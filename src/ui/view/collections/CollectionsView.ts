import Model from "model/Model";
import Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import Moments from "model/models/Moments";
import ProfileBatch from "model/models/ProfileBatch";
import View from "ui/View";
import CollectionsCurrentlyAvailable from "ui/view/collections/CollectionsCurrentlyAvailable";
import CollectionsMoment from "ui/view/collections/CollectionsMoment";
import Arrays from "utility/Arrays";
import Bungie from "utility/endpoint/bungie/Bungie";

const CollectionsViewModel = Model.createTemporary(async (api): Promise<[ProfileBatch?, Inventory?]> =>
	!Bungie.authenticated ? []
		: api.subscribeProgressAndWaitAll(Arrays.tuple(ProfileBatch, Inventory.createModel()), 1));

export default View.create({
	models: [Manifest, Moments, CollectionsViewModel] as const,
	id: "collections",
	name: "Collections",
	auth: "optional",
	initialise: (view, manifest, moments, [profile, inventory]) => {
		view.setTitle(title => title.text.set("Collections"));

		if (profile && inventory)
			CollectionsCurrentlyAvailable.create([manifest, profile, inventory])
				.appendTo(view.content);

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

			CollectionsMoment.create([moment, inventory, defaultOpen])
				.appendTo(view.content);
		}
	},
});
