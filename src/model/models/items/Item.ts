import type { DestinyInventoryItemDefinition, DestinyItemComponent, DestinyItemInstanceComponent, DestinyObjectiveProgress } from "bungie-api-ts/destiny2";
import { BucketHashes, ItemState, StatHashes } from "bungie-api-ts/destiny2";
import type { IDeepsight, IWeaponShaped } from "model/models/items/Deepsight";
import Deepsight from "model/models/items/Deepsight";
import type { IReusablePlug, ISocket } from "model/models/items/Plugs";
import Plugs from "model/models/items/Plugs";
import Source from "model/models/items/Source";
import type { IStats } from "model/models/items/Stats";
import Stats from "model/models/items/Stats";
import type { Manifest } from "model/models/Manifest";
import EquipItem from "utility/endpoint/bungie/endpoint/destiny2/actions/items/EquipItem";
import PullFromPostmaster from "utility/endpoint/bungie/endpoint/destiny2/actions/items/PullFromPostmaster";
import TransferItem from "utility/endpoint/bungie/endpoint/destiny2/actions/items/TransferItem";
import type { DestinySourceDefinition } from "utility/endpoint/deepsight/endpoint/GetDestinySourceDefinition";
import { EventManager } from "utility/EventManager";
import Store from "utility/Store";
import Time from "utility/Time";
import type { PromiseOr } from "utility/Type";

export type CharacterId = `${bigint}`;
export type PostmasterId = `postmaster:${CharacterId}`;
export type DestinationBucketId = CharacterId | "vault" | "inventory";
export type BucketId = DestinationBucketId | PostmasterId;
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
		return id !== "vault" && id !== "inventory" && !PostmasterId.is(id);
	}
}

enum TransferType {
	PullFromPostmaster,
	TransferToVault,
	TransferToCharacterFromVault,
	// TransferToInventoryFromVault,
	Equip,
}

interface ITransferArgs {
	[TransferType.PullFromPostmaster]: [],
	[TransferType.TransferToVault]: [],
	[TransferType.TransferToCharacterFromVault]: [character: CharacterId],
	// [TransferType.TransferToInventoryFromVault]: [],
	[TransferType.Equip]: [character: CharacterId],
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
		applicable: item => CharacterId.is(item.bucket),
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
				undo: TransferType.TransferToVault,
			};
		},
	},
	[TransferType.Equip]: {
		applicable: item => CharacterId.is(item.bucket),
		transfer: async (item, characterId) => {
			if (!CharacterId.is(item.bucket))
				throw new Error("Not in character bucket");

			await EquipItem.query(item, characterId);
			return {
				bucket: characterId,
				equipped: true,
				undo: TransferType.TransferToVault,
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
	instance?: DestinyItemInstanceComponent;
	objectives: DestinyObjectiveProgress[];
	sockets?: PromiseOr<(ISocket | undefined)[]>;
	plugs?: PromiseOr<IReusablePlug[][]>;
	source?: DestinySourceDefinition;
	deepsight?: IDeepsight;
	shaped?: IWeaponShaped;
	stats?: IStats;
}

export interface IItem extends IItemInit {
	equipped?: true;
	sockets: (ISocket | undefined)[];
	plugs: IReusablePlug[][];
}

export interface IItemEvents {
	update: { item: Item };
	loadStart: Event;
	loadEnd: Event;
	bucketChange: { item: Item; oldBucket: BucketId; equipped?: true };
}

namespace Item {
	export interface IItemProfile extends
		Deepsight.IDeepsightProfile,
		Plugs.IPlugsProfile,
		Stats.IStatsProfile { }
}

interface Item extends IItem { }
class Item {

	public static id (reference: DestinyItemComponent): ItemId {
		return reference.itemInstanceId as `${bigint}` ?? `hash:${reference.itemHash}`;
	}

	public static async resolve (manifest: Manifest, profile: Item.IItemProfile, reference: DestinyItemComponent, bucket: BucketId) {
		const { DestinyInventoryItemDefinition } = manifest;

		const definition = await DestinyInventoryItemDefinition.get(reference.itemHash);
		if (!definition) {
			console.warn("No item definition for ", reference.itemHash);
			return undefined;
		}

		if (definition.nonTransferrable && reference.bucketHash !== BucketHashes.LostItems && reference.bucketHash !== BucketHashes.Engrams) {
			console.debug(`Skipping "${definition.displayProperties.name}", non-transferrable`);
			return undefined;
		}

		const item: IItemInit = {
			id: Item.id(reference),
			reference,
			definition,
			bucket,
			instance: profile.itemComponents?.instances.data?.[reference.itemInstanceId!],
			objectives: Object.values(profile.itemComponents?.plugObjectives.data?.[reference.itemInstanceId!]?.objectivesPerPlug ?? {}).flat(),
		};

		await Promise.all([
			Plugs.apply(manifest, profile, item),
			Stats.apply(manifest, profile, item),
			Deepsight.apply(manifest, profile, item),
			Source.apply(manifest, item),
		]);

		return new Item(item);
	}

	public readonly event = new EventManager<this, IItemEvents>(this);

	public get character () {
		return this.bucket === "vault" || this.bucket === "inventory" ? undefined
			: PostmasterId.is(this.bucket) ? PostmasterId.character(this.bucket)
				: this.bucket;
	}

	private constructor (item: IItemInit) {
		Object.assign(this, item);
	}

	public isMasterwork () {
		return !!(this.reference.state & ItemState.Masterwork)
			|| (this.plugs?.filter(socket => socket.some(plug => plug.definition?.itemTypeDisplayName === "Enhanced Trait"))
				.length ?? 0) >= 2;
	}

	public canTransfer () {
		return !this.definition.doesPostmasterPullHaveSideEffects && this.reference.bucketHash !== BucketHashes.Engrams;
	}

	public getPower () {
		const isValidStat = this.instance?.primaryStat?.statHash === StatHashes.Power
			|| this.instance?.primaryStat?.statHash === StatHashes.Attack
			|| this.instance?.primaryStat?.statHash === StatHashes.Defense;
		const primaryStatPower = isValidStat ? this.instance!.primaryStat.value : 0;
		const itemLevelQualityPower = (this.instance?.itemLevel ?? 0) * 10 + (this.instance?.quality ?? 0);
		return Math.max(primaryStatPower, itemLevelQualityPower);
	}

	public isSame (item: Item) {
		return this.id === item.id;
	}

	public update (item: Item) {
		this.id = item.id;
		this.reference = item.reference;
		if (this.trustTransferUntil < Date.now() || !this.bucketHistory?.includes(item.bucket)) {
			delete this.bucketHistory;
			this.bucket = item.bucket;
		}
		this.instance = item.instance;
		this.objectives = item.objectives;
		this.sockets = item.sockets;
		this.plugs = item.plugs;
		this.source = item.source;
		this.deepsight = item.deepsight;
		this.shaped = item.shaped;
		this.stats = item.stats;
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
		if (bucket === "inventory")
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
			...CharacterId.is(this.bucket) ? [TransferType.TransferToVault as const] : [],
			[TransferType.TransferToCharacterFromVault, character],
		);
	}

	public transferToVault () {
		return this.transfer(
			TransferType.PullFromPostmaster,
			TransferType.TransferToVault,
		);
	}

	public transferToggleVaulted (character: CharacterId) {
		if (this.bucket === "vault")
			return this.transferToCharacter(character);
		else
			return this.transferToVault();
	}

	public equip (character: CharacterId) {
		return this.transfer(
			TransferType.PullFromPostmaster,
			[TransferType.TransferToCharacterFromVault, character],
			[TransferType.Equip, character],
		);
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

				const oldBucket = this.bucket;
				this.bucketHistory ??= [];
				this.bucketHistory.push(oldBucket);

				this.bucket = result.bucket;
				this.equipped = result.equipped;
				this.trustTransferUntil = Date.now() + Time.seconds(30);
				this.event.emit("bucketChange", { item: this, oldBucket, equipped: this.equipped });

			} catch (error) {
				console.error(error);
				if (!Store.items.settingsDisableReturnOnFailure)
					await this.performTransfer(...this.undoTransfers.reverse());
			}
		}
	}
}

export default Item;
