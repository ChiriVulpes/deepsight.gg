import type { DestinyInventoryItemDefinition, DestinyItemComponentSetOfint64, DestinyItemPlugBase, DestinyItemSocketState } from "bungie-api-ts/destiny2";
import type Item from "model/models/items/Item";
import type { Manifest } from "model/models/Manifest";

export interface ISocket {
	reference: DestinyItemSocketState;
	definition: DestinyInventoryItemDefinition;
}

export interface IReusablePlug {
	reference?: DestinyItemPlugBase | DestinyItemSocketState;
	definition?: DestinyInventoryItemDefinition;
	socketed: boolean;
}

namespace Plugs {

	export interface IPlugsProfile {
		itemComponents: DestinyItemComponentSetOfint64,
	}

	export async function resolveSockets ({ DestinyInventoryItemDefinition }: Manifest, profile: IPlugsProfile, item: Item): Promise<(ISocket | undefined)[]> {
		const sockets = profile.itemComponents.sockets.data?.[item.reference.itemInstanceId!]?.sockets;
		return Promise.all(sockets
			?.map(async (socket): Promise<ISocket | undefined> => {
				const definition = await DestinyInventoryItemDefinition.get(socket.plugHash);
				return !definition ? undefined : {
					reference: socket,
					definition,
				};
			}) ?? []);
	}

	export async function resolveReusable ({ DestinyInventoryItemDefinition }: Manifest, profile: IPlugsProfile, item: Item) {
		const plugs = profile.itemComponents.reusablePlugs.data?.[item.reference.itemInstanceId!]?.plugs;
		const sockets = item.sockets ?? [];

		const reusablePlugs = sockets.map(socket => [{
			reference: socket?.reference,
			definition: socket?.definition,
			socketed: true,
		} as IReusablePlug]);

		return Object.assign(reusablePlugs, Object.fromEntries(await Promise.all(Object.entries(plugs ?? {})
			.sort(([a], [b]) => +a - +b)
			.map(async ([i, plugs]) => [i, await Promise.all(plugs.map(async plug => {
				const definition = await DestinyInventoryItemDefinition.get(plug.plugItemHash);
				return {
					reference: plug,
					definition,
					socketed: !!sockets.find(socket => socket?.definition.hash === definition?.hash),
				} as IReusablePlug;
			}))] as const) ?? []))) as IReusablePlug[][];
	}
}

export default Plugs;
