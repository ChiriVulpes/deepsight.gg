import type { DestinyInventoryItemDefinition, DestinyItemComponentSetOfint64, DestinyItemPerkEntryDefinition, DestinyItemPlugBase, DestinyItemSocketCategoryDefinition, DestinyItemSocketEntryDefinition, DestinyItemSocketEntryPlugItemRandomizedDefinition, DestinyItemSocketState, DestinyObjectiveProgress, DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2";
import { ItemCategoryHashes, PlugCategoryHashes } from "bungie-api-ts/destiny2";
import type { IItemInit } from "model/models/items/Item";
import Objectives from "model/models/items/Objectives";
import Manifest from "model/models/Manifest";
import Maths from "utility/maths/Maths";

export interface Socket extends Omit<Socket.ISocketInit, "plugs"> {
	type: PlugType;
}

export class Socket {

	public static filterByPlugs (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bits(type);
		return sockets.filter((socket): socket is Socket.Socketed => types.everyIn(socket?.socketedPlug?.type ?? PlugType.None));
	}

	public static filterExcludePlugs (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bits(type);
		return sockets.filter((socket): socket is Socket.Socketed => !!socket?.socketedPlug?.type && !types.someIn(socket?.socketedPlug?.type ?? PlugType.None));
	}

	public static filterType (sockets: (Socket | undefined)[], type: PlugType) {
		if (!type)
			return [];

		const types = Maths.bits(type);
		return sockets.filter((socket): socket is Socket => types.every(type => socket?.is(type)));
	}

	public static filterExcludeType (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bits(type);
		return sockets.filter((socket): socket is Socket => types.every(type => socket?.isNot(type)));
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
		socket.plugs = await Promise.all(plugs.map(plug => /*plug instanceof Plug ? plug :*/ Plug.resolve(manifest, plug)));
		let socketedPlug = socket.plugs.find(plug => plug.plugItemHash === currentPlugHash);
		if (!socketedPlug && currentPlugHash) {
			socketedPlug = await Plug.resolveFromHash(manifest, currentPlugHash, init.state?.isEnabled ?? true);
			if (socketedPlug)
				socket.plugs.push(socketedPlug);
		}

		socket.socketedPlug = socketedPlug;
		// }

		if (socket.socketedPlug)
			socket.socketedPlug.socketed = true;

		for (const plug of socket.plugs) {
			plug.objectives = await Objectives.resolve(manifest, init.objectives![plug.plugItemHash] ?? [], plug, item);
			socket.type |= plug.type;
		}

		return socket;
	}

	public socketedPlug?: Plug;
	public plugs!: Plug[];
	public type = PlugType.None;

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

	public is (type: PlugType) {
		return Maths.bits(type).everyIn(this.type);
	}

	public isNot (type: PlugType) {
		return !Maths.bits(type).someIn(this.type);
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


export enum PlugType {
	None = 0,
	Perk = 2 ** 0,
	Trait = 2 ** 1,
	Intrinsic = 2 ** 2,
	Origin = 2 ** 3,
	Enhanced = 2 ** 4,
	Mod = 2 ** 5,
	Shader = 2 ** 6,
	Masterwork = 2 ** 7,
	Tracker = 2 ** 8,
	Shaped = 2 ** 9,
	Ornament = 2 ** 10,
	Memento = 2 ** 11,
	DefaultOrnament = 2 ** 12,
	Catalyst = 2 ** 13,
	EmptyCatalyst = 2 ** 14,
	DeepsightResonance = 2 ** 15,
	CraftingTransfusers = 2 ** 16,
	DeepsightActivation = 2 ** 17,
}

export namespace PlugType {
	export const ALL: PlugType = Object.values(PlugType)
		.filter((value): value is number => typeof value === "number")
		.reduce((p, v) => p | v, 0);
}

type PlugBaseStuff = { [KEY in keyof DestinyItemPlugBase as KEY extends keyof DestinyItemSocketEntryPlugItemRandomizedDefinition ? never : KEY]?: DestinyItemPlugBase[KEY] };
type ItemSocketEntryPlugStuff = { [KEY in keyof DestinyItemSocketEntryPlugItemRandomizedDefinition as KEY extends keyof DestinyItemPlugBase ? never : KEY]?: DestinyItemSocketEntryPlugItemRandomizedDefinition[KEY] };
type SharedStuff = { [KEY in keyof DestinyItemPlugBase as KEY extends keyof DestinyItemSocketEntryPlugItemRandomizedDefinition ? KEY : never]: DestinyItemPlugBase[KEY] };

interface PlugDef {
	definition?: DestinyInventoryItemDefinition;
	type: PlugType;
	perks: Perk[];
}

export interface Plug extends PlugBaseStuff, ItemSocketEntryPlugStuff, SharedStuff { }
export class Plug {

	public static async resolveFromHash (manifest: Manifest, hash: number, enabled: boolean) {
		return Plug.resolve(manifest, {
			plugItemHash: hash,
			canInsert: true,
			enabled,
			insertFailIndexes: [],
			enableFailIndexes: enabled ? [] : [-1],
		});
	}

	private static plugDefsCacheTime = 0;
	private static plugDefs: Record<number, PlugDef> = {};

	public static async resolve (manifest: Manifest, plugBase: DestinyItemPlugBase | DestinyItemSocketEntryPlugItemRandomizedDefinition) {
		const plug = new Plug();
		Object.assign(plug, plugBase);
		plug.socketed = false;

		const manifestCacheTime = Manifest.getCacheTime();
		if (Plug.plugDefsCacheTime < manifestCacheTime) {
			Plug.plugDefsCacheTime = manifestCacheTime;
			Plug.plugDefs = {};
		}

		const plugDef = Plug.plugDefs[plug.plugItemHash] ??= await Plug.resolvePlugDef(manifest, plug.plugItemHash);
		Object.assign(plug, plugDef);
		return plug;
	}

	private static async resolvePlugDef (manifest: Manifest, hash: number): Promise<PlugDef> {

		const { DestinyInventoryItemDefinition } = manifest;
		const definition = await DestinyInventoryItemDefinition.get(hash);

		return {
			definition,
			type: !definition ? PlugType.None : Plug.resolvePlugType(definition),
			perks: await Promise.all((definition?.perks ?? []).map(perk => Perk.resolve(manifest, perk))),
		};
	}

	public static initialisedPlugTypes: Partial<Record<keyof typeof PlugType, number>> = {};

	public static resolvePlugType (definition: DestinyInventoryItemDefinition) {
		let type = PlugType.None;
		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.Intrinsics) {
			type |= PlugType.Intrinsic | PlugType.Trait;
			if (definition.itemTypeDisplayName.includes("Enhanced")) // Ugh
				type |= PlugType.Enhanced;
		}

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.Origins)
			type |= PlugType.Origin | PlugType.Trait;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.Shader)
			type |= PlugType.Shader;

		if (definition.plug?.plugCategoryIdentifier.includes(".masterworks.")) // Ugh
			type |= PlugType.Masterwork;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.V400PlugsWeaponsMasterworksTrackers)
			type |= PlugType.Tracker;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.CraftingPlugsFrameIdentifiers)
			type |= PlugType.Shaped;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.Mementos)
			type |= PlugType.Memento;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.ExoticAllSkins || definition.plug?.plugCategoryHash === PlugCategoryHashes.ArmorSkinsEmpty)
			type |= PlugType.DefaultOrnament;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.V400EmptyExoticMasterwork)
			type |= PlugType.EmptyCatalyst;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.CraftingPlugsWeaponsModsTransfusersLevel)
			type |= PlugType.CraftingTransfusers;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.CraftingPlugsWeaponsModsMemories)
			type |= PlugType.DeepsightResonance;

		if (definition.hash === 1961918267)
			type |= PlugType.DeepsightActivation;

		if (definition && this.isOrnament(definition))
			type |= PlugType.Ornament;

		if (definition.traitIds?.includes("item_type.exotic_catalyst"))
			type |= PlugType.Catalyst;

		if (!type && definition.itemCategoryHashes?.includes(ItemCategoryHashes.ArmorMods) || definition.itemTypeDisplayName?.endsWith("Ghost Mod"))
			type |= PlugType.Mod;

		if (!type && (definition.tooltipStyle === "build" || definition.plug?.plugCategoryHash === PlugCategoryHashes.Scopes)) { // Ugh
			type |= PlugType.Perk;
			if (definition.itemTypeDisplayName.includes("Enhanced")) // Ugh
				type |= PlugType.Enhanced;
		}

		if (!type && definition.itemCategoryHashes?.includes(ItemCategoryHashes.WeaponMods))
			type |= PlugType.Mod;

		for (const t of Maths.bits(type)) {
			Plug.initialisedPlugTypes[PlugType[t] as keyof typeof PlugType] ??= 0;
			Plug.initialisedPlugTypes[PlugType[t] as keyof typeof PlugType]!++;
		}

		return type;
	}

	private static isOrnament (definition: DestinyInventoryItemDefinition) {
		if (!definition.traitIds) return false;

		for (const traitId of definition.traitIds) {
			switch (traitId) {
				case "item_type.armor":
				case "item_type.ornament.armor":
				case "item_type.weapon":
				case "item_type.ornament.weapon":
				case "item.ornament.armor":
				case "item.ornament.weapon":
					return true;
				default:
					if (traitId.startsWith("item.armor"))
						return true;
			}
		}

		return false;
	}

	public socketed!: boolean;
	public definition?: DestinyInventoryItemDefinition;
	public type!: PlugType;
	public perks!: Perk[];
	public objectives!: Objectives.IObjective[];

	private constructor () { }

	public is (type: PlugType) {
		const types = Maths.bits(type);
		return types.everyIn(this.type);
	}

	public isNot (type: PlugType) {
		const types = Maths.bits(type);
		return !types.someIn(this.type);
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
		itemComponents?: DestinyItemComponentSetOfint64,
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
