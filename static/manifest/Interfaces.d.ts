export type ISOString = `${bigint}-${bigint}-${bigint}T${bigint}:${bigint}:${bigint}Z`;

export interface DeepsightManifest {
	/**
	 * This number increments whenever any other property changes (excluding Destiny2/Manifest)
	 */
	deepsight: number;
	/**
	 * A datetime string in the ISO format, yyyy-mm-ddThh:mm:ssZ, representing the last time any property has changed
	 */
	updated: ISOString;

	DeepsightDropTableDefinition: number;
	DeepsightMomentDefinition: number;
	DeepsightPlugCategorisation: number;
	DeepsightWallpaperDefinition: number;
	DeepsightTierTypeDefinition: number;
	Enums: number;
	Interfaces: number;

	/**
	 * The version of the Destiny manifest the current deepsight manifest supports
	 */
	"Destiny2/Manifest": string;

	/**
	 * The last daily reset from when this manifest was last updated.  
	 * 
	 * **Note that this is only set after 30 minutes, at minimum, sometimes longer.**
	 */
	lastDailyReset: number;
	/**
	 * The last weekly reset from when this manifest was last updated.  
	 * 
	 * **Note that this is only set after 30 minutes, at minimum, sometimes longer.**
	 */
	lastWeeklyReset: number;
	/**
	 * The last Trials reset from when this manifest was last updated. When Trials is not active, this is the start of Trials on the previous week.
	 * 
	 * **Note that this does not take into account weeks when Trials is not active at all, such as when Iron Banner replaces it.**  
	 * 
	 * **Note that this is only set after 30 minutes, at minimum, sometimes longer.**
	 */
	lastTrialsReset: number;

	/**
	 * The `instanceId` and `period` datetime of a PGCR created since the last daily reset. 
	 * 
	 * **Note that this is only set after 30 minutes, at minimum, sometimes longer.**
	 * 
	 * For reference, the PGCR chosen is generally not notable in any way, 
	 * it's simply the first PGCR that a binary search happened to stumble upon in the correct day.
	 */
	referencePostGameCarnageReportSinceDailyReset: DeepsightManifestReferencePGCR;
}

export declare interface DeepsightManifestReferencePGCR {
	instanceId: `${bigint}`;
	period: ISOString;
}

export declare interface DeepsightDisplayPropertiesDefinition {
	name?: string;
	description?: string;
	/**
	 * Icon paths are guaranteed to either be via Bungie.net or deepsight.gg.
	 * - Bungie.net icon paths always begin with `/` and should be appended to `https://www.bungie.net`
	 * - deepsight.gg icon paths always begin with `./` should be joined with `https://deepsight.gg`
	 */
	icon?: DeepsightIconPath | BungieIconPath;
}

export declare type DeepsightIconPath = `./${string}`;
export declare type BungieIconPath = `/${string}`;

export declare interface DeepsightDropTableDefinition {
	/**
	 * `DestinyActivityDefinition` hash.
	 * Refers to the version of the activity that's always available.
	 */
	hash: number;
	/**
	 * `DestinyActivityDefinition` hash.
	 * Refers to the version of the activity that rotates in (if different.)
	 * 
	 * In the case of raids, this refers to the activity definition that lists all challenges available.
	 */
	rotationActivityHash?: number;
	/**
	 * A record for completing this activity.
	 */
	recordHash?: number;
	/**
	 * Partial display properties. Not all fields are guaranteed to be provided.
	 */
	displayProperties?: DeepsightDisplayPropertiesDefinition;
	/**
	 * A drop table used as the base drop table for all encounters. Encounter-specific drop tables may override this.
	 */
	dropTable?: Record<number, DeepsightDropTableDropDefinition>;
	/**
	 * If this activity has encounters, information about them will be here.
	 */
	encounters?: DeepsightDropTableEncounterDefinition[];
	/**
	 * If the activity has a high level variant which drops different loot, it's defined here.
	 */
	master?: DeepsightDropTableMasterDefinition;
	/**
	 * If challenges or drops rotate, this field will be filled.
	 */
	rotations?: DeepsightDropTableRotationsDefinition;
}

export declare interface DeepsightDropTableEncounterDefinition {
	/**
	 * Phase hashes are based on data from `characterProgressions.milestones[milestone hash].activities[activity index].phases`
	 */
	phaseHash?: number;
	/**
	 * True if this is a traversal phase (not a real encounter)
	 */
	traversal?: true;
	/**
	 * Every encounter is guaranteed to have a partial display properties object.
	 */
	displayProperties: DeepsightDisplayPropertiesDefinition & {
		/**
		 * An alternative title for the encounter, generally wordier.
		 */
		directive?: string;
	};
	/**
	 * Determines the way that this encounter's drop table should be applied to the base activity drop table.
	 * - "replace" = this encounter-specific drop table should be used instead of the base drop table.
	 * - "merge" = this encounter-specific drop table should be merged into the base drop table.
	 * If not provided, it should default to "merge". 
	 */
	dropTableMergeStrategy?: "replace" | "merge";
	/**
	 * Encounter-specific drop table.
	 */
	dropTable?: Record<number, DeepsightDropTableDropDefinition>;
}

export declare interface DeepsightDropTableMasterDefinition {
	/**
	 * `DestinyActivityDefinition` hash for the master activity.
	 */
	activityHash: number;
	/**
	 * A non-rotating drop table of items from the master activity.
	 */
	dropTable?: Record<number, DeepsightDropTableDropDefinition>;
}

export declare interface DeepsightDropTableDropDefinition {
	/**
	 * `DestinyInventoryItemDefinition` hash representing a quest item required for this drop to drop.
	 */
	requiresQuest?: number;
	/**
	 * `DestinyInventoryItemDefinition` hashes representing a list of items required for this drop to drop.
	 */
	requiresItems?: number[];
	/**
	 * `true` if this item is only available for purchase in an end-of-activity cache.
	 */
	purchaseOnly?: true;
}

export declare interface DeepsightDropTableRotationsDefinition {
	/**
	 * Unix timestamp (ms) of a Destiny reset, referring to the following week's rotation.
	 */
	anchor: number;
	/**
	 * `DestinyInventoryItemDefinition` hashes.
	 * The first drop will be the active drop during the week of the anchor reset, then the next drop the next week,
	 * and so on until all drops are exhausted. At that point, it cycles back to the first drop.
	 */
	drops?: number[];
	/**
	 * `DestinyInventoryItemDefinition` hashes.
	 * The first drop will be the active drop during the week of the anchor reset, then the next drop the next week,
	 * and so on until all drops are exhausted. At that point, it cycles back to the first drop.
	 */
	masterDrops?: number[];
	/**
	 * `DestinyActivityModifierDefinition` hashes.
	 * The first challenge will be the active challenge during the week of the anchor reset, then the next challenge the next week,
	 * and so on until all challenges are exhausted. At that point, it cycles back to the first challenge.
	 */
	challenges?: number[];
}

export declare interface DeepsightMomentDefinition {
	hash: number;
	id: string;
	displayProperties: DeepsightDisplayPropertiesDefinition;
	iconWatermark?: string;
	iconWatermarkShelved?: string;
	/**
	 * For events, the event card hash. If there isn't an event card, `true`
	 */
	event?: true | number;
	expansion?: true;
	season?: number;
	year?: number;
	seasonHash?: number;
	/**
	 * Items that should be associated with this moment, but aren't according to the Destiny manifest (by icon watermark).
	 * You should render these items with this moment's `iconWatermark`.
	 */
	itemHashes?: number[];
}

/**
 * Destiny 2 wallpapers Bungie has released indexed by `DeepsightMomentDefinition` hashes.
 */
export declare interface DeepsightWallpaperDefinition {
	/**
	 * A `DeepsightMomentDefinition` hash.
	 */
	hash: number;
	/**
	 * Wallpaper URLs. Each is an absolute (full) URL.
	 */
	wallpapers: string[];
}

export interface DeepsightTierTypeDefinition {
	/**
	 * A `DestinyItemTierTypeDefinition` hash.
	 */
	hash: number;
	/**
	 * The `TierType` of this tier, as appears in `DestinyInventoryItemDefinition`'s `inventory.tierType`.
	 */
	tierType: number;
	/**
	 * Partial display properties. Not all fields are guaranteed to be provided.
	 */
	displayProperties: DeepsightDisplayPropertiesDefinition;
}
