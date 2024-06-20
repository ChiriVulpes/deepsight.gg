import type { DestinyLoadoutColorDefinition, DestinyLoadoutComponent, DestinyLoadoutIconDefinition, DestinyLoadoutItemComponent, DestinyLoadoutNameDefinition, DestinyLoadoutsComponent, DictionaryComponentResponse } from "bungie-api-ts/destiny2";
import { InventoryItemHashes } from "deepsight.gg/Enums";
import type { Character } from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
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

	public static async init (loadout: DestinyLoadoutComponent, index: number) {
		const result = new Loadout(loadout, index);
		const { DestinyLoadoutColorDefinition, DestinyLoadoutIconDefinition, DestinyLoadoutNameDefinition } = await Manifest.await();
		result.name = await DestinyLoadoutNameDefinition.get(loadout.nameHash);
		result.icon = await DestinyLoadoutIconDefinition.get(loadout.iconHash);
		result.colour = await DestinyLoadoutColorDefinition.get(loadout.colorHash);
		return result;
	}

	public colour?: DestinyLoadoutColorDefinition;
	public icon?: DestinyLoadoutIconDefinition;
	public name?: DestinyLoadoutNameDefinition;

	public readonly items: ILoadoutItem[] = [];
	private inventoryRef?: WeakRef<Inventory>;
	public get inventory () {
		return this.inventoryRef?.deref();
	}

	private constructor (loadout: DestinyLoadoutComponent, public readonly index: number) {
		Object.assign(this, loadout);
	}

	public isEmpty () {
		return this.items.every(item => item.itemInstanceId === "0" && item.plugItemHashes.every(hash => hash === InventoryItemHashes.Invalid));
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
			component.item = this.inventory?.getItem(component.itemInstanceId as ItemId);
		}

		// console.log("Updated loadout", this);
	}
}

namespace Loadouts {
	export async function apply (character: Character, profile: ILoadoutsProfile) {
		character.loadouts = await (profile.characterLoadouts?.data?.[character.characterId]?.loadouts ?? [])
			.map(async (loadout, index) => await Loadout.init(loadout, index))
			.collect(loadouts => Promise.all(loadouts));
	}
}

export default Loadouts;
