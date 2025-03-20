import { ItemTierTypeHashes } from "@deepsight.gg/enums";
import { ItemPerkVisibility } from "bungie-api-ts/destiny2";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type { Perk, Plug, PlugType, Socket } from "model/models/items/Plugs";
import Button from "ui/component/Button";
import Card, { CardClasses } from "ui/component/Card";
import type { ComponentEventManager, ComponentEvents } from "ui/component/Component";
import Component from "ui/component/Component";
import ItemPlugTooltip from "ui/destiny/tooltip/ItemPlugTooltip";
import { Classes } from "ui/utility/Classes";
import Display from "ui/utility/DisplayProperties";

export enum ItemSocketsClasses {
	Main = "view-item-sockets",
	SocketsContainer = "view-item-sockets-container",
	Socket = "view-item-socket",
	Plug = "view-item-socket-plug", // search this string if you change it, had to dupe cuz circ dep
	PlugSelected = "view-item-socket-plug-selected",
	PlugName = "view-item-socket-plug-name",
	PlugDescription = "view-item-socket-plug-description",
	PlugEnhanced = "view-item-socket-plug-enhanced",
	PlugEffects = "view-item-socket-plug-effects",
	PlugExotic = "view-item-socket-plug-exotic",
	PlugRequiredLevel = "view-item-socket-plug-required-level",
	PlugType = "view-item-socket-plug-type",
	PlugIconInner = "view-item-socket-plug-icon-inner",
	PlugIconInnerType = "view-item-socket-plug-icon-inner-type",
	// PlugRequiredLevelWrapper = "view-item-socket-plug-required-level-wrapper",
	Socketed = "view-item-socket-plug-socketed",
}

export default abstract class ItemSockets extends Card<[Item, Inventory]> {

	private maxSocketPlugs!: number;
	private addedSockets!: ItemSocket[];
	public item!: Item;
	public inventory!: Inventory;

	protected get socketClasses (): string[] { return []; }
	protected get plugClasses (): string[] { return []; }

	protected override async onMake (item: Item, inventory: Inventory) {
		super.onMake(item, inventory);
		this.item = item;
		this.inventory = inventory;
		this.classes.add(ItemSocketsClasses.Main);
		this.setDisplayMode(CardClasses.DisplayModeSection);
		this.title.text.set(this.getTitle());

		this.addedSockets = [];
		this.maxSocketPlugs = 0;
		await this.initialise();
		this.classes.toggle(!this.addedSockets.length, Classes.Hidden);
		Component.create()
			.classes.add(ItemSocketsClasses.SocketsContainer)
			.append(...this.addedSockets.splice(0, Infinity))
			.appendTo(this.content);
		// Loadable.create(Promise.resolve().then(() => Async.sleep(2000)))
		// 	.onReady(() => ))
		// 	.appendTo(this.content);
	}

	protected abstract getTitle (): string;

	protected abstract initialise (): void | Promise<void>;

	protected addSocketsByType (...anyOfTypes: PlugType.Query[]) {
		return this.addSockets(...this.item.getSockets(...anyOfTypes));
	}

	protected addSockets (...sockets: Socket[]) {
		const components: ItemSocket[] = [];
		for (const socket of sockets) {
			if (socket.state?.isVisible !== false) {
				let socketComponent: ItemSocket | undefined;

				for (const plug of socket.plugs ?? []) {
					if (!socket.state && plug.is("Intrinsic/FrameEnhanced"))
						continue;

					if (plug.is("Perk/TraitLocked"))
						continue;

					if (plug.is("Perk/EmptyCraftingSocket", "Intrinsic/EmptyCraftingSocket"))
						continue;

					if (!plug.definition?.displayProperties.name)
						continue;

					socketComponent ??= this.addSocket()
						.classes.add(...this.socketClasses);

					socketComponent.addPlug(plug, undefined, this.item)
						.classes.add(...this.plugClasses);
				}

				if (socketComponent)
					components.push(socketComponent);
			}
		}

		return components;
	}

	protected addPerksByPlugType (...anyOfTypes: PlugType.Query[]) {
		return this.addPerks(...this.item.getSockets(...anyOfTypes));
	}

	protected addPerks (...sockets: Socket[]) {
		const components: ItemSocket[] = [];

		for (const socket of sockets) {
			if (socket.state?.isVisible !== false) {
				for (const plug of socket.plugs ?? []) {
					if (!socket.state && plug.is("Perk/TraitEnhanced", "Intrinsic/FrameEnhanced"))
						continue;

					if (socket.is("Masterwork/ExoticCatalyst") && !this.item.isMasterwork())
						continue;

					if (plug.is("Perk/EmptyCraftingSocket", "Intrinsic/EmptyCraftingSocket"))
						continue;

					for (const perk of plug.perks) {
						if (perk.perkVisibility === ItemPerkVisibility.Hidden || !perk.definition.isDisplayable)
							continue;

						const socketComponent = this.addSocket()
							.classes.add(...this.socketClasses);

						components.push(socketComponent);

						socketComponent.addPlug(plug, perk, this.item)
							.classes.add(...this.plugClasses);
					}
				}
			}
		}

		return components;
	}

	protected addSocket (initialiser?: (socket: ItemSocket) => any) {
		const socket = ItemSocket.create()
			.tweak(initialiser);

		socket.event.subscribe("addPlug", () => this.updateSocket(socket));

		this.addedSockets.push(socket);
		this.updateSocket(socket);
		return socket;
	}

	protected updateSocket (socket: ItemSocket) {
		const old = this.maxSocketPlugs;
		this.maxSocketPlugs = Math.max(this.maxSocketPlugs, socket.plugs.length);
		if (old === this.maxSocketPlugs)
			return;

		this.style.set("--max-socket-plugs", `${this.maxSocketPlugs}`);
	}

	protected hasSockets () {
		return !!this.addedSockets.length;
	}
}

export interface IItemSocketEvents extends ComponentEvents {
	addPlug: Event;
}

export class ItemSocket extends Component<HTMLElement, []> {

	public override event!: ComponentEventManager<this, IItemSocketEvents>;

	public plugs!: ItemPlug[];

	protected override onMake (): void {
		this.classes.add(ItemSocketsClasses.Socket);
		this.plugs = [];
	}

	public addPlug (plug?: Plug, perk?: Perk, item?: Item, initialiser?: (plug: ItemPlug) => any): ItemPlug;
	public addPlug (plug?: Plug, perk?: Perk, initialiser?: (plug: ItemPlug) => any): ItemPlug;
	public addPlug (plug?: Plug, initialiser?: (plug: ItemPlug) => any): ItemPlug;
	public addPlug (plug?: Plug, perkOrInitialiser?: Perk | ((plug: ItemPlug) => any), itemOrInitialiser?: Item | ((plug: ItemPlug) => any), initialiser?: (plug: ItemPlug) => any) {
		const perk = typeof perkOrInitialiser === "function" ? undefined : perkOrInitialiser;
		const item = typeof itemOrInitialiser === "function" ? undefined : itemOrInitialiser;
		initialiser = typeof perkOrInitialiser === "function" ? perkOrInitialiser : typeof itemOrInitialiser === "function" ? itemOrInitialiser : initialiser;

		const component = ItemPlug.create([plug, perk, item])
			.tweak(initialiser)
			.appendTo(this);

		this.plugs.push(component);
		this.event.emit("addPlug");
		return component;
	}
}

export class ItemPlug extends Button<[Plug?, Perk?, Item?]> {

	public label!: Component<HTMLLabelElement>;
	public description!: Component;
	public hash!: number;
	public plug?: Plug;
	public perk?: Perk;
	public item?: Item;

	protected override onMake (plug?: Plug, perk?: Perk, item?: Item): void {
		super.onMake();
		this.classes.add(ItemSocketsClasses.Plug);

		this.addIcon();

		this.label = Component.create("label")
			.classes.add(ItemSocketsClasses.PlugName)
			.appendTo(this);

		this.description = Component.create()
			.classes.add(ItemSocketsClasses.PlugDescription)
			.appendTo(this);

		if (plug) this.using(plug, perk, item);
	}

	public using (plug: Plug, perk?: Perk, item?: Item, displayRequiredLevels = false) {
		this.hash = perk?.definition.hash ?? plug.definition?.hash ?? -1;
		this.plug = plug;
		this.perk = perk;
		this.item = item;

		this.classes.toggle(!!plug.socketed, ItemSocketsClasses.Socketed)
			.classes.toggle((plug.is("Intrinsic", "=Masterwork/ExoticCatalyst")) && item?.definition.inventory?.tierTypeHash === ItemTierTypeHashes.Exotic, ItemSocketsClasses.PlugExotic)
			.classes.toggle(plug.is("Perk/TraitEnhanced", "Intrinsic/FrameEnhanced", "=Masterwork/ExoticCatalyst"), ItemSocketsClasses.PlugEnhanced)
			.classes.removeWhere(cls => cls.startsWith(ItemSocketsClasses.PlugType))
			.classes.add(`${ItemSocketsClasses.PlugType}-${plug.categorisation?.categoryName.toLowerCase()}`)
			.classes.add(`${ItemSocketsClasses.PlugType}-${plug.type.replaceAll("/", "-").toLowerCase()}`)
			.setIcon(Display.icon(perk?.definition) ?? Display.icon(plug.definition))
			.setName(Display.name(perk?.definition) ?? Display.name(plug.definition) ?? "Unknown")
			.setDescription(Display.description(perk?.definition) ?? Display.description(plug.definition));

		this.innerIcon?.classes.add(ItemSocketsClasses.PlugIconInner)
			.classes.add(`${ItemSocketsClasses.PlugIconInnerType}-${plug.categorisation?.categoryName.toLowerCase()}`)
			.classes.add(`${ItemSocketsClasses.PlugIconInnerType}-${plug.type.replaceAll("/", "-").toLowerCase()}`);

		if (item?.deepsight?.pattern?.recipe && !item.instance && !item.isAdept() && plug.is("Perk"))
			// Component.create()
			// 	.classes.add(ItemSocketsClasses.PlugRequiredLevelWrapper)
			// 	.append(
			Component.create()
				.classes.add(ItemSocketsClasses.PlugRequiredLevel)
				.text.set(`${plug.craftingRequirements?.requiredLevel ?? 1}`)
				//)
				.appendTo(this);

		this.setTooltip(ItemPlugTooltip, {
			initialise: tooltip => tooltip.set(plug, perk, item),
			differs: tooltip => tooltip.plug?.plugItemHash !== plug.plugItemHash,
		});
	}

	public setName (name?: string) {
		this.label.text.set(name ?? "Unknown");
		return this;
	}

	public setDescription (description?: string) {
		this.description.text.set(description?.replace(/\n{2,}/g, "\n") ?? "");
		return this;
	}

	public setIcon (icon?: string) {
		this.innerIcon!.style.set("--icon", icon);
		return this;
	}
}
