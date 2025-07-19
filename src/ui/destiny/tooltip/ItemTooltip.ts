import { InventoryBucketHashes, ItemCategoryHashes, StatHashes } from "@deepsight.gg/enums";
import { DestinyItemType, DestinyRecordState } from "bungie-api-ts/destiny2";
import type Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import { ItemFomoState } from "model/models/items/Item";
import Component from "ui/component/Component";
import { Hint, IInput } from "ui/component/Hints";
import LoadoutComponent from "ui/destiny/playeroverview/LoadoutComponent";
import ItemAmmo from "ui/destiny/tooltip/item/ItemAmmo";
import ItemStat from "ui/destiny/tooltip/item/ItemStat";
import ItemStatTracker from "ui/destiny/tooltip/item/ItemStatTracker";
import ItemTooltipMods from "ui/destiny/tooltip/item/ItemTooltipMods";
import ItemTooltipNotifications from "ui/destiny/tooltip/item/ItemTooltipNotifications";
import ItemTooltipPerks from "ui/destiny/tooltip/item/ItemTooltipPerks";
import ItemTooltipSource from "ui/destiny/tooltip/item/ItemTooltipSource";
import ElementType from "ui/destiny/utility/ElementTypes";
import { Classes } from "ui/utility/Classes";
import Display from "ui/utility/DisplayProperties";
import TooltipManager, { Tooltip } from "ui/utility/TooltipManager";
import type { IKeyEvent, IKeyUpEvent } from "ui/utility/UiEventBus";
import UiEventBus from "ui/utility/UiEventBus";
import Arrays from "utility/Arrays";
import Bound from "utility/decorator/Bound";

const _ = undefined;

export enum ItemTooltipClasses {
	Main = "item-tooltip",
	Rarity_ = "item-tooltip-tier-",
	Extra = "item-tooltip-extra",
	Content = "item-tooltip-content",
	ProgressBar = "item-tooltip-progress-bar",
	MomentWatermark = "item-tooltip-moment-watermark",
	MomentWatermark_Featured = "item-tooltip-moment-watermark--featured",
	// MomentWatermark_Sunset = "item-tooltip-moment-watermark--sunset",
	MomentWatermarkTier = "item-tooltip-moment-watermark-tier",
	MomentWatermarkTier_ = "item-tooltip-moment-watermark-tier--",
	MomentWatermarkTierDot = "item-tooltip-moment-watermark-tier-dot",
	Locked = "item-tooltip-locked",
	Unlocked = "item-tooltip-unlocked",
	Masterwork = "item-tooltip-masterwork",
	Artifact = "item-tooltip-artifact",
	PrimaryInfo = "item-tooltip-primary-info",
	PrimaryStat = "item-tooltip-primary-stat",
	PrimaryStatValue = "item-tooltip-primary-stat-value",
	PrimaryStatLabel = "item-tooltip-primary-stat-label",
	PrimaryStatDamage = "item-tooltip-primary-stat-damage",
	PrimaryStatDamageIcon = "item-tooltip-primary-stat-damage-icon",
	PrimaryStatHasElementRight = "item-tooltip-primary-stat-has-element-right",
	Energy = "item-tooltip-energy",
	EnergyValue = "item-tooltip-energy-value",
	WeaponLevel = "item-tooltip-weapon-level",
	WeaponLevelLabel = "item-tooltip-weapon-level-label",
	WeaponLevelProgress = "item-tooltip-weapon-level-progress",
	WeaponLevelEnhanced = "item-tooltip-weapon-level-enhanced",
	Catalyst = "item-tooltip-catalyst",
	Description = "item-tooltip-description",
	Stats = "item-tooltip-stats",
	Deepsight = "item-tooltip-deepsight",
	DeepsightPatternLabel = "item-tooltip-deepsight-pattern-label",
	DeepsightPatternNumber = "item-tooltip-deepsight-pattern-number",
	DeepsightPatternOutOf = "item-tooltip-deepsight-pattern-out-of",
	DeepsightPatternRequired = "item-tooltip-deepsight-pattern-required",
	DeepsightPatternRequiredUnit = "item-tooltip-deepsight-pattern-required-unit",
	DeepsightProgressBar = "item-tooltip-deepsight-progress-bar",
	DeepsightProgressValue = "item-tooltip-deepsight-progress-value",
	Enhance = "item-tooltip-enhance",
	Wishlist = "item-tooltip-wishlist",
	Wishlisted = "item-tooltip-wishlisted",
	Fomo = "item-tooltip-fomo",
	Note = "item-tooltip-note",
	NoteHeading = "item-tooltip-note-heading",
	Flavour = "item-tooltip-flavour",
	RandomRollHeading = "item-tooltip-random-roll-heading",
	LoadoutsWrapper = "item-tooltip-loadouts-wrapper",
	Loadouts = "item-tooltip-loadouts",
	Loadout = "item-tooltip-loadout",
}

class ItemTooltip extends Tooltip {

	public item?: Item;
	public moment!: Component;
	public tier!: Component;
	public locked!: Component;
	public primaryInfo!: Component;
	public primaryStat!: Component;
	public primaryStatValue!: Component;
	public primaryStatDamageIcon!: Component<HTMLImageElement>;
	public primaryStatLabel!: Component;
	public ammoType!: ItemAmmo;
	public energy!: Component;
	public energyValue!: Component;
	public weaponLevel!: Component;
	public weaponLevelLabel!: Component;
	public weaponLevelProgress!: Component;
	public description!: Component;
	public statTracker!: ItemStatTracker;
	public perks!: ItemTooltipPerks;
	public stats!: ItemStat.Wrapper;
	public mods!: ItemTooltipMods;
	public notifications!: ItemTooltipNotifications;
	public deepsight!: Component;
	public deepsightPatternLabel!: Component;
	public deepsightPatternNumber!: Component;
	public deepsightPatternOutOf!: Component;
	public deepsightPatternRequired!: Component;
	public deepsightPatternRequiredUnit!: Component;
	public enhance!: Component;
	public enhanceText!: Component;
	public wishlist!: Component;
	public fomo!: Component;
	public note!: Component;
	public hintVault!: Hint;
	public hintPullToCharacter!: Hint;
	public hintEquipToCharacter!: Hint;
	public hintUnequipFromCharacter!: Hint;
	public hintInspect!: Hint;
	public flavour!: Component;
	public detailedMods!: ItemTooltipMods;
	public randomRollHeading!: Component;
	public randomMods!: ItemTooltipMods;
	public source!: ItemTooltipSource;
	public loadoutsWrapper!: Component;
	public loadouts!: Component;
	public hintCollections!: Hint;

	protected override onMake () {
		this.classes.add(ItemTooltipClasses.Main);
		this.content.classes.add(ItemTooltipClasses.Content);

		this.moment = Component.create()
			.classes.add(ItemTooltipClasses.MomentWatermark, Classes.Hidden)
			.appendTo(this.header);

		this.tier = Component.create()
			.classes.add(ItemTooltipClasses.MomentWatermarkTier)
			.appendTo(this.moment);

		this.locked = Component.create()
			.classes.add(ItemTooltipClasses.Locked, Classes.Hidden)
			.appendTo(this.rarity);

		this.primaryInfo = Component.create()
			.classes.add(ItemTooltipClasses.PrimaryInfo)
			.appendTo(this.content);

		this.primaryStat = Component.create()
			.classes.add(ItemTooltipClasses.PrimaryStat)
			.appendTo(this.primaryInfo);

		this.primaryStatValue = Component.create()
			.classes.add(ItemTooltipClasses.PrimaryStatValue)
			.appendTo(this.primaryStat);

		this.primaryStatDamageIcon = Component.create("img")
			.classes.add(ItemTooltipClasses.PrimaryStatDamageIcon)
			.appendTo(this.primaryStatValue);

		this.primaryStatLabel = Component.create()
			.classes.add(ItemTooltipClasses.PrimaryStatLabel)
			.appendTo(this.primaryStat);

		this.ammoType = ItemAmmo.create()
			.appendTo(this.primaryInfo);

		this.energy = Component.create()
			.classes.add(ItemTooltipClasses.Energy)
			.appendTo(this.primaryInfo);

		this.energyValue = Component.create()
			.classes.add(ItemTooltipClasses.EnergyValue)
			.appendTo(this.energy);

		this.energy.text.add("Energy");

		this.weaponLevel = Component.create()
			.classes.add(ItemTooltipClasses.WeaponLevel, ItemTooltipClasses.ProgressBar)
			.append(this.weaponLevelLabel = Component.create()
				.classes.add(ItemTooltipClasses.WeaponLevelLabel))
			.append(this.weaponLevelProgress = Component.create()
				.classes.add(ItemTooltipClasses.WeaponLevelProgress))
			.appendTo(this.primaryInfo);

		this.statTracker = ItemStatTracker.create()
			.appendTo(this.primaryInfo);

		this.description = Component.create()
			.classes.add(ItemTooltipClasses.Description)
			.appendTo(this.primaryInfo);

		this.perks = ItemTooltipPerks.create()
			.appendTo(this.primaryInfo);

		this.stats = ItemStat.Wrapper.create()
			.classes.add(ItemTooltipClasses.Stats)
			.appendTo(this.content);

		this.mods = ItemTooltipMods.create()
			.appendTo(this.content);

		this.notifications = ItemTooltipNotifications.create()
			.appendTo(this.content);

		this.deepsight = Component.create()
			.classes.add(ItemTooltipClasses.Note, ItemTooltipClasses.Deepsight)
			.append(this.deepsightPatternLabel = Component.create()
				.classes.add(ItemTooltipClasses.DeepsightPatternLabel))
			.append(this.deepsightPatternNumber = Component.create()
				.classes.add(ItemTooltipClasses.DeepsightPatternNumber))
			.append(this.deepsightPatternOutOf = Component.create()
				.classes.add(ItemTooltipClasses.DeepsightPatternOutOf)
				.text.add(" / ")
				.append(this.deepsightPatternRequired = Component.create()
					.classes.add(ItemTooltipClasses.DeepsightPatternRequired))
				.append(this.deepsightPatternRequiredUnit = Component.create()
					.classes.add(ItemTooltipClasses.DeepsightPatternRequiredUnit)))
			.appendTo(this.content);

		this.enhance = Component.create()
			.classes.add(ItemTooltipClasses.Note, ItemTooltipClasses.Enhance)
			.append(this.enhanceText = Component.create())
			.appendTo(this.content);

		this.wishlist = Component.create()
			.classes.add(ItemTooltipClasses.Note, ItemTooltipClasses.Wishlist)
			.appendTo(this.content);

		this.note = Component.create()
			.classes.add(ItemTooltipClasses.Note)
			.appendTo(this.content);

		this.fomo = Component.create()
			.classes.add(ItemTooltipClasses.Note, ItemTooltipClasses.Fomo)
			.appendTo(this.content);

		this.hintEquipToCharacter = Hint.create([IInput.get("MouseLeft")])
			.appendTo(this.hints);

		this.hintUnequipFromCharacter = Hint.create([IInput.get("MouseLeft")])
			.tweak(hint => hint.label.text.set("Unequip"))
			.appendTo(this.hints);

		this.hintPullToCharacter = Hint.create([IInput.get("MouseLeft")])
			.appendTo(this.hints);

		this.hintVault = Hint.create([IInput.get("MouseLeft", "Shift")])
			.tweak(hint => hint.label.text.set("Vault"))
			.appendTo(this.hints);

		this.hintInspect = Hint.create([IInput.get("MouseRight")])
			.tweak(hint => hint.label.text.set("Details"))
			.appendTo(this.hints);

		this.extra.classes.add(ItemTooltipClasses.Extra);
		this.extra.content.classes.add(ItemTooltipClasses.Content);

		this.flavour = this.extra.title
			.classes.add(ItemTooltipClasses.Flavour);

		this.detailedMods = ItemTooltipMods.create()
			.setDetailed()
			.appendTo(this.extra.content);

		this.randomRollHeading = Component.create()
			.classes.add(ItemTooltipClasses.Note, ItemTooltipClasses.NoteHeading)
			.appendTo(this.extra.content);

		this.randomMods = ItemTooltipMods.create()
			.appendTo(this.extra.content);

		this.source = ItemTooltipSource.create()
			.appendTo(this.extra.content);

		this.hintCollections = Hint.create([IInput.get("MouseRight", "Shift")])
			.tweak(hint => hint.label.text.set("Collections"))
			.appendTo(this.extra.hints);

		this.loadoutsWrapper = Component.create()
			.classes.add(ItemTooltipClasses.LoadoutsWrapper, ItemTooltipClasses.Note)
			.append(this.loadouts = Component.create()
				.classes.add(ItemTooltipClasses.Loadouts))
			.appendTo(this.extra.content);

		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
		UiEventBus.subscribe("keyup", this.onGlobalKeyup);
	}

	private awaitingShiftForLock = false;
	@Bound
	protected onGlobalKeydown (event: IKeyEvent) {
		if (event.matches("Shift")) {
			this.hintInspect.label.text.set("Collections");
			this.awaitingShiftForLock = true;
		}
	}

	@Bound
	protected onGlobalKeyup (event: IKeyUpEvent) {
		if (event.matches("Shift")) {
			this.hintInspect.label.text.set("Details");

			if (!event.usedAnotherKeyDuring && this.awaitingShiftForLock) {
				this.locked.classes.add(ItemTooltipClasses.Unlocked)
					.classes.remove(Classes.Hidden);
				void this.item?.setLocked(!this.item.isLocked())
					.then(locked => this.locked.classes.remove(ItemTooltipClasses.Unlocked)
						.classes.toggle(!locked, Classes.Hidden));
			}

			this.awaitingShiftForLock = false;
		}
	}

	public async setItem (item: Item, inventory?: Inventory) {
		this.item = item;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).$i = (window as any).item = item;
		console.log(Display.name(item.definition), item);

		const { DestinyItemTierTypeDefinition, DestinyDamageTypeDefinition, DestinyClassDefinition } = await Manifest.await();

		let tierHash = item.definition.inventory?.tierTypeHash;
		if (item.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies) || item.definition.itemType === DestinyItemType.None)
			tierHash = undefined;

		const rarity = await DestinyItemTierTypeDefinition.get(tierHash);
		const tierName = (tierHash === undefined ? "none" : item.definition.inventory?.tierTypeName ?? rarity?.displayProperties.name ?? "none")?.toLowerCase();

		this.classes.removeWhere(cls => cls.startsWith(ItemTooltipClasses.Rarity_))
			.classes.add(`${ItemTooltipClasses.Rarity_}${tierName}`)
			.classes.toggle(item.isMasterwork(), ItemTooltipClasses.Masterwork)
			.classes.toggle(!!item.definition.itemCategoryHashes?.includes(ItemCategoryHashes.SeasonalArtifacts), ItemTooltipClasses.Artifact);

		this.title.text.set(Display.name(item.definition));
		this.subtitle.removeContents();

		this.subtitle.text.set(item.definition.itemTypeDisplayName ?? "Unknown");
		this.rarity.text.set(rarity && item.definition.inventory?.tierTypeName);

		this.locked.classes.toggle(!item.isLocked(), Classes.Hidden);

		const momentIcon = item.definition.iconWatermark;
		this.moment.classes.toggle(!momentIcon, Classes.Hidden)
			.classes.toggle(!!item?.definition.isFeaturedItem, ItemTooltipClasses.MomentWatermark_Featured)
		if (momentIcon)
			this.moment.style.set("--icon", `url("${momentIcon.startsWith("/") ? `https://www.bungie.net${momentIcon}` : momentIcon}")`);

		const tier = item.instance?.gearTier;
		this.tier.classes.toggle(!tier, Classes.Hidden)
		if (tier)
			this.tier.classes.removeWhere(cls => cls.startsWith(ItemTooltipClasses.MomentWatermarkTier_))
				.classes.add(`${ItemTooltipClasses.MomentWatermarkTier_}${tier}`)
				.removeContents()
				.append(...Arrays.range(tier).map(() => Component.create()
					.classes.add(ItemTooltipClasses.MomentWatermarkTierDot)
				));

		const primaryStat = item.getPower();
		const damageType = await DestinyDamageTypeDefinition.get(item.getDamageType());
		const energy = item.instance?.energy;
		const ammoType = item.definition.equippingBlock?.ammoType;

		this.primaryStat
			.classes.toggle(!primaryStat && damageType === undefined, Classes.Hidden)
			.classes.toggle(!!ammoType || !!energy, ItemTooltipClasses.PrimaryStatHasElementRight)
			.classes.removeWhere(cls => cls.startsWith("item-tooltip-energy-type-"));

		this.primaryStatValue
			.text.set(`${primaryStat ?? item.owner?.power ?? "0"}`)
			.classes.toggle(damageType !== undefined, ItemTooltipClasses.PrimaryStatDamage);

		this.primaryStatDamageIcon.classes.toggle(damageType === undefined, Classes.Hidden);

		if (damageType !== undefined) {
			const damageTypeName = (damageType?.displayProperties.name ?? "Unknown").toLowerCase();
			this.primaryStatValue
				.classes.add(`item-tooltip-energy-type-${damageTypeName}`)
				.style.set("--colour", ElementType.getColour(damageTypeName));

			this.primaryStatDamageIcon.attributes.set("src", Display.icon(damageType, false));
		}

		this.primaryStatLabel
			.text.set(this.item.instance?.primaryStat?.statHash === StatHashes.Speed ? "Speed" : "Power")
			.classes.toggle(!!item.definition.equippingBlock?.ammoType || energy !== undefined, Classes.Hidden);

		this.ammoType.setItem(item);

		this.energy.classes.toggle(energy === undefined, Classes.Hidden);
		if (energy !== undefined)
			this.energyValue.text.set(`${energy.energyCapacity}`);

		this.weaponLevel.classes.toggle(!item.shaped && (!item.catalyst || item.isMasterwork()), Classes.Hidden)
			.classes.toggle(!item.shaped && !!item.catalyst, ItemTooltipClasses.Catalyst);
		if (item.shaped) {
			const progressObjective = item.shaped.progress?.progress;
			const progress = (progressObjective?.progress ?? 0) / (progressObjective?.completionValue ?? 1);
			this.weaponLevel.style.set("--progress", `${progress}`);
			this.weaponLevelLabel.text.set(`Weapon Lv. ${item.shaped.level?.progress.progress ?? 0}`);
			this.weaponLevelProgress.text.set(`${Math.floor(progress * 100)}%`);
		} else if (item.catalyst && (!item.catalyst.complete || !item.isMasterwork())) {
			const progress = (item.catalyst.progress ?? 0) / (item.catalyst.completionValue ?? 1);
			this.weaponLevel.style.set("--progress", `${progress}`);
			const obscured = item.catalyst.state.state & DestinyRecordState.Obscured;
			const needsInsertion = item.catalyst.complete && !item.isMasterwork();
			this.weaponLevelLabel.text.set(needsInsertion ? "Insert the Catalyst" : obscured ? "Catalyst Not Acquired" : item.catalyst.progressDescription);
			this.weaponLevelProgress.text.set(obscured || needsInsertion ? "" : `${Math.floor(progress * 100)}%`);
		}

		const description = Display.description(item.definition);
		this.description.classes.toggle(!description, Classes.Hidden)
			.removeContents()
			.append(Component.create()
				.tweak(Display.applyDescription, description));

		this.statTracker.setItem(item);

		this.perks.setItem(item);

		this.stats.setItem(item);

		this.mods
			.setShaped(item.bucket.isCollections())
			.setItem(item);

		this.notifications.setItem(item);

		const showPattern = item.deepsight?.pattern?.record && !item.shaped;
		this.deepsight.classes.toggle(!showPattern, Classes.Hidden);

		if (showPattern) {
			const complete = !!item.deepsight?.pattern?.progress?.complete;
			this.deepsightPatternLabel
				.text.set(inventory?.isCrafted(item.definition.hash) ? "You have already shaped this weapon."
					: complete ? "This weapon's pattern is unlocked."
						: item.bucket.isCollections() ? "This weapon can be shaped."
							: item.deepsight?.resonance ? "This [b]Pattern[/b] can be extracted."
								: item.deepsight?.activation ? "This [b]Pattern[/b] can be [b]Activated[/b]."
									: "You have extracted this pattern.");

			const progress = !!item.deepsight?.pattern?.progress;
			this.deepsightPatternNumber.classes.toggle(!progress || complete, Classes.Hidden);
			this.deepsightPatternOutOf.classes.toggle(!progress || complete, Classes.Hidden);
			this.deepsightPatternNumber.text.set(`${item.deepsight!.pattern!.progress?.progress ?? 0}`);
			this.deepsightPatternRequired.text.set(`${item.deepsight!.pattern!.progress?.completionValue}`);
			this.deepsightPatternRequiredUnit.classes.toggle(!progress || complete, Classes.Hidden);
			this.deepsightPatternRequiredUnit.text.set("extractions");
		}

		const wishlists = !item.instance || item.shaped ? undefined : await item.getMatchingWishlists();
		this.wishlist.classes.toggle(wishlists === undefined, Classes.Hidden);
		if (wishlists !== undefined)
			this.wishlist.classes.toggle(wishlists && wishlists.length > 0, ItemTooltipClasses.Wishlisted)
				.text.set(!wishlists ? "All rolls of this item are marked as junk."
					: wishlists.length === 0 ? "This item does not match a wishlisted roll."
						: wishlists.length === 1 && wishlists[0].name === "Wishlist" ? "This item matches your wishlist."
							: `This item matches wishlist${wishlists.length > 1 ? "s" : ""}: ${wishlists.map(list => list.name).join(", ")}`);

		const fomoState = item.isFomo();
		this.fomo.classes.toggle(!fomoState, Classes.Hidden)
			.text.set(fomoState === ItemFomoState.TemporaryAvailability ? "This item is currently available."
				: "This item's activity is currently repeatable.");

		const enhancementSocket = true
			&& item.getSocket("Masterwork/Enhancement")
			&& (!item.shaped || item.deepsight?.pattern?.recipe);
		this.enhance.classes.toggle(!enhancementSocket, Classes.Hidden);
		this.enhanceText.text.set(_
			|| (item.shaped && item.deepsight?.pattern?.recipe && "This weapon can be modified at the [b]Relic[/b].")
			|| (!item.shaped && "This weapon can be [b]Enhanced[/b].")
			|| undefined
		);
		this.weaponLevel.classes.toggle(!!enhancementSocket, ItemTooltipClasses.WeaponLevelEnhanced);

		this.note.classes.add(Classes.Hidden);

		const shaped = item.bucket.isCollections() && item.deepsight?.pattern?.progress?.complete && !inventory?.isCrafted(item.definition.hash);
		if (item.isNotAcquired() && !shaped && !item.deepsight?.pattern?.progress?.progress) {
			this.note.classes.remove(Classes.Hidden);
			this.note.text.set("This item has has not been acquired.");
		}

		const owner = item.owner;
		const cls = !owner ? undefined : await DestinyClassDefinition.get(owner.classHash);
		const className = cls?.displayProperties.name ?? "Unknown";
		this.hintPullToCharacter.label.text.set(`Pull to ${className}`);
		this.hintEquipToCharacter.label.text.set(`Equip to ${className}`);
		const inEngramBucket = item.reference.bucketHash === InventoryBucketHashes.Engrams;
		this.hintVault.classes.toggle(item.bucket.isVault() || inEngramBucket || item.bucket.isCollections() || item.bucket.is(InventoryBucketHashes.Consumables) || item.bucket.is(InventoryBucketHashes.Modifications), Classes.Hidden);
		this.hintPullToCharacter.classes.toggle(item.bucket.isCharacter() || !!item.equipped || inEngramBucket || item.bucket.isCollections() || item.bucket.is(InventoryBucketHashes.Consumables) || item.bucket.is(InventoryBucketHashes.Modifications), Classes.Hidden);
		this.hintEquipToCharacter.classes.toggle(!item.bucket.isCharacter() || !!item.equipped, Classes.Hidden);
		this.hintUnequipFromCharacter.classes.toggle(!item.bucket.isCharacter() || !item.equipped, Classes.Hidden);

		const flavour = !!item.definition.flavorText;
		this.flavour.classes.toggle(!flavour, Classes.Hidden);
		this.flavour.text.set(item.definition.flavorText);

		this.randomRollHeading.classes.add(Classes.Hidden);
		this.randomMods.classes.add(Classes.Hidden);

		if (item.bucket.isCollections()) {
			this.detailedMods.setItem(item);

		} else {
			this.detailedMods.setItem(item);

			if (item.isWeapon() && item.collections?.hasRandomRolls()) {
				this.randomRollHeading.classes.remove(Classes.Hidden)
					.text.set(item.shaped ? "This item can be shaped with the following perks:"
						: "This item can roll the following perks:");

				this.randomMods.classes.remove(Classes.Hidden)
					.setShaped(!!item.shaped)
					.setItem(item.collections, "!Intrinsic");
			}
		}

		const source = this.source.setItem(item);
		this.source.classes.toggle(!source, Classes.Hidden);

		const loadouts = this.item.getLoadouts();
		this.loadoutsWrapper.classes.toggle(!loadouts.length, Classes.Hidden);
		if (loadouts.length)
			this.loadouts.removeContents()
				.append(...loadouts.map((loadout, i) => LoadoutComponent.create([])
					.classes.add(ItemTooltipClasses.Loadout)
					.set(i, loadout)));

		this.extra.classes.toggle(!flavour && !this.detailedMods.hasContents() && !source, Classes.Hidden);
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(ItemTooltip));
