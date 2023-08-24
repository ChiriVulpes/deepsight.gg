import type Model from "model/Model";
import Inventory from "model/models/Inventory";
import View from "ui/View";
import type { IInventoryViewDefinition } from "ui/view/inventory/InventoryView";
import InventoryView from "ui/view/inventory/InventoryView";

export default new View.Factory()
	.using(Inventory.createTemporary())
	.define<IInventoryViewDefinition>()
	.initialise((view, model) =>
		view.make(InventoryView, model))
	.wrapper<InventoryView & View.WrapperComponent<[Model<Inventory>], [], IInventoryViewDefinition & View.IViewBase<[]>>>();
