import type { DestinyCharacterComponent } from "bungie-api-ts/destiny2";
import Manifest from "model/models/Manifest";
import Component from "ui/Component";

export enum BucketClasses {
	Main = "bucket",
	Header = "bucket-header",
	Title = "bucket-title",
	Icon = "bucket-icon",
	Inventory = "bucket-inventory",
}

export default class BucketComponent<ARGS extends readonly any[] = readonly any[]> extends Component<HTMLElement, ARGS> {

	public header!: Component;
	public title!: Component;
	public icon!: Component;
	public inventory!: Component;

	protected override onMake (...args: ARGS) {
		this.classes.add(BucketClasses.Main);

		this.header = Component.create()
			.classes.add(BucketClasses.Header)
			.appendTo(this);

		this.title = Component.create()
			.classes.add(BucketClasses.Title)
			.appendTo(this.header);

		this.icon = Component.create()
			.classes.add(BucketClasses.Icon)
			.appendTo(this.title);

		this.inventory = Component.create()
			.classes.add(BucketClasses.Inventory)
			.appendTo(this);
	}

	public async initialiseFromCharacter (character: DestinyCharacterComponent) {
		const { DestinyClassDefinition, DestinyInventoryItemDefinition } = await Manifest.await();

		const cls = await DestinyClassDefinition.get(character.classHash);
		const className = cls?.displayProperties.name ?? "Unknown";
		this.icon.style.set("--icon",
			`url("https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_${className.toLowerCase()}.svg")`);

		this.title.text.add(className);

		const emblem = await DestinyInventoryItemDefinition.get(character.emblemHash);
		this.style.set("--background", `url("https://www.bungie.net${emblem?.secondarySpecial ?? character.emblemBackgroundPath}")`)
			.style.set("--emblem", `url("https://www.bungie.net${emblem?.secondaryOverlay ?? character.emblemPath}")`);
	}
}
