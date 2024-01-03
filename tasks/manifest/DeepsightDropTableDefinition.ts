import type { DestinyObjectiveDefinition } from "bungie-api-ts/destiny2";
import { DestinyActivityModeType } from "bungie-api-ts/destiny2";
import fs from "fs-extra";
import Log from "../utility/Log";
import Task from "../utility/Task";
import Time from "../utility/Time";
import DestinyManifestReference from "./DestinyManifestReference";
import type { ActivityHashes } from "./Enums";
import { ActivityModeHashes, InventoryItemHashes } from "./Enums";
import DeepsightDropTableDefinition from "./droptable/DeepsightDropTableDefinition";
import VendorDropTables from "./droptable/VendorDropTables";
import PGCR from "./utility/PGCR";
import DestinyActivities from "./utility/endpoint/DestinyActivities";
import manifest, { DESTINY_MANIFEST_MISSING_ICON_PATH } from "./utility/endpoint/DestinyManifest";

interface DeepsightDropTableDefinition {
	hash: number;
	rotationActivityHash?: number;
	recordHash?: number;
	displayProperties?: {
		name?: string | DestinyManifestReference;
		description?: string | DestinyManifestReference;
		icon?: string | DestinyManifestReference;
	};
}

export default Task("DeepsightDropTableDefinition", async () => {
	const { DestinyActivityDefinition, DestinyRecordDefinition, DestinyObjectiveDefinition } = manifest;
	const activities = await DestinyActivities.get();

	for (const [hash, definition] of Object.entries(DeepsightDropTableDefinition)) {
		definition.hash = +hash;

		const record = await DestinyRecordDefinition.get(definition.recordHash);
		const activity = await DestinyActivityDefinition.get(hash) ?? await DestinyActivityDefinition.get(definition.rotationActivityHash);

		if (definition.displayProperties) {
			definition.displayProperties.name = await DestinyManifestReference.resolve(definition.displayProperties.name, "name", { record, activity });
			definition.displayProperties.description = await DestinyManifestReference.resolve(definition.displayProperties.description, "description", { record, activity });
			const icon = await DestinyManifestReference.resolve(definition.displayProperties.icon, "icon", { record, activity });
			if (icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon = icon;
		}

		definition.displayProperties ??= {};

		if (activity) {
			definition.displayProperties.description ??= activity.displayProperties.description;
		}

		if (record) {
			definition.displayProperties.name ??= record.displayProperties.name;
			definition.displayProperties.description ??= record.displayProperties.description;
			if (record.displayProperties.icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon ??= record.displayProperties.icon;
		}

		if (activity) {
			definition.displayProperties.name ??= activity.displayProperties.name;
			if (activity.displayProperties.icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon ??= activity.displayProperties.icon;
		}

		definition.displayProperties.name ??= "";
		definition.displayProperties.description ??= "";

		////////////////////////////////////
		// Use live profile data to determine whether raids & dungeons are rotators or repeatable (new)

		const activityInstances = activities.filter(activity => activity.activity.activityHash === definition.rotationActivityHash);
		if (!activityInstances.length)
			activityInstances.push(...activities.filter(activity => activity.activity.activityHash === definition.hash));

		const activityChallengeStates = activityInstances.flatMap(activity => activity.activity?.challenges ?? []);
		const activityChallenges = (await Promise.all(activityChallengeStates.map(challenge => DestinyObjectiveDefinition.get(challenge.objective.objectiveHash))))
			.filter((challenge): challenge is DestinyObjectiveDefinition => !!challenge);

		const isWeekly = activityChallenges.some(challenge => challenge?.displayProperties?.name === "Weekly Dungeon Challenge" || challenge?.displayProperties?.name === "Weekly Raid Challenge");
		if (isWeekly) {
			definition.availability = "rotator";
			definition.endTime = Time.iso(Time.nextWeeklyReset);
		}

		const masterActivityAvailable = definition.master && !!activities.filter(activity => activity.activity.activityHash === definition.master?.activityHash).length;
		if (masterActivityAvailable)
			definition.availability ??= "repeatable";
	}


	interface ActivityCache {
		asOf?: number;
		trials?: ActivityHashes;
		lostSector?: ActivityHashes;
	}

	const cache = await fs.readFile("activitycache.json", "utf8")
		.then(contents => JSON.parse(contents))
		.catch(() => ({})) as ActivityCache;

	if (!cache.asOf || (cache.asOf < Time.lastDailyReset && Date.now() - Time.lastDailyReset > Time.minutes(30))) {
		if (Time.lastTrialsReset > Time.lastWeeklyReset) {
			const trialsPGCR = await PGCR.findByMode(DestinyActivityModeType.TrialsOfOsiris);
			cache.trials = trialsPGCR?.activityDetails.referenceId;
		}

		const lostSectorPGCR = await PGCR.findByMode(DestinyActivityModeType.LostSector);
		cache.lostSector = lostSectorPGCR?.activityDetails.referenceId;

		cache.asOf = Time.lastDailyReset;
		await fs.writeFile("activitycache.json", JSON.stringify(cache));
	}

	const vendorDropTables = await VendorDropTables();

	const activityDef = await manifest.DestinyActivityDefinition.get(cache.trials);
	Log.info("Trials Map:", activityDef?.displayProperties.name, cache.trials);
	DeepsightDropTableDefinition.trials = activityDef && {
		hash: activityDef.hash,
		displayProperties: {
			name: activityDef.displayProperties.name,
			description: activityDef.displayProperties.description,
			icon: (await manifest.DestinyActivityModeDefinition.get(ActivityModeHashes.TrialsOfOsiris))?.displayProperties.icon,
		},
		...vendorDropTables.trials,
	};

	const lostSectorDef = await manifest.DestinyActivityDefinition.get(cache.lostSector);
	Log.info("Lost Sector:", lostSectorDef?.displayProperties.name, cache.lostSector);
	DeepsightDropTableDefinition.lostSector = lostSectorDef && {
		hash: lostSectorDef.hash,
		displayProperties: {
			name: lostSectorDef.originalDisplayProperties.name,
			icon: (await manifest.DestinyActivityModeDefinition.get(ActivityModeHashes.LostSector))?.displayProperties.icon,
		},
		rotations: {
			anchor: Time.iso(1701190800000),
			interval: "daily",
			drops: [
				{
					[InventoryItemHashes.NoxPerennialVFusionRifle]: {},
					[InventoryItemHashes.OldSterlingAutoRifle]: {},
					[InventoryItemHashes.MarsilionCGrenadeLauncher]: {},
					[InventoryItemHashes.SenunaSi6Sidearm]: {},
				},
				{
					[InventoryItemHashes.PsiHermeticVPulseRifle]: {},
					[InventoryItemHashes.Glissando47ScoutRifle]: {},
					[InventoryItemHashes.IrukandjiSniperRifle]: {},
					[InventoryItemHashes.NasreddinSword_InventoryTierType5]: {},
				},
				{
					[InventoryItemHashes.HeliocentricQscSidearm]: {},
					[InventoryItemHashes.LastForaySniperRifle]: {},
					[InventoryItemHashes.HandInHandShotgun_InventoryTierType5]: {},
					[InventoryItemHashes.BattleScarPulseRifle_IconWatermarkShelvedUndefined]: {},
				},
				{
					[InventoryItemHashes.GeodeticHsmSword]: {},
					[InventoryItemHashes.CombinedActionHandCannon]: {},
					[InventoryItemHashes.HarshLanguageGrenadeLauncher_InventoryTierType5]: {},
					[InventoryItemHashes.Coronach22AutoRifle]: {},
				},
			],
		},
		availability: "rotator",
		endTime: Time.iso(Time.nextDailyReset),
	};

	Log.info("Nightfall:", vendorDropTables.nightfall?.displayProperties?.name, vendorDropTables.nightfall?.hash);
	DeepsightDropTableDefinition.nightfall = vendorDropTables.nightfall;

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightDropTableDefinition.json", DeepsightDropTableDefinition, { spaces: "\t" });
});
