import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import manifest from "../utility/endpoint/DestinyManifest";

export enum DeepsightPlugContext {
	Intrinsic,
	SocketEntryInitial,
	SocketEntryReusablePlugSet,
	SocketEntryRandomizedPlugSet,
}

interface DeepsightPlugContextDefinition {
	definition: DestinyInventoryItemDefinition;
	contexts: Partial<Record<DeepsightPlugContext, number[]>>;
}

namespace DeepsightPlugContextDefinition {
	export async function discover () {
		const { DestinyPlugSetDefinition, DestinyInventoryItemDefinition: DestinyInventoryItemDefinitionPromise } = manifest;

		const DestinyInventoryItemDefinition = await DestinyInventoryItemDefinitionPromise.all();

		const plugContexts: Record<number, DeepsightPlugContextDefinition> = {};
		const addPlugContext = (hash: number, containingItemDefinition?: DestinyInventoryItemDefinition, context?: DeepsightPlugContext) => {
			const definition = DestinyInventoryItemDefinition[hash];
			if (!definition)
				return;

			const contextDef = plugContexts[hash] ??= {
				definition,
				contexts: {},
			};

			if (containingItemDefinition && context !== undefined)
				(contextDef.contexts[context] ??= []).push(containingItemDefinition.hash);
		};

		for (const [itemHash, itemDef] of Object.entries(DestinyInventoryItemDefinition)) {
			if (itemDef.plug)
				addPlugContext(itemDef.hash);

			if (!itemDef.sockets)
				continue;

			for (const socket of itemDef.sockets.intrinsicSockets)
				addPlugContext(socket.plugItemHash, itemDef, DeepsightPlugContext.Intrinsic);

			for (const socket of itemDef.sockets.socketEntries) {
				addPlugContext(socket.singleInitialItemHash, itemDef, DeepsightPlugContext.SocketEntryInitial);

				const reusablePlugSet = await DestinyPlugSetDefinition.get(socket.reusablePlugSetHash);
				for (const plug of reusablePlugSet?.reusablePlugItems ?? [])
					addPlugContext(plug.plugItemHash, itemDef, DeepsightPlugContext.SocketEntryReusablePlugSet);

				const randomizedPlugSet = await DestinyPlugSetDefinition.get(socket.randomizedPlugSetHash);
				for (const plug of randomizedPlugSet?.reusablePlugItems ?? [])
					addPlugContext(plug.plugItemHash, itemDef, DeepsightPlugContext.SocketEntryRandomizedPlugSet);
			}
		}

		return plugContexts;
	}
}

export default DeepsightPlugContextDefinition;
