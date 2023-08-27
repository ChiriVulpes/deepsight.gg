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
}
