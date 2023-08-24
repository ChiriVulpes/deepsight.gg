import Component from "ui/Component";
import FilterManager from "ui/inventory/filter/FilterManager";
import SortManager from "ui/inventory/sort/SortManager";
import InventoryEquipmentView, { InventorySlotColumnsViewClasses } from "ui/view/inventory/equipment/InventorySlotColumnsView";
import { FILTER_MANAGER_EQUIPMENT_DEFINITION, SORT_MANAGER_EQUIPMENT_DEFINITION, VIEW_ID_EQUIPMENT, VIEW_NAME_EQUIPMENT } from "ui/view/inventory/slot/InventoryEquipmentSlotView";
import InventoryGhostView from "ui/view/inventory/slot/InventoryGhostView";
import InventoryShipView from "ui/view/inventory/slot/InventoryShipView";
import InventorySparrowView from "ui/view/inventory/slot/InventorySparrowView";

export default InventoryEquipmentView.clone().create({
	id: VIEW_ID_EQUIPMENT,
	name: VIEW_NAME_EQUIPMENT,
	childViews: [
		InventoryGhostView,
		InventorySparrowView,
		InventoryShipView,
	],
	sort: new SortManager(SORT_MANAGER_EQUIPMENT_DEFINITION),
	filter: new FilterManager(FILTER_MANAGER_EQUIPMENT_DEFINITION),
	preUpdateInit (view, wrapper) {
		const component = Component.create()
			.classes.add(InventorySlotColumnsViewClasses.SlotColumn, InventorySlotColumnsViewClasses.PostmasterColumn)
			.append(Component.create()
				.classes.add(InventorySlotColumnsViewClasses.SlotColumnTitle)
				.text.set("\xa0"))
			.appendTo(wrapper.content);

		view.columns.push({
			name: "Postmaster",
			component,
		});
	},
	onItemMoveStart (view, wrapper, item, event) {
		wrapper.content.element.scrollTo({ top: 0, behavior: "smooth" });
	},
});
