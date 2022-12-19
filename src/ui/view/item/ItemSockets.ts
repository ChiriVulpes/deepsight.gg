import { ItemPerkVisibility } from "bungie-api-ts/destiny2";
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
	PlugName = "view-item-socket-plug-name",
	PlugDescription = "view-item-socket-plug-description",
	PlugEnhanced = "view-item-socket-plug-enhanced",
	PlugEffects = "view-item-socket-plug-effects",
	PlugExotic = "view-item-socket-plug-exotic",
	Socketed = "view-item-socket-plug-socketed",
}

export default abstract class ItemSockets extends Card<[Item]> {

	private addedSockets!: ItemSocket[];
	public item!: Item;

	protected get socketClasses (): string[] { return []; }
	protected get plugClasses (): string[] { return []; }

	protected override async onMake (item: Item) {
		super.onMake(item);
		this.item = item;
		this.title.text.set(this.getTitle());

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
		this.addSockets(...this.item.getSockets(type));
	}

	protected addSockets (...sockets: Socket[]) {
		for (const socket of sockets) {
			if (socket.state?.isVisible !== false) {
				const socketComponent = this.addSocket()
					.classes.add(...this.socketClasses);

				for (const plug of socket.plugs)
					socketComponent.addPlug(plug, undefined, this.item)
						.classes.add(...this.plugClasses);
			}
		}
	}

	protected addPerksByPlugType (type: PlugType) {
		this.addPerks(...this.item.getSockets(type));
	}

	protected addPerks (...sockets: Socket[]) {
		for (const socket of sockets) {
			if (socket.state?.isVisible !== false) {
				for (const plug of socket.plugs)
					for (const perk of plug.perks) {
						if (perk.perkVisibility === ItemPerkVisibility.Hidden || !perk.definition.isDisplayable)
							continue;

						const socketComponent = this.addSocket()
							.classes.add(...this.socketClasses);

						socketComponent.addPlug(plug, perk, this.item)
							.classes.add(...this.plugClasses);
					}
			}
		}
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
	protected override onMake (): void {
		this.classes.add(ItemSocketsClasses.Socket);
	}

	public addPlug (plug?: Plug, perk?: Perk, item?: Item, initialiser?: (plug: ItemPlug) => any): ItemPlug;
	public addPlug (plug?: Plug, perk?: Perk, initialiser?: (plug: ItemPlug) => any): ItemPlug;
	public addPlug (plug?: Plug, initialiser?: (plug: ItemPlug) => any): ItemPlug;
	public addPlug (plug?: Plug, perkOrInitialiser?: Perk | ((plug: ItemPlug) => any), itemOrInitialiser?: Item | ((plug: ItemPlug) => any), initialiser?: (plug: ItemPlug) => any) {
		const perk = typeof perkOrInitialiser === "function" ? undefined : perkOrInitialiser;
		const item = typeof itemOrInitialiser === "function" ? undefined : itemOrInitialiser;
		initialiser = typeof perkOrInitialiser === "function" ? perkOrInitialiser : typeof itemOrInitialiser === "function" ? itemOrInitialiser : initialiser;

		return ItemPlug.create([plug, perk, item])
			.tweak(initialiser)
			.appendTo(this);
	}
}

export class ItemPlug extends Button<[Plug?, Perk?, Item?]> {

	public label!: Component<HTMLLabelElement>;
	public description!: Component;
	public effects!: Component;

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

		this.effects = Component.create()
			.classes.add(ItemSocketsClasses.PlugEffects)
			.appendTo(this);

		if (plug) this.using(plug, perk, item);
	}

	public using (plug: Plug, perk?: Perk, item?: Item) {
		this.classes.toggle(!!plug.socketed, ItemSocketsClasses.Socketed)
			.classes.toggle((plug.is(PlugType.Intrinsic) || plug.is(PlugType.Catalyst)) && item?.definition.inventory?.tierTypeHash === TierHashes.Exotic, ItemSocketsClasses.PlugExotic)
			.classes.toggle(plug.is(PlugType.Enhanced) || plug.is(PlugType.Catalyst) && item?.definition.inventory?.tierTypeHash === TierHashes.Exotic, ItemSocketsClasses.PlugEnhanced)
			.setIcon(Display.icon(perk?.definition) ?? Display.icon(plug.definition))
			.setName(Display.name(perk?.definition) ?? Display.name(plug.definition) ?? "Unknown")
			.setDescription(Display.description(perk?.definition) ?? Display.description(plug.definition));

		this.setTooltip(ItemPlugTooltip, {
			initialiser: tooltip => tooltip.setPlug(plug, perk, item),
			differs: tooltip => tooltip.plug?.plugItemHash !== plug.plugItemHash,
		})
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
