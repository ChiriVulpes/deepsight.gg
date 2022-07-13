import type { DestinyInventoryItemDefinition, DestinyItemComponent, DestinyItemInstanceComponent, DestinyObjectiveProgress } from "bungie-api-ts/destiny2";
import { ItemState } from "bungie-api-ts/destiny2";
import type { IDeepsight, IWeaponShaped } from "model/models/items/Deepsight";
import Deepsight from "model/models/items/Deepsight";
import type { IReusablePlug, ISocket } from "model/models/items/Plugs";
import Plugs from "model/models/items/Plugs";
import Source from "model/models/items/Source";
import type { IStats } from "model/models/items/Stats";
import Stats from "model/models/items/Stats";
import type { Manifest } from "model/models/Manifest";
import type { DestinySourceDefinition } from "utility/endpoint/fvm/endpoint/GetDestinySourceDefinition";
import { EventManager } from "utility/EventManager";
import type { PromiseOr } from "utility/Type";

export interface IItemInit {
	reference: DestinyItemComponent;
	definition: DestinyInventoryItemDefinition;
	instance?: DestinyItemInstanceComponent;
	objectives: DestinyObjectiveProgress[];
	sockets?: PromiseOr<(ISocket | undefined)[]>;
	plugs?: PromiseOr<IReusablePlug[][]>;
	source?: DestinySourceDefinition;
	deepsight?: IDeepsight;
	shaped?: IWeaponShaped;
	stats?: IStats;
}

export interface IItem extends IItemInit {
	equipped?: true;
	sockets: (ISocket | undefined)[];
	plugs: IReusablePlug[][];
}

export interface IItemEvents {
	transferStateChange: { transferring: boolean };
}

namespace Item {
	export interface IItemProfile extends
		Deepsight.IDeepsightProfile,
		Plugs.IPlugsProfile,
		Stats.IStatsProfile { }
}

interface Item extends IItem { }
class Item {

	public static async resolve (manifest: Manifest, profile: Item.IItemProfile, reference: DestinyItemComponent) {
		const { DestinyInventoryItemDefinition } = manifest;

		const definition = await DestinyInventoryItemDefinition.get(reference.itemHash);
		if (!definition) {
			console.warn("No item definition for ", reference.itemHash);
			return undefined;
		}

		if (definition.nonTransferrable) {
			console.debug(`Skipping "${definition.displayProperties.name}", non-transferrable`);
			return undefined;
		}

		const item: IItemInit = {
			reference: reference,
			definition: definition,
			instance: profile.itemComponents.instances.data?.[reference.itemInstanceId!],
			objectives: Object.values(profile.itemComponents.plugObjectives.data?.[reference.itemInstanceId!]?.objectivesPerPlug ?? {}).flat(),
		};

		await Promise.all([
			Plugs.apply(manifest, profile, item),
			Stats.apply(manifest, profile, item),
			Deepsight.apply(manifest, profile, item),
			Source.apply(manifest, item),
		]);

		return new Item(item);
	}

	public readonly event = new EventManager<this, IItemEvents>(this);

	private _transferring = false;
	public get transferring () {
		return this._transferring;
	}
	public set transferring (transferring: boolean) {
		if (this._transferring === transferring)
			return;

		this._transferring = transferring;
		this.event.emit("transferStateChange", { transferring });
	}

	public unequipping = false;

	private constructor (item: IItemInit) {
		Object.assign(this, item);
	}

	public isMasterwork () {
		return !!(this.reference.state & ItemState.Masterwork)
			|| (this.plugs?.filter(socket => socket.some(plug => plug.definition?.itemTypeDisplayName === "Enhanced Trait"))
				.length ?? 0) >= 2;
	}
}

export default Item;
