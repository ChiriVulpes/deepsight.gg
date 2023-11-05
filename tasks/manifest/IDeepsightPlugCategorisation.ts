import type { ActivityHashes, InventoryBucketHashes, InventoryItemHashes, StatHashes } from "./Enums";

export enum DeepsightPlugCategory {
	None,
	Intrinsic,
	Perk,
	Mod,
	Subclass,
	Artifact,
	Cosmetic,
	Masterwork,
	Vendor,
	Classified,
	StatusEffect,
	Unknown,
	Extractable,
	Infusion,
}

export enum DeepsightPlugTypeIntrinsic {
	None,
	Frame,
	EnhancedFrame,
	Origin,
	Exotic,
	SparrowEngine,
}

export enum DeepsightPlugTypePerk {
	None,
	Trait,
	EnhancedTrait,
	Exotic,
	Scope,
	Barrel,
	Battery,
	Magazine,
	Grip,
	Stock,
	Blade,
	Guard,
	Bowstring,
	Arrow,
	GrenadeLauncherMagazine,
	Tube,
	Haft,
	Deprecated,
	Dummy,
	Clan,
	Sparrow,
	Ship,
	Ghost,
	LockedTrait,
	EmptyCraftingSocket,
	EmblemAura,
	Random,
}

export enum DeepsightPlugTypeMod {
	None,
	Armor,
	Weapon,
	Ghost,
	Deprecated,
	Fallback,
	EmptySocket,
}

export enum DeepsightPlugTypeSubclass {
	None,
	Aspect,
	Fragment,
	EmptyFragment,
	Super,
	Grenade,
	Melee,
	ClassAbility,
	Movement,
}

export enum DeepsightPlugTypeCosmetic {
	None,
	Shader,
	Ornament,
	Memento,
	Emote,
	TransmatEffect,
	GhostShell,
	GhostProjection,
	ShipEngineEffect,
	Tracker,
	ArmorGlow,
	GhostTracker,
	ClanBannerStaff,
	EmblemEmpty,
	Radiance,
	DefaultOrnament,
}

export enum DeepsightPlugTypeMasterwork {
	None,
	Weapon,
	Armor,
	Ghost,
	EmptyExoticCatalyst,
	UpgradeExoticCatalyst,
	AvailableExoticCatalyst,
	ExoticCatalyst,
	Event,
	ShapedWeapon,
	HolidayOven,
	Authorization,
	EmptyEnhancement,
	Enhancement,
}

export enum DeepsightPlugTypeVendor {
	None,
	HolidayOven,
}

export enum DeepsightPlugTypeExtractable {
	None,
	DeepsightResonance,
	DeepsightActivation,
}

export const DeepsightPlugTypeMap = {
	[DeepsightPlugCategory.None]: null,
	[DeepsightPlugCategory.Classified]: null,
	[DeepsightPlugCategory.Unknown]: null,
	[DeepsightPlugCategory.Intrinsic]: /*%typeof*/ DeepsightPlugTypeIntrinsic,
	[DeepsightPlugCategory.Perk]: /*%typeof*/ DeepsightPlugTypePerk,
	[DeepsightPlugCategory.Mod]: /*%typeof*/ DeepsightPlugTypeMod,
	[DeepsightPlugCategory.Subclass]: /*%typeof*/ DeepsightPlugTypeSubclass,
	[DeepsightPlugCategory.Cosmetic]: /*%typeof*/ DeepsightPlugTypeCosmetic,
	[DeepsightPlugCategory.Masterwork]: /*%typeof*/ DeepsightPlugTypeMasterwork,
	[DeepsightPlugCategory.Artifact]: null,
	[DeepsightPlugCategory.Vendor]: /*%typeof*/ DeepsightPlugTypeVendor,
	[DeepsightPlugCategory.StatusEffect]: null,
	[DeepsightPlugCategory.Infusion]: null,
	[DeepsightPlugCategory.Extractable]: /*%typeof*/ DeepsightPlugTypeExtractable,
};

export type DeepsightPlugType<CATEGORY extends DeepsightPlugCategory = DeepsightPlugCategory> =
	DeepsightPlugCategory extends CATEGORY ? ({ [CATEGORY in DeepsightPlugCategory]: DeepsightPlugType<CATEGORY> } extends infer ALL_CATEGORIES ? ALL_CATEGORIES[keyof ALL_CATEGORIES] : never)
	: (/*<*/typeof /*>*/DeepsightPlugTypeMap)[CATEGORY] extends infer TYPE_ENUM ? TYPE_ENUM[keyof TYPE_ENUM] : never;

export interface DeepsightPlugCategorisationGeneric<CATEGORY extends DeepsightPlugCategory = DeepsightPlugCategory> {
	hash: number;
	category: CATEGORY;
	categoryName: string;
	type?: DeepsightPlugType<CATEGORY>;
	typeName?: string;
}

export interface DeepsightPlugCategorisationMasterwork extends DeepsightPlugCategorisationGeneric<DeepsightPlugCategory.Masterwork> {
	complete?: boolean;
	stat?: StatHashes;
	value?: number;
}

export interface DeepsightPlugCategorisationMod extends DeepsightPlugCategorisationGeneric<DeepsightPlugCategory.Mod> {
	adept?: boolean;
	bucketHash?: InventoryBucketHashes;
	raid?: boolean;
	artifice?: boolean;
	activityHash?: ActivityHashes;
}

export interface DeepsightPlugCategorisationSubclass extends DeepsightPlugCategorisationGeneric<DeepsightPlugCategory.Subclass> {
	subclasses: InventoryItemHashes[];
}

interface DeepsightPlugCategorisationMap {
	[DeepsightPlugCategory.Masterwork]: DeepsightPlugCategorisationMasterwork;
	[DeepsightPlugCategory.Mod]: DeepsightPlugCategorisationMod;
	[DeepsightPlugCategory.Subclass]: DeepsightPlugCategorisationSubclass;
}

export type DeepsightPlugCategorisation<CATEGORY extends DeepsightPlugCategory = DeepsightPlugCategory> =
	DeepsightPlugCategory extends CATEGORY ? ({ [CATEGORY in DeepsightPlugCategory]: DeepsightPlugCategorisation<CATEGORY> } extends infer ALL_CATEGORIES ? ALL_CATEGORIES[keyof ALL_CATEGORIES] : never)
	: DeepsightPlugCategorisationMap extends { [KEY in CATEGORY]: infer CATEGORISATION } ? CATEGORISATION : DeepsightPlugCategorisationGeneric<CATEGORY>;
