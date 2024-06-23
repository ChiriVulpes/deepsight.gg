import Model from "model/Model";
import type { IEmblem } from "model/models/Emblems";
import Emblems from "model/models/Emblems";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import Item from "model/models/items/Item";
import Component from "ui/component/Component";
import Paginator from "ui/component/Paginator";
import HintsDrawer from "ui/destiny/component/HintsDrawer";
import { ItemClasses } from "ui/destiny/component/IItemComponent";
import ProfileButton from "ui/destiny/component/ProfileButton";
import FilterManager from "ui/destiny/filter/FilterManager";
import ItemFilter from "ui/destiny/filter/ItemFilter";
import ItemSort from "ui/destiny/sort/ItemSort";
import ItemTooltip from "ui/destiny/tooltip/ItemTooltip";
import type { IKeyEvent } from "ui/utility/UiEventBus";
import UiEventBus from "ui/utility/UiEventBus";
import View from "ui/view/View";
import { VIEW_ID_COLLECTIONS } from "ui/view/collections/ICollectionsView";
import { FILTER_MANAGER_EMBLEMS, SORT_MANAGER_EMBLEMS, VIEW_ID_EMBLEMS, VIEW_NAME_EMBLEMS } from "ui/view/collections/IEmblemsView";
import Async from "utility/Async";
import type BungieID from "utility/BungieID";
import type { IProfileStorage } from "utility/Store";

export enum EmblemsViewClasses {
	Paginator = "view-emblems-paginator",
	ListWrapper = "view-emblems-list-wrapper",
	List = "view-emblems-list",
	Emblem = "view-emblems-emblem",
	Emblem_NotAcquired = "view-emblems-emblem--not-acquired",
}

const EmblemItems = Model.createTemporary(async api => {
	const profile = await api.subscribeProgressAndWait(ProfileBatch, 1 / 4);
	const manifest = await api.subscribeProgressAndWait(Manifest, 1 / 4, 1 / 4);
	const emblems = await api.subscribeProgressAndWait(Emblems, 1 / 4, 2 / 4);

	const start = 3 / 4;

	const result: IEmblem[] = [];
	let lastUpdate = 0;
	for (const emblem of emblems) {
		result.push({
			...emblem,
			item: await Item.createFake(manifest, profile, emblem.definition),
		});

		if (Date.now() - lastUpdate > 100) {
			lastUpdate = Date.now();
			api.emitProgress(start + (1 / 4) * (result.length / emblems.length), "Loading emblems");
		}
	}

	return result as Required<IEmblem>[];
});

export default View.create({
	models: [EmblemItems, FilterManager.initModel] as const,
	id: VIEW_ID_EMBLEMS,
	name: VIEW_NAME_EMBLEMS,
	auth: "optional",
	navGroupViewId: VIEW_ID_COLLECTIONS,
	initialise: (view, emblems) => {
		view.setTitle(title => title.text.set(VIEW_NAME_EMBLEMS));
		view.setSubtitle("lore", subtitle => subtitle
			.text.set("Symbols of aesthetics, collection, or prestige..."));

		const map = new Map<IEmblem, ProfileButton>();
		for (const emblem of emblems) {
			const fakeBungieId: BungieID = { name: emblem.definition.displayProperties.name, code: -1 };
			const fakeProfile: IProfileStorage = {
				lastModified: new Date().toISOString(),
				emblemHash: emblem.definition.hash,
			};
			map.set(emblem, ProfileButton.create([fakeBungieId, fakeProfile])
				.classes.add(EmblemsViewClasses.Emblem)
				.classes.toggle(emblem.item.isNotAcquired(), EmblemsViewClasses.Emblem_NotAcquired)
				.setTooltip(ItemTooltip, {
					initialise: tooltip => emblem.definition && tooltip.setPadding(20).setItem(emblem.item),
					differs: tooltip => tooltip.item?.reference.itemInstanceId !== emblem.item?.reference.itemInstanceId,
				}));
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
			sortAndFilterPromise = Async.sleep(500).then(async () => {
				sortAndFilterPromise = undefined;

				const columns = Math.floor(Component.window.width / 350);
				const rows = Math.floor((Component.window.height - 200) / 50);
				const state = `${SORT_MANAGER_EMBLEMS.getStateHash()};${FILTER_MANAGER_EMBLEMS.getStateHash()};${columns};${rows}`;
				if (state === lastState)
					return;

				lastState = state;

				view.style.set("--columns", `${columns}`);
				view.style.set("--rows", `${rows}`);
				let index = 0;
				const filler = emblemList.filler(columns * rows, page => {
					index = 0;
					page.classes.add(EmblemsViewClasses.List);
				});

				const subset = emblems
					.filter(FILTER_MANAGER_EMBLEMS.apply)
					.sort(
						(a, b) => SORT_MANAGER_EMBLEMS.sort(a, b),
						(a, b) => a.definition.displayProperties.name.localeCompare(b.definition.displayProperties.name),
					);

				for (const emblem of subset)
					map.get(emblem)
						?.style.set("--profile-index", `${index++}`)
						?.appendTo(filler.increment());

				filler.fillRemainder(page => page.append(ProfileButton.Placeholder.create()));

				emblemList.pageWrapper.element.scrollLeft = 0;
				await Async.sleep(10);
				emblemList.pageWrapper.element.scrollLeft = 0;
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
