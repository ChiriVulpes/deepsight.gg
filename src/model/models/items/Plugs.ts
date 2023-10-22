import type { DestinyInventoryItemDefinition, DestinyItemComponentSetOfint64, DestinyItemPerkEntryDefinition, DestinyItemPlugBase, DestinyItemSocketCategoryDefinition, DestinyItemSocketEntryDefinition, DestinyItemSocketEntryPlugItemRandomizedDefinition, DestinyItemSocketState, DestinyObjectiveProgress, DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2";
import { ItemCategoryHashes, PlugCategoryHashes, TraitHashes } from "bungie-api-ts/destiny2";
import Manifest from "model/models/Manifest";
import type { IItemInit } from "model/models/items/Item";
import Objectives from "model/models/items/Objectives";
import { TierHashes } from "model/models/items/Tier";
import { ClarityManifest } from "model/models/manifest/ClarityManifest";
import type { ClarityDescription } from "utility/endpoint/clarity/endpoint/GetClarityDescriptions";
import Maths from "utility/maths/Maths";

export interface Socket extends Omit<Socket.ISocketInit, "plugs"> {
	type: PlugType;
}

export class Socket {

	public static filterByPlugs (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bitsn(type);
		return sockets.filter((socket): socket is Socket.Socketed => types.everyIn(socket?.socketedPlug?.type ?? PlugType.None));
	}

	public static filterExcludePlugs (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bitsn(type);
		return sockets.filter((socket): socket is Socket.Socketed => !!socket?.socketedPlug?.type && !types.someIn(socket?.socketedPlug?.type ?? PlugType.None));
	}

	public static filterType (sockets: (Socket | undefined)[], type: PlugType) {
		if (!type)
			return [];

		const types = Maths.bitsn(type);
		return sockets.filter((socket): socket is Socket => types.every(type => socket?.is(type)));
	}

	public static filterExcludeType (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bitsn(type);
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
		socket.plugs = await Promise.all(plugs.map(plug => /*plug instanceof Plug ? plug :*/ Plug.resolve(manifest, plug, item)));
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
		return Maths.bitsn(type).everyIn(this.type);
	}

	public isNot (type: PlugType) {
		return !Maths.bitsn(type).someIn(this.type);
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

enum PlugTypes {
	None,
	Perk,
	Trait,
	Intrinsic,
	Origin,
	Enhanced,
	Exotic,
	Mod,
	Shader,
	Masterwork,
	Shaped,
	Ornament,
	Memento,
	DefaultOrnament,
	Catalyst,
	EmptyCatalyst,
	DeepsightResonance,
	CraftingTransfusers,
	DeepsightActivation,
	Emote,
	SubclassMod,
	SubclassAspect,
	SubclassFragment,
	SubclassSuper,
	SubclassGrenade,
	SubclassMelee,
	SubclassClassAbility,
	SubclassMovement,
	TransmatEffect,
	Event,
	Tracker,
	Deprecated,
	Locked,
	Enhancer,
	Sparrow,
}

// export namespace PlugType {
// 	export const ALL: PlugType = Object.values(PlugType)
// 		.filter((value): value is number => typeof value === "number")
// 		.reduce((p, v) => p | v, 0);
// }

interface IPlugType extends Record<keyof typeof PlugTypes, bigint> {
	ALL: bigint;
}

const PlugType = Object.fromEntries(Object.entries(PlugTypes)
	.filter(([key]) => isNaN(+key))
	.flatMap(([key, bitIndex]) => {
		const value = bitIndex === 0 ? 0n : 2n ** BigInt(bitIndex as number - 1);
		return [
			[key, value],
			[value, key],
		];
	})) as IPlugType;

PlugType.ALL = Object.values(PlugType)
	.filter((value: bigint): value is bigint => typeof value === "bigint")
	.reduce((p, v) => p | v, 0n);

type PlugType = bigint;

export { PlugType };

console.log(PlugType);

type PlugBaseStuff = { [KEY in keyof DestinyItemPlugBase as KEY extends keyof DestinyItemSocketEntryPlugItemRandomizedDefinition ? never : KEY]?: DestinyItemPlugBase[KEY] };
type ItemSocketEntryPlugStuff = { [KEY in keyof DestinyItemSocketEntryPlugItemRandomizedDefinition as KEY extends keyof DestinyItemPlugBase ? never : KEY]?: DestinyItemSocketEntryPlugItemRandomizedDefinition[KEY] };
type SharedStuff = { [KEY in keyof DestinyItemPlugBase as KEY extends keyof DestinyItemSocketEntryPlugItemRandomizedDefinition ? KEY : never]: DestinyItemPlugBase[KEY] };

interface PlugDef {
	definition?: DestinyInventoryItemDefinition;
	clarity?: ClarityDescription;
	type: PlugType;
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

		const { DestinyInventoryItemDefinition } = manifest;
		const definition = await DestinyInventoryItemDefinition.get(hash);
		const clarity = definition && await (await ClarityManifest.await()).ClarityDescriptions.get(hash);

		return {
			definition,
			clarity,
			type: !definition ? PlugType.None : Plug.resolvePlugType(definition, item),
			perks: await Promise.all((definition?.perks ?? []).map(perk => Perk.resolve(manifest, perk))),
		};
	}

	public static initialisedPlugTypes: Partial<Record<keyof typeof PlugType, number>> = {};

	public static resolvePlugType (definition: DestinyInventoryItemDefinition, item?: IItemInit) {
		let type = PlugType.None;

		if (definition.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies))
			return type;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.Intrinsics) {
			type |= PlugType.Intrinsic | PlugType.Trait;
			if (definition.itemTypeDisplayName.includes("Enhanced")) // Ugh
				type |= PlugType.Enhanced;
		}

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.Origins)
			type |= PlugType.Origin | PlugType.Trait;

		if (definition.hash === 2106726848 || definition.hash === 3665398231)
			type |= PlugType.Trait | PlugType.Locked;

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

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.Emote)
			type |= PlugType.Emote;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.ShipSpawnfx)
			type |= PlugType.TransmatEffect;

		if (definition.traitHashes?.includes(TraitHashes.ItemPlugAspect) || definition.plug?.plugCategoryIdentifier.endsWith(".aspects"))
			type |= PlugType.SubclassMod | PlugType.SubclassAspect;

		else if (definition.traitHashes?.includes(TraitHashes.ItemPlugFragment) || definition.plug?.plugCategoryIdentifier.endsWith(".fragments"))
			type |= PlugType.SubclassMod | PlugType.SubclassFragment;

		else if (definition.plug?.plugCategoryIdentifier.endsWith(".class_abilities"))
			type |= PlugType.SubclassMod | PlugType.SubclassClassAbility;

		else if (definition.plug?.plugCategoryIdentifier.endsWith(".supers"))
			type |= PlugType.SubclassMod | PlugType.SubclassSuper;

		else if (definition.plug?.plugCategoryIdentifier.endsWith(".melee"))
			type |= PlugType.SubclassMod | PlugType.SubclassMelee;

		else if (definition.plug?.plugCategoryIdentifier.endsWith(".grenades"))
			type |= PlugType.SubclassMod | PlugType.SubclassGrenade;

		else if (definition.plug?.plugCategoryIdentifier.endsWith(".movement"))
			type |= PlugType.SubclassMod | PlugType.SubclassMovement;

		if (definition.hash === 1961918267)
			type |= PlugType.DeepsightActivation;

		if (definition && this.isOrnament(definition))
			type |= PlugType.Ornament;

		if (definition.traitIds?.includes("item_type.exotic_catalyst") || definition.traitIds?.includes("item.exotic_catalyst"))
			type |= PlugType.Catalyst;

		if (!type && definition.itemCategoryHashes?.includes(ItemCategoryHashes.ArmorMods) || definition.itemTypeDisplayName?.endsWith("Ghost Mod") || definition.itemTypeDisplayName?.endsWith("Armor Mod"))
			type |= PlugType.Mod;

		if (definition.itemTypeDisplayName?.includes("Deprecated"))
			type |= PlugType.Deprecated;

		if (definition.plug?.plugCategoryIdentifier.startsWith("events."))
			type |= PlugType.Event;

		if (definition.plug?.plugCategoryHash === PlugCategoryHashes.CraftingPlugsWeaponsModsEnhancers)
			type |= PlugType.Enhancer;

		if (definition.itemCategoryHashes?.includes(ItemCategoryHashes.SparrowMods))
			type |= PlugType.Perk | PlugType.Sparrow;

		if (!type && (definition.tooltipStyle === "build" || definition.plug?.plugCategoryHash === PlugCategoryHashes.Scopes)) { // Ugh
			type |= PlugType.Perk;
			if (definition.itemTypeDisplayName.includes("Enhanced")) // Ugh
				type |= PlugType.Enhanced;
		}

		if (definition.inventory?.tierTypeHash === TierHashes.Exotic || (type & PlugType.Intrinsic && item?.definition.inventory?.tierTypeHash === TierHashes.Exotic))
			type |= PlugType.Exotic;

		if (!type && definition.itemCategoryHashes?.includes(ItemCategoryHashes.WeaponMods))
			type |= PlugType.Mod;

		for (const t of Maths.bitsn(type)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			const key = (PlugType as any)[t.toString()] as keyof typeof PlugType;
			Plug.initialisedPlugTypes[key] ??= 0;
			Plug.initialisedPlugTypes[key]!++;
		}

		Plug.initialisedPlugTypes.ALL ??= 0;
		Plug.initialisedPlugTypes.ALL++;

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
		const types = Maths.bitsn(type);
		return types.everyIn(this.type);
	}

	public isNot (type: PlugType) {
		const types = Maths.bitsn(type);
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
