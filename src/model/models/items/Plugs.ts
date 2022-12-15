import type { DestinyInventoryItemDefinition, DestinyItemComponentSetOfint64, DestinyItemPerkEntryDefinition, DestinyItemPlugBase, DestinyItemSocketState, DestinySandboxPerkDefinition } from "bungie-api-ts/destiny2";
import { ItemCategoryHashes, PlugCategoryHashes } from "bungie-api-ts/destiny2";
import type { IItemInit } from "model/models/items/Item";
import type Manifest from "model/models/Manifest";
import Maths from "utility/maths/Maths";
import Objects from "utility/Objects";

export interface Socket extends DestinyItemSocketState { }
export class Socket {

	public static filterByPlugs (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bits(type) as PlugType[];
		return sockets.filter((socket): socket is SocketSocketed => types.every(type => (socket?.socketedPlug?.type ?? PlugType.None) & type));
	}

	public static filterExcludePlugs (sockets: (Socket | undefined)[], type: PlugType) {
		const types = Maths.bits(type) as PlugType[];
		return sockets.filter((socket): socket is SocketSocketed => !!socket?.socketedPlug?.type && !types.some(type => (socket?.socketedPlug?.type ?? PlugType.None) & type));
	}

	public static async resolve (manifest: Manifest, socketState: DestinyItemSocketState, plugs: DestinyItemPlugBase[]) {
		const socket = Objects.inherit(socketState, Socket);
		socket.plugs = await Promise.all(plugs.map(plug => Plug.resolve(manifest, plug)));
		let socketedPlug = socket.plugs.find(plug => plug.plugItemHash === socket.plugHash);
		if (!socketedPlug && socket.plugHash !== undefined) {
			socketedPlug = await Plug.resolveFromHash(manifest, socket.plugHash, socket.isEnabled);
			if (socketedPlug)
				socket.plugs.push(socketedPlug);
		}

		socket.socketedPlug = socketedPlug;

		if (socket.socketedPlug)
			socket.socketedPlug.socketed = true;

		return socket;
	}

	public socketedPlug?: Plug;
	public plugs!: Plug[];

	private constructor () { }
}

export interface SocketSocketed extends Socket {
	socketedPlug: Plug;
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
}

export interface Plug extends DestinyItemPlugBase { }
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

	public static async resolve (manifest: Manifest, plugBase: DestinyItemPlugBase) {
		const plug = Objects.inherit(plugBase, Plug);
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

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.V400PlugsWeaponsMasterworks)
			type |= PlugType.Masterwork;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.V400PlugsWeaponsMasterworksTrackers)
			type |= PlugType.Tracker;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.CraftingPlugsFrameIdentifiers)
			type |= PlugType.Shaped;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.Mementos)
			type |= PlugType.Memento;

		if (plug.definition?.plug?.plugCategoryHash === PlugCategoryHashes.ExoticAllSkins)
			type |= PlugType.DefaultOrnament;

		if (["item_type.armor", "item_type.ornament.armor", "item_type.weapon", "item_type.ornament.weapon"].some(traitId => plug.definition?.traitIds?.includes(traitId)))
			type |= PlugType.Ornament;

		if (plug.definition?.traitIds?.includes("item_type.exotic_catalyst"))
			type |= PlugType.Catalyst;

		if (!type && plug.definition?.itemCategoryHashes?.includes(ItemCategoryHashes.ArmorMods))
			type |= PlugType.Mod;

		if (!type && plug.definition?.tooltipStyle === "build") { // Ugh
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
		const perk = Objects.inherit(perkEntry, Perk);
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
		const sockets = profile.itemComponents?.sockets.data?.[item.reference.itemInstanceId!]?.sockets ?? [];
		const plugs = profile.itemComponents?.reusablePlugs.data?.[item.reference.itemInstanceId!]?.plugs ?? [];
		return item.sockets = Promise.all(sockets.map((socket, i) => Socket.resolve(manifest, socket, plugs[i] ?? [])))
			.then(sockets => {
				item.sockets = sockets;
				return sockets;
			});
	}
}

export default Plugs;
