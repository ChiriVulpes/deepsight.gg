import { BucketHashes, ItemCategoryHashes } from "bungie-api-ts/destiny2";
import type Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import { CharacterId } from "model/models/items/Item";
import { PlugType } from "model/models/items/Plugs";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import { Hint, IInput } from "ui/Hints";
import TooltipManager, { Tooltip } from "ui/TooltipManager";
import type { IKeyEvent, IKeyUpEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import Display from "ui/bungie/DisplayProperties";
import ElementType from "ui/inventory/ElementTypes";
import ItemAmmo from "ui/inventory/tooltip/ItemAmmo";
import ItemStat from "ui/inventory/tooltip/ItemStat";
import ItemStatTracker from "ui/inventory/tooltip/ItemStatTracker";
import ItemTooltipMods from "ui/inventory/tooltip/ItemTooltipMods";

enum ItemTooltipClasses {
	Main = "item-tooltip",
	Content = "item-tooltip-content",
	ProgressBar = "item-tooltip-progress-bar",
	SourceWatermark = "item-tooltip-source-watermark",
	Locked = "item-tooltip-locked",
	Masterwork = "item-tooltip-masterwork",
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
	Description = "item-tooltip-description",
	Deepsight = "item-tooltip-deepsight",
	DeepsightPattern = "item-tooltip-deepsight-pattern",
	DeepsightPatternLabel = "item-tooltip-deepsight-pattern-label",
	DeepsightPatternNumber = "item-tooltip-deepsight-pattern-number",
	DeepsightPatternOutOf = "item-tooltip-deepsight-pattern-out-of",
	DeepsightPatternRequired = "item-tooltip-deepsight-pattern-required",
	DeepsightPatternRequiredUnit = "item-tooltip-deepsight-pattern-required-unit",
	DeepsightProgressBar = "item-tooltip-deepsight-progress-bar",
	DeepsightProgressValue = "item-tooltip-deepsight-progress-value",
	Wishlist = "item-tooltip-wishlist",
	Wishlisted = "item-tooltip-wishlisted",
	Note = "item-tooltip-note",
	NoteHeading = "item-tooltip-note-heading",
	Hints = "item-tooltip-hints",
	Flavour = "item-tooltip-flavour",
	RandomRollHeading = "item-tooltip-random-roll-heading",
}

class ItemTooltip extends Tooltip {

	public item?: Item;
	public source!: Component;
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
	public mods!: ItemTooltipMods;
	public deepsight!: Component;
	public deepsightPattern!: Component;
	public deepsightPatternLabel!: Component;
	public deepsightPatternNumber!: Component;
	public deepsightPatternOutOf!: Component;
	public deepsightPatternRequired!: Component;
	public deepsightPatternRequiredUnit!: Component;
	public wishlist!: Component;
	public note!: Component;
	public stats!: ItemStat.Wrapper;
	public hints!: Component;
	public hintVault!: Hint;
	public hintPullToCharacter!: Hint;
	public hintEquipToCharacter!: Hint;
	public hintUnequipFromCharacter!: Hint;
	public hintInspect!: Hint;
	public flavour!: Component;
	public detailedMods!: ItemTooltipMods;
	public randomRollHeading!: Component;
	public randomMods!: ItemTooltipMods;
	public randomHints!: Component;
	public hintCollections!: Hint;

	protected override onMake () {
		this.classes.add(ItemTooltipClasses.Main);
		this.content.classes.add(ItemTooltipClasses.Content);

		this.source = Component.create()
			.classes.add(ItemTooltipClasses.SourceWatermark, Classes.Hidden)
			.appendTo(this.header);

		this.locked = Component.create()
			.classes.add(ItemTooltipClasses.Locked, Classes.Hidden)
			.appendTo(this.tier);

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
			.text.set("Power")
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

		this.stats = ItemStat.Wrapper.create()
			.appendTo(this.content);

		this.mods = ItemTooltipMods.create()
			.appendTo(this.content);

		this.deepsight = Component.create()
			.classes.add(ItemTooltipClasses.Deepsight)
			.appendTo(this.content);

		this.deepsightPattern = Component.create()
			.classes.add(ItemTooltipClasses.DeepsightPattern)
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
			.appendTo(this.deepsight);

		this.wishlist = Component.create()
			.classes.add(ItemTooltipClasses.Wishlist)
			.appendTo(this.content);

		this.note = Component.create()
			.classes.add(ItemTooltipClasses.Note)
			.appendTo(this.content);

		this.hints = Component.create()
			.classes.add(ItemTooltipClasses.Hints)
			.appendTo(this.footer);

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

		this.randomHints = Component.create()
			.classes.add(ItemTooltipClasses.Hints)
			.appendTo(this.extra.footer);

		this.hintCollections = Hint.create([IInput.get("MouseRight", "Shift")])
			.tweak(hint => hint.label.text.set("Collections"))
			.appendTo(this.randomHints);

		this.onGlobalKeydown = this.onGlobalKeydown.bind(this);
		this.onGlobalKeyup = this.onGlobalKeyup.bind(this);
		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
		UiEventBus.subscribe("keyup", this.onGlobalKeyup);
	}

	protected onGlobalKeydown (event: IKeyEvent) {
		if (event.matches("Shift")) {
			this.hintInspect.label.text.set("Collections");
		}
	}

	protected onGlobalKeyup (event: IKeyUpEvent) {
		if (event.matches("Shift")) {
			this.hintInspect.label.text.set("Details");

			if (!event.usedAnotherKeyDuring)
				void this.item?.setLocked(!this.item.isLocked())
					.then(locked => this.locked.classes.toggle(!locked, Classes.Hidden));
		}
	}

	public async setItem (item: Item, inventory?: Inventory) {
		this.item = item;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).$i = (window as any).item = item;
		console.log(Display.name(item.definition), item);

		const character = inventory?.getCharacter(item.character);

		const { DestinyItemTierTypeDefinition, DestinyDamageTypeDefinition, DestinyClassDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
		this.classes.removeWhere(cls => cls.startsWith("item-tooltip-tier-"))
			.classes.add(`item-tooltip-tier-${(item.definition.inventory?.tierTypeName ?? tier?.displayProperties.name ?? "Common")?.toLowerCase()}`)
			.classes.toggle(item.isMasterwork(), ItemTooltipClasses.Masterwork);

		this.title.text.set(Display.name(item.definition));
		this.subtitle.removeContents();

		this.subtitle.text.set(item.definition.itemTypeDisplayName ?? "Unknown");
		this.tier.text.set(item.definition.inventory?.tierTypeName);

		this.locked.classes.toggle(!item.isLocked(), Classes.Hidden);

		this.source.classes.toggle(!item.source?.displayProperties.icon, Classes.Hidden);
		if (item.source?.displayProperties.icon)
			this.source.style.set("--icon", `url("${item.source.displayProperties.icon}")`);

		const primaryStat = item.getPower();
		const damageType = await DestinyDamageTypeDefinition.get(item.instance?.damageTypeHash ?? item.definition.defaultDamageTypeHash);
		const energy = item.instance?.energy;
		const ammoType = item.definition.equippingBlock?.ammoType;

		this.primaryStat
			.classes.toggle(!primaryStat && damageType === undefined, Classes.Hidden)
			.classes.toggle(!!ammoType || !!energy, ItemTooltipClasses.PrimaryStatHasElementRight)
			.classes.removeWhere(cls => cls.startsWith("item-tooltip-energy-type-"));

		this.primaryStatValue
			.text.set(`${primaryStat || character?.power || "0"}`)
			.classes.toggle(damageType !== undefined, ItemTooltipClasses.PrimaryStatDamage);

		this.primaryStatDamageIcon.classes.toggle(damageType === undefined, Classes.Hidden);

		if (damageType !== undefined) {
			const damageTypeName = (damageType?.displayProperties.name ?? "Unknown").toLowerCase();
			this.primaryStatValue
				.classes.add(`item-tooltip-energy-type-${damageTypeName}`)
				.style.set("--colour", ElementType.getColour(damageTypeName));

			this.primaryStatDamageIcon.attributes.set("src", Display.icon(damageType, false))
		}

		this.primaryStatLabel.classes.toggle(!!item.definition.equippingBlock?.ammoType || energy !== undefined, Classes.Hidden);

		this.ammoType.setItem(item);

		this.energy.classes.toggle(energy === undefined, Classes.Hidden);
		if (energy !== undefined)
			this.energyValue.text.set(`${energy.energyCapacity}`);

		this.weaponLevel.classes.toggle(!item.shaped, Classes.Hidden);
		if (item.shaped) {
			const progressObjective = item.shaped.progress?.progress;
			const progress = (progressObjective?.progress ?? 0) / (progressObjective?.completionValue ?? 1);
			this.weaponLevel.style.set("--progress", `${progress}`);
			this.weaponLevelLabel.text.set(`Weapon Lv. ${item.shaped.level?.progress.progress ?? 0}`);
			this.weaponLevelProgress.text.set(`${Math.floor(progress * 100)}%`);
		}

		const description = Display.description(item.definition);
		this.description.classes.toggle(!description, Classes.Hidden)
			.text.set(description);

		this.statTracker.setItem(item);

		this.stats.setItem(item);

		this.mods
			.setShaped(item.bucket === "collections")
			.setItem(item);

		const showPattern = item.deepsight?.pattern && !item.shaped;
		this.deepsight.classes.toggle(!item.deepsight?.resonance && !showPattern, Classes.Hidden);

		this.deepsightPattern.classes.toggle(!showPattern, Classes.Hidden);
		if (showPattern) {
			const complete = !!item.deepsight?.pattern?.progress.complete;
			this.deepsightPatternLabel
				.text.set(inventory?.craftedItems.has(item.definition.hash) ? "You have already shaped this weapon."
					: complete ? "This weapon's pattern is unlocked."
						: item.bucket === "collections" ? "This weapon can be shaped."
							: item.deepsight?.resonance ? "This [b]Pattern[/b] can be extracted."
								: item.deepsight?.activation ? "This [b]Pattern[/b] can be [b]Activated[/b]."
									: "You have extracted this pattern.");

			this.deepsightPatternNumber.classes.toggle(complete, Classes.Hidden);
			this.deepsightPatternOutOf.classes.toggle(complete, Classes.Hidden);
			this.deepsightPatternNumber.text.set(`${item.deepsight!.pattern!.progress.progress ?? 0}`);
			this.deepsightPatternRequired.text.set(`${item.deepsight!.pattern!.progress.completionValue}`);
			this.deepsightPatternRequiredUnit.classes.toggle(complete, Classes.Hidden);
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

		this.note.classes.add(Classes.Hidden);

		const shaped = item.bucket === "collections" && item.deepsight?.pattern?.progress.complete && !inventory?.craftedItems.has(item.definition.hash);
		if (item.isNotAcquired() && !shaped && !item.deepsight?.pattern?.progress.progress) {
			this.note.classes.remove(Classes.Hidden);
			this.note.text.set("This item has has not been acquired.");
		}

		const cls = !character ? undefined : await DestinyClassDefinition.get(character.classHash);
		const className = cls?.displayProperties.name ?? "Unknown";
		this.hintPullToCharacter.label.text.set(`Pull to ${className}`);
		this.hintEquipToCharacter.label.text.set(`Equip to ${className}`);
		const isEngram = item.reference.bucketHash === BucketHashes.Engrams;
		this.hintVault.classes.toggle(item.bucket === "vault" || isEngram || item.bucket === "collections" || item.bucket === "consumables" || item.bucket === "modifications", Classes.Hidden);
		this.hintPullToCharacter.classes.toggle(CharacterId.is(item.bucket) || !!item.equipped || isEngram || item.bucket === "collections" || item.bucket === "consumables" || item.bucket === "modifications", Classes.Hidden);
		this.hintEquipToCharacter.classes.toggle(!CharacterId.is(item.bucket) || !!item.equipped, Classes.Hidden);
		this.hintUnequipFromCharacter.classes.toggle(!CharacterId.is(item.bucket) || !item.equipped, Classes.Hidden);

		const flavour = !!item.definition.flavorText;
		this.flavour.classes.toggle(!flavour, Classes.Hidden);
		this.flavour.text.set(item.definition.flavorText);

		this.randomRollHeading.classes.add(Classes.Hidden);
		this.randomMods.classes.add(Classes.Hidden);

		if (item.bucket === "collections") {
			this.detailedMods.setItem(item, PlugType.ALL, PlugType.Perk);

		} else {
			this.detailedMods.setItem(item);

			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			if (item.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon) && item.collections?.hasRandomRolls()) {
				this.randomRollHeading.classes.remove(Classes.Hidden)
					.text.set(item.shaped ? "This item can be shaped with the following perks:"
						: "This item can roll the following perks:");

				this.randomMods.classes.remove(Classes.Hidden)
					.setShaped(!!item.shaped)
					.setItem(item.collections, PlugType.Perk);
			}
		}

		this.extra.classes.toggle(!flavour && !this.detailedMods.hasContents(), Classes.Hidden);
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(ItemTooltip));
