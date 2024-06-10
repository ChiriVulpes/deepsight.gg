import type { DestinyCollectibleComponent } from "bungie-api-ts/destiny2";
import { DestinyCollectibleState, type DestinyCollectiblesComponent, type DestinyProfileCollectiblesComponent, type DictionaryComponentResponse, type SingleComponentResponse } from "bungie-api-ts/destiny2";
import type Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";

namespace Collectibles {

	export interface ICollectiblesProfile {
		profileCollectibles?: SingleComponentResponse<DestinyProfileCollectiblesComponent>;
		characterCollectibles?: DictionaryComponentResponse<DestinyCollectiblesComponent>;
	}

	export async function apply (manifest: Manifest, profile: ICollectiblesProfile | undefined, item: IItemInit) {
		update(profile, item);
		item.collectible = item.collectible ?? await manifest.DestinyCollectibleDefinition.get(item.definition.collectibleHash);
	}

	export function update (profile: ICollectiblesProfile | undefined, item: IItemInit) {
		item.collectibleState = get(profile, item.definition.collectibleHash)?.state;
	}

	export function isAcquired (profile?: ICollectiblesProfile, collectibleHash?: number) {
		const state = get(profile, collectibleHash)?.state ?? DestinyCollectibleState.None;
		return !(state & DestinyCollectibleState.NotAcquired);
	}

	export function get (profile?: ICollectiblesProfile, collectibleHash?: number): DestinyCollectibleComponent | undefined {
		return profile?.profileCollectibles?.data?.collectibles[collectibleHash!]
			?? Object.values(profile?.characterCollectibles?.data ?? {})[0]?.collectibles[collectibleHash!];
	}
}

export default Collectibles;
