import { DestinyItemType } from "bungie-api-ts/destiny2";
import type Character from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import { CharacterId } from "model/models/items/Item";
import { PlugType } from "model/models/items/Plugs";
import Manifest from "model/models/Manifest";
import Display from "ui/bungie/DisplayProperties";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button from "ui/form/Button";
import ItemTooltip from "ui/inventory/ItemTooltip";
import type SortManager from "ui/inventory/sort/SortManager";
import Loadable from "ui/Loadable";
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
	Shaped = "item-shaped",
	Deepsight = "item-deepsight",
	DeepsightHasPattern = "item-deepsight-has-pattern",
	DeepsightPattern = "item-deepsight-pattern",
	DeepsightPatternUnlocked = "item-deepsight-pattern-unlocked",
	DeepsightAttuned = "item-deepsight-attuned",
	Wishlist = "item-wishlist",
	WishlistNoMatch = "item-wishlist-no-match",
	Extra = "item-extra",
	Loading = "item-loading",
}

export interface IItemComponentCharacterHandler {
	currentCharacter: Character;
	/**
	 * Return the character associated with a given bucket ID, 
	 * or, if no character is associated with that bucket ID, return the default character.
	 */
	getCharacter (id?: CharacterId): Character;
}

export default class ItemComponent extends Button<[Item, IItemComponentCharacterHandler?]> {

	public item!: Item;
	public extra!: Component;
	public loadingSpinny?: Component;
	public tooltipPadding!: number;
	public inventory?: Inventory;

	protected override async onMake (item: Item, inventory?: Inventory) {
		super.onMake(item, inventory);

		this.inventory = inventory;

		this.update = this.update.bind(this);
		this.loadStart = this.loadStart.bind(this);
		this.loadEnd = this.loadEnd.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onContextMenu = this.onContextMenu.bind(this);

		this.event.subscribe("click", this.onClick);
		this.event.subscribe("contextmenu", this.onContextMenu);

		const done = this.setItem(item);
		await done;
	}

	private update (event: { item: Item }) {
		if (!document.contains(this.element)) {
			this.item.event.unsubscribe("update", this.update);
			this.item.event.unsubscribe("loadStart", this.loadStart);
			this.item.event.unsubscribe("loadEnd", this.loadEnd);
			return;
		}

		void this.setItem(event.item);
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
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash, item.bucket !== "collections");
		this.classes.add(`item-tier-${(item.definition.inventory?.tierTypeName ?? tier?.displayProperties.name ?? "Common")?.toLowerCase()}`);

		const ornament = item.getSockets(PlugType.Ornament)[0];

		const hasUniversalOrnament = !!ornament
			&& tier?.displayProperties.name === "Legendary"
			&& item.definition.traitIds?.includes("item_type.armor");

		Component.create()
			.classes.add(ItemClasses.Icon)
			.classes.toggle(hasUniversalOrnament, ItemClasses.UniversalArmourOrnament)
			.classes.toggle(item.definition.displayProperties.icon === "/img/misc/missing_icon_d2.png", ItemClasses.Classified)
			.style.set("--icon", Display.icon(ornament?.socketedPlug?.definition) ?? Display.icon(item.definition))
			.appendTo(this);

		const shaped = item.shaped || (item.bucket === "collections" && item.deepsight?.pattern?.progress.complete && !this.inventory?.craftedItems.has(item.definition.hash));
		if (shaped && (!item.shaped || !Store.items.settingsDisableShapedIcon))
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

		const wishlisted = !item.instance || item.shaped ? undefined : await item.isWishlisted();
		if (item.isMasterwork())
			Component.create()
				.classes.add(ItemClasses.Masterwork)
				.append(Component.create()
					.classes.add(ItemClasses.MasterworkSpinny))
				.appendTo(this);

		else if (wishlisted && Store.items.settingsDisplayWishlistedHighlights)
			Component.create()
				.classes.add(ItemClasses.Wishlist)
				.append(Component.create())
				.appendTo(this);

		if (wishlisted === false && !Store.items.settingsDisableDisplayNonWishlistedHighlights)
			Component.create()
				.classes.add(ItemClasses.WishlistNoMatch)
				.append(Component.create())
				.appendTo(this);

		if (!shaped) {
			const objectiveComplete = item.deepsight?.attunement?.progress.complete ?? false;
			if (item.hasDeepsight())
				Component.create()
					.classes.add(ItemClasses.Deepsight)
					.classes.toggle(objectiveComplete, ItemClasses.DeepsightAttuned)
					.appendTo(this);

			if (item.deepsight?.pattern)
				Component.create()
					.classes.add(ItemClasses.DeepsightPattern)
					.classes.toggle(item.deepsight.pattern.progress.complete, ItemClasses.DeepsightPatternUnlocked)
					.appendTo(Component.create()
						.classes.add(ItemClasses.DeepsightHasPattern)
						.appendTo(this));
		}

		this.extra.appendTo(this);

		this.loadingSpinny = Component.create()
			.classes.add(Loadable.Classes.LoadingSpinny, ItemClasses.Loading)
			.classes.toggle(!item.transferring, Classes.Hidden)
			.append(Component.create())
			.append(Component.create())
			.appendTo(this);
	}

	public setSortedBy (sorter: SortManager) {
		void this.rerenderExtra(sorter);
		return this;
	}

	public setTooltipPadding (padding: number) {
		this.tooltipPadding = padding;
		return this;
	}

	private rerenderId?: number;
	private async rerenderExtra (sorter: SortManager) {
		const rerenderId = this.rerenderId = Math.random();
		this.extra.removeContents();

		let extra = 0;
		for (const sort of sorter.get()) {
			if (!sort.render)
				continue;

			const rendered = await sort.render(this.item);
			if (!rendered)
				continue;

			if (this.rerenderId !== rerenderId)
				// something else is causing this to rerender
				return;

			this.extra.append(rendered);
			if (++extra === 3)
				return;
		}
	}

	private async onClick (event: MouseEvent) {
		if (window.innerWidth <= 800)
			return viewManager.showItemTooltip(this.item);

		if (this.item.equipped)
			return;

		if (event.shiftKey)
			// update this item component's bucket so future clicks transfer to the right place
			await this.item.transferToggleVaulted(this.inventory?.currentCharacter.characterId as CharacterId);
		else {
			const character = this.item.character ?? this.inventory?.currentCharacter.characterId as CharacterId;
			if (CharacterId.is(this.item.bucket))
				await this.item.equip(character);
			else
				await this.item.transferToCharacter(character);
		}
	}

	private onContextMenu (event: MouseEvent) {
		if (window.innerWidth <= 800)
			return;

		event.preventDefault();
		viewManager.showItem(this.item);
	}
}
