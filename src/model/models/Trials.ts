import { ActivityHashes, InventoryItemHashes, MilestoneHashes } from "@deepsight.gg/enums";
import type { DestinyCharacterProgressionComponent } from "bungie-api-ts/destiny2";
import { DestinyActivityModeType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import ProfileBatch from "model/models/ProfileBatch";
import RecentPGCR from "model/models/RecentPGCR";
import Objects from "utility/Objects";

namespace Trials {

	export const GENERIC_ACTIVITY_HASH = ActivityHashes.TrialsOfOsiris;
	export const MILESTONE_HASH = MilestoneHashes.TrialsOfOsirisWeekly;
	export const ADEPT_WEAPON_REWARD_HASH = InventoryItemHashes.AdeptTrialsWeaponRareDummy;

	export const Map = Model.create("trials map", {
		cache: "Global",
		resetTime: "Trials",
		async generate () {
			if (!await isActive())
				return null;

			const trialsPGCR = await RecentPGCR.search("trials game", def => def.activityModeTypes?.includes(DestinyActivityModeType.TrialsOfOsiris));
			return trialsPGCR?.activityDef ?? null;
		},
	});

	export async function isActive (profile?: ProfileBatch) {
		profile ??= await ProfileBatch.await();
		return Object.values<DestinyCharacterProgressionComponent>(profile.characterProgressions?.data ?? Objects.EMPTY)
			.flatMap(progression => Object.values(progression.milestones))
			.some(milestone => milestone.milestoneHash === MILESTONE_HASH);
	}
}

export default Trials;
