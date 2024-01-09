import type { DestinyActivity, DestinyActivityDefinition } from "bungie-api-ts/destiny2";
import Model from "../../../utility/Model";
import DestinyManifest from "./DestinyManifest";
import DestinyProfile from "./DestinyProfile";

export interface Activity {
	activity: DestinyActivity;
	definition?: DestinyActivityDefinition;
}

export default Model(async () => {
	const profile = await DestinyProfile.get();
	return Promise.all(Object.values(profile?.characterActivities.data ?? {})
		.flatMap(activities => activities.availableActivities)
		.map(async (activity): Promise<Activity> => ({
			activity,
			definition: await DestinyManifest.DestinyActivityDefinition.get(activity.activityHash),
		})));
});
