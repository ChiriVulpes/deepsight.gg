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
		const types = Maths.bits(type) as PlugType[];
		return sockets.filter((socket): socket is Socket.Socketed => types.every(type => (socket?.socketedPlug?.type ?? PlugType.None) & type));
	}

	public static filterExcludePlugs (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bits(type) as PlugType[];
		return sockets.filter((socket): socket is Socket.Socketed => !!socket?.socketedPlug?.type && !types.some(type => (socket?.socketedPlug?.type ?? PlugType.None) & type));
	}

	public static filterType (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bits(type) as PlugType[];
		return sockets.filter((socket): socket is Socket => types.every(type => socket?.is(type)));
	}

	public static filterExcludeType (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bits(type) as PlugType[];
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

		const plugs = socket.state ? init.plugs : await Promise.resolve(DestinyPlugSetDefinition.get(plugSetHash, item?.bucket !== "collections"))
			.then(plugSet => plugSet?.reusablePlugItems ?? []);

		socket.plugs = await Promise.all(plugs.map(plug => Plug.resolve(manifest, plug)));
		const currentPlugHash = init.state?.plugHash ?? socket.definition.singleInitialItemHash;
		let socketedPlug = socket.plugs.find(plug => plug.plugItemHash === currentPlugHash);
		if (!socketedPlug && currentPlugHash) {
			socketedPlug = await Plug.resolveFromHash(manifest, currentPlugHash, init.state?.isEnabled ?? true);
			if (socketedPlug)
				socket.plugs.push(socketedPlug);
		}

		socket.socketedPlug = socketedPlug;

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
		const types = Maths.bits(type) as PlugType[];
		return types.every(type => this.type & type);
	}

	public isNot (type: PlugType) {
		const types = Maths.bits(type) as PlugType[];
		return !types.some(type => this.type & type);
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

type PlugBaseStuff = { [KEY in keyof DestinyItemPlugBase as KEY extends keyof DestinyItemSocketEntryPlugItemRandomizedDefinition ? never : KEY]?: DestinyItemPlugBase[KEY] };
type ItemSocketEntryPlugStuff = { [KEY in keyof DestinyItemSocketEntryPlugItemRandomizedDefinition as KEY extends keyof DestinyItemPlugBase ? never : KEY]?: DestinyItemSocketEntryPlugItemRandomizedDefinition[KEY] };
type SharedStuff = { [KEY in keyof DestinyItemPlugBase as KEY extends keyof DestinyItemSocketEntryPlugItemRandomizedDefinition ? KEY : never]: DestinyItemPlugBase[KEY] };

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

	public static async resolve (manifest: Manifest, plugBase: DestinyItemPlugBase | DestinyItemSocketEntryPlugItemRandomizedDefinition) {
		const plug = new Plug();
		Object.assign(plug, plugBase);
		plug.socketed = false;
		const { DestinyInventoryItemDefinition } = manifest;
		plug.definition = await DestinyInventoryItemDefinition.get(plug.plugItemHash);
		plug.type = Plug.resolvePlugType(plug);
		plug.perks = await Promise.all((plug.definition?.perks ?? []).map(perk => Perk.resolve(manifest, perk)));
		return plug;
	}

	public static resolvePlugType (plug: Plug) {
		let type = PlugType.None;
		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.Intrinsics) {
			type |= PlugType.Intrinsic | PlugType.Trait;
			if (plug.definition.itemTypeDisplayName.includes("Enhanced")) // Ugh
				type |= PlugType.Enhanced;
		}

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.Origins)
			type |= PlugType.Origin | PlugType.Trait;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.Shader)
			type |= PlugType.Shader;

		if (plug.definition?.plug?.uiPlugLabel === "masterwork") // Ugh
			type |= PlugType.Masterwork;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.V400PlugsWeaponsMasterworksTrackers)
			type |= PlugType.Tracker;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.CraftingPlugsFrameIdentifiers)
			type |= PlugType.Shaped;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.Mementos)
			type |= PlugType.Memento;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.ExoticAllSkins || plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.ArmorSkinsEmpty)
			type |= PlugType.DefaultOrnament;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.V400EmptyExoticMasterwork)
			type |= PlugType.EmptyCatalyst;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.CraftingPlugsWeaponsModsTransfusersLevel)
			type |= PlugType.CraftingTransfusers;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.CraftingPlugsWeaponsModsMemories)
			type |= PlugType.DeepsightResonance;

		if (plug.plugItemHash === 1961918267)
			type |= PlugType.DeepsightActivation;

		if (["item_type.armor", "item_type.ornament.armor", "item_type.weapon", "item_type.ornament.weapon", "item.ornament.armor", "item.ornament.weapon", "item.armor.*"]
			.some(traitId => plug.definition?.traitIds
				?.some(checkId => false
					|| checkId === traitId
					|| (traitId.endsWith(".*") && checkId.startsWith(traitId.slice(0, -2))))))
			type |= PlugType.Ornament;

		if (plug.definition?.traitIds?.includes("item_type.exotic_catalyst"))
			type |= PlugType.Catalyst;

		if (!type && plug.definition?.itemCategoryHashes?.includes(ItemCategoryHashes.ArmorMods))
			type |= PlugType.Mod;

		if (!type && (plug.definition?.tooltipStyle === "build" || plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.Scopes)) { // Ugh
			type |= PlugType.Perk;
			if (plug.definition.itemTypeDisplayName.includes("Enhanced")) // Ugh
				type |= PlugType.Enhanced;
		}

		if (!type && plug.definition?.itemCategoryHashes?.includes(ItemCategoryHashes.WeaponMods))
			type |= PlugType.Mod;

		return type;
	}

	public socketed!: boolean;
	public definition?: DestinyInventoryItemDefinition;
	public type!: PlugType;
	public perks!: Perk[];
	public objectives!: Objectives.IObjective[];

	private constructor () { }

	public is (type: PlugType) {
		const types = Maths.bits(type) as PlugType[];
		return types.every(type => this.type & type);
	}

	public isNot (type: PlugType) {
		const types = Maths.bits(type) as PlugType[];
		return !types.some(type => this.type & type);
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
