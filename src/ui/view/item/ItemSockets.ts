import type Item from "model/models/items/Item";
import type { Perk, Plug } from "model/models/items/Plugs";
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
	Socketed = "view-item-socket-plug-socketed",
}

export default abstract class ItemSockets extends Card<[Item]> {

	private addedSockets!: ItemSocket[];
	public item!: Item;

	protected override async onMake (item: Item) {
		super.onMake(item);
		this.item = item;
		this.title.text.set(this.getTitle());

		this.addedSockets = [];
		await this.addSockets();
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

	protected abstract addSockets (): void | Promise<void>;

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

	public addPlug (plug?: Plug, perk?: Perk, initialiser?: (plug: ItemPlug) => any): ItemPlug;
	public addPlug (plug?: Plug, initialiser?: (plug: ItemPlug) => any): ItemPlug;
	public addPlug (plug?: Plug, perkOrInitialiser?: Perk | ((plug: ItemPlug) => any), initialiser?: (plug: ItemPlug) => any) {
		return ItemPlug.create(typeof perkOrInitialiser === "function" ? [plug] : [plug, perkOrInitialiser])
			.tweak(initialiser)
			.appendTo(this);
	}
}

export class ItemPlug extends Button<[Plug?, Perk?]> {

	public label!: Component<HTMLLabelElement>;
	public description!: Component;

	protected override onMake (plug?: Plug, perk?: Perk): void {
		super.onMake();
		this.classes.add(ItemSocketsClasses.Plug);

		this.addIcon();

		this.label = Component.create("label")
			.classes.add(ItemSocketsClasses.PlugName)
			.appendTo(this);

		this.description = Component.create()
			.classes.add(ItemSocketsClasses.PlugDescription)
			.appendTo(this);

		if (plug) this.using(plug, perk);
	}

	public using (plug: Plug, perk?: Perk) {
		this.classes.toggle(!!plug.socketed, ItemSocketsClasses.Socketed)
			.setIcon(Display.icon(perk?.definition) ?? Display.icon(plug.definition))
			.setName(Display.name(perk?.definition) ?? Display.name(plug.definition) ?? "Unknown")
			.setDescription(Display.description(perk?.definition) ?? Display.description(plug.definition));

		this.setTooltip(ItemPlugTooltip, {
			initialiser: tooltip => tooltip.setPlug(plug, perk),
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
