import type { DestinyLoadoutComponent, DestinyLoadoutItemComponent, DestinyLoadoutsComponent, DictionaryComponentResponse } from "bungie-api-ts/destiny2";
import type { Character } from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import type Item from "model/models/items/Item";
import type { ItemId } from "model/models/items/Item";
import type { Plug } from "model/models/items/Plugs";
import Bound from "utility/decorator/Bound";

export interface ILoadoutsProfile {
	characterLoadouts?: DictionaryComponentResponse<DestinyLoadoutsComponent> | undefined;
}

export interface ILoadoutItem extends DestinyLoadoutItemComponent {
	item?: Item;
	plugs?: Plug[];
}

export interface Loadout extends Omit<DestinyLoadoutComponent, "items"> { }
export class Loadout {

	public readonly items: ILoadoutItem[] = [];
	private inventoryRef?: WeakRef<Inventory>;
	public get inventory () {
		return this.inventoryRef?.deref();
	}

	public constructor (loadout: DestinyLoadoutComponent) {
		Object.assign(this, loadout);
	}

	public setInventory (inventory: Inventory) {
		this.inventoryRef?.deref()?.event.unsubscribe("update", this.onInventoryUpdate);
		this.inventoryRef = new WeakRef(inventory);
		inventory.event.subscribe("update", this.onInventoryUpdate);
		this.onInventoryUpdate();
	}

	@Bound
	private onInventoryUpdate () {
		for (const component of this.items) {
			component.item = this.inventory?.items?.[component.itemInstanceId as ItemId];
		}

		// console.log("Updated loadout", this);
	}
}

namespace Loadouts {
	export function apply (character: Character, profile: ILoadoutsProfile) {
		character.loadouts = (profile.characterLoadouts?.data?.[character.characterId]?.loadouts ?? [])
			.map(loadout => new Loadout(loadout));
	}
}

export default Loadouts;
