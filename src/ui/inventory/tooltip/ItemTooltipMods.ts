import { ItemPerkVisibility } from "bungie-api-ts/destiny2";
import type Item from "model/models/items/Item";
import type { PlugType } from "model/models/items/Plugs";
import Component from "ui/Component";
import Display from "ui/bungie/DisplayProperties";
import LoadedIcon from "ui/bungie/LoadedIcon";

export enum ItemTooltipModsClasses {
	Main = "item-tooltip-mods",
	Detailed = "item-tooltip-mods-detailed",
	Shaped = "item-tooltip-mods-shaped",
	Mod = "item-tooltip-mod",
	ModEnhanced = "item-tooltip-mod-enhanced",
	ModEnhancedArrow = "item-tooltip-mod-enhanced-arrow",
	ModSocket = "item-tooltip-mod-socket",
	ModIntrinsic = "item-tooltip-mod-intrinsic",
	ModSocketEnhanced = "item-tooltip-mod-socket-enhanced",
	ModSocketDefinition = "item-tooltip-mod-socket-definition",
	ModSocketed = "item-tooltip-mod-socketed",
	ModHasName = "item-tooltip-mod-has-name",
	ModName = "item-tooltip-mod-name",
	ModRequiredLevel = "item-tooltip-mod-required-level",
	ModRequiredLevelAdept = "item-tooltip-mod-required-level-adept",
	ModDescription = "item-tooltip-mod-description",
	ModHasDescription = "item-tooltip-mod-has-description",
	ModIcon = "item-tooltip-mod-icon",
}

export default class ItemTooltipMods extends Component {

	public randomRollHeading!: Component;

	protected override onMake (): void {
		this.classes.add(ItemTooltipModsClasses.Main);
	}

	public setDetailed (detailed = true) {
		this.classes.toggle(detailed, ItemTooltipModsClasses.Detailed);
		return this;
	}

	public setShaped (shaped = true) {
		this.classes.toggle(shaped, ItemTooltipModsClasses.Shaped);
		return this;
	}

	public isDetailed () {
		return this.classes.has(ItemTooltipModsClasses.Detailed);
	}

	public isShaped () {
		return this.classes.has(ItemTooltipModsClasses.Shaped);
	}

	public setItem (item: Item, ...filters: PlugType.Query[]) {
		this.removeContents();

		this.addSockets(item, ItemTooltipModsClasses.ModIntrinsic, "Intrinsic", "!Intrinsic/Origin", ...filters);
		this.addPerks(item, ItemTooltipModsClasses.ModIntrinsic, "=Masterwork/ExoticCatalyst", ...filters);
		this.addSockets(item, ItemTooltipModsClasses.ModIntrinsic, "Intrinsic/Origin", ...filters);
		this.addSockets(item, undefined, "Perk", ...filters);
		this.addPerks(item, undefined, "Mod", ...filters);
		return this;
	}

	private addPerks (item: Item, socketClass?: ItemTooltipModsClasses, ...anyOfTypes: PlugType.Query[]) {
		const detailed = this.isDetailed();

		let i = 0;
		for (const socket of item.getSockets(...anyOfTypes)) {
			if (!socket.state || socket.state.isVisible === false)
				continue;

			const plug = socket.socketedPlug;
			const displayablePerks = socket.socketedPlug?.perks
				.filter(perk => perk.perkVisibility !== ItemPerkVisibility.Hidden && perk.definition.isDisplayable
					&& (socket.is("Masterwork/ExoticCatalyst") ? item.isMasterwork() : undefined))
				?? [];

			for (const perk of displayablePerks) {
				const socketComponent = Component.create()
					.classes.add(ItemTooltipModsClasses.ModSocket, ...socketClass ? [socketClass] : [])
					.classes.toggle(socket.state !== undefined && socket.plugs.some(plug => plug.is("=Masterwork/ExoticCatalyst")), ItemTooltipModsClasses.ModSocketEnhanced)
					.style.set("--socket-index", `${i++}`)
					.appendTo(this);

				const name = detailed ? Display.nameIfShortOrName(perk.definition, plug?.definition)
					: Display.descriptionIfShortOrName(perk.definition, plug?.definition) ?? "Unknown";
				const description = Display.description(perk.definition);

				const isEnhanced = plug?.is("=Masterwork/ExoticCatalyst") ?? false;

				Component.create()
					.classes.add(ItemTooltipModsClasses.Mod, ItemTooltipModsClasses.ModSocketed, ItemTooltipModsClasses.ModHasName)
					.classes.toggle(isEnhanced, ItemTooltipModsClasses.ModEnhanced)
					.append(LoadedIcon.create([Display.icon(perk.definition, false)])
						.classes.add(ItemTooltipModsClasses.ModIcon))
					.append(!isEnhanced ? undefined : Component.create()
						.classes.add(ItemTooltipModsClasses.ModEnhancedArrow))
					.append(Component.create()
						.classes.add(ItemTooltipModsClasses.ModName)
						.text.set(name))
					.append(!detailed || !description || description === name ? undefined : Component.create()
						.classes.add(ItemTooltipModsClasses.ModDescription)
						.text.set(description))
					.appendTo(socketComponent);
			}
		}
	}

	private addSockets (item: Item, socketClass?: ItemTooltipModsClasses, ...anyOfTypes: PlugType.Query[]) {
		const isCollections = item.bucket.isCollections();

		let i = 0;
		let traitIndex = 0;
		for (const socket of item.getSockets(...anyOfTypes)) {
			if (!socket || socket.state?.isVisible === false)
				continue;

			const willDisplayMoreThanOnePlug = isCollections && socket.plugs.length > 1;
			if (willDisplayMoreThanOnePlug && (this.isDetailed() || !socket.plugs.some(plug => Display.icon(plug.definition))))
				continue;

			const socketComponent = Component.create()
				.classes.add(ItemTooltipModsClasses.ModSocket, ...socketClass ? [socketClass] : [])
				.classes.toggle(socket.state !== undefined && socket.plugs.some(plug => plug.is("Perk/TraitEnhanced", "Intrinsic/FrameEnhanced")), ItemTooltipModsClasses.ModSocketEnhanced)
				.classes.toggle(socket.state === undefined, ItemTooltipModsClasses.ModSocketDefinition)
				.style.set("--socket-index", `${i++}`)
				.appendTo(this);

			let j = 0;
			for (const plug of socket.plugs.slice().sort((a, b) => Number(b.socketed && !isCollections) - Number(a.socketed && !isCollections))) {
				if (!socket.state && plug.is("Intrinsic/FrameEnhanced"))
					// skip enhanced intrinsics (duplicates) if this is an item definition (ie no actual socket state)
					continue;

				if (plug.is("Perk/TraitLocked"))
					continue;

				const isEnhanced = plug.is("Perk/TraitEnhanced", "Intrinsic/FrameEnhanced");
				if (!item.shaped && isEnhanced && (!plug.craftingRequirements?.unlockRequirements.length || !this.isShaped()))
					continue;

				if (j++ && plug.is("Intrinsic/Exotic"))
					continue;

				const plugComponent = Component.create()
					.classes.add(ItemTooltipModsClasses.Mod)
					.classes.toggle(!!plug?.socketed, ItemTooltipModsClasses.ModSocketed)
					.classes.toggle(isEnhanced, ItemTooltipModsClasses.ModEnhanced)
					.append(LoadedIcon.create([Display.icon(plug.definition, false)])
						.classes.add(ItemTooltipModsClasses.ModIcon))
					.appendTo(socketComponent);

				if (isEnhanced)
					Component.create()
						.classes.add(ItemTooltipModsClasses.ModEnhancedArrow)
						.appendTo(plugComponent);

				if (item.shaped && item.isAdept() && socket.is("Perk/Trait")) {
					const requiredLevel = traitIndex ? 17 : 11;
					const currentLevel = item.shaped.level?.progress.progress ?? 0;
					if (currentLevel < requiredLevel)
						Component.create()
							.classes.add(ItemTooltipModsClasses.ModRequiredLevel, ItemTooltipModsClasses.ModRequiredLevelAdept)
							.text.set(`${requiredLevel}`)
							.appendTo(plugComponent);
					traitIndex++;
				}

				if (plug?.socketed && (socket.state || (socket.plugs.length === 1 || socket.is("Intrinsic")))) {
					plugComponent.classes.add(ItemTooltipModsClasses.ModHasName);
					Component.create()
						.classes.add(ItemTooltipModsClasses.ModName)
						.text.set(Display.name(plug.definition) ?? "Unknown")
						.appendTo(plugComponent);

					const description = this.isDetailed() && Display.description(plug.definition);
					if (description)
						Component.create()
							.classes.add(ItemTooltipModsClasses.ModDescription)
							.text.set(description)
							.appendTo(plugComponent.classes.add(ItemTooltipModsClasses.ModHasDescription));

				} else if (item.deepsight?.pattern && isCollections && this.isShaped()) {
					Component.create()
						.classes.add(ItemTooltipModsClasses.ModRequiredLevel)
						.text.set(`${plug.craftingRequirements?.requiredLevel ?? 1}`)
						.appendTo(plugComponent);
				}

				if (this.isDetailed())
					break;
			}
		}
	}
}
