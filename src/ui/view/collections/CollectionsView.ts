import Model from "model/Model";
import Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import Moments from "model/models/Moments";
import ProfileBatch from "model/models/ProfileBatch";
import WeaponRotation from "model/models/WeaponRotation";
import View from "ui/View";
import CollectionsCurrentlyAvailable from "ui/view/collections/CollectionsCurrentlyAvailable";
import CollectionsMoment from "ui/view/collections/CollectionsMoment";
import Bungie from "utility/endpoint/bungie/Bungie";

const CollectionsViewModel = Model.createTemporary(async (): Promise<[ProfileBatch?, WeaponRotation?, Inventory?]> => {
	return !Bungie.authenticated ? [] : Promise.all([ProfileBatch.await(), WeaponRotation.await(), Inventory.createTemporary().await()]);
});

export default View.create({
	models: [Manifest, Moments, CollectionsViewModel] as const,
	id: "collections",
	name: "Collections",
	auth: "optional",
	initialise: (view, manifest, moments, [profile, weaponRotation, inventory]) => {
		view.setTitle(title => title.text.set("Collections"));

		if (profile && weaponRotation && inventory)
			CollectionsCurrentlyAvailable.create([manifest, profile, weaponRotation, inventory])
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
			if ((+moment.eventCard?.endTime! ?? 0) * 1000 > Date.now())
				defaultOpen = true;

			CollectionsMoment.create([moment, inventory, defaultOpen])
				.appendTo(view.content);
		}
	},
});
