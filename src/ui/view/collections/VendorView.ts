import type { DeepsightVendorDefinition } from "@deepsight.gg/interfaces";
import type { IModelGenerationApi } from "model/Model";
import Model from "model/Model";
import Manifest from "model/models/Manifest";
import Component from "ui/Component";
import LoadingManager from "ui/LoadingManager";
import View from "ui/View";
import Display from "ui/bungie/DisplayProperties";
import ErrorView from "ui/view/ErrorView";
import VendorDisplay from "ui/view/collections/vendor/VendorDisplay";
import Objects from "utility/Objects";

function getId (vendor: DeepsightVendorDefinition) {
	return vendor.displayProperties.name
		?.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/'/g, "")
		.replace(/[^a-z0-9_-]+/g, "-");
}

export async function resolveVendorURL (vendorId: string, api: IModelGenerationApi) {
	const manifest = await api.subscribeProgressAndWait(Manifest, 1);
	const { DeepsightVendorDefinition } = manifest;

	const vendors = await DeepsightVendorDefinition.all();

	const searchHash = +vendorId;
	return vendors.find(vendor => vendor.hash === searchHash
		|| vendorId === getId(vendor));
}

export enum VendorViewClasses {
	Wares = "view-vendor-wares",
	WaresBackdrop2 = "view-vendor-wares-backdrop-2",
}

const vendorViewBase = View.create({
	models: (vendor: DeepsightVendorDefinition | string) =>
		[Manifest, Model.createTemporary(async api => typeof vendor !== "string" ? vendor : resolveVendorURL(vendor, api), "resolveVendorURL")] as const,
	id: "vendor",
	hash: (vendor: DeepsightVendorDefinition | string) => typeof vendor === "string" ? `vendor/${vendor}` : `vendor/${getId(vendor)}`,
	name: (vendor: DeepsightVendorDefinition | string) => typeof vendor === "string" ? "Vendor Details" : Display.name(vendor, "Vendor Details"),
	noDestinationButton: true,
	initialise: async (view, manifest, vendorResult) => {
		LoadingManager.end(view.definition.id);

		const vendor = vendorResult;
		if (!vendor) {
			return ErrorView.show(404, {
				title: "Error: No Vendor Found",
				subtitle: "Your ghost continues its search...",
				buttonText: "View Collections",
				buttonClick: () => viewManager.showCollections(),
			});
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).$i = (window as any).vendor = vendor;
		console.log(Display.name(vendor), vendor);

		if (vendor.background)
			view.setBackground(`../.${vendor.background}`).setDarkened(false);

		VendorDisplay.Button.create([vendor])
			.event.subscribe("click", () => viewManager.showVendors())
			.appendTo(view.content);

		Component.create()
			.classes.add(VendorViewClasses.Wares)
			.append(Component.create()
				.classes.add(VendorViewClasses.WaresBackdrop2))
			.appendTo(view.content);
	},
});

type VendorViewBase = typeof vendorViewBase;
interface VendorViewClass extends VendorViewBase { }
class VendorViewClass extends View.Handler<readonly [typeof Manifest, Model.Impl<DeepsightVendorDefinition | undefined>], [vendor: string | DeepsightVendorDefinition]> {
}

const VendorView = Objects.inherit(vendorViewBase, VendorViewClass);
export default VendorView;
