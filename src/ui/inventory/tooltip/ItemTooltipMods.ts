import { ItemPerkVisibility } from "bungie-api-ts/destiny2";
import type Item from "model/models/items/Item";
import { PlugType } from "model/models/items/Plugs";
import Component from "ui/Component";
import Display from "ui/bungie/DisplayProperties";

export enum ItemTooltipModsClasses {
	Main = "item-tooltip-mods",
	Detailed = "item-tooltip-mods-detailed",
	Shaped = "item-tooltip-mods-shaped",
	Mod = "item-tooltip-mod",
	ModSocket = "item-tooltip-mod-socket",
	ModSocketEnhanced = "item-tooltip-mod-socket-enhanced",
	ModSocketDefinition = "item-tooltip-mod-socket-definition",
	ModSocketed = "item-tooltip-mod-socketed",
	ModName = "item-tooltip-mod-name",
	ModRequiredLevel = "item-tooltip-mod-required-level",
	ModDescription = "item-tooltip-mod-description",
	Intrinsic = "item-tooltip-mod-intrinsic",
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

	public setItem (item: Item, type: PlugType = PlugType.ALL, exclude = PlugType.None) {
		this.removeContents();

		this.addPerks(item, PlugType.Catalyst & type & ~exclude, ItemTooltipModsClasses.Intrinsic);
		this.addSockets(item, PlugType.Intrinsic & type & ~exclude, ItemTooltipModsClasses.Intrinsic);
		this.addSockets(item, PlugType.Origin & type & ~exclude, ItemTooltipModsClasses.Intrinsic);
		this.addSockets(item, PlugType.Perk & type & ~exclude);
		this.addPerks(item, PlugType.Mod & type & ~exclude);
		return this;
	}

	private addPerks (item: Item, type: PlugType, socketClass?: ItemTooltipModsClasses) {
		const detailed = this.isDetailed();

		let i = 0;
		for (const socket of item.getSockets(type)) {
			if (!socket || socket.state?.isVisible === false)
				continue;

			const plug = socket.socketedPlug;
			const displayablePerks = socket.socketedPlug?.perks
				.filter(perk => perk.perkVisibility !== ItemPerkVisibility.Hidden && perk.definition.isDisplayable)
				?? [];

			for (const perk of displayablePerks) {
				const socketComponent = Component.create()
					.classes.add(ItemTooltipModsClasses.ModSocket, ...socketClass ? [socketClass] : [])
					.style.set("--socket-index", `${i++}`)
					.appendTo(this);

				const name = detailed ? Display.nameIfShortOrName(perk.definition, plug?.definition)
					: Display.descriptionIfShortOrName(perk.definition, plug?.definition) ?? "Unknown";
				const description = Display.description(perk.definition);

				Component.create()
					.classes.add(ItemTooltipModsClasses.Mod, ItemTooltipModsClasses.ModSocketed)
					.style.set("--icon", Display.icon(perk.definition))
					.append(Component.create())
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

	private addSockets (item: Item, type: PlugType, socketClass?: ItemTooltipModsClasses) {
		let i = 0;
		for (const socket of item.getSockets(type)) {
			if (!socket || socket.state?.isVisible === false)
				continue;

			const socketComponent = Component.create()
				.classes.add(ItemTooltipModsClasses.ModSocket, ...socketClass ? [socketClass] : [])
				.classes.toggle(socket.state !== undefined && socket.plugs.some(plug => plug.definition?.itemTypeDisplayName === "Enhanced Trait"), ItemTooltipModsClasses.ModSocketEnhanced)
				.classes.toggle(socket.state === undefined, ItemTooltipModsClasses.ModSocketDefinition)
				.style.set("--socket-index", `${i++}`)
				.appendTo(this);

			for (const plug of socket.plugs.slice().sort((a, b) => Number(b.socketed && item.bucket !== "collections") - Number(a.socketed && item.bucket !== "collections"))) {
				if (!socket.state && plug.is(PlugType.Enhanced))
					// skip enhanced perks (duplicates) if this is an item definition (ie no actual socket state)
					continue;

				const plugComponent = Component.create()
					.classes.add(ItemTooltipModsClasses.Mod)
					.classes.toggle(!!plug?.socketed, ItemTooltipModsClasses.ModSocketed)
					.style.set("--icon", Display.icon(plug.definition))
					.appendTo(socketComponent);

				if (plug?.socketed && (socket.state || (socket.plugs.length === 1 || socket.type & PlugType.Intrinsic))) {
					Component.create()
						.classes.add(ItemTooltipModsClasses.ModName)
						.text.set(Display.name(plug.definition) ?? "Unknown")
						.appendTo(plugComponent);

					const description = this.isDetailed() && Display.description(plug.definition);
					if (description)
						Component.create()
							.classes.add(ItemTooltipModsClasses.ModDescription)
							.text.set(description)
							.appendTo(plugComponent);

				} else if (item.deepsight?.pattern && item.bucket === "collections" && this.isShaped()) {
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
