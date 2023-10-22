import { BucketHashes, DestinyItemType } from "bungie-api-ts/destiny2";
import type Character from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import { CharacterId } from "model/models/items/Item";
import Manifest from "model/models/manifest/DestinyManifest";
import Display from "ui/bungie/DisplayProperties";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button from "ui/form/Button";
import ItemTooltip from "ui/inventory/ItemTooltip";
import Sort from "ui/inventory/sort/Sort";
import type SortManager from "ui/inventory/sort/SortManager";
import SortQuantity from "ui/inventory/sort/sorts/SortQuantity";
import Loadable from "ui/Loadable";
import Async from "utility/Async";
import Store from "utility/Store";

export enum ItemClasses {
	Main = "item",
	Icon = "item-icon",
	Classified = "item-classified",
	Borderless = "item-borderless",
	UniversalArmourOrnament = "item-universal-armour-ornament",
	SourceWatermark = "item-source-watermark",
	SourceWatermarkCustom = "item-source-watermark-custom",
	IsMasterwork = "item-is-masterwork",
	Masterwork = "item-masterwork",
	MasterworkSpinny = "item-masterwork-spinny",
	MasterworkShiftedDueToJunkBorder = "item-masterwork-shifted-due-to-junk-border",
	Shaped = "item-shaped",
	Deepsight = "item-deepsight",
	DeepsightHasPattern = "item-deepsight-has-pattern",
	DeepsightPattern = "item-deepsight-pattern",
	DeepsightPatternUnlocked = "item-deepsight-pattern-unlocked",
	Wishlist = "item-wishlist",
	WishlistNoMatch = "item-wishlist-no-match",
	Extra = "item-extra",
	ExtraInfo = "item-extra-info",
	ExtraEmpty = "item-extra-empty",
	ExtraNoneAfterQuantityOrPower = "item-extra-none-after-quantity-or-power",
	Loading = "item-loading",
	NotAcquired = "item-not-acquired",
	Locked = "item-locked",
	Unlocked = "item-unlocked",
}

export interface IItemComponentCharacterHandler {
	currentCharacter: Character;
	/**
	 * Return the character associated with a given bucket ID, 
	 * or, if no character is associated with that bucket ID, return the default character.
	 */
	getCharacter (id?: CharacterId): Character;
}

export default class ItemComponent<ARGS extends any[] = any[]> extends Button<[Item, IItemComponentCharacterHandler?, ...ARGS]> {

	private static readonly showers = new Set<string>();
	public static showExtra (id: string) {
		ItemComponent.showers.add(id);
		document.documentElement.classList.add("show-item-extra-info");
	}

	public static hideExtra (id: string) {
		ItemComponent.showers.delete(id);
		if (!ItemComponent.showers.size)
			document.documentElement.classList.remove("show-item-extra-info");
	}

	public static toggleExtra (id: string, newState = !ItemComponent.showers.has(id)) {
		if (newState)
			ItemComponent.showExtra(id);
		else
			ItemComponent.hideExtra(id);
	}

	public item!: Item;
	public extra!: Component;
	public loadingSpinny?: Component;
	public tooltipPadding!: number;
	public inventory?: Inventory;
	private sorter?: WeakRef<SortManager>;

	protected override async onMake (item: Item, inventory?: Inventory, ...args: ARGS) {
		super.onMake(item, inventory, ...args);

		this.inventory = inventory;

		this.update = this.update.bind(this);
		this.loadStart = this.loadStart.bind(this);
		this.loadEnd = this.loadEnd.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onContextMenu = this.onContextMenu.bind(this);
		this.rerenderExtra = this.rerenderExtra.bind(this);

		this.event.subscribe("click", this.onClick);
		this.event.subscribe("contextmenu", this.onContextMenu);

		const done = this.setItem(item);
		await done;
	}

	private lastUpdatePromise?: Promise<void>;
	private update (event: { item: Item }) {
		if (!document.contains(this.element)) {
			this.item.event.unsubscribe("update", this.update);
			this.item.event.unsubscribe("loadStart", this.loadStart);
			this.item.event.unsubscribe("loadEnd", this.loadEnd);
			return;
		}

		void (async () => {
			while (this.lastUpdatePromise)
				await this.lastUpdatePromise;

			const updatePromise = this.lastUpdatePromise = this.setItem(event.item);
			await this.lastUpdatePromise;
			if (this.lastUpdatePromise === updatePromise)
				delete this.lastUpdatePromise;
		})();
	}

	private loadStart () {
		this.loadingSpinny?.classes.remove(Classes.Hidden);
	}

	private loadEnd () {
		this.loadingSpinny?.classes.add(Classes.Hidden);
	}

	public setItem (item: Item) {
		if (item !== this.item) {
			this.item?.event.unsubscribe("update", this.update);
			this.item?.event.unsubscribe("loadStart", this.loadStart);
			this.item?.event.unsubscribe("loadEnd", this.loadEnd);
			item.event.subscribe("update", this.update);
			item.event.subscribe("loadStart", this.loadStart);
			item.event.subscribe("loadEnd", this.loadEnd);
			this.item = item;
		}

		return this.renderItem(item);
	}

	private async renderItem (item: Item) {
		this.setTooltip(ItemTooltip, {
			initialiser: tooltip => tooltip.setPadding(this.tooltipPadding)
				.setItem(item, this.inventory),
			differs: tooltip => tooltip.item?.reference.itemInstanceId !== item.reference.itemInstanceId,
		});

		this.removeContents();

		this.tooltipPadding = 0;
		this.classes.add(ItemClasses.Main)
			.classes.toggle(item.isMasterwork(), ItemClasses.IsMasterwork);

		this.extra = Component.create()
			.classes.add(ItemClasses.Extra);

		const borderless = item.definition.itemType === DestinyItemType.Engram
			|| item.definition.itemType === DestinyItemType.Package
			|| item.definition.itemTypeDisplayName == "Umbral Engram";
		this.classes.toggle(borderless, ItemClasses.Borderless);

		const { DestinyItemTierTypeDefinition, DestinyPowerCapDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
		this.classes.add(`item-tier-${(item.definition.inventory?.tierTypeName ?? tier?.displayProperties?.name ?? "Common")?.toLowerCase()}`);

		const ornament = item.getOrnament();

		const hasUniversalOrnament = !!ornament
			&& tier?.displayProperties.name === "Legendary"
			&& item.definition.traitIds?.some(id => id === "item_type.armor" || id.startsWith("item.armor."));

		Component.create()
			.classes.add(ItemClasses.Icon)
			.classes.toggle(hasUniversalOrnament, ItemClasses.UniversalArmourOrnament)
			.classes.toggle(item.definition.displayProperties.icon === "/img/misc/missing_icon_d2.png", ItemClasses.Classified)
			.style.set("--icon", Display.icon(ornament?.definition) ?? Display.icon(item.definition))
			.appendTo(this);

		const shaped = item.shaped || (item.bucket === "collections" && item.deepsight?.pattern?.progress.complete && !this.inventory?.craftedItems.has(item.definition.hash));
		this.classes.toggle(item.isNotAcquired() && !shaped && !item.deepsight?.pattern?.progress.progress, ItemClasses.NotAcquired);
		if (shaped && !item.isMasterwork())
			Component.create()
				.classes.add(ItemClasses.Shaped)
				.append(Component.create())
				.appendTo(this);

		let watermark: string | undefined;
		const powerCap = await DestinyPowerCapDefinition.get(item.definition.quality?.versions[item.definition.quality.currentVersion]?.powerCapHash, item.bucket !== "collections");
		if ((powerCap?.powerCap ?? 0) < 900000)
			watermark = item.definition.iconWatermarkShelved ?? item.definition.iconWatermark;
		else
			watermark = item.definition.iconWatermark ?? item.definition.iconWatermarkShelved;

		if (watermark) {
			Component.create()
				.classes.add(ItemClasses.SourceWatermark)
				.style.set("--watermark", `url("https://www.bungie.net${watermark}")`)
				.appendTo(this);
		} else if (item.source?.displayProperties.icon) {
			Component.create()
				.classes.add(ItemClasses.SourceWatermark, ItemClasses.SourceWatermarkCustom)
				.style.set("--icon", `url("${item.source.displayProperties.icon}")`)
				.appendTo(this);
		}

		if ((item.isLocked() || item.isChangingLockState()))
			Component.create()
				.classes.add(item.isChangingLockState() ? ItemClasses.Unlocked : ItemClasses.Locked)
				.classes.toggle(!Store.items.settingsDisplayLocksOnItems, Classes.ShowIfExtraInfo)
				.appendTo(this);

		const wishlisted = !item.instance || item.shaped ? undefined : await item.isWishlisted();
		const displayWishlistedBorder = wishlisted && Store.items.settingsDisplayWishlistedHighlights;
		const displayJunkBorder = wishlisted === false && !Store.items.settingsDisableDisplayNonWishlistedHighlights;

		if (!shaped) {
			if (item.hasDeepsight())
				Component.create()
					.classes.add(ItemClasses.Deepsight)
					.appendTo(this);

			if (item.deepsight?.pattern) {
				Component.create()
					.classes.add(ItemClasses.DeepsightHasPattern)
					.appendTo(this);

				if (!displayJunkBorder)
					Component.create()
						.classes.add(ItemClasses.DeepsightPattern)
						.classes.toggle(item.deepsight.pattern.progress.complete, ItemClasses.DeepsightPatternUnlocked)
						.appendTo(this);
			}
		}

		if (item.isMasterwork())
			Component.create()
				.classes.add(ItemClasses.Masterwork)
				.classes.toggle(displayJunkBorder, ItemClasses.MasterworkShiftedDueToJunkBorder)
				.append(Component.create()
					.classes.add(ItemClasses.MasterworkSpinny))
				.appendTo(this);

		else if (displayWishlistedBorder)
			Component.create()
				.classes.add(ItemClasses.Wishlist)
				.append(Component.create())
				.appendTo(this);

		if (displayJunkBorder)
			Component.create()
				.classes.add(ItemClasses.WishlistNoMatch)
				.append(Component.create())
				.appendTo(this);

		void Async.debounce(this.rerenderExtra);
		this.extra.appendTo(this);

		this.loadingSpinny = Component.create()
			.classes.add(Loadable.Classes.LoadingSpinny, ItemClasses.Loading)
			.classes.toggle(!item.transferring, Classes.Hidden)
			.append(Component.create())
			.append(Component.create())
			.appendTo(this);
	}

	public setSortedBy (sorter: SortManager) {
		this.sorter = new WeakRef(sorter);
		void Async.debounce(this.rerenderExtra);
		return this;
	}

	public setTooltipPadding (padding: number) {
		this.tooltipPadding = padding;
		return this;
	}

	private disableInteractions?: true;
	public setDisableInteractions () {
		this.disableInteractions = true;
		return this;
	}

	private async rerenderExtra () {
		this.extra.removeContents();

		const sorts = this.sorter?.deref()?.get().slice() ?? [];
		if (this.item.reference.quantity > 1 && !sorts.includes(SortQuantity))
			sorts.push(SortQuantity);

		let extra = 0;
		let encounteredQuantityOrPowerState = 0;
		for (const sort of sorts) {
			if (!sort.render)
				continue;

			const rendered = await sort.render(this.item);
			if (!rendered)
				continue;

			if (encounteredQuantityOrPowerState || sort.id === Sort.Quantity || sort.id === Sort.Power)
				encounteredQuantityOrPowerState++;

			rendered.classes.add(ItemClasses.ExtraInfo)
				.appendTo(this.extra);
			if (++extra === 3)
				return;
		}

		this.extra.classes.toggle(extra === 0 || (this.item.definition.inventory?.bucketTypeHash === BucketHashes.Engrams && extra === 1), ItemClasses.ExtraEmpty);
		this.extra.classes.toggle(encounteredQuantityOrPowerState === 1 && extra < 3, ItemClasses.ExtraNoneAfterQuantityOrPower);
	}

	private async onClick (event: MouseEvent) {
		if (window.innerWidth <= 800)
			return viewManager.showItemTooltip(this.item);

		if (this.disableInteractions)
			return;

		if (!event.use("MouseLeft"))
			return;

		if (event.shiftKey)
			// update this item component's bucket so future clicks transfer to the right place
			await this.item.transferToggleVaulted(this.inventory?.currentCharacter.characterId as CharacterId);
		else {
			const character = this.item.character ?? this.inventory?.currentCharacter.characterId as CharacterId;
			if (!CharacterId.is(this.item.bucket))
				await this.item.transferToCharacter(character);

			else if (this.item.equipped)
				await this.item.unequip();
			else
				await this.item.equip(character);
		}
	}

	private onContextMenu (event: MouseEvent) {
		if (window.innerWidth <= 800)
			return;

		if (this.disableInteractions)
			return;

		if (!event.use("MouseRight"))
			return;

		event.preventDefault();
		if (event.shiftKey)
			viewManager.showCollections(this.item);
		else
			viewManager.showItem(this.item);
	}
}
