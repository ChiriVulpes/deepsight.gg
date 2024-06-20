import { ItemState, type DestinyItemComponent } from "bungie-api-ts/destiny2";
import type { ItemId } from "model/models/items/Item";
import IStateModification from "model/models/state/IStateModification";
import type { Mutable } from "utility/Type";

interface IStateModificationItemLock extends IStateModification {
	type: "item/lock";
	item: ItemId;
	locked: boolean;
}

export default IStateModification.register<IStateModificationItemLock>({
	type: "item/lock",
	apply (profile, modification) {
		const tryLock = (item: DestinyItemComponent) => {
			if (item.itemInstanceId !== modification.item)
				return;

			const mutable = (item as Mutable<DestinyItemComponent>);
			if (modification.locked)
				mutable.state |= ItemState.Locked;
			else
				mutable.state &= ~ItemState.Locked;
		};

		for (const item of profile.profileInventory?.data?.items ?? [])
			tryLock(item);

		for (const character of Object.values(profile.characterInventories?.data ?? {}))
			for (const item of character.items)
				tryLock(item);

		for (const character of Object.values(profile.characterEquipment?.data ?? {}))
			for (const item of character.items)
				tryLock(item);
	},
});
