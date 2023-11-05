import type { DestinyCollectibleDefinition, DestinyInventoryItemDefinition, DestinyItemComponent, DestinyItemInstanceComponent, DestinyItemTierTypeDefinition } from "bungie-api-ts/destiny2";
import { BucketHashes, DestinyCollectibleState, ItemBindStatus, ItemLocation, ItemState, StatHashes, TransferStatuses } from "bungie-api-ts/destiny2";
import type { DeepsightMomentDefinition } from "manifest.deepsight.gg";
import type Manifest from "model/models/Manifest";
import Collectibles from "model/models/items/Collectibles";
import type { IDeepsight, IWeaponShaped } from "model/models/items/Deepsight";
import Deepsight from "model/models/items/Deepsight";
import Moment from "model/models/items/Moment";
import type { IPerk } from "model/models/items/Perks";
import Perks from "model/models/items/Perks";
import type { PlugType } from "model/models/items/Plugs";
import Plugs, { Socket } from "model/models/items/Plugs";
import type { ISource } from "model/models/items/Source";
import Source from "model/models/items/Source";
import type { IStats } from "model/models/items/Stats";
import Stats from "model/models/items/Stats";
import Tier from "model/models/items/Tier";
import Arrays from "utility/Arrays";
import { EventManager } from "utility/EventManager";
import type { IItemPerkWishlist } from "utility/Store";
import Store from "utility/Store";
import type { Mutable, PromiseOr } from "utility/Type";
import EquipItem from "utility/endpoint/bungie/endpoint/destiny2/actions/items/EquipItem";
import PullFromPostmaster from "utility/endpoint/bungie/endpoint/destiny2/actions/items/PullFromPostmaster";
import SetLockState from "utility/endpoint/bungie/endpoint/destiny2/actions/items/SetLockState";
import TransferItem from "utility/endpoint/bungie/endpoint/destiny2/actions/items/TransferItem";

export type CharacterId = `${bigint}`;
export type PostmasterId = `postmaster:${CharacterId}`;
export type DestinationBucketId = CharacterId | "vault" | "consumables" | "modifications";
export type OwnedBucketId = DestinationBucketId | PostmasterId;
export type BucketId = OwnedBucketId | "collections";
export namespace PostmasterId {
	export function is (id: BucketId): id is PostmasterId {
		return id.startsWith("postmaster:");
	}

	export function character (id: PostmasterId) {
		return id.slice(11) as CharacterId;
	}
}
export namespace CharacterId {
	export function is (id: BucketId): id is CharacterId {
		return id !== "vault" && id !== "consumables" && id !== "modifications" && id !== "collections" && !PostmasterId.is(id);
	}
}

export enum ItemFomoState {
	NoMo,
	TemporaryAvailability,
	TemporaryRepeatability,
}

enum TransferType {
	PullFromPostmaster,
	TransferToVault,
	TransferToCharacterFromVault,
	Equip,
	Unequip,
}

interface ITransferArgs {
	[TransferType.PullFromPostmaster]: [],
	[TransferType.TransferToVault]: [ifNotCharacter?: CharacterId],
	[TransferType.TransferToCharacterFromVault]: [character: CharacterId],
	[TransferType.Equip]: [character: CharacterId],
	[TransferType.Unequip]: [],
}

type Transfer = {
	[TYPE in TransferType]: (
		[type: TYPE, ...args: ITransferArgs[TYPE]] extends infer TRANSFER ?
		Extract<TRANSFER, any[]>["length"] extends 1 ? Extract<TRANSFER, any[]>[number] | TRANSFER : TRANSFER
		: never
	)
} extends infer UNDOS ? UNDOS[keyof UNDOS] : never;

interface ITransferDefinition<TYPE extends TransferType> {
	applicable (item: Item, ...args: ITransferArgs[TYPE]): boolean;
	transfer (item: Item, ...args: ITransferArgs[TYPE]): Promise<ITransferResult>;
}

interface IGenericTransferDefinition {
	applicable (item: Item, ...args: ITransferArgs[TransferType]): boolean;
	transfer (item: Item, ...args: ITransferArgs[TransferType]): Promise<ITransferResult>;
}

interface ITransferResult {
	bucket: DestinationBucketId;
	equipped?: true;
	undo?: Transfer;
}

const TRANSFERS: { [TYPE in TransferType]: ITransferDefinition<TYPE> } = {
	[TransferType.PullFromPostmaster]: {
		applicable: item => PostmasterId.is(item.bucket),
		transfer: async item => {
			if (!PostmasterId.is(item.bucket))
				throw new Error("Not in postmaster bucket");

			const characterId = PostmasterId.character(item.bucket);
			await PullFromPostmaster.query(item, characterId);
			return { bucket: characterId };
		},
	},
	[TransferType.TransferToVault]: {
		applicable: (item, ifNotCharacter) => CharacterId.is(item.bucket) && item.bucket !== ifNotCharacter,
		transfer: async item => {
			if (!CharacterId.is(item.bucket))
				throw new Error("Not in character bucket");

			const characterId = item.bucket;
			await TransferItem.query(item, characterId, "vault");
			return {
				bucket: "vault",
				undo: [TransferType.TransferToCharacterFromVault, characterId],
			};
		},
	},
	[TransferType.TransferToCharacterFromVault]: {
		applicable: item => item.bucket === "vault",
		transfer: async (item, characterId) => {
			if (item.bucket !== "vault")
				throw new Error("Not in vault bucket");

			await TransferItem.query(item, characterId);
			return {
				bucket: characterId,
				undo: [TransferType.TransferToVault],
			};
		},
	},
	[TransferType.Equip]: {
		applicable: item => CharacterId.is(item.bucket) && !item.equipped,
		transfer: async (item, characterId) => {
			if (!CharacterId.is(item.bucket))
				throw new Error("Not in character bucket");

			if (item.equipped)
				throw new Error("Already equipped");

			await EquipItem.query(item, characterId);
			return {
				bucket: characterId,
				equipped: true,
				undo: [TransferType.TransferToVault],
			};
		},
	},
	[TransferType.Unequip]: {
		applicable: item => CharacterId.is(item.bucket) && !!item.equipped,
		transfer: async item => {
			if (!CharacterId.is(item.bucket))
				throw new Error("Not in character bucket");

			if (!item.equipped)
				throw new Error("Not equipped");

			const characterId = item.bucket;

			await item.unequip();
			return {
				bucket: characterId,
				undo: [TransferType.Equip, characterId],
			};
		},
	},
};

export type ItemId = `hash:${bigint}` | `${bigint}`;

export interface IItemInit {
	id: ItemId;
	reference: DestinyItemComponent;
	definition: DestinyInventoryItemDefinition;
	bucket: BucketId;
	lastModified: number;
	instance?: DestinyItemInstanceComponent;
	sockets?: PromiseOr<(Socket | undefined)[]>;
	moment?: DeepsightMomentDefinition;
	deepsight?: IDeepsight;
	shaped?: IWeaponShaped;
	stats?: IStats;
	perks?: IPerk[];
	tier?: DestinyItemTierTypeDefinition;
	collectible?: DestinyCollectibleDefinition;
	/**
	 * - None: 0
	 * - NotAcquired: 1  
	 * If this flag is set, you have not yet obtained this collectible.
	 * - Obscured: 2  
	 * If this flag is set, the item is "obscured" to you: you can/should use the alternate item hash found in DestinyCollectibleDefinition.stateInfo.obscuredOverrideItemHash when displaying this collectible instead of the default display info.
	 * - Invisible: 4  
	 * If this flag is set, the collectible should not be shown to the user.  
	 * Please do consider honoring this flag. It is used - for example - to hide items that a person didn't get from the Eververse. I can't prevent these from being returned in definitions, because some people may have acquired them and thus they should show up: but I would hate for people to start feeling some variant of a Collector's Remorse about these items, and thus increasing their purchasing based on that compulsion. That would be a very unfortunate outcome, and one that I wouldn't like to see happen. So please, whether or not I'm your mom, consider honoring this flag and don't show people invisible collectibles.
	 * - CannotAffordMaterialRequirements: 8  
	 * If this flag is set, the collectible requires payment for creating an instance of the item, and you are lacking in currency. Bring the benjamins next time. Or spinmetal. Whatever.
	 * - InventorySpaceUnavailable: 16  
	 * If this flag is set, you can't pull this item out of your collection because there's no room left in your inventory.
	 * - UniquenessViolation: 32  
	 * If this flag is set, you already have one of these items and can't have a second one.
	 * - PurchaseDisabled: 64  
	 * If this flag is set, the ability to pull this item out of your collection has been disabled.
	 */
	collectibleState?: number;
	collections?: Item;
	sources?: ISource[];
}

export interface IItem extends IItemInit {
	equipped?: true;
	sockets: (Socket | undefined)[];
}

export interface IItemEvents {
	update: { item: Item };
	loadStart: Event;
	loadEnd: Event;
	bucketChange: { item: Item; oldBucket: OwnedBucketId; equipped?: true };
}

namespace Item {
	export interface IItemProfile extends
		Deepsight.IDeepsightProfile,
		Plugs.IPlugsProfile,
		Stats.IStatsProfile,
		Collectibles.ICollectiblesProfile,
		Source.ISourceProfile {
		lastModified: Date;
	}
}

interface Item extends IItem { }
class Item {

	public static id (reference: DestinyItemComponent, occurrence: number): ItemId {
		return reference.itemInstanceId as `${bigint}` ?? `hash:${reference.itemHash}:${reference.bucketHash}:${occurrence}`;
	}

	public static async resolve (manifest: Manifest, profile: Item.IItemProfile, reference: DestinyItemComponent, bucket: BucketId, occurrence: number) {
		const { DestinyInventoryItemDefinition } = manifest;

		const definition = await DestinyInventoryItemDefinition.get(reference.itemHash);
		if (!definition) {
			console.warn("No item definition for ", reference.itemHash);
			return undefined;
		}

		const invOrVault = reference.bucketHash === BucketHashes.Modifications ? "modifications" : reference.bucketHash === BucketHashes.Consumables ? "consumables" : "vault";
		if ((bucket === "vault" || bucket === "consumables" || bucket === "modifications") && invOrVault !== bucket) {
			return undefined;
		}

		// if (definition.nonTransferrable && reference.bucketHash !== BucketHashes.LostItems && reference.bucketHash !== BucketHashes.Engrams) {
		// 	console.debug(`Skipping "${definition.displayProperties.name}", non-transferrable`);
		// 	return undefined;
		// }

		const item: IItemInit = {
			id: Item.id(reference, occurrence),
			reference,
			definition,
			bucket,
			instance: profile.itemComponents?.instances.data?.[reference.itemInstanceId!],
			lastModified: profile.lastModified.getTime(),
		};

		await Promise.all([
			Plugs.apply(manifest, profile, item),
			Stats.apply(manifest, profile, item),
			Deepsight.apply(manifest, profile, item),
			Moment.apply(manifest, item),
			Tier.apply(manifest, item),
			Collectibles.apply(manifest, profile, item),
			this.addCollections(manifest, profile, item),
			Perks.apply(manifest, profile, item),
		]);

		return new Item(item);
	}

	private static async addCollections (manifest: Manifest, profile: Plugs.IPlugsProfile & Deepsight.IDeepsightProfile & Collectibles.ICollectiblesProfile & Source.ISourceProfile, item: IItemInit) {
		item.collections = await Item.createFake(manifest, profile, item.definition);
	}

	public static async createFake (manifest: Manifest, profile: Plugs.IPlugsProfile & Deepsight.IDeepsightProfile & Collectibles.ICollectiblesProfile & Source.ISourceProfile, definition: DestinyInventoryItemDefinition, source = true) {
		const item: IItemInit = {
			id: `hash:${definition.hash}:collections` as ItemId,
			reference: { itemHash: definition.hash, quantity: 0, bindStatus: ItemBindStatus.NotBound, location: ItemLocation.Unknown, bucketHash: BucketHashes.General, transferStatus: TransferStatuses.NotTransferrable, lockable: false, state: ItemState.None, isWrapper: false, tooltipNotificationIndexes: [], metricObjective: { objectiveHash: -1, complete: false, visible: false, completionValue: 0 }, itemValueVisibility: [] },
			definition,
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			bucket: "collections" as any,
			sockets: [],
			lastModified: Date.now(),
		};

		// deepsight has to finish first because pattern presence is used by plugs
		await Deepsight.apply(manifest, profile, item);

		await Promise.all([
			Plugs.apply(manifest, profile, item),
			Stats.apply(manifest, profile, item),
			Moment.apply(manifest, item),
			Collectibles.apply(manifest, profile, item),
			source && Source.apply(manifest, profile, item),
		]);

		return new Item(item);
	}

	public readonly event = new EventManager<this, IItemEvents>(this);

	public get character () {
		return this.bucket === "vault" || this.bucket === "consumables" || this.bucket === "modifications" || this.bucket === "collections" ? undefined
			: PostmasterId.is(this.bucket) ? PostmasterId.character(this.bucket)
				: this.bucket;
	}

	private _owner!: CharacterId;

	/**
	 * The character this item is in the inventory of, or the current character if the item is somewhere else
	 */
	public get owner () {
		return this.character ?? this._owner;
	}

	public get objectives () {
		return this.sockets.flatMap(socket => socket?.plugs.flatMap(plug => plug.objectives) ?? []);
	}

	public collectibleState!: number;
	public fallbackItem?: Item;

	private constructor (item: IItemInit) {
		Object.assign(this, item);
		this.collectibleState ??= DestinyCollectibleState.None;
	}

	public hasRandomRolls () {
		return this.getSockets("Perk").some(socket => socket.plugs.length > 1);
	}

	public isNotAcquired () {
		return !!(this.collectibleState & DestinyCollectibleState.NotAcquired);
	}

	public isMasterwork () {
		return !!(this.reference.state & ItemState.Masterwork)
			|| (!!this.instance
				&& (this.sockets
					?.filter(socket => socket?.plugs.some(plug => plug.definition?.itemTypeDisplayName === "Enhanced Trait"))
					.length ?? 0) >= 2);
	}

	public hasDeepsight () {
		const hasIncompletePattern = this.deepsight?.pattern && !(this.deepsight.pattern.progress.complete ?? false);
		return !this.deepsight?.resonance ? false : hasIncompletePattern;
	}

	public hasPattern () {
		return !!(this.deepsight?.resonance && this.deepsight?.pattern && !this.deepsight.pattern.progress.complete);
	}

	public canTransfer () {
		return (!PostmasterId.is(this.bucket) || !this.definition.doesPostmasterPullHaveSideEffects)
			&& this.reference.bucketHash !== BucketHashes.Engrams;
	}

	public getPower () {
		const isValidStat = this.instance?.primaryStat?.statHash === StatHashes.Power
			|| this.instance?.primaryStat?.statHash === StatHashes.Attack
			|| this.instance?.primaryStat?.statHash === StatHashes.Defense
			|| this.instance?.primaryStat?.statHash === StatHashes.Speed;
		const primaryStatPower = isValidStat ? this.instance!.primaryStat.value : 0;
		const itemLevelQualityPower = (this.instance?.itemLevel ?? 0) * 10 + (this.instance?.quality ?? 0);
		return Math.max(primaryStatPower, itemLevelQualityPower);
	}

	public isSame (item: Item) {
		return this.id === item.id;
	}

	public getSockets (...anyOfTypes: PlugType.Query[]) {
		return Socket.filterType(this.sockets, ...anyOfTypes);
	}

	public getOrnament () {
		return this.getSockets("=Cosmetic/Ornament")[0]?.socketedPlug;
	}

	/**
	 * Some items are only very rarely available, such as adept raid weapons. Do you have the fomo? You should!
	 */
	public isFomo () {
		for (const source of this.sources ?? []) {
			if (source.isActiveDrop && (source.activityChallenges.some(Source.isWeeklyChallenge) || source.masterActivityDefinition?.activityTypeHash === 2043403989 /* Raid */ || source.masterActivityDefinition?.activityTypeHash === 608898761 /* Dungeon */))
				return ItemFomoState.TemporaryRepeatability;

			if (source.dropTable.dropTable?.[this.definition.hash] || source.dropTable.encounters?.some(encounter => encounter.dropTable?.[this.definition.hash]))
				// always available in specific encounters
				continue;

			if (source.isActiveDrop)
				return ItemFomoState.TemporaryAvailability;

			if (source.masterActivity && source.isActiveMasterDrop)
				return ItemFomoState.TemporaryRepeatability;
		}

		return ItemFomoState.NoMo;
	}

	public shouldTrustBungie () {
		return this.trustTransferUntil < this.lastModified;
	}

	public isLocked () {
		return !!(this.reference.state & ItemState.Locked);
	}

	public isChangingLockState () {
		return !!this.settingLocked;
	}

	private settingLocked?: Promise<void>;
	public async setLocked (locked = true) {
		await this.settingLocked;

		if (this.isLocked() !== locked) {
			this.settingLocked = (async () => {
				let err: Error | undefined;
				await SetLockState.query(this, locked).catch((e: Error) => err = e);
				locked = !err ? locked : !locked;
				const mutableRef = this.reference as Mutable<DestinyItemComponent>;
				if (locked)
					mutableRef.state |= ItemState.Locked;
				else
					mutableRef.state &= ~ItemState.Locked;
			})();

			this.update(this);
			await this.settingLocked;
			delete this.settingLocked;
			this.update(this);
		}

		return locked;
	}

	public update (item: Item) {
		if (item !== this) {
			this.id = item.id;
			this.reference = item.reference;
			if (this.shouldTrustBungie() || !this.bucketHistory?.includes(item.bucket)) {
				delete this.bucketHistory;
				this.bucket = item.bucket;
				this.equipped = item.equipped;
			}
			this.instance = item.instance;
			this.sockets = item.sockets;
			this.moment = item.moment;
			this.deepsight = item.deepsight;
			this.shaped = item.shaped;
			this.stats = item.stats;
		}

		this.event.emit("update", { item: this });
		return this;
	}

	private _transferPromise?: Promise<void>;
	private undoTransfers: Transfer[] = [];
	private bucketHistory?: BucketId[];
	private trustTransferUntil = 0;

	public get transferring () {
		return !!this._transferPromise;
	}

	public async transferrable () {
		while (this._transferPromise)
			await this._transferPromise;
	}

	public transferToBucket (bucket: DestinationBucketId) {
		if (bucket === "consumables" || bucket === "modifications")
			throw new Error("Inventory transfer not implemented yet");

		if (bucket === "vault")
			return this.transferToVault();

		return this.transferToCharacter(bucket);
	}

	public async transferToCharacter (character: CharacterId) {
		if (character === this.bucket)
			return;

		return this.transfer(
			TransferType.PullFromPostmaster,
			TransferType.Unequip,
			...CharacterId.is(this.bucket) ? [Arrays.tuple(TransferType.TransferToVault as const)] : [],
			[TransferType.TransferToCharacterFromVault, character],
		);
	}

	public transferToVault () {
		return this.transfer(
			TransferType.PullFromPostmaster,
			TransferType.Unequip,
			[TransferType.TransferToVault],
		);
	}

	public transferToggleVaulted (character: CharacterId) {
		if (this.bucket === "vault")
			return this.transferToCharacter(character);
		else
			return this.transferToVault();
	}

	public async equip (character: CharacterId) {
		if (this.bucket === character && this.equipped)
			return;

		return this.transfer(
			TransferType.PullFromPostmaster,
			TransferType.Unequip,
			[TransferType.TransferToVault, character],
			[TransferType.TransferToCharacterFromVault, character],
			[TransferType.Equip, character],
		);
	}

	public async unequip () {
		await this.transferrable();
		if (!this.character || !this.fallbackItem) {
			// TODO notify
		} else {
			this.event.emit("loadStart");
			this._transferPromise = this.fallbackItem.equip(this.character);
			await this._transferPromise;
			delete this._transferPromise;
			this.event.emit("loadEnd");
		}
	}

	public pullFromPostmaster () {
		return this.transfer(TransferType.PullFromPostmaster);
	}

	private async transfer (...transfers: Transfer[]) {
		await this.transferrable();
		this.event.emit("loadStart");
		this._transferPromise = this.performTransfer(...transfers);
		await this._transferPromise;
		delete this._transferPromise;
		this.event.emit("loadEnd");
	}

	private async performTransfer (...transfers: Transfer[]) {
		this.undoTransfers.splice(0, Infinity);

		for (let transfer of transfers) {
			transfer = Array.isArray(transfer) ? transfer : [transfer] as Exclude<Transfer, number>;
			const [type, ...args] = transfer;
			const definition = TRANSFERS[type] as IGenericTransferDefinition;
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
			if (!definition.applicable(this, ...args))
				continue;

			try {
				const result = await definition.transfer(this, ...args);

				if (result.undo)
					this.undoTransfers.push(result.undo);
				else
					this.undoTransfers.splice(0, Infinity);

				const oldBucket = this.bucket as OwnedBucketId;
				this.bucketHistory ??= [];
				this.bucketHistory.push(oldBucket);

				this.bucket = result.bucket;
				this.equipped = result.equipped;
				this.trustTransferUntil = Date.now();
				this.event.emit("bucketChange", { item: this, oldBucket, equipped: this.equipped });

			} catch (error) {
				console.error(error);
				if (!Store.items.settingsDisableReturnOnFailure)
					await this.performTransfer(...this.undoTransfers.reverse());
			}
		}
	}

	/**
	 * @returns undefined if there are no wishlists for this item, true if a wishlist matches, false otherwise
	 */
	public async isWishlisted () {
		const wishlists = Store.items[`item${this.definition.hash}PerkWishlists`];
		if (wishlists?.length === 0)
			// the user doesn't want any roll of this item
			return false;

		if (!wishlists)
			// the user hasn't configured wishlists for this item
			return undefined;

		for (const wishlist of Store.items[`item${this.definition.hash}PerkWishlists`] ?? [])
			if (await this.checkMatchesWishlist(wishlist))
				// all sockets match this wishlist!
				return true;

		// none of the wishlists matched
		return false;
	}

	/**
	 * @returns `undefined` if there are no wishlists for this item, `false` if the user doesn't want this item at all,
	 * and an array with matching wishlists otherwise
	 */
	public async getMatchingWishlists () {
		const wishlists = Store.items[`item${this.definition.hash}PerkWishlists`];
		if (!wishlists)
			return undefined;

		if (!wishlists.length)
			return false;

		const matchingWishlists: IItemPerkWishlist[] = [];
		for (const wishlist of wishlists)
			if (await this.checkMatchesWishlist(wishlist))
				matchingWishlists.push(wishlist);

		return matchingWishlists;
	}

	private async checkMatchesWishlist (wishlist: IItemPerkWishlist) {
		for (const socket of this.sockets) {
			const pool = await socket?.getPool();
			if (pool?.some(plug => wishlist.plugs.includes(plug.plugItemHash))) {
				// the full pool for this socket contains a wishlisted plug
				if (!socket?.plugs.some(plug => wishlist.plugs.includes(plug.plugItemHash))) {
					// but the available plugs on this socket don't
					return false;
				}
			}
		}

		return true;
	}

	public getStatTracker () {
		for (const socket of this.sockets) {
			if (!socket?.socketedPlug?.is("Cosmetic/Tracker"))
				continue;

			for (const objective of socket.socketedPlug.objectives) {
				if (!objective.progress.visible)
					continue;

				return objective;
			}
		}
	}
}

export default Item;

Object.assign(window, { Item });
