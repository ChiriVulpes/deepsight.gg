import type { DestinyCharacterRecordsComponent, DestinyInventoryItemDefinition, DestinyObjectiveProgress, DestinyProfileRecordsComponent, DestinyRecordDefinition, DictionaryComponentResponse, SingleComponentResponse } from "bungie-api-ts/destiny2";
import { DestinyObjectiveUiStyle, ItemState } from "bungie-api-ts/destiny2";
import { ItemTierTypeHashes, MomentHashes } from "deepsight.gg/Enums";
import type Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import type { IItemInit } from "model/models/items/Item";
import type Objectives from "model/models/items/Objectives";

export interface IWeaponShaped {
	level?: Objectives.IObjective;
	progress?: Objectives.IObjective;
}

export interface IDeepsightPattern {
	recipe?: DestinyInventoryItemDefinition;
	record?: DestinyRecordDefinition;
	progress?: DestinyObjectiveProgress;
}

export interface IDeepsight {
	resonance?: boolean;
	activation?: boolean;
	pattern?: IDeepsightPattern;
}

namespace Deepsight {

	export interface IDeepsightProfile {
		profileRecords?: SingleComponentResponse<DestinyProfileRecordsComponent>;
		characterRecords?: DictionaryComponentResponse<DestinyCharacterRecordsComponent>;
	}

	export async function apply (manifest: Manifest, profile: IDeepsightProfile | undefined, item: Item | IItemInit) {
		item.shaped = item.bucket.isCollections() ? undefined : await resolveShaped(item);
		item.deepsight = await resolve(manifest, profile, item);
	}

	async function resolve (manifest: Manifest, profile: IDeepsightProfile | undefined, item: IItemInit): Promise<IDeepsight> {
		const pattern = await resolvePattern(manifest, profile, item);
		return {
			resonance: !item.bucket.isCollections() && await resolveResonance(item),
			pattern,
			activation: !item.bucket.isCollections() && !item.shaped && !pattern?.progress?.complete && await resolveActivation(item),
		};
	}

	async function resolveShaped (item: IItemInit) {
		if (!(item.reference.state & ItemState.Crafted))
			return undefined;

		return {
			level: await findObjective(item, objective =>
				objective.definition.uiStyle === DestinyObjectiveUiStyle.CraftingWeaponLevel),
			progress: await findObjective(item, objective =>
				objective.definition.uiStyle === DestinyObjectiveUiStyle.CraftingWeaponLevelProgress),
		};
	}

	async function resolveResonance (item: IItemInit) {
		const sockets = await item.sockets;
		return sockets?.some(socket => socket?.state?.isVisible && socket.socketedPlug?.is("Extractable/DeepsightResonance"));
	}

	async function resolveActivation (item: IItemInit) {
		const sockets = await item.sockets;
		return sockets?.some(socket => socket?.socketedPlug?.is("Extractable/DeepsightActivation"));
	}

	async function resolvePattern (manifest: Manifest, profile: IDeepsightProfile | undefined, item: IItemInit): Promise<IDeepsightPattern | undefined> {
		const { DestinyInventoryItemDefinition } = manifest;
		const recipe = await DestinyInventoryItemDefinition.get(item.definition.inventory?.recipeItemHash);

		const result: IDeepsightPattern = {
			recipe,
			...await resolvePatternRecord(manifest, profile, item),
		};

		if (!result.record && !result.recipe)
			return undefined;

		return result;
	}

	async function resolvePatternRecord (manifest: Manifest, profile: IDeepsightProfile | undefined, item: IItemInit): Promise<IDeepsightPattern | undefined> {
		const { DestinyCollectibleDefinition, DestinyRecordDefinition } = manifest;

		if (item.definition.displayProperties.icon === "/img/misc/missing_icon_d2.png")
			return undefined;

		let record = item.deepsight?.pattern?.record;
		if (!record) {
			const collectible = await DestinyCollectibleDefinition.get(item.definition.collectibleHash);
			record = collectible ? await DestinyRecordDefinition.get("icon", collectible?.displayProperties.icon ?? null)
				: await DestinyRecordDefinition.get("name", item.definition.displayProperties.name);

			if (item.moment?.hash === MomentHashes.IntoTheLight && item.tier?.hash !== ItemTierTypeHashes.Exotic)
				return undefined;

			if (record?.recordTypeName !== "Weapon Pattern")
				return undefined;
		}

		return {
			record,
			progress: resolvePatternProgress(record, profile, item),
		};
	}

	function resolvePatternProgress (record: DestinyRecordDefinition, profile: IDeepsightProfile | undefined, item: IItemInit) {
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const progress = profile?.profileRecords?.data?.records[record?.hash]
			?? Object.values(profile?.characterRecords?.data ?? {}) // bungie bad, sometimes patterns are character scoped
				.map(records => records.records[record?.hash])
				.find(record => record);

		if (!progress?.objectives)
			return undefined;

		if (progress.objectives.length !== 1) {
			console.warn(`Incomprehensible pattern record for '${item.definition.displayProperties.name}'`, progress);
			return undefined;
		}

		if (!progress.objectives[0].completionValue)
			return undefined;

		return progress.objectives[0];
	}

	async function findObjective (item: IItemInit, predicate: (objective: Objectives.IObjective) => any): Promise<Objectives.IObjective | undefined> {
		const sockets = await item.sockets ?? [];
		for (const objective of sockets.flatMap(socket => socket?.plugs?.flatMap(plug => plug.objectives) ?? [])) {
			if (objective && predicate(objective))
				return objective;
		}

		return undefined;
	}
}

export default Deepsight;
