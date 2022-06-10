import { DestinyComponentType, ItemState } from "bungie-api-ts/destiny2";
import type { Item } from "model/models/Items";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import Button from "ui/Button";
import Component from "ui/Component";

const AttunementProgressHash = 1162857131;

export enum ItemClasses {
	Main = "item",
	Icon = "item-icon",
	Masterwork = "item-masterwork",
	Shaped = "item-shaped",
	Deepsight = "item-deepsight",
	DeepsightAttuned = "item-deepsight-attuned",
}

export default class ItemComponent extends Button<[Item]> {

	public item!: Item;

	protected override async onMake (item: Item) {
		super.onMake(item);

		this.item = item;

		this.classes.add(ItemClasses.Main);
		const { DestinyItemTierTypeDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
		this.classes.add(`item-tier-${(tier?.displayProperties.name ?? "Common")?.toLowerCase()}`);

		Component.create()
			.classes.add(ItemClasses.Icon)
			.style.set("--icon", `url("https://www.bungie.net${item.definition.displayProperties.icon}")`)
			.appendTo(this);

		if (item.instance.state & ItemState.Crafted)
			Component.create()
				.classes.add(ItemClasses.Shaped)
				.appendTo(this);

		if (item.instance.state & ItemState.Masterwork)
			Component.create()
				.classes.add(ItemClasses.Masterwork)
				.appendTo(this);

		if (item.instance.state & ItemState.HighlightedObjective) {
			const { itemComponents: { plugObjectives } } = await Profile(DestinyComponentType.ProfileInventories, DestinyComponentType.ItemPlugObjectives).await();
			const objectives = plugObjectives.data?.[item.instance.itemInstanceId!]?.objectivesPerPlug;
			const attunement = Object.values(objectives ?? {}).flat()
				.find(progress => progress.objectiveHash === AttunementProgressHash);

			Component.create()
				.classes.add(ItemClasses.Deepsight)
				.classes.toggle(attunement?.complete ?? false, ItemClasses.DeepsightAttuned)
				.appendTo(this);
		}

		// this.text.set(item.definition.displayProperties.name);
	}
}
