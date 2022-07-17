import type Item from "model/models/items/Item";
import Manifest from "model/models/Manifest";
import Display from "ui/bungie/DisplayProperties";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button from "ui/form/Button";
import ItemTooltip from "ui/inventory/ItemTooltip";
import type SortManager from "ui/inventory/sort/SortManager";
import Loadable from "ui/Loadable";
import Store from "utility/Store";

export enum ItemClasses {
	Main = "item",
	Icon = "item-icon",
	UniversalArmourOrnament = "item-universal-armour-ornament",
	SourceWatermark = "item-source-watermark",
	SourceWatermarkCustom = "item-source-watermark-custom",
	IsMasterwork = "item-is-masterwork",
	Masterwork = "item-masterwork",
	MasterworkSpinny = "item-masterwork-spinny",
	Shaped = "item-shaped",
	Deepsight = "item-deepsight",
	DeepsightHasPattern = "item-deepsight-has-pattern",
	DeepsightPattern = "item-deepsight-pattern",
	DeepsightPatternUnlocked = "item-deepsight-pattern-unlocked",
	DeepsightAttuned = "item-deepsight-attuned",
	Extra = "item-extra",
	Loading = "item-loading",
}

export default class ItemComponent extends Button<[Item]> {

	public item!: Item;
	public extra!: Component;
	public loadingSpinny?: Component;
	public tooltipPadding!: number;

	protected override async onMake (item: Item) {
		super.onMake(item);

		this.update = this.update.bind(this);
		this.loadStart = this.loadStart.bind(this);
		this.loadEnd = this.loadEnd.bind(this);
		const done = this.setItem(item);
		await done;
	}

	private update (event: { item: Item }) {
		if (!document.contains(this.element)) {
			this.item.event.unsubscribe("update", this.update);
			this.item.event.unsubscribe("loadStart", this.loadStart);
			this.item.event.unsubscribe("loadEnd", this.loadEnd);
			return;
		}

		void this.setItem(event.item);
	}

	private loadStart () {
		this.loadingSpinny?.classes.remove(Classes.Hidden);
	}

	private loadEnd () {
		this.loadingSpinny?.classes.add(Classes.Hidden);
	}

	public setItem (item: Item) {
		if (item !== this.item) {
			this.item?.event.unsubscribe("update", this.update);
			this.item?.event.unsubscribe("loadStart", this.loadStart);
			this.item?.event.unsubscribe("loadEnd", this.loadEnd);
			item.event.subscribe("update", this.update);
			item.event.subscribe("loadStart", this.loadStart);
			item.event.subscribe("loadEnd", this.loadEnd);
			this.item = item;
		}

		return this.renderItem(item);
	}

	private async renderItem (item: Item) {
		this.removeContents();

		this.tooltipPadding = 0;
		this.classes.add(ItemClasses.Main)
			.classes.toggle(item.isMasterwork(), ItemClasses.IsMasterwork);

		this.extra = Component.create()
			.classes.add(ItemClasses.Extra);

		const { DestinyItemTierTypeDefinition, DestinyPowerCapDefinition } = await Manifest.await();
		const tier = await DestinyItemTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
		this.classes.add(`item-tier-${(tier?.displayProperties.name ?? "Common")?.toLowerCase()}`);

		const ornament = item.sockets?.find(socket => socket?.definition.traitIds?.includes("item_type.ornament.armor")
			|| socket?.definition.traitIds?.includes("item_type.armor")
			|| socket?.definition.traitIds?.includes("item_type.ornament.weapon"));

		const hasUniversalOrnament = !!ornament
			&& tier?.displayProperties.name === "Legendary"
			&& item.definition.traitIds?.includes("item_type.armor");

		Component.create()
			.classes.add(ItemClasses.Icon)
			.classes.toggle(hasUniversalOrnament, ItemClasses.UniversalArmourOrnament)
			.style.set("--icon", Display.icon(ornament?.definition) ?? Display.icon(item.definition))
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
			const objectiveComplete = item.deepsight?.attunement?.objective.complete ?? false;
			const hasIncompletePattern = item.deepsight?.pattern && !(item.deepsight.pattern.progress.complete ?? false);
			if (item.deepsight?.attunement && (objectiveComplete || hasIncompletePattern || !Store.items.settingsNoDeepsightBorderOnItemsWithoutPatterns))
				Component.create()
					.classes.add(ItemClasses.Deepsight)
					.classes.toggle(objectiveComplete, ItemClasses.DeepsightAttuned)
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
		this.setTooltip(ItemTooltip, {
			initialiser: tooltip => tooltip.setPadding(this.tooltipPadding)
				.setItem(item),
			differs: tooltip => tooltip.item?.reference.itemInstanceId !== item.reference.itemInstanceId,
		});

		this.extra.appendTo(this);

		this.loadingSpinny = Component.create()
			.classes.add(Loadable.Classes.LoadingSpinny, ItemClasses.Loading)
			.classes.toggle(!item.transferring, Classes.Hidden)
			.append(Component.create())
			.append(Component.create())
			.appendTo(this);
	}

	public setSortedBy (sorter: SortManager) {
		void this.rerenderExtra(sorter);
		return this;
	}

	public setTooltipPadding (padding: number) {
		this.tooltipPadding = padding;
		return this;
	}

	private rerenderId?: number;
	private async rerenderExtra (sorter: SortManager) {
		const rerenderId = this.rerenderId = Math.random();
		this.extra.removeContents();

		let extra = 0;
		for (const sort of sorter.get()) {
			if (!sort.render)
				continue;

			const rendered = await sort.render(this.item);
			if (!rendered)
				continue;

			if (this.rerenderId !== rerenderId)
				// something else is causing this to rerender
				return;

			this.extra.append(rendered);
			if (++extra === 3)
				return;
		}
	}
}
