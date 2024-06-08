import type { DeepsightPlugCategorisation } from "@deepsight.gg/plugs";
import Model from "model/Model";
import Manifest from "model/models/Manifest";
import { Plug } from "model/models/items/Plugs";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import View from "ui/View";
import HintsDrawer from "ui/inventory/HintsDrawer";
import { ItemClasses } from "ui/inventory/IItemComponent";
import FilterManager from "ui/inventory/filter/FilterManager";
import ItemFilter from "ui/inventory/filter/ItemFilter";
import ItemSort from "ui/inventory/sort/ItemSort";
import { FILTER_MANAGER_MODS, SORT_MANAGER_MODS } from "ui/view/collections/IModsView";
import ModsCategory, { ModsList } from "ui/view/collections/ModsCategory";
import Async from "utility/Async";

const ModsViewModel = Model.createTemporary(async api => {
	api.emitProgress(0 / 3, "Loading manifest");
	const manifest = await api.subscribeProgressAndWait(Manifest, 1 / 3);
	const { DeepsightPlugCategorisation } = manifest;

	api.emitProgress(1 / 3, "Initialising filters");
	await FilterManager.init();

	const from = 2 / 3;
	const amount = 1 / 3;
	api.emitProgress(from, "Loading mods");

	const categorisations = await DeepsightPlugCategorisation.all();
	const categoryNames = Array.from(new Set(categorisations.map(plug => plug.categoryName))).sort();

	let lastRender = 0;
	const categories: ModsDataCategory[] = [];
	let i = 0;
	for (const categoryName of categoryNames) {
		const categoryCategorisations = categorisations.filter(plug => plug.categoryName === categoryName);
		const typeNames = Array.from(new Set(categoryCategorisations.map(plug => plug.typeName))).sort();

		const types: ModsDataType[] = [];
		const plugs: Plug[] = [];
		const category: ModsDataCategory = {
			category: categoryName,
			categorisations: categoryCategorisations,
			types,
			plugs,
		};

		for (const typeName of typeNames) {
			let plugs = category.plugs;

			if (typeName) {
				plugs = [];
				types.push({
					type: typeName,
					plugs,
				});
			}

			for (const plugCategorisation of categoryCategorisations) {
				if (plugCategorisation.typeName === typeName)
					plugs.push(await Plug.resolveFromHash(manifest, plugCategorisation.hash, true));

				if (Date.now() - lastRender > 200) {
					lastRender = Date.now();
					api.emitProgress(from + amount * (i++ / categorisations.length), "Loading mods");
					await Async.sleep(10);
				}
			}
		}

		categories.push(category);
	}

	const sorter = (a: Plug, b: Plug) =>
		(a.definition?.displayProperties?.name ?? "").localeCompare(b.definition?.displayProperties?.name ?? "");

	for (const category of categories) {
		category.plugs.sort(sorter);
		for (const type of category.types) {
			type.plugs.sort(sorter);
		}
	}

	return {
		manifest,
		categories,
	} satisfies ModsData;
});

interface ModsData {
	manifest: Manifest,
	categories: ModsDataCategory[];
}

interface ModsDataCategory {
	category: string;
	categorisations: DeepsightPlugCategorisation[];
	types: ModsDataType[];
	plugs: Plug[];
}

interface ModsDataType {
	type: string;
	plugs: Plug[];
}

export default View.create({
	models: [ModsViewModel] as const,
	id: "mods",
	name: "Mods",
	auth: "optional",
	noProfileInURL: true,
	navGroupViewId: "collections",
	initialise: (view, { categories }) => {
		view.setTitle(title => title.text.set("Mods"));
		view.setSubtitle("lore", subtitle => subtitle
			.text.set("An exhaustive list of every mod, perk, cosmetic, and more..."));

		let detailsIndex = 0;
		const details: ModsCategory[] = [];

		for (const category of categories) {
			const categoryDetails = ModsCategory.create([category.category])
				.style.set("--index", `${detailsIndex++}`)
				.addPlugs(category.plugs)
				.appendTo(view.content);
			details.push(categoryDetails);

			for (const type of category.types) {
				const typeDetails = ModsList.create([type.type, undefined, undefined, false])
					.style.set("--index", `${detailsIndex++}`)
					.addPlugs(type.plugs);
				categoryDetails.addType(typeDetails);
			}
		}

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

				const state = `${SORT_MANAGER_MODS.getStateHash()};${FILTER_MANAGER_MODS.getStateHash()}`;
				if (state === lastState)
					return;

				lastState = state;
				details.forEach(wrapper => wrapper.sortAndFilter());
			});
		};

		ItemSort.create([SORT_MANAGER_MODS])
			.event.subscribe("sort", queueSortAndFilter)
			.tweak(itemSort => View.registerFooterButton(itemSort.button))
			.tweak(itemSort => itemSort.label.classes.add(View.Classes.FooterButtonLabel))
			.tweak(itemSort => itemSort.sortText.classes.add(View.Classes.FooterButtonText))
			.appendTo(view.footer);

		const filterer = ItemFilter.getFor(FILTER_MANAGER_MODS)
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
