import Component from "ui/Component";
import FilterManager from "ui/inventory/filter/FilterManager";
import SortManager from "ui/inventory/sort/SortManager";
import InventoryEquipmentView, { InventoryEquipmentViewClasses } from "ui/view/inventory/equipment/InventoryEquipmentView";
import InventoryEnergyView from "ui/view/inventory/slot/InventoryEnergyView";
import InventoryKineticView from "ui/view/inventory/slot/InventoryKineticView";
import InventoryPowerView from "ui/view/inventory/slot/InventoryPowerView";
import { FILTER_MANAGER_WEAPONS_DEFINITION, SORT_MANAGER_WEAPONS_DEFINITION } from "ui/view/inventory/slot/InventoryWeaponSlotView";

export default InventoryEquipmentView.clone().create({
	id: "weapons",
	name: "Weapons",
	childViews: [
		InventoryKineticView,
		InventoryEnergyView,
		InventoryPowerView,
	],
	sort: new SortManager(SORT_MANAGER_WEAPONS_DEFINITION),
	filter: new FilterManager(FILTER_MANAGER_WEAPONS_DEFINITION),
	preUpdateInit (view, wrapper) {
		const component = Component.create()
			.classes.add(InventoryEquipmentViewClasses.SlotColumn, InventoryEquipmentViewClasses.PostmasterColumn)
			.append(Component.create()
				.classes.add(InventoryEquipmentViewClasses.SlotColumnTitle)
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
