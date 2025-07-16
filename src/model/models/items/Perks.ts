import type { DestinyBaseItemComponentSetOfuint32, DestinyCharacterProgressionComponent, DestinyItemComponentSetOfint64, DestinyPerkReference, DictionaryComponentResponse } from "bungie-api-ts/destiny2";
import { type DestinyItemPerkEntryDefinition, type DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2";
import type Manifest from "model/models/Manifest";
import type { CharacterId, IItemInit } from "model/models/items/Item";

const _ = undefined

export interface IPerk extends DestinyItemPerkEntryDefinition {
	definition: DestinySandboxPerkDefinition;
	reference?: DestinyPerkReference;
}

namespace Perks {

	export interface IPerksProfile {
		itemComponents?: DestinyItemComponentSetOfint64;
		characterUninstancedItemComponents?: Record<CharacterId, DestinyBaseItemComponentSetOfuint32>;
		characterProgressions?: DictionaryComponentResponse<DestinyCharacterProgressionComponent>;
	}

	export async function apply (manifest: Manifest, profile: IPerksProfile, item: IItemInit) {
		item.perks = (await resolve(manifest, profile, item))
			?.filter((perk): perk is IPerk => !!perk);
	}

	async function resolve ({ DestinySandboxPerkDefinition }: Manifest, profile: IPerksProfile, item: IItemInit) {
		if (!item.definition.perks?.length)
			return undefined;

		const perkRefs = _
			// only applies to instanced items
			?? profile.itemComponents?.perks.data?.[item.reference.itemInstanceId!]?.perks
			// `perks.data` is always {}
			?? (profile.characterUninstancedItemComponents && Object.values(profile.characterUninstancedItemComponents))
				?.find(uninstancedItemComponents => uninstancedItemComponents?.perks?.data?.[item.definition.hash]?.perks)
				?.perks?.data?.[item.definition.hash]?.perks
			// `uninstancedItemPerks` is always {}
			?? (profile.characterProgressions?.data && Object.values(profile.characterProgressions.data))
				?.find(progression => progression.uninstancedItemPerks[item.definition.hash])
				?.uninstancedItemPerks[item.definition.hash].perks;

		return Promise.all(item.definition.perks.map(async perk => {
			const result = perk as IPerk;
			const definition = await DestinySandboxPerkDefinition.get(perk.perkHash);
			if (!definition)
				return undefined;

			result.definition = definition;
			result.reference = perkRefs?.find(ref => ref.perkHash === perk.perkHash);
			return result;
		}));
	}
}

export default Perks;
