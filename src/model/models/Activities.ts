import type { DestinyActivityDefinition, DestinyCharacterActivitiesComponent } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import Trials from "model/models/Trials";
import Objects from "utility/Objects";
import Time from "utility/Time";

export default Model.createDynamic(Time.seconds(30), async () => {
	const profile = await ProfileBatch.await();
	const { DestinyActivityDefinition } = await Manifest.await();
	const characterActivities = (await Promise.all(Object.values<DestinyCharacterActivitiesComponent>(profile.characterActivities?.data ?? Objects.EMPTY)
		.flatMap(activities => activities.availableActivities)
		.map(async activity => DestinyActivityDefinition.get(activity.activityHash))))
		.filter((activity): activity is DestinyActivityDefinition => !!activity);

	const Activities: DestinyActivityDefinition[] = [];
	const activityHashes = new Set<number>();
	for (const activity of characterActivities) {
		if (activityHashes.has(activity.hash))
			continue;

		Activities.push(activity);
		activityHashes.add(activity.hash);
	}

	if (await Trials.isActive()) {
		const trials = await DestinyActivityDefinition.get(Trials.GENERIC_ACTIVITY_HASH);
		if (trials)
			Activities.push(trials);
	}

	Object.assign(window, { Activities });
	return Activities;
});