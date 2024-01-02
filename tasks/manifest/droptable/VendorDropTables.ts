import Strings from "@app/utility/Strings";
import type { DestinyInventoryItemDefinition, DestinyVendorSaleItemComponent } from "bungie-api-ts/destiny2";
import { DestinyActivityModeType, DestinyComponentType } from "bungie-api-ts/destiny2";
import Time from "../../utility/Time";
import { ActivityTypeHashes, InventoryItemHashes, VendorHashes } from "../Enums";
import ItemEquippableDummies from "../utility/ItemEquippableDummies";
import DestinyActivities from "../utility/endpoint/DestinyActivities";
import manifest from "../utility/endpoint/DestinyManifest";
import DestinyVendor from "../utility/endpoint/DestinyVendor";
import type { DeepsightDropTableDefinition } from "./DeepsightDropTableDefinition";

const ZavalaFocusedDecoding = VendorHashes.FocusedDecoding2232145065;
const Saint14FocusedDecoding = VendorHashes.FocusedDecoding502095006;

export default async function () {
	return {
		nightfall: await getNightfallDropTable(),
		trials: await getTrialsDropTable(),
	};
}

async function getNightfallDropTable (): Promise<DeepsightDropTableDefinition | undefined> {
	const activities = await DestinyActivities.get();

	const matchingActivities = activities.filter(activity => true
		&& activity.definition?.activityTypeHash === ActivityTypeHashes.Nightfall575572995
		&& activity.definition.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall));

	const activity = matchingActivities[0];
	if (!activity)
		return undefined;

	const { DestinyActivityDefinition } = manifest;
	const activityMap = await DestinyActivityDefinition.all();
	const activityDefs = Object.values(activityMap);

	const rootActivity = activityDefs.find(a => a.activityModeTypes?.includes(DestinyActivityModeType.Strike)
		&& a.displayProperties.name === activity.definition?.displayProperties.description);

	const masterActivity = activities.find(a => true
		&& activity.definition?.activityTypeHash === ActivityTypeHashes.Nightfall575572995
		&& activity.definition.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall)
		&& a.definition?.rewards?.some(reward => reward.rewardItems
			.some(item => item.itemHash === InventoryItemHashes.AdeptNightfallWeaponCommonDummy)));

	const weapons = await getVendorWeapons(ZavalaFocusedDecoding);

	return rootActivity && {
		hash: rootActivity.hash,
		displayProperties: {
			...rootActivity.displayProperties,
			icon: "./image/png/activity/strike.png",
		},
		dropTable: Object.fromEntries(weapons
			.filter(weapon => !weapon.displayProperties.name.endsWith("(Adept)"))
			.map(weapon => [weapon.hash, {}])),
		master: masterActivity?.definition && {
			activityHash: masterActivity.definition.hash,
			dropTable: Object.fromEntries(weapons
				.filter(weapon => weapon.displayProperties.name.endsWith("(Adept)"))
				.map(weapon => [weapon.hash, {}])),
		},
		availability: "rotator",
		endTime: Time.iso(Time.nextWeeklyReset),
	};
}

async function getTrialsDropTable (): Promise<Partial<DeepsightDropTableDefinition> | undefined> {
	const weapons = await getVendorWeapons(Saint14FocusedDecoding);

	return {
		dropTable: Object.fromEntries(weapons.map(weapon => [weapon.hash, {}])),
		availability: "rotator",
		endTime: Time.iso(Time.nextWeeklyReset),
	};
}

async function getVendorWeapons (vendorHash: VendorHashes) {
	const { DestinyInventoryItemDefinition } = manifest;
	const result: DestinyInventoryItemDefinition[] = [];

	for (const vendor of await DestinyVendor.get(vendorHash, DestinyComponentType.VendorSales)) {
		for (const sale of Object.values<DestinyVendorSaleItemComponent>(vendor.sales.data ?? {})) {
			const definition = await DestinyInventoryItemDefinition.get(sale.itemHash);
			const name = definition?.displayProperties?.name.trimEnd();
			if (!name?.endsWith("(Adept)"))
				continue;

			const item = await ItemEquippableDummies.findPreferredCopy(definition!);
			const nonAdept = await ItemEquippableDummies.findPreferredCopy(Strings.trimTextMatchingFromEnd(name, " (Adept)"));

			if (item)
				result.push(item);
			if (nonAdept)
				result.push(nonAdept);
		}
	}

	return result;
}
