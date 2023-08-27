import type Character from "model/models/Characters";
import Card from "ui/Card";
import type Component from "ui/Component";

export enum BucketClasses {
	Main = "bucket",
	Header = "bucket-header",
	Title = "bucket-title",
	Icon = "bucket-icon",
	Inventory = "bucket-inventory",
}

interface BucketComponentDropTarget {
	component: Component;
	equipped: boolean;
}

export default class BucketComponent<ARGS extends readonly any[] = readonly any[]> extends Card<ARGS> {

	private dropTargets?: BucketComponentDropTarget[];

	public getDropTargets () {
		return this.dropTargets ?? [{ component: this, equipped: false }];
	}

	protected override onMake (...args: ARGS) {
		super.onMake(...args);
		this.classes.add(BucketClasses.Main);
		this.header.classes.add(BucketClasses.Header);
		this.title.classes.add(BucketClasses.Title);
		this.icon.classes.add(BucketClasses.Icon);
		this.content.classes.add(BucketClasses.Inventory);
	}

	public registerDropTarget (component: Component, equipped?: true) {
		this.dropTargets ??= [];
		this.dropTargets.push({ component, equipped: equipped ?? false });
	}

	public initialiseFromCharacter (character: Character) {
		const className = character.class?.displayProperties.name ?? "Unknown";
		this.icon.style.set("--icon",
			`url("https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_${className.toLowerCase()}.svg")`);

		this.title.text.add(className);

		this.style.set("--background", `url("https://www.bungie.net${character.emblem?.secondarySpecial ?? character.emblemBackgroundPath}")`)
			.style.set("--emblem", `url("https://www.bungie.net${character.emblem?.secondaryOverlay ?? character.emblemPath}")`);
	}
}
