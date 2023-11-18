import type { IModelGenerationApi } from "model/Model";
import Model from "model/Model";
import Inventory from "model/models/Inventory";
import type { BucketId } from "model/models/items/Item";
import Item from "model/models/items/Item";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import Display from "ui/bungie/DisplayProperties";
import Component from "ui/Component";
import Button from "ui/form/Button";
import ElementTypes from "ui/inventory/ElementTypes";
import ItemComponent, { ItemClasses } from "ui/inventory/ItemComponent";
import ItemAmmo from "ui/inventory/tooltip/ItemAmmo";
import ItemStat from "ui/inventory/tooltip/ItemStat";
import ItemStatTracker from "ui/inventory/tooltip/ItemStatTracker";
import LoadingManager from "ui/LoadingManager";
import View from "ui/View";
import ItemIntrinsics from "ui/view/item/ItemIntrinsics";
import ItemPerks from "ui/view/item/ItemPerks";
import Objects from "utility/Objects";

export async function resolveItemURL (url: string, api: IModelGenerationApi) {
	const manifest = await api.subscribeProgressAndWait(Manifest, 1 / 4);
	const profile = await api.subscribeProgressAndWait(ProfileBatch, 1 / 4, 1 / 4);
	const inventory = await api.subscribeProgressAndWait(Inventory.createModel(), 1 / 4, 2 / 4);
	const { DestinyInventoryItemDefinition } = manifest;

	let [bucketId, characterIdOrItemId, itemId] = url.split("/") as ["collections" | BucketId, string, string?];
	if (itemId)
		bucketId = `${bucketId}/${characterIdOrItemId}` as BucketId;
	else
		itemId = characterIdOrItemId;

	if (bucketId !== "collections")
		return inventory.buckets?.[bucketId]?.items.find(item => item.id === itemId);

	const itemDef = await DestinyInventoryItemDefinition.get(itemId);

	api.emitProgress(1);
	if (!itemDef)
		return;

	return Item.createFake(manifest, profile, itemDef);
}

enum ItemViewClasses {
	Item = "view-item-header-item",
	ItemDefinition = "view-item-definition",
	FlavourText = "view-item-flavour-text",
	PerksModsTraits = "view-item-perks-mods-traits",
	ButtonViewInCollections = "view-item-button-view-in-collections",
	LockButton = "view-item-lock-button",
	LockButtonLocked = "view-item-lock-button-locked",

	StatsContainer = "view-item-stats-container",
	Stats = "view-item-stats",
	PrimaryInfo = "view-item-primary-info",
	PrimaryInfoPowerLabel = "view-item-primary-info-power-label",
	PrimaryInfoPower = "view-item-primary-info-power",
	PrimaryInfoElement = "view-item-primary-info-element",
	PrimaryInfoAmmo = "view-item-primary-info-ammo",
	PrimaryInfoTracker = "view-item-primary-info-tracker",
}

const itemViewBase = View.create({
	models: (item: Item | string) =>
		[Manifest, Inventory.createModel(), Model.createTemporary(async api => typeof item !== "string" ? item : resolveItemURL(item, api), "resolveItemURL")] as const,
	id: "item",
	hash: (item: Item | string) => typeof item === "string" ? `item/${item}` : `item/${item.bucket.isCollections() ? "collections" : item.bucket.id}/${item.bucket.isCollections() ? item.definition.hash : item.id}`,
	name: (item: Item | string) => typeof item === "string" ? "Item Details" : item.definition.displayProperties.name,
	noDestinationButton: true,
	initialise: async (view, manifest, inventory, itemResult) => {
		LoadingManager.end(view.definition.id);

		const item = itemResult;
		if (!item) {
			view.setTitle(title => title.text.set("No Item Was Found..."));
			view.setSubtitle("small", subtitle => subtitle.text.set("Your ghost continues its search..."));

			const content = Component.create()
				.appendTo(view.content);

			Button.create()
				.text.set("View Collections")
				.setPrimary()
				.setAttention()
				.event.subscribe("click", () => viewManager.showCollections())
				.appendTo(content);
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).$i = (window as any).item = item;
		console.log(Display.name(item.definition), item);

		view.classes.toggle(!item.instance, ItemViewClasses.ItemDefinition)
			.setTitle(title => title.text.set(item.definition.displayProperties.name))
			.setSubtitle("caps", subtitle => subtitle.text.set(item.definition.itemTypeDisplayName));

		const screenshot = item.getOrnament()?.definition?.screenshot ?? item.definition.screenshot;
		const secondaryIcon = item.definition.secondaryIcon;
		if (screenshot)
			view.setBackground(`https://www.bungie.net${screenshot}`,
				...secondaryIcon ? [`https://www.bungie.net${secondaryIcon}`] : []);

		if (!item.bucket.isCollections()) {
			const lockButton = Button.create()
				.classes.add(ItemViewClasses.LockButton)
				.classes.toggle(item.isLocked(), ItemViewClasses.LockButtonLocked)
				.event.subscribe("click", async () => {
					lockButton.classes.toggle(ItemViewClasses.LockButtonLocked);
					const locked = await item.setLocked(lockButton.classes.has(ItemViewClasses.LockButtonLocked));
					lockButton.classes.toggle(locked, ItemViewClasses.LockButtonLocked);
				})
				.appendTo(view.title);
		}

		ItemComponent.create([item])
			.classes.remove(ItemClasses.NotAcquired)
			.classes.add(ItemViewClasses.Item)
			.clearTooltip()
			.setDisableInteractions()
			.event.subscribe("mouseenter", () => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				(window as any).$i = (window as any).item = item;
				console.log(Display.name(item.definition), item);
			})
			.prependTo(view.header);

		Component.create("p")
			.classes.add(ItemViewClasses.FlavourText)
			.text.set(item.definition.flavorText)
			.appendTo(view.header);

		if (item.instance)
			Button.create()
				.classes.add(ItemViewClasses.ButtonViewInCollections)
				.text.set("View in Collections")
				.event.subscribe("click", () => ItemView.showCollections(item))
				.appendTo(view.header);

		Component.create()
			.classes.add(ItemViewClasses.PerksModsTraits)
			.append(ItemPerks.create([item, inventory])
				.event.subscribe("showCollections", () => ItemView.showCollections(item)))
			// .append(ItemMods.create([item]))
			.append(ItemIntrinsics.create([item, inventory]))
			.appendTo(view.content);

		const statsContainer = Component.create()
			.classes.add(ItemViewClasses.StatsContainer)
			.appendTo(view.content);

		const energy = item.instance?.energy;

		const { DestinyDamageTypeDefinition, DestinyEnergyTypeDefinition } = manifest;
		const damageType = await DestinyDamageTypeDefinition.get(item.instance?.damageTypeHash ?? item.definition.defaultDamageTypeHash);
		const energyType = await DestinyEnergyTypeDefinition.get(energy?.energyTypeHash);

		const character = inventory?.getCharacter(item.character);
		const elementTypeName = (damageType?.displayProperties.name ?? energyType?.displayProperties.name ?? "Unknown").toLowerCase();
		Component.create()
			.classes.add(ItemViewClasses.PrimaryInfo)
			.append(Component.create()
				.classes.add(ItemViewClasses.PrimaryInfoPowerLabel)
				.text.set("POWER"))
			.append(Component.create()
				.classes.add(ItemViewClasses.PrimaryInfoElement, `${ItemViewClasses.PrimaryInfoElement}-${elementTypeName}`)
				.style.set("--icon", Display.icon(damageType) ?? Display.icon(energyType))
				.style.set("--colour", ElementTypes.getColour(elementTypeName)))
			.append(Component.create()
				.classes.add(ItemViewClasses.PrimaryInfoPower)
				.text.set(`${item.getPower() || character?.power || 0}`))
			.append(ItemAmmo.create()
				.classes.add(ItemViewClasses.PrimaryInfoAmmo)
				.setItem(item))
			.append(ItemStatTracker.create()
				.classes.add(ItemViewClasses.PrimaryInfoTracker)
				.setItem(item))
			.appendTo(statsContainer);

		const stats = ItemStat.Wrapper.create()
			.classes.add(ItemViewClasses.Stats);

		if (stats.setItem(item))
			stats.appendTo(statsContainer);
	},
});

type ItemViewBase = typeof itemViewBase;
interface ItemViewClass extends ItemViewBase { }
class ItemViewClass extends View.Handler<readonly [typeof Manifest, Model.Impl<Inventory>, Model.Impl<Item | undefined>], [item: string | Item]> {
	public showCollections (item: Item) {
		this.show(`collections/${item.definition.hash}`);
	}
}

const ItemView = Objects.inherit(itemViewBase, ItemViewClass);
export default ItemView;
