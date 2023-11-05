import type { DestinyInventoryItemDefinition, DestinyItemComponentSetOfint64, DestinyItemPerkEntryDefinition, DestinyItemPlugBase, DestinyItemSocketCategoryDefinition, DestinyItemSocketEntryDefinition, DestinyItemSocketEntryPlugItemRandomizedDefinition, DestinyItemSocketState, DestinyObjectiveProgress, DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2";
import type { DeepsightPlugCategorisation, DeepsightPlugCategory, DeepsightPlugCategoryName, DeepsightPlugFullName } from "manifest.deepsight.gg/plugs";
import Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";
import Objectives from "model/models/items/Objectives";
import { ClarityManifest } from "model/models/manifest/ClarityManifest";
import Async from "utility/Async";
import type { ClarityDescription } from "utility/endpoint/clarity/endpoint/GetClarityDescriptions";

type PlugCat = DeepsightPlugCategoryName;
type PlugType<CATEGORY extends DeepsightPlugCategory = DeepsightPlugCategory> = DeepsightPlugFullName<CATEGORY>;

namespace PlugType {
	export const None = "None" as const;

	export type Query = PlugCat | PlugType | `=${PlugCat | PlugType}` | `!${PlugCat | PlugType | `=${PlugCat | PlugType}`}`;

	export function check (type?: PlugType, ...fragments: Query[]) {
		if (!type)
			return false;

		let found = false;
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
				return false;

			found ||= startsWith;
		}

		return found;
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

	public static async resolve (manifest: Manifest, init: Socket.ISocketInit, item?: IItemInit, index?: number) {
		const socket = new Socket();
		Object.assign(socket, init);
		delete socket.objectives;

		const { DestinyPlugSetDefinition, DestinyInventoryItemDefinition } = manifest;

		let plugSetHash = socket.definition.randomizedPlugSetHash ?? socket.definition.reusablePlugSetHash;
		if (item?.deepsight?.pattern && index !== undefined) {
			const recipeItem = await DestinyInventoryItemDefinition.get(item.definition.inventory?.recipeItemHash);
			const recipeSocket = recipeItem?.sockets?.socketEntries[index];
			if (recipeSocket) {
				plugSetHash = recipeSocket.randomizedPlugSetHash ?? recipeSocket.reusablePlugSetHash;
			}
		}

		type PlugRaw = DestinyItemPlugBase | DestinyItemSocketEntryPlugItemRandomizedDefinition;
		const plugs: (PlugRaw /*| Plug*/)[] = socket.state ? init.plugs : await Promise.resolve(DestinyPlugSetDefinition.get(plugSetHash))
			.then(plugSet => plugSet?.reusablePlugItems ?? []);

		const currentPlugHash = init.state?.plugHash ?? socket.definition.singleInitialItemHash;

		// plugs[0] = await Plug.resolve(manifest, plugs[0] as PlugRaw);
		// if (plugs[0].type & PlugType.Shader) {
		// 	socket.socketedPlug = plugs[0];

		// } else {
		socket.plugs = [];
		let lastPause = Date.now();
		for (const plug of plugs) {
			socket.plugs.push(/*plug instanceof Plug ? plug :*/ await Plug.resolve(manifest, plug, item));
			if (Date.now() - lastPause > 30) {
				await Async.sleep(1);
				lastPause = Date.now();
			}
		}

		let socketedPlug = socket.plugs.find(plug => plug.plugItemHash === currentPlugHash);
		if (!socketedPlug && currentPlugHash) {
			socketedPlug = await Plug.resolveFromHash(manifest, currentPlugHash, init.state?.isEnabled ?? true, item);
			if (socketedPlug && socket.state)
				socket.plugs.push(socketedPlug);
		}

		socket.socketedPlug = socketedPlug;
		// }

		if (socket.socketedPlug)
			socket.socketedPlug.socketed = true;

		for (const plug of [...socket.plugs, socket.socketedPlug]) {
			if (!plug)
				continue;

			plug.objectives = await Objectives.resolve(manifest, init.objectives![plug.plugItemHash] ?? [], plug, item);
			socket.types.add(plug.type);
		}

		if (socket.types.size <= 1) {
			const [type] = socket.types;
			socket.type = type ?? PlugType.None;
		}

		return socket;
	}

	public socketedPlug?: Plug;
	public plugs!: Plug[];
	public type?: PlugType;
	public types = new Set<PlugType>();

	private constructor () { }

	public async getPool () {
		if (!this.state)
			return this.plugs;

		const manifest = await Manifest.await();
		const { DestinyPlugSetDefinition } = manifest;
		return await Promise.resolve(DestinyPlugSetDefinition.get(this.definition.randomizedPlugSetHash ?? this.definition.reusablePlugSetHash))
			.then(plugSet => plugSet?.reusablePlugItems ?? [])
			.then(plugs => Promise.all(plugs.map(plug => Plug.resolve(manifest, plug))));
	}

	public is (...anyOfTypes: PlugType.Query[]) {
		return PlugType.check(this.type, ...anyOfTypes);
	}

	public isNot (...anyOfTypes: PlugType.Query[]) {
		return !PlugType.check(this.type, ...anyOfTypes);
	}
}

export namespace Socket {

	export interface Socketed extends Socket {
		socketedPlug: Plug;
	}

	export interface ISocketInit {
		definition: DestinyItemSocketEntryDefinition;
		state?: DestinyItemSocketState;
		category?: DestinyItemSocketCategoryDefinition;
		plugs: DestinyItemPlugBase[];
		objectives?: Record<number, DestinyObjectiveProgress[]>;
	}
}

type PlugBaseStuff = { [KEY in keyof DestinyItemPlugBase as KEY extends keyof DestinyItemSocketEntryPlugItemRandomizedDefinition ? never : KEY]?: DestinyItemPlugBase[KEY] };
type ItemSocketEntryPlugStuff = { [KEY in keyof DestinyItemSocketEntryPlugItemRandomizedDefinition as KEY extends keyof DestinyItemPlugBase ? never : KEY]?: DestinyItemSocketEntryPlugItemRandomizedDefinition[KEY] };
type SharedStuff = { [KEY in keyof DestinyItemPlugBase as KEY extends keyof DestinyItemSocketEntryPlugItemRandomizedDefinition ? KEY : never]: DestinyItemPlugBase[KEY] };

interface PlugDef {
	definition?: DestinyInventoryItemDefinition;
	clarity?: ClarityDescription;
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

	public static async resolve (manifest: Manifest, plugBase: DestinyItemPlugBase | DestinyItemSocketEntryPlugItemRandomizedDefinition, item?: IItemInit) {
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

		const { DestinyInventoryItemDefinition, DeepsightPlugCategorisation } = manifest;
		const definition = await DestinyInventoryItemDefinition.get(hash);
		const clarity = definition && await (await ClarityManifest.await()).ClarityDescriptions.get(hash);
		const categorisation = await DeepsightPlugCategorisation.get(hash);

		return {
			definition,
			clarity,
			type: categorisation?.fullName,
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
	}

	export function resetInitialisedPlugTypes () {
		Plug.initialisedPlugTypes = {};
	}

	export function logInitialisedPlugTypes () {
		console.debug("Initialised plugs:", Plug.initialisedPlugTypes);
	}

	export async function apply (manifest: Manifest, profile: IPlugsProfile, item: IItemInit) {
		return item.sockets = (async (): Promise<(Socket | undefined)[]> => {
			const { socketCategories, /*intrinsicSockets,*/ socketEntries } = item.definition.sockets ?? {};
			const states = profile.itemComponents?.sockets.data?.[item.reference.itemInstanceId!]?.sockets ?? [];

			const plugs = profile.itemComponents?.reusablePlugs.data?.[item.reference.itemInstanceId!]?.plugs ?? {};
			const objectivesByPlug = profile.itemComponents?.plugObjectives?.data?.[item.reference.itemInstanceId!]?.objectivesPerPlug ?? {};

			const sockets = await Promise.all((socketEntries ?? [])
				.map(async (definition, i) => Socket.resolve(manifest, {
					definition,
					state: states[i],
					category: socketCategories?.find(category => category.socketIndexes.includes(i)),
					plugs: plugs[i] ?? [],
					objectives: objectivesByPlug,
				}, item, i)));

			item.sockets = sockets;

			return item.sockets;
		})();
	}
}

export default Plugs;
