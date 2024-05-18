import type { DeepsightVendorDefinition, DeepsightVendorItemDefinition } from "@deepsight.gg/interfaces";
import type { IModelGenerationApi } from "model/Model";
import Model from "model/Model";
import Manifest from "model/models/Manifest";
import type { ItemId } from "model/models/items/Item";
import Item from "model/models/items/Item";
import Card, { CardClasses } from "ui/Card";
import type { AnyComponent } from "ui/Component";
import Component from "ui/Component";
import LoadingManager from "ui/LoadingManager";
import View from "ui/View";
import Display from "ui/bungie/DisplayProperties";
import Paginator from "ui/form/Paginator";
import { ItemClasses } from "ui/inventory/IItemComponent";
import ItemComponent from "ui/inventory/ItemComponent";
import Slot from "ui/inventory/Slot";
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
	Information = "view-vendor-information",
	Wares = "view-vendor-wares",
	WaresBackdrop2 = "view-vendor-wares-backdrop-2",
	CategoryPaginator = "view-vendor-category-paginator",
	CategoryPaginatorPageWrapper = "view-vendor-category-paginator-page-wrapper",
	CategoryPaginatorPage = "view-vendor-category-paginator-page",
	Category = "view-vendor-category",
	CategoryContent = "view-vendor-category-content",
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

		const appendItemSlot = async (to: AnyComponent, itemRef: DeepsightVendorItemDefinition, initialiser?: (itemComponent: ItemComponent) => any) => {
			const itemDef = await manifest.DestinyInventoryItemDefinition.get(itemRef.itemHash);
			if (!itemDef)
				return;

			const item = await Item.createFake(manifest, { itemComponents: itemRef.itemComponent }, itemDef, undefined, `${itemRef.vendorItemIndex}` as ItemId);
			const itemComponent = ItemComponent.create([])
				.appendTo(Slot.create().appendTo(to)) as ItemComponent;

			await itemComponent.setItem(item);

			initialiser?.(itemComponent);
		};

		const informationIndex = vendor.categories.findIndex(category => false
			|| category.identifier.endsWith(".help.name")
			|| category.items.some(item => Display.name(item) === "Event Information")); // TODO this should be fixed in the vendor manifest

		const informationCategory = vendor.categories[informationIndex];
		const categories = vendor.categories.filter(category => category !== informationCategory);

		if (informationCategory)
			Component.create()
				.classes.add(VendorViewClasses.Information)
				.tweak(appendItemSlot, informationCategory.items[0], item => item.classes.add(ItemClasses.Borderless))
				.appendTo(view.content);

		const wares = Component.create()
			.classes.add(VendorViewClasses.Wares)
			.append(Component.create()
				.classes.add(VendorViewClasses.WaresBackdrop2))
			.appendTo(view.content);

		const categoryPaginator = Paginator.create()
			.classes.add(VendorViewClasses.CategoryPaginator)
			.appendTo(wares);

		categoryPaginator.pageWrapper.classes.add(VendorViewClasses.CategoryPaginatorPageWrapper);

		const filler = categoryPaginator.filler(16);

		for (const category of categories) {
			const categorySection = Card.create()
				.classes.add(VendorViewClasses.Category, `${VendorViewClasses.Category}-${category.identifier.toLowerCase().replace(/[^a-z]+/g, "-")}`)
				.setDisplayMode(CardClasses.DisplayModeSection);

			categorySection.content.classes.add(VendorViewClasses.CategoryContent);

			let size = 0;
			if (category.displayProperties.name) {
				size++;
				Component.create()
					.tweak(Display.applyDescription, category.displayProperties.name, { singleLine: true })
					.appendTo(categorySection.title);
			}

			let catItemsSize = 0;
			for (const itemRef of category.items) {
				await appendItemSlot(categorySection.content, itemRef);
				catItemsSize += 1 / 7;
			}

			size += Math.ceil(catItemsSize) * 2;

			categorySection.appendTo(filler.add(size, page => page.classes.add(VendorViewClasses.CategoryPaginatorPage)));
		}
	},
});

type VendorViewBase = typeof vendorViewBase;
interface VendorViewClass extends VendorViewBase { }
class VendorViewClass extends View.Handler<readonly [typeof Manifest, Model.Impl<DeepsightVendorDefinition | undefined>], [vendor: string | DeepsightVendorDefinition]> {
}

const VendorView = Objects.inherit(vendorViewBase, VendorViewClass);
export default VendorView;
