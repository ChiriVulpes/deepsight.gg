import type { DestinyInventoryItemDefinition, DestinyItemComponent, DestinyItemInstanceComponent, DestinyItemPlugBase, DestinyItemSocketState, DestinyObjectiveDefinition, DestinyObjectiveProgress, DestinyRecordDefinition, DestinyStat } from "bungie-api-ts/destiny2";
import { DestinyComponentType, DestinyObjectiveUiStyle, ItemLocation, ItemState } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import DestinyEnums from "model/models/DestinyEnums";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import type { DestinySourceDefinition } from "utility/endpoint/fvm/endpoint/GetDestinySourceDefinition";
import { EventManager } from "utility/EventManager";
import Time from "utility/Time";

/**
 * **Warning:** Not all weapon mods have this category hash
 */
export const ITEM_WEAPON_MOD = 610365472;

export type BucketId = `${bigint}` | "vault" | "inventory" | "postmaster";
export interface IItem {
	equipped?: true;
	reference: DestinyItemComponent;
	instance?: DestinyItemInstanceComponent;
	definition: DestinyInventoryItemDefinition;
	source?: DestinySourceDefinition;
	objectives: DestinyObjectiveProgress[];
	deepsight?: IDeepsight;
	shaped?: IWeaponShaped;
	stats?: Partial<Record<number, IStat>>;
	sockets?: (ISocket | undefined)[];
	plugs?: IReusablePlug[][];
	temp: any;
}

export interface IWeaponShaped {
	level?: IObjective;
	progress?: IObjective;
}

export interface IDeepsightPattern {
	record: DestinyRecordDefinition;
	progress: DestinyObjectiveProgress;
}

export interface IDeepsight {
	attunement?: IObjective;
	pattern?: IDeepsightPattern;
}

export interface IObjective {
	objective: DestinyObjectiveProgress;
	definition: DestinyObjectiveDefinition;
}

export interface ISocket {
	reference: DestinyItemSocketState;
	definition: DestinyInventoryItemDefinition;
}

export interface IReusablePlug {
	reference?: DestinyItemPlugBase | DestinyItemSocketState;
	definition?: DestinyInventoryItemDefinition;
	socketed: boolean;
}

export interface IStat {
	value: number;
	intrinsic?: number;
	masterwork?: number;
	mod?: number;
}

export interface IItemEvents {
	transferStateChange: { transferring: boolean };
}

export interface Item extends IItem { }
export class Item {

	public readonly event = new EventManager<this, IItemEvents>(this);

	private _transferring = false;
	public get transferring () {
		return this._transferring;
	}
	public set transferring (transferring: boolean) {
		if (this._transferring === transferring)
			return;

		this._transferring = transferring;
		this.event.emit("transferStateChange", { transferring });
	}

	public constructor (item: IItem) {
		Object.assign(this, item);
	}

	public isMasterwork () {
		return !!(this.reference.state & ItemState.Masterwork)
			|| (this.plugs?.filter(socket => socket.some(plug => plug.definition?.itemTypeDisplayName === "Enhanced Trait"))
				.length ?? 0) >= 2;
	}
}

export class Bucket {

	public constructor (public readonly id: BucketId, public readonly items: Item[]) {
	}
}

export default Model.createDynamic(Time.seconds(30), async api => {
	api.subscribeProgress(Manifest, 1 / 3);
	const {
		DestinyInventoryItemDefinition,
		DestinySourceDefinition,
		DestinyRecordDefinition,
		DestinyCollectibleDefinition,
		DestinyObjectiveDefinition,
		DestinyStatDefinition,
	} = await Manifest.await();
	const { BucketHashes } = await DestinyEnums.await();

	const ProfileQuery = Profile(
		DestinyComponentType.CharacterInventories,
		DestinyComponentType.CharacterEquipment,
		DestinyComponentType.ProfileInventories,
		DestinyComponentType.ItemInstances,
		DestinyComponentType.ProfileProgression,
		DestinyComponentType.ItemPlugObjectives,
		DestinyComponentType.ItemStats,
		DestinyComponentType.Records,
		DestinyComponentType.ItemSockets,
		DestinyComponentType.ItemReusablePlugs,
		DestinyComponentType.ItemPlugStates,
	);

	api.subscribeProgress(ProfileQuery, 1 / 3, 1 / 3);
	const profile = await ProfileQuery.await();

	console.log(profile.itemComponents.sockets);

	const initialisedItems = new Set<string>();

	async function findObjective (item: Item, predicate: (objective: DestinyObjectiveProgress, definition: DestinyObjectiveDefinition) => any): Promise<IObjective | undefined> {
		for (const objective of item.objectives) {
			const definition = await DestinyObjectiveDefinition.get(objective.objectiveHash);
			if (!definition)
				continue;

			if (predicate(objective, definition))
				return { objective: objective, definition };
		}

		return undefined;
	}

	async function resolveDeepsightAttunement (item: Item) {
		if (!(item.reference.state & ItemState.HighlightedObjective))
			return undefined;

		return findObjective(item, (objective, definition) => definition?.uiStyle === DestinyObjectiveUiStyle.Highlighted);
	}

	async function resolveDeepsightPattern (item: Item): Promise<IDeepsightPattern | undefined> {

		const collectible = await DestinyCollectibleDefinition.get(item.definition.collectibleHash);
		const record = collectible ? await DestinyRecordDefinition.get("icon", collectible?.displayProperties.icon ?? null)
			: await DestinyRecordDefinition.get("name", item.definition.displayProperties.name);

		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const progress = profile.profileRecords.data?.records[record?.hash!];
		if (!progress)
			return undefined;

		if (progress.objectives.length !== 1) {
			console.warn(`Incomprehensible pattern record for '${item.definition.displayProperties.name}'`, progress);
			return undefined;
		}

		return {
			record: record!,
			progress: progress.objectives[0],
		};
	}

	async function resolveDeepsight (item: Item): Promise<IDeepsight> {
		return { attunement: await resolveDeepsightAttunement(item), pattern: await resolveDeepsightPattern(item) };
	}

	async function resolveSockets (sockets?: DestinyItemSocketState[]): Promise<(ISocket | undefined)[]> {
		return Promise.all(sockets
			?.map(async (socket): Promise<ISocket | undefined> => {
				const definition = await DestinyInventoryItemDefinition.get(socket.plugHash);
				return !definition ? undefined : {
					reference: socket,
					definition,
				};
			}) ?? []);
	}

	// async function resolvePlugStates (sockets: ISocket[], plugs?: Record<number, DestinyItemPlugBase[]>) {
	// 	return Promise.all(Object.values(plugs ?? {})
	// 		.map(async (plugs) => Promise.all(plugs.map(async plug => {
	// 			const definition = await DestinyInventoryItemDefinition.get(plug.plugItemHash);
	// 			return !definition ? undefined : {
	// 				reference: plug,
	// 				definition,
	// 				socketed: !!sockets.find(socket => socket.definition.hash === definition.hash),
	// 			} as IReusablePlug;
	// 		}))
	// 		) ?? []);
	// }

	async function resolveReusablePlugs (sockets: (ISocket | undefined)[], plugs?: Record<number, DestinyItemPlugBase[]>) {
		// sockets = sockets.filter(socket => socket?.definition.itemCategoryHashes?.includes(ITEM_WEAPON_MOD)
		// 	&& socket.definition.plug?.plugCategoryIdentifier !== "intrinsics");
		const reusablePlugs = sockets.map(socket => [{
			reference: socket?.reference,
			definition: socket?.definition,
			socketed: true,
		} as IReusablePlug]);
		return Object.assign(reusablePlugs, Object.fromEntries(await Promise.all(Object.entries(plugs ?? {})
			.sort(([a], [b]) => +a - +b)
			.map(async ([i, plugs]) => [i, await Promise.all(plugs.map(async plug => {
				const definition = await DestinyInventoryItemDefinition.get(plug.plugItemHash);
				return {
					reference: plug,
					definition,
					socketed: !!sockets.find(socket => socket?.definition.hash === definition?.hash),
				} as IReusablePlug;
			}))] as const) ?? []))) as IReusablePlug[][];
	}

	async function resolveStats (stats: Record<number, DestinyStat> | undefined, sockets: (ISocket | undefined)[]) {
		const intrinsicStats = sockets.filter(socket => socket?.definition.plug?.plugCategoryIdentifier === "intrinsics")
			.flatMap(plug => plug?.definition.investmentStats);

		const masterworkStats = sockets.find(socket => socket?.definition.plug?.uiPlugLabel === "masterwork")
			?.definition.investmentStats ?? [];

		const modStats = sockets.filter(socket => socket?.definition.plug?.plugCategoryIdentifier !== "intrinsics" && socket?.definition.plug?.uiPlugLabel !== "masterwork")
			.flatMap(plug => plug?.definition.investmentStats);

		const result: Record<number, IStat> = {};

		for (const [hash, { value }] of Object.entries(stats ?? {})) {
			const definition = await DestinyStatDefinition.get(hash);
			if (!definition) {
				console.warn("Unknown stat", hash, "value", value);
				continue;
			}

			const stat: IStat = result[+hash] = { value };

			for (const intrinsic of intrinsicStats)
				if (+hash === intrinsic?.statTypeHash)
					stat.intrinsic = (stat.intrinsic ?? 0) + intrinsic.value;

			for (const masterwork of masterworkStats)
				if (+hash === masterwork.statTypeHash)
					stat.masterwork = (stat.masterwork ?? 0) + masterwork.value;

			for (const mod of modStats)
				if (+hash === mod?.statTypeHash)
					stat.mod = (stat.mod ?? 0) + mod.value;
		}

		return result;
	}

	async function resolveItemComponent (reference: DestinyItemComponent) {
		api.emitProgress(2 / 3 + 1 / 3 * (initialisedItems.size / (profile.profileInventory.data?.items.length ?? 1)), "Loading items");
		const definition = await DestinyInventoryItemDefinition.get(reference.itemHash);
		if (!definition) {
			console.warn("No item definition for ", reference.itemHash);
			return undefined;
		}

		const itemId = reference.itemInstanceId ?? `item:${reference.itemHash}`;
		if (initialisedItems.has(itemId)) {
			console.debug(`Skipping "${definition.displayProperties.name}", already initialised in another bucket`);
			return undefined; // already initialised in another bucket
		}

		if (definition.nonTransferrable) {
			console.debug(`Skipping "${definition.displayProperties.name}", non-transferrable`);
			return undefined;
		}

		initialisedItems.add(itemId);

		const sockets = await resolveSockets(profile.itemComponents.sockets.data?.[reference.itemInstanceId!]?.sockets);
		const plugs = await resolveReusablePlugs(sockets, profile.itemComponents.reusablePlugs.data?.[reference.itemInstanceId!]?.plugs);

		const stats = await resolveStats(profile.itemComponents.stats.data?.[reference.itemInstanceId!]?.stats, sockets);

		const item = new Item({
			definition: definition,
			reference: reference,
			instance: profile.itemComponents.instances.data?.[reference.itemInstanceId!],
			objectives: Object.values(profile.itemComponents.plugObjectives.data?.[reference.itemInstanceId!]?.objectivesPerPlug ?? {}).flat(),
			sockets,
			stats,
			plugs,
			temp: profile.itemComponents.plugStates.data,
		});

		let source = await DestinySourceDefinition.get("iconWatermark", `https://www.bungie.net${definition.iconWatermark}`);
		if (!source) {
			source = await DestinySourceDefinition.get("id", "redwar");
			if (!source?.itemHashes?.includes(definition.hash)) {
				source = undefined;
				console.warn(`Unable to determine source of '${definition.displayProperties.name}' (${definition.hash})`, item);
			}
		}

		item.source = source;
		item.deepsight = await resolveDeepsight(item);
		if (item.reference.state & ItemState.Crafted) {
			item.shaped = {
				level: await findObjective(item, (objective, definition) => definition.uiStyle === DestinyObjectiveUiStyle.CraftingWeaponLevel),
				progress: await findObjective(item, (objective, definition) => definition.uiStyle === DestinyObjectiveUiStyle.CraftingWeaponLevelProgress),
			};
		}

		return item;
	}

	async function createBucket (id: BucketId, itemComponents: DestinyItemComponent[]) {
		const items: Item[] = [];
		for (const itemComponent of itemComponents) {
			const item = await resolveItemComponent(itemComponent);
			if (!item)
				continue;

			items.push(item);
		}

		return new Bucket(id, items);
	}

	const profileItems = profile.profileInventory.data?.items ?? [];

	const buckets = {} as Record<BucketId, Bucket>;
	buckets.postmaster = await createBucket("postmaster", profileItems
		.filter(item => item.location === ItemLocation.Postmaster));

	for (const [characterId, character] of Object.entries(profile.characterInventories.data ?? {})) {
		const bucketId = characterId as BucketId;
		const bucket = buckets[bucketId] = await createBucket(bucketId, character.items);

		for (const itemComponent of (profile.characterEquipment.data?.[bucketId].items ?? [])) {
			const item = await resolveItemComponent(itemComponent);
			if (!item)
				continue;

			item.equipped = true;
			bucket.items.push(item);
		}
	}

	buckets.inventory = await createBucket("inventory", profileItems
		.filter(item => item.bucketHash === BucketHashes.byName("Modifications") || item.bucketHash === BucketHashes.byName("Consumables")));
	buckets.vault = await createBucket("vault", profileItems);

	return buckets;
});
