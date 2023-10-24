import type { DestinyActivityDefinition } from "bungie-api-ts/destiny2";
import type { DestinyActivity, DestinyActivityModifierDefinition, DestinyCharacterActivitiesComponent, DestinyRecordDefinition, DictionaryComponentResponse } from "bungie-api-ts/destiny2/interfaces";
import type Manifest from "model/models/Manifest";
import WeaponRotation from "model/models/WeaponRotation";
import type { IItemInit } from "model/models/items/Item";
import Objects from "utility/Objects";
import Time from "utility/Time";
import { VendorHashes } from "utility/endpoint/bungie/endpoint/destiny2/GetVendor";
import type { DeepsightDropTableDefinition } from "utility/endpoint/deepsight/endpoint/GetDeepsightDropTableDefinition";

export interface ISource {
	dropTable: DeepsightDropTableDefinition;
	activityDefinition: DestinyActivityDefinition;
	masterActivityDefinition?: DestinyActivityDefinition;
	masterActivity?: DestinyActivity | true;
	activeChallenge?: DestinyActivityModifierDefinition;
	isActiveDrop: boolean;
	isActiveMasterDrop: boolean;
	record?: DestinyRecordDefinition;
}

namespace Source {

	export interface ISourceProfile {
		characterActivities?: DictionaryComponentResponse<DestinyCharacterActivitiesComponent>;
	}

	export async function apply (manifest: Manifest, profile: ISourceProfile, item: IItemInit) {
		if (item.bucket !== "collections")
			return;

		item.sources = await resolve(manifest, profile, item);
	}

	async function resolve (manifest: Manifest, profile: ISourceProfile, item: IItemInit): Promise<ISource[] | undefined> {
		const dropTableSources = await resolveDropTables(manifest, profile, item);
		const weaponRotationSources = await resolveWeaponRotation(manifest, profile, item);
		if (!dropTableSources?.length && !weaponRotationSources.size)
			return undefined;

		return [...dropTableSources ?? [], ...weaponRotationSources.values()];
	}

	async function resolveWeaponRotation (manifest: Manifest, profile: ISourceProfile, item: IItemInit) {
		const sources = new Map<number, ISource>();

		const weaponRotation = await WeaponRotation.await();
		for (const [vendor, itemHashes] of Object.entries(weaponRotation) as any[] as [VendorHashes, number[]][]) {
			if (!itemHashes.includes(item.definition.hash))
				continue;

			const activities = await resolveVendorActivities(manifest, profile, vendor);

			for (const activity of activities) {
				const adept = item.definition.displayProperties.name.trimEnd().endsWith("(Adept)");
				const activityAwardsAdept = activity.rewards.some(reward => reward.rewardItems.some(item => item.itemHash === 2119974556));

				if (adept !== activityAwardsAdept)
					continue;

				sources.set(activity.hash, {
					dropTable: {
						hash: activity.hash,
						recordHash: 3052859887,
					},
					activityDefinition: activity,
					masterActivity: activityAwardsAdept ? true : undefined,
					masterActivityDefinition: activityAwardsAdept ? activity : undefined,
					isActiveDrop: true,
					isActiveMasterDrop: activityAwardsAdept,
				});
			}
		}

		return sources;
	}

	const vendorActivityTypeHashMap: Partial<Record<VendorHashes, number>> = {
		[VendorHashes.CommanderZavala]: 575572995,
		[VendorHashes.Saint14]: 2112637710,
	};
	async function resolveVendorActivities (manifest: Manifest, profile: ISourceProfile, vendor: VendorHashes) {
		return (await Promise.all(Object.values<DestinyCharacterActivitiesComponent>(profile.characterActivities?.data ?? Objects.EMPTY)
			.flatMap(activities => activities.availableActivities)
			.map(async activity => manifest.DestinyActivityDefinition.get(activity.activityHash))))
			.filter((activity): activity is DestinyActivityDefinition => activity?.activityTypeHash === vendorActivityTypeHashMap[vendor]);
	}

	async function resolveDropTables (manifest: Manifest, profile: ISourceProfile, item: IItemInit) {
		const { DeepsightDropTableDefinition } = manifest;
		let dropTables = await DeepsightDropTableDefinition.all();
		dropTables = dropTables.filter(table => false
			|| table.dropTable?.[item.definition.hash]
			|| table.encounters?.some(encounter => encounter.dropTable?.[item.definition.hash])
			|| table.master?.dropTable?.[item.definition.hash]
			|| table.rotations?.drops?.includes(item.definition.hash)
			|| table.rotations?.masterDrops?.includes(item.definition.hash));

		if (!dropTables.length)
			return undefined;

		return Promise.all(dropTables.map(table => resolveDropTable(manifest, profile, table, item)));
	}

	async function resolveDropTable ({ DestinyActivityDefinition, DestinyRecordDefinition, DestinyActivityModifierDefinition }: Manifest, profile: ISourceProfile, table: DeepsightDropTableDefinition, item: IItemInit): Promise<ISource> {
		const weeks = Math.floor((Date.now() - (table.rotations?.anchor ?? 0)) / Time.weeks(1));

		return {
			dropTable: table,
			activityDefinition: await DestinyActivityDefinition.get(table.hash)!,
			masterActivityDefinition: await DestinyActivityDefinition.get(table.master?.activityHash),
			masterActivity: !table.master?.activityHash ? undefined : Object.values<DestinyCharacterActivitiesComponent>(profile.characterActivities?.data ?? Objects.EMPTY)
				.flatMap(activities => activities.availableActivities)
				.find(activity => activity.activityHash === table.master!.activityHash),
			activeChallenge: await DestinyActivityModifierDefinition.get(resolveRotation(table.rotations?.challenges, weeks)),
			isActiveDrop: resolveRotation(table.rotations?.drops, weeks) === item.definition.hash,
			isActiveMasterDrop: !!table.master?.dropTable?.[item.definition.hash]
				|| resolveRotation(table.rotations?.masterDrops, weeks) === item.definition.hash,
			record: await DestinyRecordDefinition.get(table.recordHash),
		};
	}

	function resolveRotation<T> (rotation: T[] | undefined, weeks: number) {
		return !rotation?.length ? undefined : rotation?.[weeks % rotation.length];
	}
}

export default Source;
