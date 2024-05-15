import Model from "model/Model";
import Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import Moments from "model/models/Moments";
import ProfileBatch from "model/models/ProfileBatch";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import View from "ui/View";
import HintsDrawer from "ui/inventory/HintsDrawer";
import { ItemClasses } from "ui/inventory/ItemComponent";
import FilterManager from "ui/inventory/filter/FilterManager";
import ItemFilter from "ui/inventory/filter/ItemFilter";
import ItemSort from "ui/inventory/sort/ItemSort";
import CollectionsCurrentlyAvailable from "ui/view/collections/CollectionsCurrentlyAvailable";
import CollectionsMoment from "ui/view/collections/CollectionsMoment";
import { FILTER_MANAGER_COLLECTIONS, SORT_MANAGER_COLLECTIONS, VIEW_ID_COLLECTIONS, VIEW_NAME_COLLECTIONS } from "ui/view/collections/ICollectionsView";
import Bungie from "utility/endpoint/bungie/Bungie";

const CollectionsViewModel = Model.createTemporary(async (api): Promise<[ProfileBatch?, Inventory?]> => {
	if (!Bungie.authenticated)
		return [];

	const profile = ProfileBatch.latest ?? await api.subscribeProgressAndWait(ProfileBatch, 0.5);
	const inventory = await api.subscribeProgressAndWait(Inventory.createModel(), 0.5, 0.5);
	return [profile, inventory];
});

export default View.create({
	models: [Manifest, Moments, CollectionsViewModel] as const,
	id: VIEW_ID_COLLECTIONS,
	name: VIEW_NAME_COLLECTIONS,
	auth: "optional",
	initialise: async (view, manifest, moments, [profile, inventory]) => {
		view.setTitle(title => title.text.set("Collections"));

		await FilterManager.init();

		CollectionsCurrentlyAvailable.create([manifest, profile, inventory])
			.appendTo(view.content);

		const momentWrappers: CollectionsMoment[] = [];

		let shownExpansion = false;
		let shownSeason = false;
		for (const moment of moments) {

			let defaultOpen = false;
			if (!shownExpansion && moment.expansion) {
				defaultOpen = true;
				shownExpansion = true;
			}

			if (!shownSeason && moment.season) {
				defaultOpen = true;
				shownSeason = true;
			}

			// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
			if (profile?.profile?.data?.activeEventCardHash === moment.eventCard?.hash && (+moment.eventCard?.endTime! ?? 0) * 1000 > Date.now())
				defaultOpen = true;

			const wrapper = CollectionsMoment.create([moment, inventory, defaultOpen])
				.appendTo(view.content);

			momentWrappers.push(wrapper);
		}

		ItemSort.create([SORT_MANAGER_COLLECTIONS])
			.event.subscribe("sort", () => momentWrappers.forEach(wrapper => wrapper.sort()))
			.tweak(itemSort => View.registerFooterButton(itemSort.button))
			.tweak(itemSort => itemSort.label.classes.add(View.Classes.FooterButtonLabel))
			.tweak(itemSort => itemSort.sortText.classes.add(View.Classes.FooterButtonText))
			.appendTo(view.footer);

		const filterer = ItemFilter.getFor(FILTER_MANAGER_COLLECTIONS)
			.event.subscribe("filter", () => momentWrappers.forEach(wrapper => wrapper.filter()))
			.event.subscribe("submit", () =>
				document.querySelector<HTMLButtonElement>(`.${ItemClasses.Main}:not([tabindex="-1"])`)?.focus())
			.tweak(itemFilter => View.registerFooterButton(itemFilter.button))
			.tweak(itemFilter => itemFilter.label.classes.add(View.Classes.FooterButtonLabel))
			.tweak(itemFilter => itemFilter.input.classes.add(View.Classes.FooterButtonText))
			.appendTo(view.footer);

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
