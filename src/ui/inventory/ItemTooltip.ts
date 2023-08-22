import { BucketHashes, ItemPerkVisibility } from "bungie-api-ts/destiny2";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import { CharacterId } from "model/models/items/Item";
import { PlugType } from "model/models/items/Plugs";
import Manifest from "model/models/Manifest";
import Display from "ui/bungie/DisplayProperties";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import { Hint, IInput } from "ui/Hints";
import ElementType from "ui/inventory/ElementTypes";
import ItemAmmo from "ui/inventory/tooltip/ItemAmmo";
import ItemStat from "ui/inventory/tooltip/ItemStat";
import ItemStatTracker from "ui/inventory/tooltip/ItemStatTracker";
import TooltipManager, { Tooltip } from "ui/TooltipManager";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";

enum ItemTooltipClasses {
	Main = "item-tooltip",
	Content = "item-tooltip-content",
	ProgressBar = "item-tooltip-progress-bar",
	SourceWatermark = "item-tooltip-source-watermark",
	Masterwork = "item-tooltip-masterwork",
	PrimaryInfo = "item-tooltip-primary-info",
	PrimaryStat = "item-tooltip-primary-stat",
	PrimaryStatDamage = "item-tooltip-primary-stat-damage",
	Energy = "item-tooltip-energy",
	EnergyValue = "item-tooltip-energy-value",
	WeaponLevel = "item-tooltip-weapon-level",
	WeaponLevelLabel = "item-tooltip-weapon-level-label",
	WeaponLevelProgress = "item-tooltip-weapon-level-progress",
	Mods = "item-tooltip-mods",
	Mod = "item-tooltip-mod",
	ModSocket = "item-tooltip-mod-socket",
	ModSocketEnhanced = "item-tooltip-mod-socket-enhanced",
	ModSocketDefinition = "item-tooltip-mod-socket-definition",
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
	Wishlist = "item-tooltip-wishlist",
	Wishlisted = "item-tooltip-wishlisted",
	Note = "item-tooltip-note",
	Hints = "item-tooltip-hints",
}

class ItemTooltip extends Tooltip {

	public item?: Item;
	public source!: Component;
	public primaryInfo!: Component;
	public primaryStat!: Component;
	public ammoType!: ItemAmmo;
	public energy!: Component;
	public energyValue!: Component;
	public weaponLevel!: Component;
	public weaponLevelLabel!: Component;
	public weaponLevelProgress!: Component;
	public statTracker!: ItemStatTracker;
	public mods!: Component;
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
	public hintInspect!: Hint;

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

		this.stats = ItemStat.Wrapper.create()
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

		this.hintPullToCharacter = Hint.create([IInput.get("MouseLeft")])
			.appendTo(this.hints);

		this.hintVault = Hint.create([IInput.get("MouseLeft", "Shift")])
			.tweak(hint => hint.label.text.set("Vault"))
			.appendTo(this.hints);

		this.hintInspect = Hint.create([IInput.get("MouseRight")])
			.tweak(hint => hint.label.text.set("Details"))
			.appendTo(this.hints);

		this.onGlobalKeydown = this.onGlobalKeydown.bind(this);
		this.onGlobalKeyup = this.onGlobalKeyup.bind(this);
		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
		UiEventBus.subscribe("keyup", this.onGlobalKeyup);
	}

	protected onGlobalKeydown (event: IKeyEvent) {
		if (event.use("Control")) {
			this.hintInspect.label.text.set("Collections");
		}
	}

	protected onGlobalKeyup (event: IKeyEvent) {
		if (event.use("Control")) {
			this.hintInspect.label.text.set("Details");
		}
	}

	public async setItem (item: Item, inventory?: Inventory) {
		this.item = item;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).item = item;
		console.log(Display.name(item.definition), item);

		const character = inventory?.getCharacter(item.character);

		const { DestinyItemTierTypeDefinition, DestinyDamageTypeDefinition, DestinyEnergyTypeDefinition, DestinyClassDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
		this.classes.removeWhere(cls => cls.startsWith("item-tooltip-tier-"))
			.classes.add(`item-tooltip-tier-${(item.definition.inventory?.tierTypeName ?? tier?.displayProperties.name ?? "Common")?.toLowerCase()}`)
			.classes.toggle(item.isMasterwork(), ItemTooltipClasses.Masterwork);

		this.title.text.set(Display.name(item.definition));
		this.subtitle.removeContents();

		this.subtitle.text.set(item.definition.itemTypeDisplayName ?? "Unknown");
		this.extra.text.set(item.definition.inventory?.tierTypeName);

		this.source.classes.toggle(!item.source?.displayProperties.icon, Classes.Hidden);
		if (item.source?.displayProperties.icon)
			this.source.style.set("--icon", `url("${item.source.displayProperties.icon}")`);

		const damageType = await DestinyDamageTypeDefinition.get(item.instance?.damageTypeHash ?? item.definition.defaultDamageTypeHash);

		const primaryStat = item.getPower();
		this.primaryStat
			.classes.toggle(!primaryStat && damageType === undefined, Classes.Hidden)
			.classes.removeWhere(cls => cls.startsWith("item-tooltip-energy-type-"))
			.text.set(`${primaryStat || character?.power || "0"}`)
			.style.remove("--icon")
			.classes.toggle(damageType !== undefined, ItemTooltipClasses.PrimaryStatDamage);

		if (damageType !== undefined) {
			const damageTypeName = (damageType?.displayProperties.name ?? "Unknown").toLowerCase();
			this.primaryStat
				.classes.add(`item-tooltip-energy-type-${damageTypeName}`)
				.style.set("--icon", Display.icon(damageType))
				.style.set("--colour", ElementType.getColour(damageTypeName));
		}

		this.ammoType.setItem(item);

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
			const progressObjective = item.shaped.progress?.progress;
			const progress = (progressObjective?.progress ?? 0) / (progressObjective?.completionValue ?? 1);
			this.weaponLevel.style.set("--progress", `${progress}`);
			this.weaponLevelLabel.text.set(`Weapon Lv. ${item.shaped.level?.progress.progress ?? 0}`);
			this.weaponLevelProgress.text.set(`${Math.floor(progress * 100)}%`);
		}

		this.statTracker.setItem(item);

		this.stats.setItem(item);

		this.mods.removeContents();
		for (const socket of item.getSockets(PlugType.Intrinsic)) {
			if (socket.state?.isVisible === false || !socket.socketedPlug.definition?.displayProperties.name)
				continue;

			const socketComponent = Component.create()
				.classes.add(ItemTooltipClasses.ModSocket, ItemTooltipClasses.Intrinsic)
				.appendTo(this.mods);

			Component.create()
				.classes.add(ItemTooltipClasses.Mod, ItemTooltipClasses.ModSocketed)
				.style.set("--icon", Display.icon(socket?.socketedPlug?.definition))
				.text.set(Display.name(socket?.socketedPlug?.definition))
				.appendTo(socketComponent);
		}

		for (const socket of this.item.getSockets(PlugType.Catalyst))
			for (const plug of socket.plugs)
				for (const perk of plug.perks) {
					if (perk.perkVisibility === ItemPerkVisibility.Hidden || !perk.definition.isDisplayable)
						continue;

					const socketComponent = Component.create()
						.classes.add(ItemTooltipClasses.ModSocket, ItemTooltipClasses.Intrinsic)
						.appendTo(this.mods);

					Component.create()
						.classes.add(ItemTooltipClasses.Mod, ItemTooltipClasses.ModSocketed)
						.style.set("--icon", Display.icon(perk?.definition))
						.text.set(Display.name(perk?.definition))
						.appendTo(socketComponent);
				}

		for (const socket of item.getSockets(PlugType.Origin)) {
			const socketComponent = Component.create()
				.classes.add(ItemTooltipClasses.ModSocket, ItemTooltipClasses.Intrinsic)
				.appendTo(this.mods);

			for (const plug of socket.plugs.slice().sort((a, b) => Number(b.socketed) - Number(a.socketed))) {
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
		for (const socket of item.getSockets(PlugType.Perk)) {
			if (!socket)
				continue;

			const socketComponent = Component.create()
				.classes.add(ItemTooltipClasses.ModSocket)
				.classes.toggle(socket.state !== undefined && socket.plugs.some(plug => plug.definition?.itemTypeDisplayName === "Enhanced Trait"), ItemTooltipClasses.ModSocketEnhanced)
				.classes.toggle(socket.state === undefined, ItemTooltipClasses.ModSocketDefinition)
				.style.set("--socket-index", `${i++}`)
				.appendTo(this.mods);

			for (const plug of socket.plugs.slice().sort((a, b) => Number(b.socketed) - Number(a.socketed))) {
				if (!socket.state && plug.is(PlugType.Enhanced))
					// skip enhanced perks (duplicates) if this is an item definition (ie no actual socket state)
					continue;

				Component.create()
					.classes.add(ItemTooltipClasses.Mod)
					.classes.toggle(!!plug?.socketed, ItemTooltipClasses.ModSocketed)
					.style.set("--icon", Display.icon(plug.definition))
					.append(!plug?.socketed || (!socket.state && socket.plugs.length > 1) ? undefined : Component.create()
						.classes.add(ItemTooltipClasses.ModName)
						.text.set(Display.name(plug.definition) ?? "Unknown"))
					.appendTo(socketComponent);
			}
		}

		for (const socket of item.getSockets(PlugType.Mod)) {
			if (!socket)
				continue;

			const plug = socket.socketedPlug;
			const displayablePerks = socket.socketedPlug.perks
				.filter(perk => perk.perkVisibility !== ItemPerkVisibility.Hidden && perk.definition.isDisplayable);

			for (const perk of displayablePerks) {
				const socketComponent = Component.create()
					.classes.add(ItemTooltipClasses.ModSocket)
					.style.set("--socket-index", `${i++}`)
					.appendTo(this.mods);

				Component.create()
					.classes.add(ItemTooltipClasses.Mod, ItemTooltipClasses.ModSocketed)
					.style.set("--icon", Display.icon(perk.definition))
					.append(Component.create()
						.classes.add(ItemTooltipClasses.ModName)
						.text.set(Display.descriptionIfShortOrName(perk.definition, displayablePerks.length === 1 ? plug.definition : undefined) ?? "Unknown"))
					.appendTo(socketComponent);
			}
		}

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
		this.hintVault.classes.toggle(item.bucket === "vault" || !!item.equipped || isEngram || item.bucket === "collections", Classes.Hidden);
		this.hintPullToCharacter.classes.toggle(CharacterId.is(item.bucket) || !!item.equipped || isEngram || item.bucket === "collections", Classes.Hidden);
		this.hintEquipToCharacter.classes.toggle(!CharacterId.is(item.bucket) || !!item.equipped, Classes.Hidden);
		this.hintInspect.classes.toggle(isEngram, Classes.Hidden);
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(ItemTooltip));
