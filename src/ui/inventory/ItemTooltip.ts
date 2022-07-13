import { DestinyAmmunitionType } from "bungie-api-ts/destiny2";
import { ITEM_WEAPON_MOD } from "model/models/Items";
import type Item from "model/models/items/Item";
import Manifest from "model/models/Manifest";
import Display from "ui/bungie/DisplayProperties";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import ElementType from "ui/inventory/ElementTypes";
import ItemTooltipStat from "ui/inventory/tooltip/ItemTooltipStat";
import TooltipManager, { Tooltip } from "ui/TooltipManager";

enum ItemTooltipClasses {
	Main = "item-tooltip",
	Content = "item-tooltip-content",
	ProgressBar = "item-tooltip-progress-bar",
	SourceWatermark = "item-tooltip-source-watermark",
	Masterwork = "item-tooltip-masterwork",
	PrimaryInfo = "item-tooltip-primary-info",
	PrimaryStat = "item-tooltip-primary-stat",
	PrimaryStatDamage = "item-tooltip-primary-stat-damage",
	AmmoType = "item-tooltip-ammo-type",
	AmmoPrimary = "item-tooltip-ammo-type-primary",
	AmmoSpecial = "item-tooltip-ammo-type-special",
	AmmoHeavy = "item-tooltip-ammo-type-heavy",
	Energy = "item-tooltip-energy",
	EnergyValue = "item-tooltip-energy-value",
	WeaponLevel = "item-tooltip-weapon-level",
	WeaponLevelLabel = "item-tooltip-weapon-level-label",
	WeaponLevelProgress = "item-tooltip-weapon-level-progress",
	Mods = "item-tooltip-mods",
	Mod = "item-tooltip-mod",
	ModSocket = "item-tooltip-mod-socket",
	ModSocketEnhanced = "item-tooltip-mod-socket-enhanced",
	ModSocketed = "item-tooltip-mod-socketed",
	ModName = "item-tooltip-mod-name",
	Intrinsic = "item-tooltip-mod-intrinsic",
	Deepsight = "item-tooltip-deepsight",
	DeepsightPattern = "item-tooltip-deepsight-pattern",
	DeepsightPatternLabel = "item-tooltip-deepsight-pattern-label",
	DeepsightPatternNumber = "item-tooltip-deepsight-pattern-number",
	DeepsightPatternOutOf = "item-tooltip-deepsight-pattern-out-of",
	DeepsightPatternRequired = "item-tooltip-deepsight-pattern-required",
	DeepsightPatternRequiredUnit = "item-tooltip-deepsight-pattern-required-unit",
	DeepsightProgressBar = "item-tooltip-deepsight-progress-bar",
	DeepsightProgressValue = "item-tooltip-deepsight-progress-value",
}

class ItemTooltip extends Tooltip {

	public item?: Item;
	public source!: Component;
	public primaryInfo!: Component;
	public primaryStat!: Component;
	public ammoType!: Component;
	public energy!: Component;
	public energyValue!: Component;
	public weaponLevel!: Component;
	public weaponLevelLabel!: Component;
	public weaponLevelProgress!: Component;
	public mods!: Component;
	public deepsight!: Component;
	public deepsightPattern!: Component;
	public deepsightPatternLabel!: Component;
	public deepsightPatternNumber!: Component;
	public deepsightPatternOutOf!: Component;
	public deepsightPatternRequired!: Component;
	public deepsightPatternRequiredUnit!: Component;
	public deepsightProgressBar!: Component;
	public deepsightProgressValue!: Component;
	public stats!: ItemTooltipStat.Wrapper;

	protected override onMake () {
		this.classes.add(ItemTooltipClasses.Main);
		this.content.classes.add(ItemTooltipClasses.Content);

		this.source = Component.create()
			.classes.add(ItemTooltipClasses.SourceWatermark, Classes.Hidden)
			.appendTo(this.header);

		this.primaryInfo = Component.create()
			.classes.add(ItemTooltipClasses.PrimaryInfo)
			.appendTo(this.content);

		this.primaryStat = Component.create()
			.classes.add(ItemTooltipClasses.PrimaryStat)
			.appendTo(this.primaryInfo);

		this.ammoType = Component.create()
			.classes.add(ItemTooltipClasses.AmmoType)
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

		this.stats = ItemTooltipStat.Wrapper.create()
			.appendTo(this.content);

		this.mods = Component.create()
			.classes.add(ItemTooltipClasses.Mods)
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

		this.deepsightProgressBar = Component.create()
			.classes.add(ItemTooltipClasses.DeepsightProgressBar, ItemTooltipClasses.ProgressBar)
			.text.add("Attunement Progress")
			.appendTo(this.deepsight);

		this.deepsightProgressValue = Component.create()
			.classes.add(ItemTooltipClasses.DeepsightProgressValue)
			.appendTo(this.deepsightProgressBar);
	}

	public async setItem (item: Item) {
		this.item = item;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).item = item;
		console.log(Display.name(item.definition), item);

		const { DestinyItemTierTypeDefinition, DestinyDamageTypeDefinition, DestinyEnergyTypeDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
		this.classes.removeWhere(cls => cls.startsWith("item-tooltip-tier-"))
			.classes.add(`item-tooltip-tier-${(tier?.displayProperties.name ?? "Common")?.toLowerCase()}`)
			.classes.toggle(item.isMasterwork(), ItemTooltipClasses.Masterwork);

		this.title.text.set(Display.name(item.definition));
		this.subtitle.removeContents();

		this.subtitle.text.set(item.definition.itemTypeDisplayName);
		this.extra.text.set(item.definition.inventory?.tierTypeName);

		this.source.classes.toggle(!item.source?.displayProperties.icon, Classes.Hidden);
		if (item.source?.displayProperties.icon)
			this.source.style.set("--icon", `url("${item.source.displayProperties.icon}")`);

		const damageType = await DestinyDamageTypeDefinition.get(item.instance?.damageTypeHash);

		const primaryStat = item.instance?.primaryStat.value;
		this.primaryStat
			.classes.toggle(primaryStat === undefined, Classes.Hidden)
			.classes.removeWhere(cls => cls.startsWith("item-tooltip-energy-type-"))
			.text.set(`${primaryStat ?? ""}`)
			.style.remove("--icon")
			.classes.toggle(damageType !== undefined, ItemTooltipClasses.PrimaryStatDamage);

		if (damageType !== undefined) {
			const damageTypeName = (damageType?.displayProperties.name ?? "Unknown").toLowerCase();
			this.primaryStat
				.classes.add(`item-tooltip-energy-type-${damageTypeName}`)
				.style.set("--icon", Display.icon(damageType))
				.style.set("--colour", ElementType.getColour(damageTypeName));
		}

		const ammoType = item.definition.equippingBlock?.ammoType;
		this.ammoType.classes.toggle(!ammoType, Classes.Hidden);
		if (ammoType)
			this.ammoType.classes.remove(ItemTooltipClasses.AmmoPrimary, ItemTooltipClasses.AmmoSpecial, ItemTooltipClasses.AmmoHeavy)
				.classes.add(ammoType === DestinyAmmunitionType.Primary ? ItemTooltipClasses.AmmoPrimary
					: ammoType === DestinyAmmunitionType.Special ? ItemTooltipClasses.AmmoSpecial
						: ammoType === DestinyAmmunitionType.Heavy ? ItemTooltipClasses.AmmoHeavy
							: ItemTooltipClasses.AmmoType)
				.text.set(ammoType === DestinyAmmunitionType.Primary ? "Primary"
					: ammoType === DestinyAmmunitionType.Special ? "Special"
						: ammoType === DestinyAmmunitionType.Heavy ? "Heavy"
							: "");

		const energy = item.instance?.energy;
		this.energy.classes.toggle(energy === undefined, Classes.Hidden);
		if (energy !== undefined) {
			const energyType = await DestinyEnergyTypeDefinition.get(energy.energyTypeHash);
			const energyTypeName = (energyType?.displayProperties.name ?? "Unknown").toLowerCase();
			this.energyValue.text.set(`${energy.energyCapacity}`)
				.classes.removeWhere(cls => cls.startsWith("item-tooltip-energy-type-"))
				.classes.add(`item-tooltip-energy-type-${energyTypeName}`)
				.style.set("--icon", Display.icon(energyType))
				.style.set("--colour", ElementType.getColour(energyTypeName));
		}

		this.weaponLevel.classes.toggle(!item.shaped, Classes.Hidden);
		if (item.shaped) {
			const progressObjective = item.shaped.progress?.objective;
			const progress = (progressObjective?.progress ?? 0) / (progressObjective?.completionValue ?? 1);
			this.weaponLevel.style.set("--progress", `${progress}`);
			this.weaponLevelLabel.text.set(`Weapon Lv. ${item.shaped.level?.objective.progress ?? 0}`);
			this.weaponLevelProgress.text.set(`${Math.floor(progress * 100)}%`);
		}

		this.stats.setItem(item);

		this.mods.removeContents();
		const intrinsics: Component[] = [];
		for (const socket of item.sockets?.filter(socket => socket?.definition.plug?.plugCategoryIdentifier === "intrinsics" && Display.name(socket.definition)) ?? []) {
			const socketComponent = Component.create()
				.classes.add(ItemTooltipClasses.ModSocket, ItemTooltipClasses.Intrinsic)
				.appendTo(this.mods);

			intrinsics.push(socketComponent);

			Component.create()
				.classes.add(ItemTooltipClasses.Mod, ItemTooltipClasses.ModSocketed)
				.style.set("--icon", Display.icon(socket?.definition))
				.text.set(Display.name(socket?.definition))
				.appendTo(socketComponent);
		}

		for (const socket of item.plugs?.filter(socket => socket.some(plug => plug.definition?.plug?.plugCategoryIdentifier === "origins")) ?? []) {
			const socketComponent = Component.create()
				.classes.add(ItemTooltipClasses.ModSocket, ItemTooltipClasses.Intrinsic)
				.appendTo(this.mods);

			for (const plug of socket.sort((a, b) => Number(b.socketed) - Number(a.socketed))) {
				Component.create()
					.classes.add(ItemTooltipClasses.Mod)
					.classes.toggle(!!plug?.socketed, ItemTooltipClasses.ModSocketed)
					.style.set("--icon", Display.icon(plug.definition))
					.append(!plug?.socketed ? undefined : Component.create()
						.classes.add(ItemTooltipClasses.ModName)
						.text.set(Display.name(plug.definition) ?? "Unknown"))
					.appendTo(socketComponent);
			}
		}

		let i = 0;
		for (const socket of (item.plugs ?? [])) {
			const isValidSocket = socket.some(plug =>
				// filter out different socket types (a shader or something)
				plug.definition?.itemCategoryHashes?.some(hash => hash === ITEM_WEAPON_MOD)
				|| plug.definition?.plug?.plugCategoryIdentifier === "frames");

			const isInvalidSocket = !isValidSocket || socket.some(plug =>
				plug.definition?.plug?.plugCategoryIdentifier === "intrinsics"
				|| plug.definition?.plug?.plugCategoryIdentifier === "origins"
				|| plug.definition?.plug?.plugCategoryIdentifier === "v400.weapon.mod_empty"
				|| plug.definition?.traitIds?.includes("item_type.ornament.weapon"));
			if (isInvalidSocket)
				continue;

			const socketComponent = Component.create()
				.classes.add(ItemTooltipClasses.ModSocket)
				.classes.toggle(socket.some(plug => plug.definition?.itemTypeDisplayName === "Enhanced Trait"), ItemTooltipClasses.ModSocketEnhanced)
				.style.set("--socket-index", `${i++}`)
				.appendTo(this.mods);

			for (const plug of socket.sort((a, b) => Number(b.socketed) - Number(a.socketed))) {
				Component.create()
					.classes.add(ItemTooltipClasses.Mod)
					.classes.toggle(!!plug?.socketed, ItemTooltipClasses.ModSocketed)
					.style.set("--icon", Display.icon(plug.definition))
					.append(!plug?.socketed ? undefined : Component.create()
						.classes.add(ItemTooltipClasses.ModName)
						.text.set(Display.name(plug.definition) ?? "Unknown"))
					.appendTo(socketComponent);
			}
		}

		const showPattern = item.deepsight?.pattern && !item.shaped;
		this.deepsight.classes.toggle(!item.deepsight?.attunement && !showPattern, Classes.Hidden);

		this.deepsightPattern.classes.toggle(!showPattern, Classes.Hidden);
		if (showPattern) {
			const complete = !!item.deepsight?.pattern?.progress.complete;
			this.deepsightPatternLabel
				.text.set(complete ? "This weapon's Pattern is unlocked."
					: !item.deepsight?.attunement ? "This weapon can be shaped." : "Attune to extract the Pattern.");
			this.deepsightPatternNumber.classes.toggle(complete, Classes.Hidden);
			this.deepsightPatternOutOf.classes.toggle(complete, Classes.Hidden);
			this.deepsightPatternNumber.text.set(`${item.deepsight!.pattern!.progress.progress ?? 0}`);
			this.deepsightPatternRequired.text.set(`${item.deepsight!.pattern!.progress.completionValue}`);
			this.deepsightPatternRequiredUnit.classes.toggle(complete, Classes.Hidden);
			this.deepsightPatternRequiredUnit.text.set("extractions");
		}

		this.deepsightProgressBar.classes.toggle(!item.deepsight?.attunement, Classes.Hidden);
		if (item.deepsight?.attunement) {
			const progress = (item.deepsight.attunement.objective.progress ?? 0) / item.deepsight.attunement.objective.completionValue;
			this.deepsightProgressBar.style.set("--progress", `${progress}`);
			this.deepsightProgressValue.text.set(`${Math.floor(progress * 100)}%`);
		}
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(ItemTooltip));
