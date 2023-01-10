import { ItemPerkVisibility } from "bungie-api-ts/destiny2";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type { Perk, Plug, Socket } from "model/models/items/Plugs";
import { PlugType } from "model/models/items/Plugs";
import { TierHashes } from "model/models/items/Tier";
import Display from "ui/bungie/DisplayProperties";
import Card from "ui/Card";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button from "ui/form/Button";
import ItemPlugTooltip from "ui/inventory/ItemPlugTooltip";

export enum ItemSocketsClasses {
	Main = "view-item-sockets",
	SocketsContainer = "view-item-sockets-container",
	Socket = "view-item-socket",
	Plug = "view-item-socket-plug",
	PlugSelected = "view-item-socket-plug-selected",
	PlugName = "view-item-socket-plug-name",
	PlugDescription = "view-item-socket-plug-description",
	PlugEnhanced = "view-item-socket-plug-enhanced",
	PlugEffects = "view-item-socket-plug-effects",
	PlugExotic = "view-item-socket-plug-exotic",
	PlugRequiredLevel = "view-item-socket-plug-required-level",
	PlugRequiredLevelWrapper = "view-item-socket-plug-required-level-wrapper",
	Socketed = "view-item-socket-plug-socketed",
	Header = "view-item-sockets-header",
	Title = "view-item-sockets-title",
	TitleButton = "view-item-sockets-title-button",
}

export default abstract class ItemSockets extends Card<[Item, Inventory]> {

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
		this.header.classes.add(ItemSocketsClasses.Header);
		this.title.classes.add(ItemSocketsClasses.Title)
			.text.set(this.getTitle());

		this.addedSockets = [];
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

	protected addSocketsByPlugType (type: PlugType) {
		return this.addSockets(...this.item.getSockets(type));
	}

	protected addSockets (...sockets: Socket[]) {
		const components: ItemSocket[] = [];
		for (const socket of sockets) {
			if (socket.state?.isVisible !== false) {
				let socketComponent: ItemSocket | undefined;

				for (const plug of socket.plugs) {
					if (!socket.state && plug.is(PlugType.Enhanced | PlugType.Intrinsic))
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

	protected addPerksByPlugType (type: PlugType) {
		return this.addPerks(...this.item.getSockets(type));
	}

	protected addPerks (...sockets: Socket[]) {
		const components: ItemSocket[] = [];

		for (const socket of sockets) {
			if (socket.state?.isVisible !== false) {
				for (const plug of socket.plugs) {
					if (!socket.state && plug.is(PlugType.Enhanced))
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
		this.addedSockets.push(socket);
		return socket;
	}

	protected hasSockets () {
		return !!this.addedSockets.length;
	}
}

export class ItemSocket extends Component<HTMLElement, []> {

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
			.classes.toggle((plug.is(PlugType.Intrinsic) || plug.is(PlugType.Catalyst)) && item?.definition.inventory?.tierTypeHash === TierHashes.Exotic, ItemSocketsClasses.PlugExotic)
			.classes.toggle(plug.is(PlugType.Enhanced) || plug.is(PlugType.Catalyst) && item?.definition.inventory?.tierTypeHash === TierHashes.Exotic, ItemSocketsClasses.PlugEnhanced)
			.setIcon(Display.icon(perk?.definition) ?? Display.icon(plug.definition))
			.setName(Display.name(perk?.definition) ?? Display.name(plug.definition) ?? "Unknown")
			.setDescription(Display.description(perk?.definition) ?? Display.description(plug.definition));

		if (item?.deepsight?.pattern && !item.instance && plug.is(PlugType.Perk))
			Component.create()
				.classes.add(ItemSocketsClasses.PlugRequiredLevelWrapper)
				.append(Component.create()
					.classes.add(ItemSocketsClasses.PlugRequiredLevel)
					.text.set(`${plug.craftingRequirements?.requiredLevel ?? 1}`))
				.appendTo(this);

		this.setTooltip(ItemPlugTooltip, {
			initialiser: tooltip => tooltip.setPlug(plug, perk, item),
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
