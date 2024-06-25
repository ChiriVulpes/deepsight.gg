import type { DeepsightPlugCategorisation, DeepsightPlugCategory, DeepsightPlugCategoryName, DeepsightPlugFullName } from "@deepsight.gg/plugs";
import type { DestinyInventoryItemDefinition, DestinyItemComponentSetOfint64, DestinyItemPerkEntryDefinition, DestinyItemPlugBase, DestinyItemSocketCategoryDefinition, DestinyItemSocketEntryDefinition, DestinyItemSocketEntryPlugItemDefinition, DestinyItemSocketEntryPlugItemRandomizedDefinition, DestinyItemSocketState, DestinyObjectiveProgress, DestinyPlugSetsComponent, DestinySandboxPerkDefinition, SingleComponentResponse } from "bungie-api-ts/destiny2";
import type { PlugSetHashes } from "deepsight.gg/Enums";
import { MomentHashes } from "deepsight.gg/Enums";
import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import type { IItemInit } from "model/models/items/Item";
import Objectives from "model/models/items/Objectives";
import type { PromiseOr } from "utility/Type";
import type { ClarityDescription } from "utility/endpoint/clarity/endpoint/GetClarityDescriptions";

type PlugCat = DeepsightPlugCategoryName;
type PlugType<CATEGORY extends DeepsightPlugCategory = DeepsightPlugCategory> = DeepsightPlugFullName<CATEGORY>;
type PlugRaw = DestinyItemPlugBase | DestinyItemSocketEntryPlugItemRandomizedDefinition | DestinyItemSocketEntryPlugItemDefinition;

namespace PlugType {
	export const None = "None" as const;

	export type Query = PlugCat | PlugType | `=${PlugCat | PlugType}` | `!${PlugCat | PlugType | `=${PlugCat | PlugType}`}`;

	export function check (type?: PlugType, ...fragments: Query[]) {
		if (!type)
			return false;

		let found = false;
		let hadNot = false;
		let hadNotNot = false;
		for (let query of fragments) {
			let not = false;
			if (query[0] === "!") {
				not = true;
				query = query.slice(1) as Query;
			} else if (found)
				// already found one and this isn't an inverted check, so skip it
				continue;

			const startsWith = query[0] === "=" ? type === query.slice(1) : type.startsWith(query);
			if (startsWith && not)
				return false; // if any "not"s match, early exit

			hadNot ||= not;
			found ||= startsWith;
			hadNotNot ||= !not;
		}

		return hadNotNot ? found : hadNot;
	}
}

export { PlugType };

export interface Socket extends Omit<Socket.ISocketInit, "plugs"> {
}

export class Socket {

	public static filterByPlugs (sockets: (Socket | undefined)[], ...anyOfTypes: PlugType.Query[]) {
		return sockets.filter((socket): socket is Socket.Socketed => socket?.socketedPlug?.is(...anyOfTypes) ?? false);
	}

	public static filterExcludePlugs (sockets: (Socket | undefined)[], ...anyOfTypes: PlugType.Query[]) {
		return sockets.filter((socket): socket is Socket.Socketed => socket?.socketedPlug?.isNot(...anyOfTypes) ?? false);
	}

	public static filterType (sockets: (Socket | undefined)[], ...anyOfTypes: PlugType.Query[]) {
		if (!anyOfTypes.length)
			return [];

		return sockets.filter((socket): socket is Socket => socket?.is(...anyOfTypes) ?? false);
	}

	public static filterExcludeType (sockets: (Socket | undefined)[], ...anyOfTypes: PlugType.Query[]) {
		return sockets.filter((socket): socket is Socket => socket?.isNot(...anyOfTypes) ?? false);
	}

	public static async resolve (manifest: Manifest, init: Socket.ISocketInit, item: IItemInit, index: number) {
		const socket = new Socket();
		Object.assign(socket, init);
		delete socket.objectives;
		socket.item = item;
		socket.index = index;

		const { DestinyInventoryItemDefinition, DeepsightSocketCategorisation } = manifest;
		const categorisation = await DeepsightSocketCategorisation.get(item?.definition.hash);
		socket.type = categorisation?.categorisation[index]?.fullName ?? "None";
		if (socket.type === "Cosmetic/Shader")
			return socket; // skip shader init

		if (item.bucket.isCollections() && socket.is("Cosmetic/Ornament") && item.moment?.hash !== MomentHashes.IntoTheLight)
			return socket; // skip ornament init in collections

		let plugSetHash = socket.definition.randomizedPlugSetHash ?? socket.definition.reusablePlugSetHash;
		if (item.deepsight?.pattern && index !== undefined) {
			const recipeItem = await DestinyInventoryItemDefinition.get(item.definition.inventory?.recipeItemHash);
			const recipeSocket = recipeItem?.sockets?.socketEntries[index];
			if (recipeSocket) {
				plugSetHash = recipeSocket.randomizedPlugSetHash ?? recipeSocket.reusablePlugSetHash;
			}
		}

		socket.plugSetHash = plugSetHash;
		await socket.refresh(manifest, init);

		return socket;
	}

	public socketedPlug?: Plug;
	public plugs!: Plug[];
	private plugPool?: PromiseOr<Plug[]>;
	public type: PlugType = PlugType.None;
	public types = new Set<PlugType>();
	private plugSetHash?: PlugSetHashes;
	private item?: IItemInit;
	private index = 0;
	private plugsListHash?: string;

	private constructor () { }

	public async refresh (manifest: Manifest, refresh: Socket.ISocketRefresh) {
		this.category = refresh.category;
		this.state = refresh.state;

		const { DestinyPlugSetDefinition, DeepsightSocketExtendedDefinition } = manifest;

		let plugs: PlugRaw[] = undefined
			?? (this.state ? refresh.plugs : undefined)
			?? this.plugs?.slice()
			?? (!this.plugSetHash ? undefined : (await DestinyPlugSetDefinition.get(this.plugSetHash))?.reusablePlugItems)
			?? (this.plugSetHash ? undefined : (await DeepsightSocketExtendedDefinition.get(this.item?.definition.hash))?.sockets[this.index]?.rewardPlugItems)
			?? [];

		if (!this.state && !this.plugs)
			plugs.concat(this.definition.reusablePlugItems);

		plugs = plugs.distinct(plug => plug.plugItemHash);

		const currentPlugHash = this.state?.plugHash ?? this.definition.singleInitialItemHash;

		let plugListChanged = false;

		const plugsListHash = plugs.map(plug => plug.plugItemHash).join(",");
		if (this.plugsListHash !== plugsListHash) {
			this.plugsListHash = plugsListHash;
			const newPlugsList = [];
			for (const plug of plugs)
				newPlugsList.push(await Plug.resolve(manifest, plug, this.item));

			plugListChanged = true;
			this.plugs = newPlugsList;
		}

		if (this.socketedPlug?.plugItemHash !== currentPlugHash) {
			let socketedPlug = this.plugs.find(plug => plug.plugItemHash === currentPlugHash);
			if (!socketedPlug && currentPlugHash) {
				socketedPlug = await Plug.resolveFromHash(manifest, currentPlugHash, this.state?.isEnabled ?? true, this.item);
				plugListChanged = true;
				if (socketedPlug && this.state)
					this.plugs.push(socketedPlug);
			}

			this.socketedPlug = socketedPlug;

			if (this.socketedPlug)
				this.socketedPlug.socketed = true;
		}

		for (const plug of this.plugs) {
			await plug.refresh(manifest, refresh, this.item);

			if (plugListChanged)
				this.types.add(plug.type);
		}

		if (this.socketedPlug) {
			await this.socketedPlug.refresh(manifest, refresh, this.item);
			if (plugListChanged)
				this.types.add(this.socketedPlug.type);
		}

		if (plugListChanged) {
			if (this.types.size <= 1) {
				const [type] = this.types;
				this.type = type ?? PlugType.None;
			} else {
				const smallestFirst = Array.from(this.types)
					.sort((a, b) => a.length - b.length);

				const smallest = smallestFirst[0];
				if (smallestFirst.every(type => type.startsWith(smallest)))
					this.type = smallest;

				if (this.type === PlugType.None) {
					// we still don't have a type, so now we grab the smallest type and see how much we can shorten it to make all match
					let type = smallestFirst[0];
					while (type.length) {
						type = type.slice(0, -1) as PlugType;
						if (!type.includes("/"))
							break;

						if (smallestFirst.every(t => t.startsWith(type))) {
							this.type = type;
							break;
						}
					}
				}
			}
		}
	}

	public getPool (...anyOfTypes: PlugType.Query[]): PromiseOr<Plug[]>;
	public getPool<ALREADY_RESOLVED extends true> (...anyOfTypes: PlugType.Query[]): Plug[];
	public getPool (...anyOfTypes: PlugType.Query[]): PromiseOr<Plug[]> {
		if (this.plugPool && !(this.plugPool instanceof Promise))
			return anyOfTypes.length === 0 ? this.plugPool : this.plugPool.filter(plug => plug.is(...anyOfTypes));

		return (async () => {
			const plugPool = this.plugPool = await (this.plugPool ??= Manifest.await()
				.then((manifest) => Promise.resolve(manifest.DestinyPlugSetDefinition.get(this.definition.randomizedPlugSetHash ?? this.definition.reusablePlugSetHash))
					.then(plugSet => plugSet?.reusablePlugItems ?? [])
					.then((plugs: PlugRaw[]) => plugs.concat(this.definition.reusablePlugItems))
					.then(plugs => Promise.all(plugs.map(plug => Plug.resolve(manifest, plug))))));

			return anyOfTypes.length === 0 ? plugPool : plugPool.filter(plug => plug.is(...anyOfTypes));
		})();
	}

	public is (...anyOfTypes: PlugType.Query[]) {
		return PlugType.check(this.type, ...anyOfTypes);
	}

	public isNot (...anyOfTypes: PlugType.Query[]) {
		return !PlugType.check(this.type, ...anyOfTypes);
	}

	public getPlugs (...anyOfTypes: PlugType.Query[]) {
		return anyOfTypes.length === 0 ? this.plugs : this.plugs.filter(plug => plug.is(...anyOfTypes));
	}

	public getPlug (...anyOfTypes: PlugType.Query[]): Plug | undefined {
		return this.getPlugs(...anyOfTypes)[0];
	}
}

export namespace Socket {

	export interface Socketed extends Socket {
		socketedPlug: Plug;
	}

	export interface ISocketRefresh {
		state?: DestinyItemSocketState;
		category?: DestinyItemSocketCategoryDefinition;
		plugs?: DestinyItemPlugBase[];
		objectives?: Record<number, DestinyObjectiveProgress[]>;
	}

	export interface ISocketInit extends ISocketRefresh {
		definition: DestinyItemSocketEntryDefinition;
	}
}

type PlugBaseStuff = { [KEY in keyof DestinyItemPlugBase as KEY extends keyof DestinyItemSocketEntryPlugItemRandomizedDefinition ? never : KEY]?: DestinyItemPlugBase[KEY] };
type ItemSocketEntryPlugStuff = { [KEY in keyof DestinyItemSocketEntryPlugItemRandomizedDefinition as KEY extends keyof DestinyItemPlugBase ? never : KEY]?: DestinyItemSocketEntryPlugItemRandomizedDefinition[KEY] };
type SharedStuff = { [KEY in keyof DestinyItemPlugBase as KEY extends keyof DestinyItemSocketEntryPlugItemRandomizedDefinition ? KEY extends keyof DestinyItemSocketEntryPlugItemDefinition ? KEY : never : never]: DestinyItemPlugBase[KEY] };

interface PlugDef {
	definition?: DestinyInventoryItemDefinition;
	clarity?: ClarityDescription;
	categorisation?: DeepsightPlugCategorisation;
	type?: PlugType;
	perks: Perk[];
}

export interface Plug extends PlugBaseStuff, ItemSocketEntryPlugStuff, SharedStuff { }
export class Plug {

	static {
		Object.assign(window, { Plug });
	}

	public static async resolveFromHash (manifest: Manifest, hash: number, enabled: boolean, item?: IItemInit) {
		return Plug.resolve(manifest, {
			plugItemHash: hash,
			canInsert: true,
			enabled,
		} as DestinyItemPlugBase, item);
	}

	// private static plugGenericCacheTime = 0;
	// private static plugGenericCache: Record<string, Plug> = {};

	private static plugDefCacheTime = 0;
	private static plugDefCache: Record<number, PlugDef> = {};

	public clarity?: ClarityDescription;
	public categorisation?: DeepsightPlugCategorisation;

	public getCategorisationAs<CATEGORY extends DeepsightPlugCategory> (category: CATEGORY) {
		return this.categorisation?.category === category ? this.categorisation as DeepsightPlugCategorisation<CATEGORY> : undefined;
	}

	public static async resolve (manifest: Manifest, plugBase: DestinyItemPlugBase | DestinyItemSocketEntryPlugItemRandomizedDefinition | DestinyItemSocketEntryPlugItemDefinition, item?: IItemInit) {
		const manifestCacheTime = Manifest.getCacheTime();

		// generic caching doesn't work bcuz we store socketed & objectives data on instances
		// const genericHash = Plug.getGenericPlugHash(plugBase);
		// if (genericHash) {
		// 	if (Plug.plugGenericCacheTime < manifestCacheTime) {
		// 		Plug.plugGenericCacheTime = manifestCacheTime;
		// 		Plug.plugGenericCache = {};
		// 	}

		// 	const genericCached = this.plugGenericCache[genericHash];
		// 	if (genericCached)
		// 		return genericCached;
		// }

		const plug = new Plug();
		Object.assign(plug, plugBase);
		plug.socketed = false;

		if (Plug.plugDefCacheTime < manifestCacheTime) {
			Plug.plugDefCacheTime = manifestCacheTime;
			Plug.plugDefCache = {};
		}

		const plugDef = Plug.plugDefCache[plug.plugItemHash] ??= await Plug.resolvePlugDef(manifest, plug.plugItemHash, item);
		Object.assign(plug, plugDef);

		// if (genericHash)
		// 	this.plugGenericCache[genericHash] = plug;

		return plug;
	}

	// private static getGenericPlugHash (plugBase: DestinyItemPlugBase | DestinyItemSocketEntryPlugItemRandomizedDefinition) {
	// 	if ("enabled" in plugBase)
	// 		return plugBase.enableFailIndexes?.length || plugBase.insertFailIndexes?.length ? undefined
	// 			: `${plugBase.plugItemHash}:${plugBase.enabled ? "enabled" : "disabled"}:${plugBase.canInsert ? "canInsert" : "noInsert"}`;

	// 	return plugBase.craftingRequirements?.materialRequirementHashes?.length || !plugBase.craftingRequirements?.unlockRequirements?.length ? undefined
	// 		: `${plugBase.plugItemHash}:${plugBase.currentlyCanRoll ? "currentlyCanRoll" : "currentlyCannotRoll"}:${plugBase.craftingRequirements?.requiredLevel ?? 0}`;
	// }

	private static async resolvePlugDef (manifest: Manifest, hash: number, item?: IItemInit): Promise<PlugDef> {

		const { DestinyInventoryItemDefinition, DeepsightPlugCategorisation, ClarityDescriptions } = manifest;
		// let start = Date.now();
		const definition = await DestinyInventoryItemDefinition.get(hash);
		// console.log("invtime", Date.now() - start);
		// start = Date.now();
		const clarity = definition && await ClarityDescriptions.get(hash);
		// console.log("claritytime", Date.now() - start);
		// start = Date.now();
		const categorisation = await DeepsightPlugCategorisation.get(hash);
		// console.log("cattime", Date.now() - start);
		// start = Date.now();

		return {
			definition,
			clarity,
			categorisation,
			type: categorisation?.fullName ?? "Unknown",
			perks: await Promise.all((definition?.perks ?? []).map(perk => Perk.resolve(manifest, perk))),
		};
	}

	public static initialisedPlugTypes: Partial<Record<keyof typeof PlugType, number>> = {};


	public socketed!: boolean;
	public definition?: DestinyInventoryItemDefinition;
	public type!: PlugType;
	public perks!: Perk[];
	public objectives!: Objectives.IObjective[];

	private constructor () { }

	public is (...anyOfTypes: PlugType.Query[]) {
		return PlugType.check(this.type, ...anyOfTypes);
	}

	public isNot (...anyOfTypes: PlugType.Query[]) {
		return !PlugType.check(this.type, ...anyOfTypes);
	}

	public async refresh (manifest: Manifest, refresh: Socket.ISocketRefresh, item?: IItemInit) {
		this.objectives = await Objectives.resolve(manifest, refresh.objectives![this.plugItemHash] ?? [], this, item);
	}
}

export interface Perk extends DestinyItemPerkEntryDefinition { }
export class Perk {

	public static async resolve ({ DestinySandboxPerkDefinition }: Manifest, perkEntry: DestinyItemPerkEntryDefinition) {
		const perk = new Perk();
		Object.assign(perk, perkEntry);
		perk.definition = await DestinySandboxPerkDefinition.get(perk.perkHash)!;
		return perk;
	}

	public definition!: DestinySandboxPerkDefinition;
}

namespace Plugs {

	export interface IPlugsProfile {
		itemComponents?: DestinyItemComponentSetOfint64;
		profilePlugSets?: SingleComponentResponse<DestinyPlugSetsComponent>;
	}

	export function resetInitialisedPlugTypes () {
		Plug.initialisedPlugTypes = {};
	}

	export function logInitialisedPlugTypes () {
		console.debug("Initialised plugs:", Plug.initialisedPlugTypes);
	}

	interface SocketData {
		states: DestinyItemSocketState[];
		entries?: DestinyItemSocketEntryDefinition[];
		categories?: DestinyItemSocketCategoryDefinition[];
		plugs: Record<number, DestinyItemPlugBase[]>;
		objectives: Record<number, DestinyObjectiveProgress[]>;
	}

	function getSocketData (profile: IPlugsProfile | undefined, item: IItemInit): SocketData {
		const { socketCategories, socketEntries } = item.definition.sockets ?? {};
		const states = profile?.itemComponents?.sockets.data?.[item.reference.itemInstanceId!]?.sockets ?? [];

		const plugs = profile?.itemComponents?.reusablePlugs.data?.[item.reference.itemInstanceId!]?.plugs ?? {};
		const objectivesByPlug = profile?.itemComponents?.plugObjectives?.data?.[item.reference.itemInstanceId!]?.objectivesPerPlug ?? {};

		return {
			states,
			entries: socketEntries,
			categories: socketCategories,
			plugs,
			objectives: objectivesByPlug,
		};
	}

	export async function apply (manifest: Manifest, profile: IPlugsProfile | undefined, item: IItemInit) {
		const { states, entries, categories, plugs, objectives } = getSocketData(profile, item);

		return item.sockets = (async (): Promise<(Socket | undefined)[]> => {

			const sockets = await Promise.all((entries ?? [])
				.map(async (definition, i) => Socket.resolve(manifest, {
					definition,
					state: states[i],
					category: categories?.find(category => category.socketIndexes.includes(i)),
					plugs: plugs[i],
					objectives,
				}, item, i)));

			item.sockets = sockets;
			return item.sockets;
		})();
	}

	export async function refresh (manifest: Manifest, profile: IPlugsProfile | undefined, item: Item) {
		const { states, categories, plugs, objectives } = getSocketData(profile, item);

		for (let i = 0; i < item.sockets.length; i++) {
			const socket = item.sockets[i];
			await socket?.refresh(manifest, {
				state: states[i],
				category: categories?.find(category => category.socketIndexes.includes(i)),
				plugs: plugs[i],
				objectives,
			});
		}
	}
}

export default Plugs;
