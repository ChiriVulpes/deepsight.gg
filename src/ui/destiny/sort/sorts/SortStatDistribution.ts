import { DestinyClass } from "bungie-api-ts/destiny2";
import Characters from "model/models/Characters";
import Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import type { ComponentEventManager, ComponentEvents } from "ui/component/Component";
import Component from "ui/component/Component";
import Details from "ui/component/Details";
import Loadable from "ui/component/Loadable";
import Checkbox from "ui/component/form/Checkbox";
import RangeInput from "ui/component/form/RangeInput";
import Sort, { ISort } from "ui/destiny/sort/Sort";
import type { Stat, StatGroup } from "ui/destiny/utility/Stat";
import { ARMOUR_GROUP_STATS_MAX, ARMOUR_STAT_GROUPS, ARMOUR_STAT_MAX, ARMOUR_STAT_MIN, IStatDistribution } from "ui/destiny/utility/Stat";
import { EventManager } from "utility/EventManager";
import Bound from "utility/decorator/Bound";

export enum StatDistributionClasses {
	ClassConfiguration = "stat-distribution-class-configuration",
	ClassButton = "stat-distribution-class-configuration-button",
	StatRows = "stat-distribution-stat-rows",
	Group = "stat-distribution-stat-group",
	Row = "stat-distribution-stat",
	Label = "stat-distribution-stat-label",
	Range = "stat-distribution-stat-range",
	Value = "stat-distribution-stat-value",
	Enabled = "stat-distribution-stat-enabled",
}

interface IStatDistributionDisplayEvents {
	update: Event;
}

const displayEvents = EventManager.make<IStatDistributionDisplayEvents>();

enum StatDistributionDisplayClasses {
	Main = "item-stat-distribution",
	Value = "item-stat-distribution-value",
}

class StatDistributionDisplay extends Component<HTMLElement, [Item]> {

	public item!: Item;
	public value!: Component;
	private contained = false;

	protected override onMake (item: Item): void {
		this.item = item;
		this.classes.add(StatDistributionDisplayClasses.Main);

		this.value = Component.create("span")
			.classes.add(StatDistributionDisplayClasses.Value)
			.appendTo(this);

		displayEvents.subscribe("update", this.update);
		this.update();
	}

	@Bound
	public update () {
		if (!document.contains(this.element) && this.contained) {
			displayEvents.unsubscribe("update", this.update);
			return;
		}

		this.contained = true;

		const distribution = IStatDistribution.get(this.item);
		this.style.set("--value", `${distribution.overall}`);
		this.value.text.set(`${Math.floor(distribution.overall * 100)}%`);
	}
}

export default ISort.create({
	id: Sort.StatDistribution,
	name: "Stat Distribution",
	shortName: "Stats",
	sort: (a, b) => IStatDistribution.get(b).overall - IStatDistribution.get(a).overall,
	render: item => IStatDistribution.get(item).overall <= 0 ? undefined : StatDistributionDisplay.create([item]),
	renderSortable: sortable => sortable.icon.text.set("%"),
	renderSortableOptions: (wrapper, update) => Loadable.create(Inventory.await())
		.onReady(inventory => {
			const container = Component.create();

			const classes = Characters.getSortedClasses();
			for (let i = 0; i < classes.length; i++) {
				const classType = classes[i];

				const characterDetails = Details.create()
					.classes.add(StatDistributionClasses.ClassConfiguration)
					.tweak(details => details.summary
						.text.set(classType === DestinyClass.Titan ? "Titan" : classType === DestinyClass.Hunter ? "Hunter" : "Warlock")
						.classes.add(StatDistributionClasses.ClassButton)
						.event.subscribe("click", () => {
							for (const details of container.children<Details>())
								if (details !== characterDetails)
									details.close();
						}))
					.toggle(i === 0)
					.appendTo(container);

				const configuration = Component.create()
					.classes.add(StatDistributionClasses.StatRows)
					.appendTo(characterDetails);

				for (const group of ARMOUR_STAT_GROUPS)
					StatGroupDisplay.create([group, classType])
						.event.subscribe("update", update)
						.appendTo(configuration);
			}

			return container;
		})
		.appendTo(wrapper),
});

export interface IStatRowEvents extends ComponentEvents {
	update: { value: number; oldValue: number };
	done: Event;
}

class StatRow extends Component<HTMLElement, [Stat, DestinyClass]> {

	public override event!: ComponentEventManager<this, IStatRowEvents>;

	public stat!: Stat;
	public classType!: DestinyClass;
	public checkbox!: Checkbox;
	public input!: RangeInput;
	public valueText!: Component;

	public get value () {
		return this.input.value;
	}
	public set value (value: number) {
		this.input.value = value;
		this.update();
	}

	private oldValue!: number;

	protected override async onMake (stat: Stat, classType: DestinyClass) {
		this.stat = stat;
		this.classType = classType;
		this.classes.add(StatDistributionClasses.Row);

		const enabled = IStatDistribution.isEnabled(stat, classType);
		this.classes.toggle(enabled, StatDistributionClasses.Enabled);

		this.checkbox = Checkbox.create([enabled])
			.classes.add(StatDistributionClasses.Label)
			.event.subscribe("update", ({ checked }) => {
				IStatDistribution.setIsEnabled(stat, classType, checked);
				this.update(false, true);
				this.event.emit("done");
				this.input.attributes.set("tabindex", checked ? undefined : "-1");
				this.classes.toggle(checked, StatDistributionClasses.Enabled);
			})
			.appendTo(this);

		this.input = RangeInput.create([{ min: ARMOUR_STAT_MIN, max: ARMOUR_STAT_MAX }])
			.classes.add(StatDistributionClasses.Range)
			.style.set("--visual-min", `${ARMOUR_STAT_MIN / ARMOUR_STAT_MAX}`)
			.attributes.set("tabindex", enabled ? undefined : "-1")
			.event.subscribe("input", this.update)
			.event.subscribe("change", () => this.event.emit("done"))
			.appendTo(this);

		this.valueText = Component.create()
			.classes.add(StatDistributionClasses.Value)
			.appendTo(this);

		this.value = IStatDistribution.getPreferredValue(stat, classType);

		this.update();

		const { DestinyStatDefinition } = await Manifest.await();
		const definition = await DestinyStatDefinition.get(stat);
		this.checkbox.label.text.set(definition?.displayProperties.name ?? "Unknown");
	}

	@Bound
	public update (event?: any, force = false) {
		if (this.oldValue === this.input.value && !force)
			return this;

		this.valueText.text.set(`${this.input.value}`);

		const oldValue = this.oldValue;
		this.oldValue = this.input.value;
		IStatDistribution.setPreferredValue(this.stat, this.classType, this.input.value);

		// if (event)
		// 	this.checkbox.checked = true;

		if (event)
			this.event.emit("update", { value: this.input.value, oldValue });

		return this;
	}
}

interface IStatGroupDisplayEvents extends ComponentEvents {
	update: Event;
}

class StatGroupDisplay extends Component<HTMLElement, [StatGroup, DestinyClass]> {

	public override readonly event!: ComponentEventManager<this, IStatGroupDisplayEvents>;

	protected override onMake (group: StatGroup, classType: DestinyClass) {
		this.classes.add(StatDistributionClasses.Group);

		const statRows = {} as Record<Stat, StatRow>;
		for (const stat of group) {
			statRows[stat] = StatRow.create([stat, classType])
				.event.subscribe("update", event => {
					let difference = event.value - event.oldValue;
					const modificationOrder = group.map(stat => statRows[stat]).sort((a, b) => b.value - a.value);
					let i = 0;
					for (const otherRow of modificationOrder) {
						if (otherRow.stat === stat)
							continue;

						const oldValue = otherRow.value;
						otherRow.value -= i++ === 0 ? Math.ceil(difference / 2) : difference;
						difference += otherRow.value - oldValue;
					}

					// ensure stats are the right amount
					const total = modificationOrder.reduce((previous, current) => previous + current.value, 0);
					if (total !== ARMOUR_GROUP_STATS_MAX) {
						let difference = ARMOUR_GROUP_STATS_MAX - total;
						for (const otherRow of modificationOrder) {
							if (otherRow.stat === stat)
								continue;

							const oldValue = otherRow.value;
							otherRow.value += i++ === 0 ? Math.ceil(difference / 2) : difference;
							difference -= otherRow.value - oldValue;
						}
					}

					displayEvents.emit("update");
				})
				.event.subscribe("done", () => this.event.emit("update"))
				.appendTo(this);
		}

		for (const stat of group)
			statRows[stat].update(false, true);
	}
}
