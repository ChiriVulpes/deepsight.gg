import { InventoryBucketHashes, ItemCategoryHashes } from "@deepsight.gg/enums";
import { DestinyItemType } from "bungie-api-ts/destiny2";
import type { Character } from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import type { CharacterId } from "model/models/items/Item";
import { Classes } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import Loadable from "ui/Loadable";
import Display from "ui/bungie/DisplayProperties";
import LoadedIcon from "ui/bungie/LoadedIcon";
import Button from "ui/form/Button";
import { ItemClasses } from "ui/inventory/IItemComponent";
import ItemTooltip from "ui/inventory/ItemTooltip";
import Slot, { SlotClasses } from "ui/inventory/Slot";
import Sort from "ui/inventory/sort/Sort";
import type SortManager from "ui/inventory/sort/SortManager";
import SortQuantity from "ui/inventory/sort/sorts/SortQuantity";
import Async from "utility/Async";
import Store from "utility/Store";
import Bound from "utility/decorator/Bound";

export interface IItemComponentCharacterHandler {
	currentCharacter: Character;
	/**
	 * Return the character associated with a given bucket ID, 
	 * or, if no character is associated with that bucket ID, return the default character.
	 */
	getCharacter (id?: CharacterId): Character;
}

export interface IItemComponentEvents extends ComponentEvents {
	setSorter: Event;
}

export default class ItemComponent<ARGS extends [Item?, Inventory?, ...any[]] = [Item?, Inventory?]> extends Button<ARGS> {

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

	public override readonly event!: ComponentEventManager<this, IItemComponentEvents>;

	public item?: Item;
	public extra?: Component;
	public loadingSpinny?: Component;
	public icon?: LoadedIcon;
	public iconShaped?: Component;
	public momentWatermark?: Component;
	public iconLock?: Component;
	public deepsight?: Component;
	public deepsightHasPattern?: Component;
	public deepsightPattern?: Component;
	public masterwork?: Component;
	public wishlist?: Component;
	public junk?: Component;
	public fomo?: Component;
	public artifice?: Component;
	public loadouted?: Component;

	public tooltipPadding!: number;
	public inventory?: Inventory;
	private sorter?: WeakRef<SortManager>;

	protected override async onMake (...args: ARGS) {
		super.onMake(...args);
		const [item, inventory] = args;

		this.tooltipPadding = 0;
		this.classes.add(ItemClasses.Main);

		this.inventory = inventory;

		this.event.subscribe("click", this.onClick);
		this.event.subscribe("contextmenu", this.onContextMenu);

		if (item) {
			const done = this.setItem(item);
			await done;
		}
	}

	private lastUpdatePromise?: Promise<void>;
	@Bound
	private update (event: { item: Item }) {
		if (!document.contains(this.element)) {
			this.item?.event.unsubscribe("update", this.update);
			this.item?.event.unsubscribe("loadStart", this.loadStart);
			this.item?.event.unsubscribe("loadEnd", this.loadEnd);
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

	@Bound
	private loadStart () {
		this.loadingSpinny?.classes.remove(Classes.Hidden);
	}

	@Bound
	private loadEnd () {
		this.loadingSpinny?.classes.add(Classes.Hidden);
	}

	private settingItem?: Promise<void>;
	public async setItem (item?: Item, inventory?: Inventory) {
		this.inventory = inventory ?? this.inventory;

		if (item !== this.item) {
			this.item?.event.unsubscribe("update", this.update);
			this.item?.event.unsubscribe("loadStart", this.loadStart);
			this.item?.event.unsubscribe("loadEnd", this.loadEnd);
			item?.event.subscribe("update", this.update);
			item?.event.subscribe("loadStart", this.loadStart);
			item?.event.subscribe("loadEnd", this.loadEnd);
			this.item = item;
		}

		while (this.settingItem)
			await this.settingItem;

		this.settingItem = this.renderItem(item);
		await this.settingItem;
		delete this.settingItem;
	}

	public getIcon (index: number, pathSupplier?: () => string | undefined) {
		return this.icon ??= LoadedIcon.create([pathSupplier?.()])
			.classes.add(ItemClasses.Icon)
			.tweak(icon => this.initialiseIcon(icon))
			.indexInto(this, index);
	}

	protected async renderItem (item?: Item) {
		this.setTooltip(ItemTooltip, {
			initialise: tooltip => item && tooltip.setPadding(this.tooltipPadding)
				.setItem(item, this.inventory),
			differs: tooltip => tooltip.item?.reference.itemInstanceId !== item?.reference.itemInstanceId,
		});

		this.classes.toggle(!!item?.isMasterwork(), ItemClasses.IsMasterwork);

		this.extra ??= Component.create()
			.classes.add(ItemClasses.Extra);

		const borderless = item?.definition.itemType === DestinyItemType.Engram
			|| item?.definition.itemType === DestinyItemType.Package
			|| item?.definition.itemTypeDisplayName == "Umbral Engram";
		this.classes.toggle(borderless, ItemClasses.Borderless);

		const isContainer = item?.definition.uiItemDisplayStyle === "ui_display_style_set_container";
		this.classes.toggle(isContainer, ItemClasses.IsContainer);
		Slot.setWide(this.parent<Slot>(`.${SlotClasses.Main}`), isContainer);

		const { DestinyItemTierTypeDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item?.definition.inventory?.tierTypeHash);
		this.classes.removeWhere(cls => cls.startsWith("item-tier-"))
			.classes.add(`item-tier-${(item?.definition.inventory?.tierTypeName ?? tier?.displayProperties?.name ?? "Common")?.toLowerCase()}`);

		const ornament = item?.getOrnament();

		const hasUniversalOrnament = !!ornament
			&& tier?.displayProperties.name === "Legendary"
			&& !!item?.definition.traitIds?.some(id => id === "item_type.armor" || id.startsWith("item.armor."));

		let index = 0;

		this.getIcon(index++, () => Display.icon(ornament?.definition, false) ?? Display.icon(item?.definition, false))
			.classes.toggle(hasUniversalOrnament, ItemClasses.UniversalArmourOrnament)
			.classes.toggle(item?.definition.displayProperties.icon === "/img/misc/missing_icon_d2.png", ItemClasses.Classified);

		const canShape = item?.bucket.isCollections() && item.deepsight?.pattern?.progress?.complete && !this.inventory?.craftedItems.has(item.definition.hash);
		const shaped = item?.shaped || canShape;
		this.classes.toggle(!!item?.isNotAcquired() && !shaped && !item.deepsight?.pattern?.progress?.progress, ItemClasses.NotAcquired);
		if (shaped ? !item?.isMasterwork() : item?.canEnhance())
			(this.iconShaped ??= Component.create()
				.classes.toggle(!!shaped, ItemClasses.Shaped)
				.classes.toggle(!!item?.canEnhance(), ItemClasses.CanEnhance)
				.append(Component.create())
				.indexInto(this, index))
				.classes.remove(Classes.Hidden);
		else
			this.iconShaped?.classes.add(Classes.Hidden);

		index++;

		let watermark: string | undefined;
		if (item?.isSunset())
			watermark = item?.definition.iconWatermarkShelved ?? item?.definition.iconWatermark;
		else
			watermark = item?.definition.iconWatermark ?? item?.definition.iconWatermarkShelved;

		if (watermark || item?.moment?.displayProperties.icon)
			(this.momentWatermark ??= Component.create()
				.classes.add(ItemClasses.MomentWatermark)
				.indexInto(this, index))
				.classes.remove(Classes.Hidden)
				.classes.toggle(!watermark && !!item?.moment?.displayProperties.icon, ItemClasses.MomentWatermarkCustom)
				.style.set("--watermark", watermark && `url("https://www.bungie.net${watermark}")`)
				.style.set("--icon", item?.moment?.displayProperties.icon && `url("${item.moment.displayProperties.icon}")`);
		else
			this.momentWatermark?.classes.add(Classes.Hidden);

		index++;

		if ((item?.isLocked() || item?.isChangingLockState()))
			(this.iconLock ??= Component.create()
				.indexInto(this, index))
				.classes.remove(Classes.Hidden)
				.classes.toggle(item.isChangingLockState(), ItemClasses.Unlocked)
				.classes.toggle(!item.isChangingLockState(), ItemClasses.Locked)
				.classes.toggle(!Store.items.settingsDisplayLocksOnItems, Classes.ShowIfExtraInfo);
		else
			this.iconLock?.classes.add(Classes.Hidden);

		index++;

		const wishlisted = !item?.instance || item.shaped ? undefined : await item.isWishlisted();
		const displayWishlistedBorder = wishlisted && Store.items.settingsDisplayWishlistedHighlights;
		const displayJunkBorder = wishlisted === false && !Store.items.settingsDisableDisplayNonWishlistedHighlights;

		this.deepsight?.classes.add(Classes.Hidden);
		this.deepsightHasPattern?.classes.add(Classes.Hidden);
		this.deepsightPattern?.classes.add(Classes.Hidden);

		if (!shaped) {
			if (item?.hasDeepsight())
				(this.deepsight ??= Component.create()
					.classes.add(ItemClasses.Deepsight)
					.indexInto(this, index))
					.classes.remove(Classes.Hidden);

			if (item?.deepsight?.pattern) {
				(this.deepsightHasPattern ??= Component.create()
					.classes.add(ItemClasses.DeepsightHasPattern)
					.indexInto(this, index + 1))
					.classes.remove(Classes.Hidden);

				if (!displayJunkBorder)
					(this.deepsightPattern ??= Component.create()
						.classes.add(ItemClasses.DeepsightPattern)
						.indexInto(this, index + 2))
						.classes.remove(Classes.Hidden)
						.classes.toggle(!!item.deepsight.pattern.progress?.complete, ItemClasses.DeepsightPatternUnlocked);
			}
		}

		index += 3;

		this.loadouted?.classes.add(Classes.Hidden);

		const isLoadouted = !!this.item?.getLoadouts().length;
		this.classes.toggle(isLoadouted, ItemClasses.IsLoadouted);
		if (isLoadouted)
			(this.loadouted ??= Component.create()
				.classes.add(ItemClasses.LoadoutedBookmark)
				.append(Component.create()
					.classes.add(ItemClasses.LoadoutedBookmark1))
				.indexInto(this, index))
				.classes.remove(Classes.Hidden);

		index++;

		this.artifice?.classes.add(Classes.Hidden);

		if (item?.isArtifice())
			(this.artifice ??= Component.create()
				.classes.add(ItemClasses.Artifice)
				.indexInto(this, index))
				.classes.remove(Classes.Hidden);

		index++;

		this.masterwork?.classes.add(Classes.Hidden);
		this.wishlist?.classes.add(Classes.Hidden);

		const isArtifact = !!item?.definition.itemCategoryHashes?.includes(ItemCategoryHashes.SeasonalArtifacts);
		if (item?.isMasterwork())
			(this.masterwork ??= Component.create()
				.classes.add(ItemClasses.Masterwork)
				.append(Component.create()
					.classes.add(ItemClasses.MasterworkSpinny))
				.indexInto(this, index))
				.classes.remove(Classes.Hidden)
				.classes.toggle(isArtifact, ItemClasses.Artifact)
				.classes.toggle(displayJunkBorder, ItemClasses.MasterworkShiftedDueToJunkBorder);

		else if (displayWishlistedBorder)
			(this.wishlist ??= Component.create()
				.classes.add(ItemClasses.Wishlist)
				.append(Component.create()
					.classes.add(ItemClasses.WishlistIcon))
				.indexInto(this, index))
				.classes.remove(Classes.Hidden);

		index++;

		if (displayJunkBorder)
			(this.junk ??= Component.create()
				.classes.add(ItemClasses.WishlistNoMatch)
				.append(Component.create()
					.classes.add(ItemClasses.WishlistNoMatchIcon))
				.indexInto(this, index))
				.classes.remove(Classes.Hidden);
		else
			this.junk?.classes.add(Classes.Hidden);

		index++;

		if (item?.isFomo() && !item.deepsight?.pattern?.progress?.complete)
			(this.fomo ??= Component.create()
				.classes.add(ItemClasses.Fomo)
				.append(Component.create()
					.classes.add(ItemClasses.FomoIcon))
				.indexInto(this, index))
				.classes.remove(Classes.Hidden);
		else
			this.fomo?.classes.add(Classes.Hidden);

		index++;

		void Async.debounce(this.rerenderExtra);
		this.extra.indexInto(this, index);

		index++;

		(this.loadingSpinny ??= Component.create()
			.classes.add(Loadable.Classes.LoadingSpinny, ItemClasses.Loading)
			.append(Component.create())
			.append(Component.create())
			.indexInto(this, index))
			.classes.toggle(!item?.transferring, Classes.Hidden);
	}

	protected initialiseIcon (icon: LoadedIcon) { }

	public setSortedBy (sorter?: SortManager) {
		this.sorter = sorter && new WeakRef(sorter);
		this.event.emit("setSorter");
		sorter?.event.until(this.event.waitFor("setSorter"), event => event
			.subscribe("update", () => Async.debounce(this.rerenderExtra)));
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

	@Bound
	private async rerenderExtra () {
		this.extra?.removeContents();

		if (!this.item || !this.extra)
			return;

		const sorts = this.sorter?.deref()?.get()?.slice() ?? [];
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

		this.extra.classes.toggle(extra === 0 || (this.item.definition.inventory?.bucketTypeHash === InventoryBucketHashes.Engrams && extra === 1), ItemClasses.ExtraEmpty);
		this.extra.classes.toggle(encounteredQuantityOrPowerState === 1 && extra < 3, ItemClasses.ExtraNoneAfterQuantityOrPower);
	}

	@Bound
	private async onClick (event: MouseEvent) {
		if (!this.item)
			return;

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
			if (!this.item.bucket.isCharacter())
				await this.item.transferToCharacter(character);

			else if (this.item.equipped)
				await this.item.unequip();
			else
				await this.item.equip(character);
		}
	}

	@Bound
	private onContextMenu (event: MouseEvent) {
		if (!this.item)
			return;

		if (window.innerWidth <= 800)
			return;

		if (this.disableInteractions)
			return;

		if (!event.use("MouseRight"))
			return;

		event.preventDefault();
		event.stopPropagation();
		if (event.shiftKey)
			viewManager.showCollections(this.item);
		else
			viewManager.showItem(this.item);
	}
}
