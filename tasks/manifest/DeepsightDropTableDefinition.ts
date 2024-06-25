import { ActivityGraphHashes, ActivityHashes, ActivityModeHashes, ActivityTypeHashes, InventoryItemHashes, MilestoneHashes, PresentationNodeHashes } from "@deepsight.gg/enums";
import type { DestinyObjectiveDefinition } from "bungie-api-ts/destiny2";
import { DestinyActivityModeType } from "bungie-api-ts/destiny2";
import fs from "fs-extra";
import type { DeepsightDisplayPropertiesDefinition, DeepsightDropTableRotationsDefinition } from "../../static/manifest/Interfaces";
import Log from "../utility/Log";
import Task from "../utility/Task";
import Time from "../utility/Time";
import { getCollectionsCopies } from "./DeepsightCollectionsDefinition";
import DestinyManifestReference from "./DestinyManifestReference";
import DeepsightDropTableDefinition from "./droptable/DeepsightDropTableDefinition";
import VendorDropTables from "./droptable/VendorDropTables";
import PGCR from "./utility/PGCR";
import Rotation from "./utility/Rotations";
import type { Activity } from "./utility/endpoint/DestinyActivities";
import DestinyActivities from "./utility/endpoint/DestinyActivities";
import manifest, { DESTINY_MANIFEST_MISSING_ICON_PATH } from "./utility/endpoint/DestinyManifest";

export default Task("DeepsightDropTableDefinition", async () => {
	const { DestinyActivityDefinition, DestinyRecordDefinition, DestinyObjectiveDefinition, DestinyActivityGraphDefinition } = manifest;
	const activities = await DestinyActivities.get();


	////////////////////////////////////
	// Generate exotic rotator drop table

	let normalExoticMission: Activity | undefined;
	let legendExoticMission: Activity | undefined;

	for (const activity of activities) {
		const exoticRotatorChallenge = await Promise.all((activity.activity.challenges ?? [])
			.map(challenge => manifest.DestinyObjectiveDefinition.get(challenge.objective.objectiveHash)))
			.then(challenges => challenges.find(challenge => challenge?.displayProperties?.name === "Weekly Exotic Rotator Challenge"));

		if (!exoticRotatorChallenge || !activity.definition)
			continue;

		if (activity.definition?.selectionScreenDisplayProperties?.name === "Standard")
			normalExoticMission = activity;
		else
			legendExoticMission = activity;
	}

	if (!normalExoticMission || !legendExoticMission) {
		const legendsGraph = await DestinyActivityGraphDefinition.get(ActivityGraphHashes.Legends);
		const exoticMissionsNodeHash = 329299745;
		const exoticMissionsNode = legendsGraph?.nodes.find(node => node.nodeId === exoticMissionsNodeHash);
		const exoticMissions = activities.filter(activity => exoticMissionsNode?.activities.some(exoticMission => exoticMission.activityHash === activity.activity.activityHash));

		for (const activity of exoticMissions) {
			if (activity.definition?.selectionScreenDisplayProperties?.name === "Standard")
				normalExoticMission = activity;
			else if (activity.definition?.selectionScreenDisplayProperties?.name === "Normal")
				normalExoticMission = activity;
			else if (activity.definition?.selectionScreenDisplayProperties?.name === "Legend")
				legendExoticMission = activity;
			else if (activity.definition?.selectionScreenDisplayProperties?.name === "Expert")
				legendExoticMission = activity;
		}

		if (!normalExoticMission || !legendExoticMission)
			for (const activity of exoticMissions) {
				if (activity.definition?.displayProperties?.name.includes("Normal"))
					normalExoticMission = activity;
				else if (activity.definition?.displayProperties?.name.includes("Standard"))
					normalExoticMission = activity;
				else if (activity.definition?.displayProperties?.name.includes("Legend"))
					legendExoticMission = activity;
				else if (activity.definition?.displayProperties?.name.includes("Expert"))
					legendExoticMission = activity;
			}

		if (!normalExoticMission && legendExoticMission)
			for (const activity of exoticMissions) {
				const isLegend = activity.definition?.displayProperties?.name.includes("Legend")
					|| activity.definition?.displayProperties?.name.includes("Expert")
					|| activity.definition?.selectionScreenDisplayProperties?.name.includes("Legend")
					|| activity.definition?.selectionScreenDisplayProperties?.name.includes("Expert");
				if (!isLegend)
					normalExoticMission = activity;
			}

		if (!normalExoticMission || !legendExoticMission)
			throw new Error("Failed to get the current exotic mission :(");
	}

	if (normalExoticMission && legendExoticMission) {
		let [exoticWeapon] = await getCollectionsCopies(...normalExoticMission.definition!.rewards
			.flatMap(reward => reward.rewardItems)
			.map(item => item.itemHash));

		if (normalExoticMission.definition?.displayProperties.name.includes("Starcrossed"))
			[exoticWeapon] = await getCollectionsCopies(InventoryItemHashes.WishKeeperCombatBow_ItemType3);
		else if (normalExoticMission.definition?.displayProperties.name.includes("AVALON"))
			[exoticWeapon] = await getCollectionsCopies(InventoryItemHashes.VexcaliburGlaive_ItemType3);

		if (!exoticWeapon)
			throw new Error("Failed to get the exotic weapon from the current exotic mission :(");

		Log.info("Exotic Mission:", normalExoticMission.definition!.displayProperties.name, normalExoticMission.activity.activityHash);
		DeepsightDropTableDefinition.exoticMission = {
			hash: normalExoticMission.activity.activityHash,
			displayProperties: {
				name: normalExoticMission.definition!.originalDisplayProperties.name,
				description: normalExoticMission.definition!.originalDisplayProperties.description,
				icon: { DestinyMilestoneDefinition: MilestoneHashes.WeeklyExoticRotatorChallenge_Activities1ActivityHash2919809209 },
			},
			dropTable: {
				[exoticWeapon.hash]: {},
			},
			master: {
				activityHash: legendExoticMission.activity.activityHash,
				availability: "rotator",
			},
			availability: "rotator",
			endTime: Time.iso(Time.nextWeeklyReset),
			type: "exotic-mission",
			typeDisplayProperties: await DestinyManifestReference.resolveAll({
				name: { DestinyPresentationNodeDefinition: PresentationNodeHashes.ExoticMission_ObjectiveHash3349214720 },
				description: { DestinyActivityTypeDefinition: ActivityTypeHashes.Dungeon },
				icon: { DestinyMilestoneDefinition: MilestoneHashes.WeeklyExoticRotatorChallenge_Activities1ActivityHash2919809209 },
			}),
		};
	}


	////////////////////////////////////
	// Fix up drop static tables based on manifest and profile data

	for (const [hash, definition] of Object.entries(DeepsightDropTableDefinition)) {
		definition.hash ??= +hash;

		const activity = await DestinyActivityDefinition.get(hash) ?? await DestinyActivityDefinition.get(definition.rotationActivityHash);

		definition.displayProperties = await DestinyManifestReference.resolveAll(definition.displayProperties, { activity });

		if (activity) {
			definition.displayProperties.description ??= activity.displayProperties.description;
		}

		if (activity) {
			definition.displayProperties.name ??= activity.displayProperties.name;
			if (activity.displayProperties.icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				definition.displayProperties.icon ??= activity.displayProperties.icon;

			if (activity.activityTypeHash === ActivityTypeHashes.Raid || activity.activityTypeHash === ActivityTypeHashes.Dungeon)
				definition.displayProperties.name = activity.originalDisplayProperties.name;
		}

		if (definition.availability)
			// availability already filled out
			continue;

		////////////////////////////////////
		// Use live profile data to determine whether raids & dungeons are rotators or repeatable (new)

		const activityInstances = activities.filter(activity => activity.activity.activityHash === definition.rotationActivityHash);
		if (!activityInstances.length)
			activityInstances.push(...activities.filter(activity => activity.activity.activityHash === definition.hash));

		const activityChallengeStates = activityInstances.flatMap(activity => activity.activity?.challenges ?? []);
		const activityChallenges = (await Promise.all(activityChallengeStates.map(challenge => DestinyObjectiveDefinition.get(challenge.objective.objectiveHash))))
			.filter((challenge): challenge is DestinyObjectiveDefinition => !!challenge);

		const isWeekly = activityChallenges.some(challenge => false
			|| challenge?.displayProperties?.name === "Weekly Dungeon Challenge"
			|| challenge?.displayProperties?.name === "Weekly Raid Challenge");

		if (isWeekly) {
			definition.availability = "rotator";
			definition.endTime = Time.iso(Time.nextWeeklyReset);
			if (definition.master)
				definition.master.availability = "rotator";
		}

		const masterActivityAvailable = definition.master && !!activities.filter(activity => activity.activity.activityHash === definition.master?.activityHash).length;
		if (masterActivityAvailable) {
			definition.availability ??= activity?.activityTypeHash === ActivityTypeHashes.Raid ? "new" : "repeatable";
			definition.master!.availability ??= activity?.activityTypeHash === ActivityTypeHashes.Raid ? "new" : "repeatable";
		}

		if (activity?.activityTypeHash === ActivityTypeHashes.Raid) {
			definition.type = "raid";
			definition.typeDisplayProperties = await DestinyManifestReference.displayOf("DestinyActivityTypeDefinition", ActivityTypeHashes.Raid) as DeepsightDisplayPropertiesDefinition;
		} else if (activity?.activityTypeHash === ActivityTypeHashes.Dungeon) {
			definition.type = "dungeon";
			definition.typeDisplayProperties = await DestinyManifestReference.resolveAll({
				name: { DestinyActivityTypeDefinition: ActivityTypeHashes.Dungeon },
				description: { DestinyActivityTypeDefinition: ActivityTypeHashes.Dungeon },
				icon: { DestinyActivityModeDefinition: ActivityModeHashes.Dungeon },
			});
		}
	}


	////////////////////////////////////
	// Generate drop tables for rotators such as lost sectors, nightfalls, and trials

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
			const hasIronBanner = activities.some(activity => activity.definition?.activityTypeHash === ActivityTypeHashes.IronBanner);
			const trialsPGCR = hasIronBanner ? undefined : await PGCR.findByMode(DestinyActivityModeType.TrialsOfOsiris);
			cache.trials = trialsPGCR?.activityDetails.referenceId;
		}

		const lostSectorPGCR = await PGCR.findByMode(DestinyActivityModeType.LostSector, pgcr => true
			&& pgcr.activityDetails.referenceId !== ActivityHashes.TheMessagePartI
			&& pgcr.activityDetails.referenceId !== ActivityHashes.TheMessagePartIi
			&& pgcr.activityDetails.referenceId !== ActivityHashes.TheMessagePartIii
			&& true);
		cache.lostSector = lostSectorPGCR?.activityDetails.referenceId;

		cache.asOf = Time.lastDailyReset;
		await fs.writeFile("activitycache.json", JSON.stringify(cache));
	}

	const vendorDropTables = await VendorDropTables();

	const activityDef = await manifest.DestinyActivityDefinition.get(cache.trials);
	Log.info("Trials Map:", activityDef?.displayProperties.name, cache.trials);
	DeepsightDropTableDefinition.trials = activityDef && {
		hash: activityDef.hash,
		displayProperties: await DestinyManifestReference.resolveAll({
			name: activityDef.displayProperties.name,
			description: activityDef.displayProperties.description,
			icon: { DestinyActivityModeDefinition: ActivityModeHashes.TrialsOfOsiris },
		}),
		...vendorDropTables.trials,
		type: "trials",
		typeDisplayProperties: await DestinyManifestReference.resolveAll({
			name: { DestinyActivityTypeDefinition: ActivityTypeHashes.TrialsOfOsiris },
			description: { DestinyActivityTypeDefinition: ActivityTypeHashes.TrialsOfOsiris },
			icon: { DestinyActivityModeDefinition: ActivityModeHashes.TrialsOfOsiris },
		}),
	};

	const lostSectorDef = await manifest.DestinyActivityDefinition.get(cache.lostSector);
	Log.info("Lost Sector:", lostSectorDef?.displayProperties.name, cache.lostSector);
	DeepsightDropTableDefinition.lostSector = lostSectorDef && {
		hash: lostSectorDef.hash,
		displayProperties: await DestinyManifestReference.resolveAll({
			name: lostSectorDef.originalDisplayProperties.name,
			description: lostSectorDef.originalDisplayProperties.description,
			icon: { DestinyActivityModeDefinition: ActivityModeHashes.LostSector },
		}),
		dropTable: {
			[InventoryItemHashes.ExoticEngramEngram903043774]: {},
			[InventoryItemHashes.EnhancementPrismMaterialDummy4257549984]: {},
			[InventoryItemHashes.EnhancementCoreMaterialDummy]: {},
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
		type: "lost-sector",
		typeDisplayProperties: await DestinyManifestReference.resolveAll({
			name: { DestinyActivityModeDefinition: ActivityModeHashes.LostSector },
			description: { DestinyActivityTypeDefinition: ActivityTypeHashes.LostSector },
			icon: { DestinyActivityModeDefinition: ActivityModeHashes.LostSector },
		}),
	};

	Log.info("Nightfall:", vendorDropTables.nightfall?.displayProperties?.name, vendorDropTables.nightfall?.hash);
	DeepsightDropTableDefinition.nightfall = vendorDropTables.nightfall;


	////////////////////////////////////
	// Fill in current rotation info for rotator drops

	for (const table of Object.values(DeepsightDropTableDefinition)) {
		if (!table?.rotations)
			continue;

		const rotations = table.rotations as DeepsightDropTableRotationsDefinition;
		rotations.interval ??= "weekly";

		const interval = rotations.interval === "daily" ? Time.days(1) : Time.weeks(1);

		const anchorTime = new Date(rotations.anchor).getTime();

		const intervals = rotations.current = Rotation.get(rotations);

		const currentStart = anchorTime + interval * intervals;
		const next = currentStart + interval;
		rotations.next = Time.iso(next);
	}


	////////////////////////////////////
	// Write!

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightDropTableDefinition.json", DeepsightDropTableDefinition, { spaces: "\t" });
});
