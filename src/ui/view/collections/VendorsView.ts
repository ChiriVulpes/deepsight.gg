import { VendorGroupHashes } from "deepsight.gg/Enums";
import Manifest from "model/models/Manifest";
import Component from "ui/component/Component";
import View from "ui/view/View";
import VendorView from "ui/view/collections/VendorView";
import VendorDisplay from "ui/view/collections/vendor/VendorDisplay";

export enum VendorsViewClasses {
	Vendor = "view-vendors-vendor",
	GroupTitle = "view-vendors-group-title",
}

export default View.create({
	models: [Manifest] as const,
	id: "vendors",
	name: "Vendors",
	auth: "optional",
	noProfileInURL: true,
	navGroupViewId: "collections",
	initialise: async (view, Manifest) => {
		const vendors: any[] = []
		// (await Manifest.DeepsightVendorDefinition.all())
		// .sort((a, b) => (a.displayProperties.name ?? "").localeCompare(b.displayProperties.name ?? ""))
		// .sort((a, b) => (b.moment ?? Infinity) - (a.moment ?? Infinity));

		for (const group of [VendorGroupHashes.LimitedTime, VendorGroupHashes.Seasonal, VendorGroupHashes.Tower, VendorGroupHashes.Destination]) {
			const groupDef = await Manifest.DestinyVendorGroupDefinition.get(group);
			const groupVendors = vendors.filter(vendor => vendor.groups.includes(group));
			if (!groupVendors.length)
				continue;

			Component.create()
				.classes.add(View.Classes.Title, VendorsViewClasses.GroupTitle)
				.text.set(groupDef?.categoryName)
				.appendTo(view.content);

			for (const vendor of groupVendors) {
				VendorDisplay.Button.create([vendor])
					.classes.add(VendorsViewClasses.Vendor)
					.event.subscribe("click", () => VendorView.show(vendor))
					.appendTo(view.content);
			}
		}
	},
});
