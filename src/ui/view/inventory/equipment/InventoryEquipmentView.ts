import FilterManager from "ui/inventory/filter/FilterManager";
import SortManager from "ui/inventory/sort/SortManager";
import InventoryEquipmentView from "ui/view/inventory/equipment/InventorySlotColumnsView";
import { FILTER_MANAGER_EQUIPMENT_DEFINITION, SORT_MANAGER_EQUIPMENT_DEFINITION, VIEW_ID_EQUIPMENT, VIEW_NAME_EQUIPMENT } from "ui/view/inventory/slot/InventoryEquipmentSlotView";
import InventoryGhostView from "ui/view/inventory/slot/InventoryGhostView";
import InventoryShipView from "ui/view/inventory/slot/InventoryShipView";
import InventorySparrowView from "ui/view/inventory/slot/InventorySparrowView";

export default InventoryEquipmentView.clone().create({
	id: VIEW_ID_EQUIPMENT,
	name: VIEW_NAME_EQUIPMENT,
	sort: new SortManager(SORT_MANAGER_EQUIPMENT_DEFINITION),
	filter: new FilterManager(FILTER_MANAGER_EQUIPMENT_DEFINITION),
	childViews: [InventoryGhostView, InventorySparrowView, InventoryShipView],
	mergedVaults: true,
});
