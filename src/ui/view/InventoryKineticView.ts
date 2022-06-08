import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Profile from "model/models/Profile";
import InventorySlotView from "ui/view/InventorySlotView";

export default InventorySlotView.create({
	id: "kinetic",
	name: "Kinetic",
	models: [Profile(DestinyComponentType.CharacterActivities)] as const,
	initialise: (component, items, profile) => {

	},
});
