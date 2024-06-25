import { InventoryItemHashes, type InventoryBucketHashes, type MomentHashes } from "@deepsight.gg/enums";
import type { DeepsightCollectionsDefinitionManifest } from "@deepsight.gg/interfaces";
import type { PromiseOr } from "@deepsight.gg/utility/Type";
import type { DestinyInventoryItemDefinition, DestinyPlugSetDefinition } from "bungie-api-ts/destiny2";
import { DestinyClass } from "bungie-api-ts/destiny2";
import fs from "fs-extra";
import Log from "../utility/Log";
import Task from "../utility/Task";
import { getDeepsightMomentDefinition } from "./DeepsightMomentDefinition";
import { getDeepsightSocketCategorisation } from "./DeepsightSocketCategorisation";
import type { DeepsightSocketCategorisationDefinition } from "./IDeepsightPlugCategorisation";
import ItemPreferred from "./utility/ItemPreferred";
import manifest from "./utility/endpoint/DestinyManifest";

const IGNORED_ITEM_ISSUES = [
	"Airhead Hood",
	"Ancient Apocalypse Bond",
	"Ancient Apocalypse Boots",
	"Ancient Apocalypse Cloak",
	"Ancient Apocalypse Gauntlets",
	"Ancient Apocalypse Gloves",
	"Ancient Apocalypse Greaves",
	"Ancient Apocalypse Grips",
	"Ancient Apocalypse Helm",
	"Ancient Apocalypse Hood",
	"Ancient Apocalypse Mark",
	"Ancient Apocalypse Mask",
	"Ancient Apocalypse Plate",
	"Ancient Apocalypse Robes",
	"Ancient Apocalypse Strides",
	"Ancient Apocalypse Vest",
	"Ankaa Seeker IV",
	"Binary Phoenix Bond",
	"Binary Phoenix Cloak",
	"Binary Phoenix Mark",
	"Brave Titan's Mark",
	"Ego Talon IV",
	"Ere the End",
	"Errant Knight 1.0",
	"Frumious Cloak",
	"Frumious Vest",
	"Hodiocentrist Bond",
	"Insight Rover Boots",
	"Insight Rover Grips",
	"Insight Rover Vest",
	"Insight Unyielding Greaves",
	"Insight Unyielding Helm",
	"Insight Unyielding Plate",
	"Iron Fellowship Bond",
	"Iron Fellowship Boots",
	"Iron Fellowship Casque",
	"Iron Fellowship Cloak",
	"Iron Fellowship Gauntlets",
	"Iron Fellowship Gloves",
	"Iron Fellowship Greaves",
	"Iron Fellowship Grips",
	"Iron Fellowship Helm",
	"Iron Fellowship Hood",
	"Iron Fellowship Mark",
	"Iron Fellowship Plate",
	"Iron Fellowship Robes",
	"Iron Fellowship Strides",
	"Iron Fellowship Vest",
	"Iron Remembrance Grips",
	"Iron Remembrance Helm",
	"Iron Remembrance Plate",
	"Iron Remembrance Vestments",
	"Iron Symmachy Bond",
	"Iron Symmachy Cloak",
	"Iron Symmachy Gloves",
	"Iron Symmachy Greaves",
	"Iron Symmachy Grips",
	"Iron Symmachy Helm",
	"Iron Symmachy Mark",
	"Iron Symmachy Mask",
	"Iron Symmachy Strides",
	"Iron Truage Boots",
	"Iron Truage Casque",
	"Iron Truage Gloves",
	"Iron Truage Greaves",
	"Iron Truage Helm",
	"Iron Truage Legs",
	"Iron Truage Vest",
	"Iron Truage Vestments",
	"Kerak Type 2",
	"Mark of Shelter",
	"Mark of the Colliders",
	"Mark of the Unassailable",
	"Memory of Cayde",
	"Memory of Cayde Cloak",
	"Memory of Cayde Mark",
	"Mimetic Savior Greaves",
	"Mimetic Savior Mark",
	"Mimetic Savior Plate",
	"Nea-Thonis Breather",
	"Noble Constant Type 2",
	"Philomath Bond",
	"Phoenix Strife Type 0",
	"Red Moon Phantom Steps",
	"Righteous Bond",
	"Righteous Boots",
	"Righteous Cloak",
	"Righteous Gauntlets",
	"Righteous Gloves",
	"Righteous Helm",
	"Righteous Mark",
	"Righteous Mask",
	"Righteous Plate",
	"Righteous Robes",
	"Righteous Strides",
	"Righteous Vest",
	"Scorned Baron Plate",
	"Solstice Boots",
	"Solstice Gloves",
	"Solstice Mark",
	"Solstice Robes",
	"Solstice Boots (Renewed)",
	"Solstice Gloves (Renewed)",
	"Solstice Mark (Renewed)",
	"Solstice Robes (Renewed)",
	"Substitutional Alloy Boots",
	"Substitutional Alloy Cloak",
	"Substitutional Alloy Gloves",
	"Substitutional Alloy Mark",
	"Substitutional Alloy Plate",
	"Substitutional Alloy Robes",
	"Substitutional Alloy Strides",
	"Substitutional Alloy Vest",
	"Swordflight 4.1",
	"Terra Concord Greaves",
	"Tesseract Trace IV",
	"The Beyond",
	"The Shelter in Place",
	"The Took Offense",
	"Thorium Holt Bond",
	"Thorium Holt Gloves",
	"Vigil of Heroes",
	"Wing Contender",
	"Wing Discipline",
	"Wing Theorem",
	"Xenos Vale Bond",
	"Xenos Vale IV",
];

const ACCEPTIBLE_DUPLICATES = [
	InventoryItemHashes.JurassicGreenPulseRifle2603335652,
	InventoryItemHashes.JurassicGreenPulseRifle3103255595,
	InventoryItemHashes.ZephyrSword396910433,
	InventoryItemHashes.ZephyrSword1911078836,
];

const hasArtificeIntrinsic = (item: DestinyInventoryItemDefinition) =>
	!!item.sockets?.socketEntries.some(socket => socket.singleInitialItemHash === InventoryItemHashes.ArtificeArmorIntrinsicPlug);

const hasBraveOrnament = (item: DestinyInventoryItemDefinition, socketCategorisation: Record<number, DeepsightSocketCategorisationDefinition>, plugSets: Record<number, DestinyPlugSetDefinition>, invItems: Record<number, DestinyInventoryItemDefinition>) =>
	!!item.sockets?.socketEntries.some((socket, i) => true
		&& socketCategorisation[item.hash].categorisation[i].fullName.startsWith("Cosmetic/Ornament")
		&& plugSets[socket.reusablePlugSetHash!].reusablePlugItems.some(plug => invItems[plug.plugItemHash].displayProperties.name.includes("BRAVE")));

let DeepsightCollectionsDefinition: PromiseOr<DeepsightCollectionsDefinitionManifest> | undefined;
export default Task("DeepsightCollectionsDefinition", async () => {
	DeepsightCollectionsDefinition = undefined;
	const result = await getDeepsightCollectionsDefinition();

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightCollectionsDefinition.json", result, { spaces: "\t" });
});

export async function getDeepsightCollectionsDefinition () {
	DeepsightCollectionsDefinition ??= computeDeepsightCollectionsDefinition();
	return DeepsightCollectionsDefinition = await DeepsightCollectionsDefinition;
}

export async function getCollectionsCopies (...items: (InventoryItemHashes | DestinyInventoryItemDefinition)[]) {
	const { DestinyInventoryItemDefinition } = manifest;
	const collections = await Object.values(await getDeepsightCollectionsDefinition())
		.flatMap(moment => Object.values(moment.buckets))
		.flat()
		.map(itemHash => DestinyInventoryItemDefinition.get(itemHash))
		.collect(itemPromises => Promise.all(itemPromises));

	const unCollectionsItems = await items.map(itemOrItemHash => typeof itemOrItemHash !== "number" ? itemOrItemHash : DestinyInventoryItemDefinition.get(itemOrItemHash))
		.collect(itemPromises => Promise.all(itemPromises)) as DestinyInventoryItemDefinition[];

	return collections.filter((c): c is DestinyInventoryItemDefinition => !!c
		&& unCollectionsItems.some(item => item.displayProperties.name === c.displayProperties.name));
}

async function computeDeepsightCollectionsDefinition () {
	const { DestinyInventoryItemDefinition, DestinyPowerCapDefinition, DestinyPlugSetDefinition } = manifest;
	const DeepsightMomentDefinition = await getDeepsightMomentDefinition();
	const powerCaps = await DestinyPowerCapDefinition.all();
	const socketCategorisation = await getDeepsightSocketCategorisation();
	const plugSets = await DestinyPlugSetDefinition.all();
	const invItems = await DestinyInventoryItemDefinition.all();

	const watermarkPathToMomentHashMap = Object.values(DeepsightMomentDefinition)
		.flatMap(moment => [[moment.iconWatermark, moment.hash], [moment.iconWatermarkShelved, moment.hash]])
		.filter(([iconPath]) => iconPath !== undefined)
		.toObject() as Record<string, MomentHashes>;

	const overriddenItemMoments = Object.values(DeepsightMomentDefinition)
		.flatMap(moment => (moment.itemHashes ?? []).map(itemHash => [itemHash, moment.hash]))
		.toObject() as Record<InventoryItemHashes, MomentHashes>;

	const seenMoments: Partial<Record<MomentHashes, Record<string, Set<DestinyInventoryItemDefinition>>>> = {};
	const issues: Record<string, Set<DestinyInventoryItemDefinition>> = {};
	const DeepsightCollectionsDefinition: DeepsightCollectionsDefinitionManifest = {};

	for (const itemB of Object.values(await DestinyInventoryItemDefinition.all())) {
		if (!itemB.displayProperties.name)
			continue;

		if (ItemPreferred.isEquippableDummy(itemB))
			continue;

		const moment = overriddenItemMoments[itemB.hash as InventoryItemHashes]
			?? watermarkPathToMomentHashMap[itemB.iconWatermark]
			?? watermarkPathToMomentHashMap[itemB.iconWatermarkShelved];

		if (moment === undefined || !itemB.inventory?.bucketTypeHash)
			continue;

		const seenInMoment = seenMoments[moment] ??= {};

		const name = [
			itemB.displayProperties.name,
			itemB.equippingBlock?.equipmentSlotTypeHash ?? "n/a",
			itemB.classType,
			hasArtificeIntrinsic(itemB) ? "artifice" : undefined,
			hasBraveOrnament(itemB, socketCategorisation, plugSets, invItems) ? "shiny" : undefined,
		].filter(operand => operand !== undefined).join(" ");

		const existing = seenInMoment[name];
		if (existing?.size) {
			const [itemA] = existing;

			const sort = ItemPreferred.sortPreferredCopy(itemA, itemB, powerCaps);

			if (sort < 0)
				// don't replace itemA copy if itemB copy is worse
				continue;

			if (!sort) {
				if (IGNORED_ITEM_ISSUES.includes(itemA.displayProperties.name))
					continue;

				if (ACCEPTIBLE_DUPLICATES.includes(itemA.hash) && ACCEPTIBLE_DUPLICATES.includes(itemB.hash)) {
					existing.add(itemA);
					continue;
				}

				issues[name] ??= new Set();
				issues[name].add(itemA);
				issues[name].add(itemB);
				continue;
			}
		}

		seenInMoment[name] = new Set([itemB]);

		const { buckets } = DeepsightCollectionsDefinition[moment] ??= {
			hash: moment,
			buckets: {},
		};
		const bucket = buckets[itemB.inventory.bucketTypeHash as InventoryBucketHashes] ??= [];
		bucket.push(itemB.hash);
	}

	const issuesArr = Object.values(issues);
	if (issuesArr.length) {
		Log.warn(`Could not find difference between copies of items in collections:\n${issuesArr
			.map(issueItemSet => [...issueItemSet])
			.map(issueItems => {
				const item = issueItems[0];
				const className = item.classType === DestinyClass.Hunter ? "Hunter" : item.classType === DestinyClass.Titan ? "Titan" : item.classType === DestinyClass.Warlock ? "Warlock" : "";
				return ` - ${item.displayProperties.name} (${className ? `${className} ` : ""}${item.itemTypeDisplayName}): ${issueItems.map(item => item.hash).join(" ")}`;
			})
			.sort()
			.join("\n")}`);
	}

	return DeepsightCollectionsDefinition;
}
