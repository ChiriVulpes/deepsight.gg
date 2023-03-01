import FilterManager from "ui/inventory/filter/FilterManager";
import SortManager from "ui/inventory/sort/SortManager";
import InventoryEquipmentView from "ui/view/inventory/equipment/InventoryEquipmentView";
import { FILTER_MANAGER_ARMOUR_DEFINITION, SORT_MANAGER_ARMOUR_DEFINITION, VIEW_ID_ARMOUR, VIEW_NAME_ARMOUR } from "ui/view/inventory/slot/InventoryArmourSlotView";
import InventoryArmsView from "ui/view/inventory/slot/InventoryArmsView";
import InventoryChestView from "ui/view/inventory/slot/InventoryChestView";
import InventoryClassItemView from "ui/view/inventory/slot/InventoryClassItemView";
import InventoryHelmetView from "ui/view/inventory/slot/InventoryHelmetView";
import InventoryLegsView from "ui/view/inventory/slot/InventoryLegsView";

export default InventoryEquipmentView.clone().create({
	id: VIEW_ID_ARMOUR,
	name: VIEW_NAME_ARMOUR,
	childViews: [
		InventoryHelmetView,
		InventoryArmsView,
		InventoryChestView,
		InventoryLegsView,
		InventoryClassItemView,
	],
	sort: new SortManager(SORT_MANAGER_ARMOUR_DEFINITION),
	filter: new FilterManager(FILTER_MANAGER_ARMOUR_DEFINITION),
	separateVaults: true,
});
