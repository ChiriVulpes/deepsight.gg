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

export interface IItem {
	equipped?: true;
	reference: DestinyItemComponent;
	instance?: DestinyItemInstanceComponent;
	definition: DestinyInventoryItemDefinition;
	source?: DestinySourceDefinition;
	objectives: DestinyObjectiveProgress[];
	deepsight?: IDeepsight;
	shaped?: IWeaponShaped;
	stats?: IStats;
	sockets?: (ISocket | undefined)[];
	plugs?: IReusablePlug[][];
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

		const item = new Item({
			definition: definition,
			reference: reference,
			instance: profile.itemComponents.instances.data?.[reference.itemInstanceId!],
			objectives: Object.values(profile.itemComponents.plugObjectives.data?.[reference.itemInstanceId!]?.objectivesPerPlug ?? {}).flat(),
		});

		item.sockets = await Plugs.resolveSockets(manifest, profile, item);
		item.plugs = await Plugs.resolveReusable(manifest, profile, item);
		item.stats = await Stats.resolve(manifest, profile, item);
		item.source = await Source.resolve(manifest, item);
		item.deepsight = await Deepsight.resolve(manifest, profile, item);
		item.shaped = await Deepsight.resolveShaped(manifest, item);

		return item;
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

	public constructor (item: IItem) {
		Object.assign(this, item);
	}

	public isMasterwork () {
		return !!(this.reference.state & ItemState.Masterwork)
			|| (this.plugs?.filter(socket => socket.some(plug => plug.definition?.itemTypeDisplayName === "Enhanced Trait"))
				.length ?? 0) >= 2;
	}
}

export default Item;
