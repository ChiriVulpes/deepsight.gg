import Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import Moments from "model/models/Moments";
import ProfileBatch from "model/models/ProfileBatch";
import WeaponRotation from "model/models/WeaponRotation";
import View from "ui/View";
import CollectionsCurrentlyAvailable from "ui/view/collections/CollectionsCurrentlyAvailable";
import CollectionsMoment from "ui/view/collections/CollectionsMoment";

export default View.create({
	models: [Manifest, ProfileBatch, Moments, WeaponRotation, Inventory.createTemporary()] as const,
	id: "collections",
	name: "Collections",
	initialise: (view, manifest, profile, moments, weaponRotation, inventory) => {
		view.setTitle(title => title.text.set("Collections"));

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
