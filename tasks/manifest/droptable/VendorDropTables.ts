import { ActivityTypeHashes, InventoryItemHashes, VendorHashes } from "@deepsight.gg/enums";
import Strings from "@deepsight.gg/utility/Strings";
import type { DestinyInventoryItemDefinition, DestinyVendorSaleItemComponent } from "bungie-api-ts/destiny2";
import { DestinyActivityModeType, DestinyComponentType, DestinyVendorItemState, VendorItemStatus } from "bungie-api-ts/destiny2";
import Time from "../../utility/Time";
import DestinyManifestReference from "../DestinyManifestReference";
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
		&& activity.definition.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall)
		&& activity.definition.originalDisplayProperties?.name !== "Nightfall Grandmaster");

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
			.some(item => item.itemHash === InventoryItemHashes.AdeptNightfallWeaponCommonDummy))
		&& a.definition.displayProperties?.description === activity.definition.displayProperties.description);

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
		type: "nightfall",
		typeDisplayProperties: await DestinyManifestReference.resolveAll({
			name: { DestinyActivityTypeDefinition: ActivityTypeHashes.Nightfall272800122 },
			description: { DestinyActivityTypeDefinition: ActivityTypeHashes.Nightfall272800122 },
			icon: { DestinyActivityTypeDefinition: ActivityTypeHashes.Nightfall272800122 },
		}),
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

function createFakeSaleItem (itemHash: InventoryItemHashes): DestinyVendorSaleItemComponent {
	return {
		saleStatus: VendorItemStatus.DisplayOnly,
		requiredUnlocks: [],
		unlockStatuses: [],
		failureIndexes: [],
		augments: DestinyVendorItemState.Featured,
		itemValueVisibility: [],
		vendorItemIndex: -1,
		itemHash,
		quantity: 1,
		costs: [],
	};
}

async function getVendorWeapons (vendorHash: VendorHashes) {
	const { DestinyInventoryItemDefinition } = manifest;
	const result: DestinyInventoryItemDefinition[] = [];

	function addItem (item?: DestinyInventoryItemDefinition) {
		if (!item || result.includes(item))
			return;

		result.push(item);
	}

	const sales = await Promise.resolve(DestinyVendor.get(vendorHash, DestinyComponentType.VendorSales))
		.then(vendors => vendors.flatMap(vendor => Object.values<DestinyVendorSaleItemComponent>(vendor.sales.data ?? {})));

	// if (vendorHash === Saint14FocusedDecoding)
	// 	sales.push(createFakeSaleItem(InventoryItemHashes.EyeOfSolAdeptSniperRifle_QualityCurrentVersion0));

	for (const sale of sales) {
		const definition = await DestinyInventoryItemDefinition.get(sale.itemHash);
		const name = definition?.displayProperties?.name.trimEnd();

		const isAdept = name?.endsWith("(Adept)");
		if (vendorHash !== Saint14FocusedDecoding && !isAdept)
			continue;

		addItem(await ItemEquippableDummies.findPreferredCopy(definition!));

		if (isAdept)
			addItem(await ItemEquippableDummies.findPreferredCopy(Strings.trimTextMatchingFromEnd(name!, " (Adept)")));
	}

	return [...result];
}
