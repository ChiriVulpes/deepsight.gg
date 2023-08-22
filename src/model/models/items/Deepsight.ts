import type { DestinyObjectiveProgress, DestinyProfileRecordsComponent, DestinyRecordDefinition, SingleComponentResponse } from "bungie-api-ts/destiny2";
import { DestinyObjectiveUiStyle, ItemState } from "bungie-api-ts/destiny2";
import type { IItemInit } from "model/models/items/Item";
import type Objectives from "model/models/items/Objectives";
import { PlugType } from "model/models/items/Plugs";
import type Manifest from "model/models/Manifest";

export interface IWeaponShaped {
	level?: Objectives.IObjective;
	progress?: Objectives.IObjective;
}

export interface IDeepsightPattern {
	record: DestinyRecordDefinition;
	progress: DestinyObjectiveProgress;
}

export interface IDeepsight {
	resonance?: boolean;
	activation?: boolean;
	pattern?: IDeepsightPattern;
}

namespace Deepsight {

	export interface IDeepsightProfile {
		profileRecords?: SingleComponentResponse<DestinyProfileRecordsComponent>;
	}

	export async function apply (manifest: Manifest, profile: IDeepsightProfile, item: IItemInit) {
		item.deepsight = await resolve(manifest, profile, item);
		item.shaped = await resolveShaped(item);
	}

	async function resolve (manifest: Manifest, profile: IDeepsightProfile, item: IItemInit): Promise<IDeepsight> {
		return {
			resonance: await resolveResonance(item),
			activation: await resolveActivation(item),
			pattern: await resolvePattern(manifest, profile, item),
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
		return sockets?.some(socket => socket?.socketedPlug?.is(PlugType.DeepsightResonance));
	}

	async function resolveActivation (item: IItemInit) {
		const sockets = await item.sockets;
		return sockets?.some(socket => socket?.socketedPlug?.is(PlugType.DeepsightActivation));
	}

	async function resolvePattern (manifest: Manifest, profile: IDeepsightProfile, item: IItemInit): Promise<IDeepsightPattern | undefined> {
		const { DestinyCollectibleDefinition, DestinyRecordDefinition } = manifest;

		if (item.definition.displayProperties.icon === "/img/misc/missing_icon_d2.png")
			return undefined;

		const collectible = await DestinyCollectibleDefinition.get(item.definition.collectibleHash, item.bucket !== "collections");
		const record = collectible ? await DestinyRecordDefinition.get("icon", collectible?.displayProperties.icon ?? null, item.bucket !== "collections")
			: await DestinyRecordDefinition.get("name", item.definition.displayProperties.name, item.bucket !== "collections");

		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const progress = profile.profileRecords?.data?.records[record?.hash!];
		if (!progress)
			return undefined;

		if (progress.objectives.length !== 1) {
			console.warn(`Incomprehensible pattern record for '${item.definition.displayProperties.name}'`, progress);
			return undefined;
		}

		if (!progress.objectives[0].completionValue)
			return undefined;

		return {
			record: record!,
			progress: progress.objectives[0],
		};
	}

	async function findObjective (item: IItemInit, predicate: (objective: Objectives.IObjective) => any): Promise<Objectives.IObjective | undefined> {
		const sockets = await item.sockets ?? [];
		for (const objective of sockets.flatMap(socket => socket?.plugs.flatMap(plug => plug.objectives) ?? [])) {
			if (predicate(objective))
				return objective;
		}

		return undefined;
	}
}

export default Deepsight;
