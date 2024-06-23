import type { Plug } from "model/models/items/Plugs";
import Component from "ui/component/Component";
import Details from "ui/component/Details";
import Paginator from "ui/component/Paginator";
import { Classes } from "ui/utility/Classes";
import { CollectionsMomentClasses } from "ui/view/collections/CollectionsMoment";
import { FILTER_MANAGER_MODS, ModsViewClasses, SORT_MANAGER_MODS } from "ui/view/collections/IModsView";
import { ItemPlug } from "ui/view/item/ItemSockets";
import Bound from "utility/decorator/Bound";

const capitalisationRegex = /(?<=[a-z])(?=[A-Z])/g;

export class ModsList extends Details<[name: string, plugs?: Plug[], defaultOpen?: boolean, updateVisibility?: boolean]> {

	protected updatingVisibility = false;
	public plugList!: Paginator;
	public plugs!: Plug[];
	public components!: WeakMap<Plug, ItemPlug>;

	protected override onMake (name: string, plugs?: Plug[], defaultOpen = false, updateVisibility = true): void {
		super.onMake(name, plugs);
		this.classes.add(CollectionsMomentClasses.Moment, ModsViewClasses.TypeWrapper);
		this.close();

		this.plugs = plugs?.slice() ?? [];
		this.components = new WeakMap();

		this.classes.add(CollectionsMomentClasses.Moment)
			.toggle(defaultOpen)
			.tweak(details => details.summary.text.set(name.replace(capitalisationRegex, " ")));

		this.plugList = Paginator.create()
			.classes.add(ModsViewClasses.PlugList);

		this.plugList.pageWrapper.classes.add(ModsViewClasses.PlugListContent);

		const storage = Component.create();
		this.event.subscribe("toggle", event => {
			event.stopPropagation();

			if (!this.updatingVisibility)
				this.forcedOpen = false;

			this.plugList.appendTo(this.isOpen() ? this : storage)
				.attributes.toggle(!this.isOpen(), "inert");
		}, false);

		this.sortAndFilter(updateVisibility);
	}

	public addPlugs (plugs: Plug[]) {
		this.plugs.push(...plugs);
		this.sortAndFilter();
		return this;
	}

	private forcedOpen = false;
	@Bound public sortAndFilter (updateVisibility = true) {
		this.plugs.sort(
			(a, b) => SORT_MANAGER_MODS.sort(a, b, false),
			(a, b) => a.definition?.displayProperties.name.localeCompare(b.definition?.displayProperties.name ?? "") ?? 0,
		);

		const helper = this.plugList.filler({ desktop: 25, vertical: 15, tablet: 10, mobile: 5 });
		const plugs = this.plugs.filter(FILTER_MANAGER_MODS.apply);
		for (const plug of plugs)
			if (plug.definition?.displayProperties?.name)
				this.components.compute(plug,
					() => ItemPlug.create([plug, undefined, undefined])
						.classes.add(ModsViewClasses.Plug))
					.appendTo(helper.increment(page => page
						.classes.add(ModsViewClasses.PlugListPage)));

		this.plugList.classes.toggle(!plugs.length, Classes.Hidden);

		if (updateVisibility)
			this.updateVisibility(!!plugs.length);

		return !!plugs.length;
	}

	protected updateVisibility (visible: boolean) {
		this.updatingVisibility = true;

		const hidden = !visible;
		this.classes.toggle(hidden, CollectionsMomentClasses.FilteredOut);

		if (this.forcedOpen && (hidden || !FILTER_MANAGER_MODS.isFiltered())) {
			this.close();
			this.forcedOpen = false;

		} else if (FILTER_MANAGER_MODS.isFiltered() && !hidden && !this.isOpen()) {
			this.open();
			this.forcedOpen = true;
		}

		this.updatingVisibility = false;
	}

}

export default class ModsCategory extends ModsList {

	public types!: ModsList[];

	protected override onMake (name: string, contents: Plug[], defaultOpen = false): void {
		this.types = [];
		super.onMake(name, contents, defaultOpen);
		this.classes.remove(ModsViewClasses.TypeWrapper);
	}

	public addType (typeDetails: ModsList) {
		typeDetails.appendTo(this);
		this.types.push(typeDetails);
	}

	@Bound public override sortAndFilter () {
		let showing = false;
		for (const details of this.types) {
			const typeShowing = details.sortAndFilter();
			showing ||= typeShowing;
		}

		const catShowing = super.sortAndFilter(false);
		showing ||= catShowing;

		this.updateVisibility(showing);
		return showing;
	}
}
