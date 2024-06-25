import type { DamageTypeHashes, InventoryItemHashes } from "@deepsight.gg/enums";
import { InventoryBucketHashes, ItemCategoryHashes, ItemTierTypeHashes, MomentHashes, StatHashes } from "@deepsight.gg/enums";
import { type DeepsightMomentDefinition, type DeepsightTierTypeDefinition } from "@deepsight.gg/interfaces";
import { DeepsightPlugCategory } from "@deepsight.gg/plugs";
import type { DestinyBreakerTypeDefinition, DestinyCollectibleDefinition, DestinyInventoryItemDefinition, DestinyItemComponent, DestinyItemInstanceComponent, DestinyPowerCapDefinition, TierType } from "bungie-api-ts/destiny2";
import { DestinyCollectibleState, DestinyItemType, ItemBindStatus, ItemLocation, ItemState, TransferStatuses } from "bungie-api-ts/destiny2";
import Characters from "model/models/Characters";
import DeepsightStats from "model/models/DeepsightStats";
import type Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import BreakerType from "model/models/items/BreakerType";
import type { BucketId } from "model/models/items/Bucket";
import { Bucket } from "model/models/items/Bucket";
import type { ICatalyst } from "model/models/items/Catalyst";
import Catalyst from "model/models/items/Catalyst";
import Collectibles from "model/models/items/Collectibles";
import type { IDeepsight, IWeaponShaped } from "model/models/items/Deepsight";
import Deepsight from "model/models/items/Deepsight";
import Moment from "model/models/items/Moment";
import type { IPerk } from "model/models/items/Perks";
import Perks from "model/models/items/Perks";
import type { Plug, PlugType } from "model/models/items/Plugs";
import Plugs, { Socket } from "model/models/items/Plugs";
import PowerCap from "model/models/items/PowerCap";
import type { ISource } from "model/models/items/Source";
import Source from "model/models/items/Source";
import type { IStats } from "model/models/items/Stats";
import Stats from "model/models/items/Stats";
import Tier from "model/models/items/Tier";
import StateItemTransfer from "model/models/state/StateItemTransfer";
import StateLock from "model/models/state/StateLock";
import Arrays from "utility/Arrays";
import { EventManager } from "utility/EventManager";
import ProfileManager from "utility/ProfileManager";
import type { IItemPerkWishlist } from "utility/Store";
import Store from "utility/Store";
import type { Mutable, PromiseOr } from "utility/Type";
import EquipItem from "utility/endpoint/bungie/endpoint/destiny2/actions/items/EquipItem";
import PullFromPostmaster from "utility/endpoint/bungie/endpoint/destiny2/actions/items/PullFromPostmaster";
import SetLockState from "utility/endpoint/bungie/endpoint/destiny2/actions/items/SetLockState";
import TransferItem from "utility/endpoint/bungie/endpoint/destiny2/actions/items/TransferItem";

declare const inventory: Inventory;

export type CharacterId = `${bigint}`;

export enum ItemFomoState {
	NoMo,
	TemporaryAvailability,
	TemporaryRepeatability,
	New,
}

const WEAPON_BUCKET_HASHES = new Set([InventoryBucketHashes.KineticWeapons, InventoryBucketHashes.EnergyWeapons, InventoryBucketHashes.PowerWeapons]);
const ARMOUR_BUCKET_HASHES = new Set([InventoryBucketHashes.Helmet, InventoryBucketHashes.Gauntlets, InventoryBucketHashes.ChestArmor, InventoryBucketHashes.LegArmor, InventoryBucketHashes.ClassArmor]);

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
	[TransferType.TransferToCharacterFromVault]: [character: CharacterId, swapBucket?: Bucket],
	[TransferType.Equip]: [character: CharacterId, item?: ItemId],
	[TransferType.Unequip]: [item?: ItemId],
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

interface ITransferResultSideEffect {
	item: Item;
	result: Omit<ITransferResult, "sideEffects" | "undo">;
}

interface ITransferResult {
	bucket: BucketId;
	equipped?: true;
	undo?: Transfer;
	sideEffects?: ITransferResultSideEffect[];
}

const TRANSFERS: { [TYPE in TransferType]: ITransferDefinition<TYPE> } = {
	[TransferType.PullFromPostmaster]: {
		applicable: item => item.bucket.is(InventoryBucketHashes.LostItems)
			&& !!item.bucket.characterId
			&& !!item.definition.inventory?.bucketTypeHash,
		async transfer (item) {
			if (!this.applicable(item))
				throw new Error("Not in postmaster bucket");

			const characterId = item.bucket.characterId!;
			await PullFromPostmaster.query(item, characterId);
			return { bucket: Bucket.id(item.definition.inventory!.bucketTypeHash as InventoryBucketHashes, characterId) };
		},
	},
	[TransferType.TransferToVault]: {
		applicable: (item, ifNotCharacter) => !!item.character && item.bucket.characterId !== ifNotCharacter && !!inventory?.getBucket(InventoryBucketHashes.General),
		async transfer (item, ifNotCharacter) {
			if (!this.applicable(item, ifNotCharacter))
				throw new Error("Not in character bucket");

			const characterId = item.character?.characterId as CharacterId;
			await TransferItem.query(item, characterId, "vault");
			return {
				bucket: Bucket.id(InventoryBucketHashes.General),
				undo: [TransferType.TransferToCharacterFromVault, characterId],
			};
		},
	},
	[TransferType.TransferToCharacterFromVault]: {
		applicable: (item, characterId, swapBucket) => item.bucket.isVault()
			&& (inventory?.hasBucket(item.definition.inventory?.bucketTypeHash, characterId) ?? false),
		async transfer (item, characterId, swapBucket) {
			if (!this.applicable(item, characterId))
				throw new Error("Not in vault bucket");

			const bucket = inventory?.getBucket(item.definition.inventory!.bucketTypeHash, characterId);
			if (!bucket)
				throw new Error("Not in a bucket");

			if (bucket.items.length >= (bucket.capacity ?? Infinity) && !await bucket.makeSpace(swapBucket))
				throw new Error("Unable to make space");

			await TransferItem.query(item, characterId);
			return {
				bucket: Bucket.id(item.definition.inventory!.bucketTypeHash as InventoryBucketHashes, characterId),
				undo: [TransferType.TransferToVault],
			};
		},
	},
	[TransferType.Equip]: {
		applicable: item => item.bucket.isCharacter() && !item.equipped,
		async transfer (item, characterId, equipItemId) {
			if (equipItemId) {
				const equipItem = inventory?.getItem(equipItemId);
				if (!equipItem)
					throw new Error(`Could not find item ${equipItemId}`);

				if (item === equipItem)
					equipItemId = undefined;

				item = equipItem;
			}

			if (!this.applicable(item, characterId))
				throw new Error("Not in character bucket");

			if (item.isExotic()) {
				const buckets = new Set(item.isWeapon() ? WEAPON_BUCKET_HASHES : item.isArmour() ? ARMOUR_BUCKET_HASHES : []);
				buckets.delete(item.bucket.hash);

				for (const bucketHash of buckets) {
					const bucket = inventory?.getBucket(bucketHash, characterId);
					if (!bucket) continue;

					if (bucket.equippedItem?.isExotic())
						await bucket.equippedItem.unequip();
				}
			}

			const currentlyEquippedItem = item.bucket.equippedItem;
			await EquipItem.query(item, characterId);
			return {
				bucket: item.bucket.id,
				equipped: equipItemId ? undefined : true,
				undo:
					// there's another item that was equipped, re-equip it
					currentlyEquippedItem ? [TransferType.Equip, characterId, currentlyEquippedItem.id]
						// idk, unequip this item then i guess
						: [TransferType.Unequip, equipItemId],
				sideEffects: [
					!currentlyEquippedItem ? undefined : {
						item: currentlyEquippedItem,
						result: {
							bucket: item.bucket.id,
						},
					},
					!equipItemId ? undefined : {
						item,
						result: {
							bucket: item.bucket.id,
							equipped: true as const,
						},
					},
				].filter(Arrays.filterNullish),
			};
		},
	},
	[TransferType.Unequip]: {
		applicable: item => item.bucket.isCharacter() && !!item.equipped,
		async transfer (item, unequipItemId) {
			if (unequipItemId) {
				const unequipItem = inventory?.getItem(unequipItemId);
				if (!unequipItem)
					throw new Error(`Could not find item ${unequipItemId}`);

				if (item === unequipItem)
					unequipItemId = undefined;

				item = unequipItem;
			}

			if (!this.applicable(item))
				throw new Error("Not equipped in character bucket");

			const fallbackItem = item.fallbackItem;
			await item.unequip();
			return {
				bucket: item.bucket.id,
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				undo: [TransferType.Equip, item.character?.characterId!, unequipItemId],
				sideEffects: [
					!fallbackItem ? undefined : {
						item: fallbackItem,
						result: {
							bucket: item.bucket.id,
							equipped: true as const,
						},
					},
					!unequipItemId ? undefined : {
						item,
						result: {
							bucket: item.bucket.id,
						},
					},
				].filter(Arrays.filterNullish),
			};
		},
	},
};

export type ItemId = `hash:${bigint}` | `${bigint}`;

export interface IItemInit {
	id: ItemId;
	reference: DestinyItemComponent;
	definition: DestinyInventoryItemDefinition;
	bucket: Bucket;
	lastModified: number;
	instance?: DestinyItemInstanceComponent;
	sockets?: PromiseOr<(Socket | undefined)[]>;
	moment?: DeepsightMomentDefinition;
	deepsight?: IDeepsight;
	shaped?: IWeaponShaped;
	stats?: IStats;
	perks?: IPerk[];
	tier?: DeepsightTierTypeDefinition;
	collectible?: DestinyCollectibleDefinition;
	collectibleState?: DestinyCollectibleState;
	collections?: Item;
	sources?: ISource[];
	powerCap?: DestinyPowerCapDefinition;
	baseItem?: DestinyInventoryItemDefinition;
	breakerTypes?: DestinyBreakerTypeDefinition[];
	catalyst?: ICatalyst;
}

export interface IItem extends IItemInit {
	equipped?: true;
	sockets: (Socket | undefined)[];
}

export interface IItemEvents {
	update: { item: Item };
	loadStart: Event;
	loadEnd: Event;
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

	public static async resolve (manifest: Manifest, profile: Item.IItemProfile, reference: DestinyItemComponent, bucket: Bucket, occurrence: number, definition?: DestinyInventoryItemDefinition) {
		const { DestinyInventoryItemDefinition, DeepsightAdeptDefinition } = manifest;

		definition ??= await DestinyInventoryItemDefinition.get(reference.itemHash);
		if (!definition || !Object.keys(definition).length) {
			console.warn("No item definition for ", reference.itemHash);
			return undefined;
		}

		// if (definition.nonTransferrable && reference.bucketHash !== BucketHashes.LostItems && reference.bucketHash !== BucketHashes.Engrams) {
		// 	console.debug(`Skipping "${definition.displayProperties.name}", non-transferrable`);
		// 	return undefined;
		// }

		const init: IItemInit = {
			id: Item.id(reference, occurrence),
			reference,
			definition,
			bucket,
			instance: profile.itemComponents?.instances.data?.[reference.itemInstanceId!],
			lastModified: profile.lastModified.getTime(),
		};

		await Promise.all([
			Promise.resolve(DestinyInventoryItemDefinition.get((await DeepsightAdeptDefinition.get(definition.hash))?.base)).then(baseItem => Object.assign(init, { baseItem })),
			Moment.apply(manifest, init), // used for Into the Light plugs
			Tier.apply(manifest, init), // used for Into the Light deepsight
		]);

		await Promise.all([
			Plugs.apply(manifest, profile, init),
			Stats.apply(manifest, profile, init),
			Deepsight.apply(manifest, profile, init),
			Collectibles.apply(manifest, profile, init),
			this.addCollections(manifest, profile, init),
			Perks.apply(manifest, profile, init),
			PowerCap.apply(manifest, init),
			Catalyst.apply(manifest, profile, init),
		]);

		const item = new Item(init);
		if (item.isExotic())
			await item.getSocket("Masterwork/ExoticCatalyst")?.getPool();

		await BreakerType.apply(item);

		return item;
	}

	private static async addCollections (manifest: Manifest, profile: Plugs.IPlugsProfile & Deepsight.IDeepsightProfile & Collectibles.ICollectiblesProfile & Source.ISourceProfile, item: IItemInit) {
		item.collections = await Item.createFake(manifest, profile, item.definition);
	}

	public static async createFake (manifest: Manifest, profile: Plugs.IPlugsProfile & Deepsight.IDeepsightProfile & Collectibles.ICollectiblesProfile & Source.ISourceProfile, definition: DestinyInventoryItemDefinition, source = true, instanceId?: ItemId) {
		const id = `hash:${definition.hash}:collections` as ItemId;

		const existing = Bucket.COLLECTIONS.getItemById(id);
		if (existing) {
			await Deepsight.apply(manifest, profile, existing);
			Collectibles.update(profile, existing);
			return existing;
		}

		const init: IItemInit = {
			id,
			reference: { itemHash: definition.hash, itemInstanceId: instanceId, quantity: 0, bindStatus: ItemBindStatus.NotBound, location: ItemLocation.Unknown, bucketHash: InventoryBucketHashes.General, transferStatus: TransferStatuses.NotTransferrable, lockable: false, state: ItemState.None, isWrapper: false, tooltipNotificationIndexes: [], metricObjective: { objectiveHash: -1, complete: false, visible: false, completionValue: 0 }, itemValueVisibility: [] },
			definition,
			bucket: Bucket.COLLECTIONS,
			sockets: [],
			lastModified: Date.now(),
		};

		await Promise.all([
			Moment.apply(manifest, init), // used for Into the Light plugs
			Tier.apply(manifest, init), // used for Into the Light deepsight
		]);

		await Deepsight.apply(manifest, profile, init); // pattern presence is used by plugs

		await Promise.all([
			Plugs.apply(manifest, profile, init),
			Stats.apply(manifest, profile, init),
			Collectibles.apply(manifest, profile, init),
			source && Source.apply(manifest, profile, init),
			PowerCap.apply(manifest, init),
			Catalyst.apply(manifest, profile, init),
		]);

		const item = new Item(init);
		if (item.isExotic())
			await item.getSocket("Masterwork/ExoticCatalyst")?.getPool();

		await BreakerType.apply(item);

		return item;
	}

	public readonly event = new EventManager<this, IItemEvents>(this);

	public get character () {
		return this.bucket.character;
	}

	/**
	 * The character this item is in the inventory of, or the current character if the item is somewhere else
	 */
	public get owner () {
		return this.character ?? Characters.getCurrent();
	}

	public get objectives () {
		return this.sockets.flatMap(socket => socket?.plugs.flatMap(plug => plug.objectives) ?? []);
	}

	public collectibleState!: number;
	public fallbackItem?: Item;

	public bucket!: Bucket;
	public bucketIds!: BucketId[];
	protected readonly name: string;
	private occurrence = 0;

	private constructor (item: IItemInit) {
		this.name = item.definition.displayProperties?.name;
		Object.assign(this, item);
		this.undoTransfers = [];
		this.collectibleState ??= DestinyCollectibleState.None;
		this.bucketIds = [];
	}

	public isWeapon () {
		return this.definition.equippable
			&& (this.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Weapon)
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				|| WEAPON_BUCKET_HASHES.has(this.definition.inventory?.bucketTypeHash!));
	}

	public isArmour () {
		return this.definition.equippable
			&& (this.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Armor)
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				|| ARMOUR_BUCKET_HASHES.has(this.definition.inventory?.bucketTypeHash!));
	}

	public isExotic () {
		return this.tier?.hash === ItemTierTypeHashes.Exotic;
	}

	public isDummy () {
		return this.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies);
	}

	public getDamageType (): DamageTypeHashes | undefined {
		return this.getSocketedPlug("=Subclass/Super")?.getCategorisationAs(DeepsightPlugCategory.Subclass)?.damageType
			|| (this.instance?.damageTypeHash ?? this.definition.defaultDamageTypeHash) as DamageTypeHashes
			|| undefined;
	}

	public hasRandomRolls () {
		return this.getSockets("Perk").some(socket => socket.plugs.length > 1);
	}

	public isNotAcquired () {
		return this.bucket === Bucket.COLLECTIONS
			&& !!(this.collectibleState & DestinyCollectibleState.NotAcquired)
			&& !this.deepsight?.pattern?.progress?.progress;
	}

	public isMasterwork () {
		if (this.reference.state & ItemState.Masterwork)
			return true;

		if (this.instance && this.getSocketedPlug("Intrinsic/FrameEnhanced") && this.getSocketedPlugs("Perk/TraitEnhanced").length >= 2)
			return true;

		if (this.isExotic()) {
			const catalyst = this.getSocket("Masterwork/ExoticCatalyst");
			if (catalyst?.state && (!catalyst?.state?.isVisible || !catalyst?.getPool<true>("!Masterwork/ExoticCatalystEmpty")?.length))
				return true;

			if (this.isWeapon() && (!this.catalyst || this.catalyst?.complete) && this.bucket.isCollections() && !this.isNotAcquired())
				return true;
		}

		if (this.definition.itemCategoryHashes?.includes(ItemCategoryHashes.SeasonalArtifacts))
			return true;

		return false;
	}

	public isArtifice () {
		return !!this.getSocketedPlug("Intrinsic/ArmorArtifice");
	}

	public isAdept () {
		return this.canEnhance() || (!this.bucket.isCollections() && !!this.getSocket("Mod/Weapon")?.getPlug("Mod/WeaponAdept"));
	}

	public canEnhance () {
		return !!this.getSocket("Masterwork/Enhancement");
	}

	public hasDeepsight () {
		const hasIncompletePattern = this.deepsight?.pattern && !(this.deepsight.pattern.progress?.complete ?? false);
		return !this.deepsight?.resonance ? false : hasIncompletePattern;
	}

	public hasPattern () {
		return this.bucket.isCollections() ? !!this.deepsight?.pattern && !this.deepsight.pattern.progress?.complete
			: !!(this.deepsight?.resonance && this.deepsight?.pattern && !this.deepsight.pattern.progress?.complete);
	}

	public canShape () {
		return this.deepsight?.pattern?.progress?.complete && !this.hasShapedCopy() || false;
	}

	public hasShapedCopy () {
		return inventory?.isCrafted(this.definition.hash) ?? false;
	}

	public getLoadouts () {
		return Object.values(Characters.all())
			.flatMap(character => character.loadouts
				.filter(loadout => loadout.items
					.some(item => item.itemInstanceId === this.id)));
	}

	public canTransfer () {
		return ProfileManager.isAuthenticated()
			&& (!this.bucket.is(InventoryBucketHashes.LostItems) || !this.definition.doesPostmasterPullHaveSideEffects)
			&& this.reference.bucketHash !== InventoryBucketHashes.Engrams;
	}

	public isTierLessThan (tier: TierType | undefined, max?: TierType) {
		return (this.tier?.tierType ?? 0) <= Math.min(tier ?? 0, max ?? 0);
	}

	public isEngram () {
		return this.definition.inventory?.bucketTypeHash === InventoryBucketHashes.Engrams
			|| this.definition.itemType === DestinyItemType.Engram;
	}

	public getCollectionsRandomIntrinsics () {
		if (!this.bucket.isCollections())
			return undefined;

		const randomIntrinsics = {
			frames: this.getSocket("Intrinsic/Frame")?.plugs.distinct(plug => plug.definition?.displayProperties.name),
			exotics: this.getSocket("Intrinsic/Exotic")?.plugs,
		};
		if ((randomIntrinsics.exotics?.length ?? 0) < 2 && (randomIntrinsics.frames?.length ?? 0) < 2)
			return undefined;

		return randomIntrinsics;
	}

	public getPower (onlyPower = false) {
		const statHash = this.instance?.primaryStat?.statHash;
		const isValidStat = statHash === StatHashes.Power
			|| statHash === StatHashes.Attack
			|| statHash === StatHashes.Defense
			|| (!onlyPower && statHash === StatHashes.Speed);

		if (!isValidStat) {
			if (this.isWeapon() || this.isArmour())
				return this.bucket.isCollections() ? DeepsightStats.get()?.powerFloor ?? 0 : 0;

			return undefined;
		}

		const primaryStatPower = isValidStat ? this.instance!.primaryStat.value : 0;

		const itemLevelQualityPower = (this.instance?.itemLevel ?? 0) * 10 + (this.instance?.quality ?? 0);
		if (this.isEngram())
			return Math.max(primaryStatPower, itemLevelQualityPower);

		return primaryStatPower;
	}

	public isSunset () {
		const powerpower = this.getPower(true);
		const powerCap = powerpower === undefined ? undefined : this.powerCap;
		return powerpower !== undefined && (powerCap?.powerCap ?? 0) < 900000;
	}

	public isSame (item: Item) {
		return this.id === item.id;
	}

	public getSockets (...anyOfTypes: PlugType.Query[]) {
		return Socket.filterType(this.sockets, ...anyOfTypes);
	}

	public getSocket (...anyOfTypes: PlugType.Query[]): Socket | undefined {
		return this.getSockets(...anyOfTypes)[0];
	}

	public getSocketedPlugs (...anyOfTypes: PlugType.Query[]) {
		return Socket.filterByPlugs(this.sockets, ...anyOfTypes)
			.filter(socket => socket.socketedPlug.is(...anyOfTypes))
			.map(socket => socket.socketedPlug);
	}

	public getSocketedPlug (...anyOfTypes: PlugType.Query[]): Plug | undefined {
		return this.getSocketedPlugs(...anyOfTypes)[0];
	}

	public getOrnament () {
		if (this.bucket.isCollections() && this.isWeapon() && this.moment?.hash === MomentHashes.IntoTheLight) {
			const ornament = this.getSocket("Cosmetic/Ornament")
				?.getPlugs()
				?.find(ornament => ornament.definition?.displayProperties.name.includes("BRAVE"));

			if (ornament)
				return ornament;
		}

		return this.getSocketedPlug(
			"Cosmetic/OrnamentArmor",
			"Cosmetic/OrnamentWeapon",
			"Cosmetic/OrnamentMask",
		);
	}

	/**
	 * Some items are only very rarely available, such as adept raid weapons. Do you have the fomo? You should!
	 */
	public isFomo () {
		if (!this.bucket.isCollections())
			return ItemFomoState.NoMo;

		const hash = this.definition.hash as InventoryItemHashes;
		for (const source of this.sources ?? []) {
			if (source.dropTable.dropTable?.[hash] || source.dropTable.encounters?.some(encounter => encounter.dropTable?.[hash])) {
				if (source.dropTable.availability === "new")
					return ItemFomoState.New;
				else if (source.dropTable.availability)
					return ItemFomoState.TemporaryRepeatability;

				// always available in specific encounters
				continue;
			}

			if (source.isActiveMasterDrop || source.isActiveDrop)
				return ItemFomoState.TemporaryAvailability;
		}

		return ItemFomoState.NoMo;
	}

	public getBaseName () {
		return this.baseItem?.displayProperties.name ?? this.definition.displayProperties.name;
	}

	public isLocked () {
		return !!(this.reference.state & ItemState.Locked);
	}

	public isChangingLockState () {
		return !!this.settingLocked;
	}

	private settingLocked?: Promise<void>;
	public async setLocked (locked = true) {
		if (this.bucket === Bucket.COLLECTIONS)
			return false;

		if (!ProfileManager.isAuthenticated())
			return false;

		await this.settingLocked;

		if (this.isLocked() !== locked) {
			this.settingLocked = (async () => {
				let err: Error | undefined;
				await SetLockState.query(this, locked).catch((e: Error) => err = e);
				if (err)
					return;

				StateLock.add({
					type: "item/lock",
					time: Date.now(),
					item: this.id,
					locked,
				});

				const mutable = (this.reference as Mutable<DestinyItemComponent>);
				if (locked)
					mutable.state |= ItemState.Locked;
				else
					mutable.state &= ~ItemState.Locked;
			})();

			await this.refresh();
			await this.settingLocked;
			delete this.settingLocked;
			await this.refresh();
		}

		return locked;
	}

	public async refresh (manifest?: Manifest, profile = ProfileBatch.latest, itemRef = this.reference, occurrence = this.occurrence) {
		manifest ??= await Manifest.await();
		this.lastModified = profile?.lastModified.getTime() ?? 0;
		this.reference = itemRef;
		this.occurrence = occurrence;
		this.instance = profile?.itemComponents?.instances.data?.[itemRef.itemInstanceId!];
		await Plugs.refresh(manifest, profile, this);
		// moment should be ok
		await Deepsight.apply(manifest, profile ?? {}, this); // includes shaped
		await Stats.apply(manifest, profile, this);
		this.event.emit("update", { item: this });
	}

	private _transferPromise?: Promise<void>;
	private readonly undoTransfers: Transfer[];

	public get transferring () {
		return !!this._transferPromise;
	}

	public async transferrable () {
		while (this._transferPromise)
			await this._transferPromise;
	}

	public async transferToBucket (bucket: Bucket) {
		// if (bucket.is(InventoryBucketHashes.Consumables) || bucket.is(InventoryBucketHashes.Modifications))
		// 	throw new Error("Inventory transfer not implemented yet");

		if (bucket.is(InventoryBucketHashes.General))
			return this.transferToVault();

		if (!bucket.characterId) {
			console.warn("Transfer type not implemented", bucket);
			return;
		}

		return this.transferToCharacter(bucket.characterId);
	}

	public async transferToCharacter (character: CharacterId) {
		if (this.bucket.isCharacter(character))
			return;

		return this.transfer(
			TransferType.PullFromPostmaster,
			[TransferType.Unequip],
			...this.bucket.isCharacter() ? [Arrays.tuple(TransferType.TransferToVault as const)] : [],
			[TransferType.TransferToCharacterFromVault, character, this.bucket],
		);
	}

	public transferToVault () {
		return this.transfer(
			TransferType.PullFromPostmaster,
			[TransferType.Unequip],
			[TransferType.TransferToVault],
		);
	}

	public transferToggleVaulted (character: CharacterId) {
		if (this.bucket.is(InventoryBucketHashes.General))
			return this.transferToCharacter(character);
		else
			return this.transferToVault();
	}

	public async equip (character: CharacterId) {
		if (this.bucket.isCharacter(character) && this.equipped)
			return;

		return this.transfer(
			TransferType.PullFromPostmaster,
			[TransferType.Unequip],
			[TransferType.TransferToVault, character],
			[TransferType.TransferToCharacterFromVault, character, this.bucket],
			[TransferType.Equip, character],
		);
	}

	public async unequip () {
		await this.transferrable();
		if (!this.character || !this.fallbackItem) {
			// TODO notify
		} else {
			this.event.emit("loadStart");
			this._transferPromise = this.fallbackItem.equip(this.character.characterId);
			await this._transferPromise;
			delete this._transferPromise;
			this.event.emit("loadEnd");
		}
	}

	public pullFromPostmaster () {
		return this.transfer(TransferType.PullFromPostmaster);
	}

	private async transfer (...transfers: Transfer[]) {
		if (!ProfileManager.isAuthenticated())
			return;

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
				const sideEffects = [{ item: this, result }, ...result.sideEffects ?? []]; // includes main effect

				const pendingEmits: { item: Item, oldBucket: Bucket, equipped: true | undefined }[] = [];
				for (const { item, result } of sideEffects) {
					const fromBucket = item.bucket;
					const fromEquipped = !!item.equipped;

					const toBucket = inventory?.getBucket(result.bucket);
					if (!toBucket)
						console.warn("Missing bucket", result.bucket, "for item after transfer", item);

					pendingEmits.push({ item, oldBucket: fromBucket, equipped: result.equipped });
					if (toBucket) {
						console.log("Transferred", item.name, "from", fromBucket.name, fromEquipped ? "equipped" : "unequipped", "to", toBucket.name, result.equipped ? "equipped" : "unequipped");
						StateItemTransfer.add({
							type: "item/transfer",
							time: Date.now(),
							item: item.id,
							fromBucket: fromBucket.id,
							fromEquipped,
							toBucket: toBucket.id,
							toEquipped: !!result.equipped,
						});
					}
				}

				if (result.undo)
					this.undoTransfers.push(result.undo);
				else
					this.undoTransfers.splice(0, Infinity);

			} catch (error) {
				console.error(error);
				if (!Store.items.settingsDisableReturnOnFailure)
					await this.performTransfer(...this.undoTransfers.reverse());
			}

			await inventory.refreshing;
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
