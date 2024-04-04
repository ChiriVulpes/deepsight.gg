import { ItemTierTypeHashes } from "@deepsight.gg/enums";
import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { DestinyItemType } from "bungie-api-ts/destiny2";
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
	contextTypes: Partial<Record<DestinyItemType, number[]>>;
	contextTiers: Partial<Record<ItemTierTypeHashes, number[]>>;
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
				contextTypes: {},
				contextTiers: {},
			};

			if (!containingItemDefinition)
				return;

			if (context !== undefined)
				(contextDef.contexts[context] ??= []).push(containingItemDefinition.hash);

			(contextDef.contextTypes[containingItemDefinition.itemType] ??= []).push(containingItemDefinition.hash);

			const tierHash = containingItemDefinition.inventory?.tierTypeHash;
			if (tierHash)
				(contextDef.contextTiers[tierHash as ItemTierTypeHashes] ??= []).push(containingItemDefinition.hash);
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

	export function isExoticOnly (context: DeepsightPlugContextDefinition) {
		return !!context.contextTiers[ItemTierTypeHashes.Exotic]?.length
			&& !context.contextTiers[ItemTierTypeHashes.Legendary]?.length
			&& !context.contextTiers[ItemTierTypeHashes.Rare]?.length
			&& !context.contextTiers[ItemTierTypeHashes.Common]?.length;
	}

	export function isOnOnlyType (type: DestinyItemType, context: DeepsightPlugContextDefinition) {
		return !!context.contextTypes[type]?.length
			&& Object.keys(context.contextTypes)
				.every(t => +t === DestinyItemType.Dummy || +t === DestinyItemType.None
					|| ((+t === type) === !!context.contextTypes[+t as DestinyItemType]?.length));
	}
}

export default DeepsightPlugContextDefinition;
