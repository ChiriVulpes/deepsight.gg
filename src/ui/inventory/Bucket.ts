import type { DestinyCharacterComponent } from "bungie-api-ts/destiny2";
import Manifest from "model/models/Manifest";
import Card from "ui/Card";

export enum BucketClasses {
	Main = "bucket",
	Header = "bucket-header",
	Title = "bucket-title",
	Icon = "bucket-icon",
	Inventory = "bucket-inventory",
}

export default class BucketComponent<ARGS extends readonly any[] = readonly any[]> extends Card<ARGS> {

	protected override onMake (...args: ARGS) {
		super.onMake(...args);
		this.classes.add(BucketClasses.Main);
		this.header.classes.add(BucketClasses.Header);
		this.title.classes.add(BucketClasses.Title);
		this.icon.classes.add(BucketClasses.Icon);
		this.content.classes.add(BucketClasses.Inventory);
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
