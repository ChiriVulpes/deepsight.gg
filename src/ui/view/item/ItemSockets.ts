import type Item from "model/models/items/Item";
import type { IReusablePlug } from "model/models/items/Plugs";
import Display from "ui/bungie/DisplayProperties";
import Card from "ui/Card";
import Component from "ui/Component";
import Button from "ui/form/Button";

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
}

export class ItemSocket extends Component<HTMLElement, []> {
	protected override onMake (): void {
		this.classes.add(ItemSocketsClasses.Socket);
	}

	public addOption (plug?: IReusablePlug, initialiser?: (plug: ItemPlug) => any) {
		return ItemPlug.create([plug])
			.tweak(initialiser)
			.appendTo(this);
	}
}

export class ItemPlug extends Button<[IReusablePlug?]> {

	public label!: Component<HTMLLabelElement>;
	public description!: Component;

	protected override onMake (plug?: IReusablePlug): void {
		super.onMake();
		this.classes.add(ItemSocketsClasses.Plug);

		this.addIcon();

		this.label = Component.create("label")
			.classes.add(ItemSocketsClasses.PlugName)
			.appendTo(this);

		this.description = Component.create()
			.classes.add(ItemSocketsClasses.PlugDescription)
			.appendTo(this);

		if (plug) this.using(plug);
	}

	public using (plug: IReusablePlug) {
		this.classes.toggle(!!plug.socketed, ItemSocketsClasses.Socketed)
			.setIcon(Display.icon(plug.definition))
			.setName(Display.name(plug.definition) ?? "Unknown")
			.setDescription(Display.description(plug.definition));
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