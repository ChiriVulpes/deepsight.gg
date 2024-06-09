import Model from "model/Model";
import type { IEmblem } from "model/models/Emblems";
import Emblems from "model/models/Emblems";
import Component from "ui/Component";
import ProfileButton from "ui/ProfileButton";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import View from "ui/View";
import Paginator from "ui/form/Paginator";
import HintsDrawer from "ui/inventory/HintsDrawer";
import { ItemClasses } from "ui/inventory/IItemComponent";
import FilterManager from "ui/inventory/filter/FilterManager";
import ItemFilter from "ui/inventory/filter/ItemFilter";
import ItemSort from "ui/inventory/sort/ItemSort";
import { FILTER_MANAGER_EMBLEMS, SORT_MANAGER_EMBLEMS, VIEW_ID_EMBLEMS, VIEW_NAME_EMBLEMS } from "ui/view/collections/IEmblemsView";
import Async from "utility/Async";
import type BungieID from "utility/BungieID";
import type { IProfileStorage } from "utility/Store";

export enum EmblemsViewClasses {
	Paginator = "view-emblems-paginator",
	ListWrapper = "view-emblems-list-wrapper",
	List = "view-emblems-list",
}

export default View.create({
	models: [Emblems, Model.createTemporary(FilterManager.init, "Initialising filters")] as const,
	id: VIEW_ID_EMBLEMS,
	name: VIEW_NAME_EMBLEMS,
	auth: "optional",
	navGroupViewId: "collections",
	initialise: (view, emblems) => {
		view.setTitle(title => title.text.set("Emblems"));
		view.setSubtitle("lore", subtitle => subtitle
			.text.set("Symbols of prestige or aesthetic, collected and worn by the guardians..."));

		const map = new Map<IEmblem, ProfileButton>();
		for (const emblem of emblems) {
			const fakeBungieId: BungieID = { name: emblem.definition.displayProperties.name, code: -1 };
			const fakeProfile: IProfileStorage = {
				lastModified: new Date().toISOString(),
				emblemHash: emblem.definition.hash,
			};
			map.set(emblem, ProfileButton.create([fakeBungieId, fakeProfile]));
		}

		const emblemList = Paginator.create()
			.classes.add(EmblemsViewClasses.Paginator)
			.tweak(paginator => paginator.pageWrapper.classes.add(EmblemsViewClasses.ListWrapper))
			.appendTo(view.content);

		let sortAndFilterQueued = false;
		let sortAndFilterPromise: Promise<void> | undefined;
		let lastState = "";
		const queueSortAndFilter = async () => {
			if (sortAndFilterQueued)
				return;

			sortAndFilterQueued = true;
			while (sortAndFilterPromise)
				await sortAndFilterPromise;

			sortAndFilterQueued = false;
			sortAndFilterPromise = Async.sleep(500).then(() => {
				sortAndFilterPromise = undefined;

				const columns = Math.floor(Component.window.width / 350);
				const rows = Math.floor((Component.window.height - 200) / 50);
				const state = `${SORT_MANAGER_EMBLEMS.getStateHash()};${FILTER_MANAGER_EMBLEMS.getStateHash()};${columns};${rows}`;
				if (state === lastState)
					return;

				lastState = state;

				view.style.set("--columns", `${columns}`);
				view.style.set("--rows", `${rows}`);
				const filler = emblemList.filler(columns * rows, page => page.classes.add(EmblemsViewClasses.List));

				const subset = emblems
					.filter(FILTER_MANAGER_EMBLEMS.apply)
					.sort(
						(a, b) => SORT_MANAGER_EMBLEMS.sort(a, b),
						(a, b) => a.definition.displayProperties.name.localeCompare(b.definition.displayProperties.name),
					);

				for (const emblem of subset)
					map.get(emblem)?.appendTo(filler.increment());

				filler.fillRemainder(page => page.append(ProfileButton.Placeholder.create()));
			});
		};

		Component.window.event.subscribe("resize", queueSortAndFilter);

		ItemSort.create([SORT_MANAGER_EMBLEMS])
			.event.subscribe("sort", queueSortAndFilter)
			.tweak(itemSort => View.registerFooterButton(itemSort.button))
			.tweak(itemSort => itemSort.label.classes.add(View.Classes.FooterButtonLabel))
			.tweak(itemSort => itemSort.sortText.classes.add(View.Classes.FooterButtonText))
			.appendTo(view.footer);

		const filterer = ItemFilter.getFor(FILTER_MANAGER_EMBLEMS)
			.event.subscribe("filter", queueSortAndFilter)
			.event.subscribe("submit", () =>
				document.querySelector<HTMLButtonElement>(`.${ItemClasses.Main}:not([tabindex="-1"])`)?.focus())
			.tweak(itemFilter => View.registerFooterButton(itemFilter.button))
			.tweak(itemFilter => itemFilter.label.classes.add(View.Classes.FooterButtonLabel))
			.tweak(itemFilter => itemFilter.input.classes.add(View.Classes.FooterButtonText))
			.appendTo(view.footer);

		void queueSortAndFilter();

		const hints = HintsDrawer.create()
			.tweak(hints => View.registerFooterButton(hints.button))
			.tweak(hints => hints.buttonLabel.classes.add(View.Classes.FooterButtonLabel))
			.tweak(hints => hints.buttonText.classes.add(View.Classes.FooterButtonText))
			.appendTo(view.footer);

		const onGlobalKeydown = (event: IKeyEvent) => {
			if (!document.contains(view.element)) {
				UiEventBus.unsubscribe("keydown", onGlobalKeydown);
				return;
			}

			if (hints.drawer.isOpen() && event.useOverInput("Escape")) {
				hints.drawer.close(true);
			}

			if (filterer.isFiltered() && event.use("Escape")) {
				filterer.reset();
			}
		};

		UiEventBus.subscribe("keydown", onGlobalKeydown);
	},
});
