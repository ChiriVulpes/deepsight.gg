import { VendorGroupHashes } from "deepsight.gg/Enums";
import Manifest from "model/models/Manifest";
import Component from "ui/Component";
import View from "ui/View";
import Button from "ui/form/Button";
import VendorDisplay from "ui/view/collections/vendor/VendorDisplay";

export enum VendorsViewClasses {
	Group = "view-vendors-group",
	GroupTitle = "view-vendors-group-title",
	GroupContents = "view-vendors-group-contents",
	Vendor = "view-vendors-vendor",
	VendorTitle = "view-vendors-vendor-title",
	VendorSubtitle = "view-vendors-vendor-subtitle",
}

export default View.create({
	models: [Manifest] as const,
	id: "vendors",
	name: "Vendors",
	auth: "optional",
	parentViewId: "collections",
	initialise: async (view, Manifest) => {
		const vendors = (await Manifest.DeepsightVendorDefinition.all())
			.sort((a, b) => (a.displayProperties.name ?? "").localeCompare(b.displayProperties.name ?? ""))
			.sort((a, b) => (b.moment ?? Infinity) - (a.moment ?? Infinity));

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
				Button.create()
					.classes.add(VendorsViewClasses.Vendor)
					.append(VendorDisplay.create([vendor]))
					.appendTo(view.content);
			}
		}
	},
});
