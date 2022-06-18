import type { Item } from "model/models/Items";
import Manifest from "model/models/Manifest";
import Component from "ui/Component";
import Button from "ui/form/Button";
import ItemTooltip from "ui/inventory/ItemTooltip";
import type SortManager from "ui/inventory/SortManager";

export enum ItemClasses {
	Main = "item",
	Icon = "item-icon",
	SourceWatermark = "item-source-watermark",
	SourceWatermarkCustom = "item-source-watermark-custom",
	Masterwork = "item-masterwork",
	MasterworkSpinny = "item-masterwork-spinny",
	Shaped = "item-shaped",
	Deepsight = "item-deepsight",
	DeepsightHasPattern = "item-deepsight-has-pattern",
	DeepsightPattern = "item-deepsight-pattern",
	DeepsightPatternUnlocked = "item-deepsight-pattern-unlocked",
	DeepsightAttuned = "item-deepsight-attuned",
	Extra = "item-extra",
}

export default class ItemComponent extends Button<[Item]> {

	public item!: Item;
	public extra!: Component;

	protected override async onMake (item: Item) {
		super.onMake(item);

		this.item = item;
		this.classes.add(ItemClasses.Main);
		this.extra = Component.create()
			.classes.add(ItemClasses.Extra);

		const { DestinyItemTierTypeDefinition, DestinyPowerCapDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
		this.classes.add(`item-tier-${(tier?.displayProperties.name ?? "Common")?.toLowerCase()}`);

		Component.create()
			.classes.add(ItemClasses.Icon)
			.style.set("--icon", `url("https://www.bungie.net${item.definition.displayProperties.icon}")`)
			.appendTo(this);

		if (item.shaped)
			Component.create()
				.classes.add(ItemClasses.Shaped)
				.append(Component.create())
				.appendTo(this);

		let watermark: string | undefined;
		const powerCap = await DestinyPowerCapDefinition.get(item.definition.quality?.versions[item.definition.quality.currentVersion].powerCapHash);
		if ((powerCap?.powerCap ?? 0) < 900000)
			watermark = item.definition.iconWatermarkShelved ?? item.definition.iconWatermark;
		else
			watermark = item.definition.iconWatermark ?? item.definition.iconWatermarkShelved;

		// Note: For some reason there's no watermarks on really old exotics.
		// DIM shows all of these ones with the red war icon.
		// TODO... figure out how, if necessary?

		if (watermark) {
			Component.create()
				.classes.add(ItemClasses.SourceWatermark)
				.style.set("--watermark", `url("https://www.bungie.net${watermark}")`)
				.appendTo(this);
		} else if (item.source?.displayProperties.icon) {
			Component.create()
				.classes.add(ItemClasses.SourceWatermark, ItemClasses.SourceWatermarkCustom)
				.style.set("--icon", `url("${item.source.displayProperties.icon}")`)
				.appendTo(this);
		}

		if (item.isMasterwork())
			Component.create()
				.classes.add(ItemClasses.Masterwork)
				.append(Component.create()
					.classes.add(ItemClasses.MasterworkSpinny))
				.appendTo(this);

		if (!item.shaped) {
			if (item.deepsight?.attunement)
				Component.create()
					.classes.add(ItemClasses.Deepsight)
					.classes.toggle(item.deepsight.attunement?.objective.complete ?? false, ItemClasses.DeepsightAttuned)
					.appendTo(this);

			if (item.deepsight?.pattern)
				Component.create()
					.classes.add(ItemClasses.DeepsightPattern)
					.classes.toggle(item.deepsight.pattern.progress.complete, ItemClasses.DeepsightPatternUnlocked)
					.appendTo(Component.create()
						.classes.add(ItemClasses.DeepsightHasPattern)
						.appendTo(this));
		}

		// this.text.set(item.definition.displayProperties.name);
		this.setTooltip(ItemTooltip, tooltip => tooltip
			.setItem(item));

		this.extra.appendTo(this);
	}

	public setSortedBy (sorter: SortManager) {
		void this.rerenderExtra(sorter);
		return this;
	}

	private rerenderId?: number;
	private async rerenderExtra (sorter: SortManager) {
		const rerenderId = this.rerenderId = Math.random();
		this.extra.removeContents();

		for (const sort of sorter.get()) {
			if (!sort.render)
				continue;

			const rendered = await sort.render(this.item);
			if (this.rerenderId !== rerenderId)
				// something else is causing this to rerender
				return;

			this.extra.append(rendered);
		}
	}
}
