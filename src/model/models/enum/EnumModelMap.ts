import { DamageType, DestinyAmmunitionType, DestinyBreakerType, DestinyClass } from "bungie-api-ts/destiny2";
import AmmoTypes from "model/models/enum/AmmoTypes";
import BreakerTypes from "model/models/enum/BreakerTypes";
import ClassTypes from "model/models/enum/ClassTypes";
import DamageTypes from "model/models/enum/DamageTypes";
import type EnumModel from "model/models/enum/EnumModel";
import type { DisplayPropertied } from "ui/bungie/DisplayProperties";

const EnumModelMap = {
	kinetic: [DamageTypes, DamageType.Kinetic] as const,
	arc: [DamageTypes, DamageType.Arc] as const,
	void: [DamageTypes, DamageType.Void] as const,
	solar: [DamageTypes, DamageType.Thermal] as const,
	stasis: [DamageTypes, DamageType.Stasis] as const,
	strand: [DamageTypes, DamageType.Strand] as const,
	primary: [AmmoTypes, DestinyAmmunitionType.Primary] as const,
	special: [AmmoTypes, DestinyAmmunitionType.Special] as const,
	heavy: [AmmoTypes, DestinyAmmunitionType.Heavy] as const,
	titan: [ClassTypes, DestinyClass.Titan] as const,
	hunter: [ClassTypes, DestinyClass.Hunter] as const,
	warlock: [ClassTypes, DestinyClass.Warlock] as const,
	barrier: [BreakerTypes, DestinyBreakerType.ShieldPiercing] as const,
	"shield-piercing": [BreakerTypes, DestinyBreakerType.ShieldPiercing] as const,
	overload: [BreakerTypes, DestinyBreakerType.Disruption] as const,
	disruption: [BreakerTypes, DestinyBreakerType.Disruption] as const,
	unstoppable: [BreakerTypes, DestinyBreakerType.Stagger] as const,
	stagger: [BreakerTypes, DestinyBreakerType.Stagger] as const,
} satisfies Record<string, [EnumModel<any, DisplayPropertied>, number]>;

export default EnumModelMap;

export type EnumModelMapString = keyof typeof EnumModelMap;
