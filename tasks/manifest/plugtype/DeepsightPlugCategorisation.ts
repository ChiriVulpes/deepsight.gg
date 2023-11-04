import type { DestinyInventoryBucketDefinition } from "../../../src/node_modules/bungie-api-ts/destiny2";
import { EnumHelper } from "../../generate_enums";
import Log from "../../utilities/Log";
import manifest from "../DestinyManifest";
import type { StatHashes } from "../Enums";
import { ActivityHashes, InventoryBucketHashes, InventoryItemHashes, ItemCategoryHashes, PlugCategoryHashes, TraitHashes } from "../Enums";
import type { DeepsightPlugCategorisationMasterwork, DeepsightPlugCategorisationMod, DeepsightPlugCategorisationSubclass } from "../IDeepsightPlugCategorisation";
import { DeepsightPlugCategorisation, DeepsightPlugCategory, DeepsightPlugTypeCosmetic, DeepsightPlugTypeExtractable, DeepsightPlugTypeIntrinsic, DeepsightPlugTypeMap, DeepsightPlugTypeMasterwork, DeepsightPlugTypeMod, DeepsightPlugTypePerk, DeepsightPlugTypeSubclass, DeepsightPlugTypeVendor } from "../IDeepsightPlugCategorisation";
import DeepsightPlugContextDefinition from "./DeepsightPlugContextDefinition";

namespace DeepsightPlugCategorisation {

	function determinePlugCategory (context: DeepsightPlugContextDefinition) {
		switch (context.definition.hash) {
			case InventoryItemHashes.RandomizedPerksIntrinsicDummy:
			case InventoryItemHashes.RandomizedPerks1IntrinsicDummy:
			case InventoryItemHashes.RandomizedPerks1IntrinsicDummy2:
			case InventoryItemHashes.RandomizedPerks1IntrinsicDummy3:
			case InventoryItemHashes.RandomizedPerks2IntrinsicDummy:
			case InventoryItemHashes.TraitLocked:
			case InventoryItemHashes.TraitLocked2:
				return DeepsightPlugCategory.Perk;

			case InventoryItemHashes.EmptyModSocket:
				return DeepsightPlugCategory.Mod;
		}

		switch (context.definition.plug?.plugCategoryHash) {
			case PlugCategoryHashes.Intrinsics:
			case PlugCategoryHashes.Origins:
				return DeepsightPlugCategory.Intrinsic;

			case PlugCategoryHashes.Shader:
			case PlugCategoryHashes.Mementos:
			case PlugCategoryHashes.ExoticAllSkins:
			case PlugCategoryHashes.Emote:
			case PlugCategoryHashes.ShipSpawnfx:
			case PlugCategoryHashes.V500ShipsEventsDawningExoticShip0Engines:
			case PlugCategoryHashes.Hologram:
			case PlugCategoryHashes.SocialClansStaves:
			case PlugCategoryHashes.EmblemVariant:
			case PlugCategoryHashes.DawningShipShader:
			case PlugCategoryHashes.DawningShipSpawnfx:
			case PlugCategoryHashes.GenericAllVfx:
				return DeepsightPlugCategory.Cosmetic;

			case PlugCategoryHashes.PlugsGhostsMasterworks:
			case PlugCategoryHashes.EventsSolsticeEmbers:
			case PlugCategoryHashes.EventsSolsticeEmbersEmpty:
			case PlugCategoryHashes.EventsSolsticeKindling:
			case PlugCategoryHashes.CraftingPlugsWeaponsModsTransfusersLevel:
			case PlugCategoryHashes.EventsDawning2022OvenNotMasterworked:
			case PlugCategoryHashes.EventsDawningOvenMasterworked:
			case PlugCategoryHashes.V400PlugsWeaponsMasterworks:
			case PlugCategoryHashes.V700WeaponsModsMissionAvalon:
			case PlugCategoryHashes.ExoticWeaponMasterworkUpgrade:
			case PlugCategoryHashes.V400EmptyExoticMasterwork:
			case PlugCategoryHashes.CraftingPlugsWeaponsModsEnhancers:
				return DeepsightPlugCategory.Masterwork;

			case PlugCategoryHashes.EventsDawning2022Recipe:
			case PlugCategoryHashes.EventsDawning2022NoRecipe:
			case PlugCategoryHashes.EventsDawning2022IngredientA:
			case PlugCategoryHashes.EventsDawning2022IngredientB:
			case PlugCategoryHashes.EventsDawning2022OvenCombine:
			case PlugCategoryHashes.EventsDawning2022OvenEmpty:
			case PlugCategoryHashes.EventsDawning2022OvenEmptyCombination:
				return DeepsightPlugCategory.Vendor;

			case PlugCategoryHashes.EnhancementsGhostsActivity:
			case PlugCategoryHashes.EnhancementsGhostsActivityFake:
			case PlugCategoryHashes.EnhancementsGhostsEconomic:
			case PlugCategoryHashes.EnhancementsGhostsExperience:
			case PlugCategoryHashes.EnhancementsGhostsTracking:
			case PlugCategoryHashes.IntermediatePlugThatWorksInEveryCategory:
				return DeepsightPlugCategory.Mod;

			case PlugCategoryHashes.SocialClansPerks:
			case PlugCategoryHashes.Scopes:
			case PlugCategoryHashes.Barrels:
			case PlugCategoryHashes.Batteries:
			case PlugCategoryHashes.Magazines:
			case PlugCategoryHashes.Grips:
			case PlugCategoryHashes.Stocks:
			case PlugCategoryHashes.Blades:
			case PlugCategoryHashes.Guards:
			case PlugCategoryHashes.Bowstrings:
			case PlugCategoryHashes.Arrows:
			case PlugCategoryHashes.MagazinesGl:
			case PlugCategoryHashes.Tubes:
			case PlugCategoryHashes.Hafts:
			case PlugCategoryHashes.V300GhostsModsPerks:
			case PlugCategoryHashes.CraftingRecipesEmptySocket:
			case PlugCategoryHashes.EmblemPerk:
			case PlugCategoryHashes.RandomPerk:
				return DeepsightPlugCategory.Perk;

			case PlugCategoryHashes.StatusEffectTooltip:
				return DeepsightPlugCategory.StatusEffect;

			case PlugCategoryHashes.CraftingPlugsFrameIdentifiers:
				return DeepsightPlugCategory.Unknown;

			case PlugCategoryHashes.CraftingPlugsWeaponsModsMemories:
			case PlugCategoryHashes.CraftingPlugsWeaponsModsExtractors:
				return DeepsightPlugCategory.Extractable;

			case PlugCategoryHashes.SharedStasisTrinkets:
				return DeepsightPlugCategory.Subclass;

			case PlugCategoryHashes.DummyInfuse:
				return DeepsightPlugCategory.Infusion;
		}

		for (const traitHash of context.definition.traitHashes ?? []) {
			switch (traitHash) {
				case TraitHashes.ItemOrnamentArmor:
				case TraitHashes.ItemOrnamentWeapon:
				case TraitHashes.ItemArmorArms:
				case TraitHashes.ItemArmorChest:
				case TraitHashes.ItemArmorClass:
				case TraitHashes.ItemArmorHead:
				case TraitHashes.ItemArmorLegs:
					return DeepsightPlugCategory.Cosmetic;

				case TraitHashes.ItemExoticCatalyst:
					return DeepsightPlugCategory.Masterwork;

				case TraitHashes.ItemPlugAspect:
				case TraitHashes.ItemPlugFragment:
					return DeepsightPlugCategory.Subclass;
			}
		}

		for (const itemCategoryHash of context.definition.itemCategoryHashes ?? []) {
			switch (itemCategoryHash) {
				case ItemCategoryHashes.ArmorModsGlowEffects:
					return DeepsightPlugCategory.Cosmetic;
				case ItemCategoryHashes.GhostModsTrackers:
					return DeepsightPlugCategory.Cosmetic;
				case ItemCategoryHashes.SparrowModsPerks:
					return DeepsightPlugCategory.Perk;
				case ItemCategoryHashes.SparrowModsSpeed:
					return DeepsightPlugCategory.Intrinsic;
			}
		}

		for (const itemCategoryHash of context.definition.itemCategoryHashes ?? []) {
			switch (itemCategoryHash) {
				case ItemCategoryHashes.ArmorModsGlowEffects:
					return DeepsightPlugCategory.Cosmetic;

				case ItemCategoryHashes.ArmorMods: // matches ornaments, so this *must* come after the cosmetic checks
				case ItemCategoryHashes.GhostMods:
					return DeepsightPlugCategory.Mod;
			}
		}

		switch (context.definition.itemTypeDisplayName) {
			case "Deprecated Perk":
			case "Trait":
			case "Enhanced Trait":
				return DeepsightPlugCategory.Perk;

			case "Armor Mod":
			case "Weapon Mod":
			case "Deprecated Armor Mod":
			case "Deprecated Weapon Mod":
				return DeepsightPlugCategory.Mod;

			case "Ship Mod":
				return DeepsightPlugCategory.Perk;

			case "Artifact Perk":
				return DeepsightPlugCategory.Artifact;
		}

		const plugCategoryIdentifier = context.definition.plug?.plugCategoryIdentifier;
		if (plugCategoryIdentifier?.startsWith("armor_skins_"))
			return DeepsightPlugCategory.Cosmetic;

		if (plugCategoryIdentifier?.endsWith(".masterworks.trackers"))
			return DeepsightPlugCategory.Cosmetic;

		if (plugCategoryIdentifier?.includes(".masterworks."))
			return DeepsightPlugCategory.Masterwork;

		const lastPlugCategoryIdentifierSegment = plugCategoryIdentifier?.slice(plugCategoryIdentifier.lastIndexOf(".") + 1);
		switch (lastPlugCategoryIdentifierSegment) {
			case "aspects":
			case "fragments":
			case "class_abilities":
			case "supers":
			case "melee":
			case "grenades":
			case "movement":
				return DeepsightPlugCategory.Subclass;
		}

		switch (context.definition.displayProperties?.name) {
			case "Classified":
				return DeepsightPlugCategory.Classified;

			case "Upgrade Masterwork":
				return DeepsightPlugCategory.Masterwork;
		}

		if (context.definition.displayProperties?.name.endsWith(" Catalyst") && context.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies))
			return DeepsightPlugCategory.Masterwork;

		if (context.definition.displayProperties?.description.includes("An Exotic catalyst can be inserted into this socket."))
			return DeepsightPlugCategory.Masterwork;

		if (!context.definition.displayProperties?.name && (context.definition.plug?.plugCategoryHash === PlugCategoryHashes.Frames || context.definition.plug?.plugCategoryHash === PlugCategoryHashes.EnhancementsUniversal))
			return DeepsightPlugCategory.Unknown;

		return -1;
	}

	const plugTypeHandlers: Partial<Record<DeepsightPlugCategory, (context: DeepsightPlugContextDefinition) => number | void>> = {
		[DeepsightPlugCategory.Masterwork]: context => {
			switch (context.definition.hash) {
				case InventoryItemHashes.EmptyEnhancementSocket:
					return DeepsightPlugTypeMasterwork.EnhancementEmpty;
			}

			switch (context.definition.plug?.plugCategoryHash) {
				case PlugCategoryHashes.EventsSolsticeEmbers:
				case PlugCategoryHashes.EventsSolsticeEmbersEmpty:
				case PlugCategoryHashes.EventsSolsticeKindling:
					return DeepsightPlugTypeMasterwork.Event;
				case PlugCategoryHashes.CraftingPlugsWeaponsModsTransfusersLevel:
					return DeepsightPlugTypeMasterwork.ShapedWeapon;
				case PlugCategoryHashes.EventsDawning2022OvenNotMasterworked:
				case PlugCategoryHashes.EventsDawningOvenMasterworked:
					return DeepsightPlugTypeMasterwork.HolidayOven;
				case PlugCategoryHashes.V700WeaponsModsMissionAvalon:
					return DeepsightPlugTypeMasterwork.Authorization;
				case PlugCategoryHashes.ExoticWeaponMasterworkUpgrade:
					return DeepsightPlugTypeMasterwork.Weapon;
				case PlugCategoryHashes.V400EmptyExoticMasterwork:
					return DeepsightPlugTypeMasterwork.ExoticCatalystEmpty;
				case PlugCategoryHashes.CraftingPlugsWeaponsModsEnhancers:
					return DeepsightPlugTypeMasterwork.Enhancement;
			}

			const plugCategoryIdentifier = context.definition.plug?.plugCategoryIdentifier;
			if (plugCategoryIdentifier) {
				if (plugCategoryIdentifier.includes(".armor.masterworks.") || plugCategoryIdentifier.includes(".masterworks.armor.") || plugCategoryIdentifier.includes(".masterworks.generic.armor."))
					return DeepsightPlugTypeMasterwork.Armor;

				if (plugCategoryIdentifier.includes(".weapons.masterworks") || plugCategoryIdentifier.includes(".masterworks.weapons.") || plugCategoryIdentifier.includes(".masterworks.generic.weapons."))
					return DeepsightPlugTypeMasterwork.Weapon;

				if (plugCategoryIdentifier.includes(".ghosts.masterworks"))
					return DeepsightPlugTypeMasterwork.Ghost;
			}

			for (const traitHash of context.definition.traitHashes ?? []) {
				switch (traitHash) {
					case TraitHashes.ItemExoticCatalyst:
						return DeepsightPlugTypeMasterwork.ExoticCatalyst;
				}
			}

			switch (context.definition.displayProperties?.name) {
				case "Upgrade Masterwork":
					return DeepsightPlugTypeMasterwork.ExoticCatalystUpgrade;
			}

			if (context.definition.displayProperties.description.includes("An Exotic catalyst can be inserted into this socket."))
				return DeepsightPlugTypeMasterwork.ExoticCatalystEmpty;

			if (context.definition.displayProperties?.name.endsWith(" Catalyst") && context.definition.itemCategoryHashes?.includes(ItemCategoryHashes.Dummies))
				return DeepsightPlugTypeMasterwork.ExoticCatalystAvailable;
		},
		[DeepsightPlugCategory.Vendor]: context => {
			switch (context.definition.plug?.plugCategoryHash) {
				case PlugCategoryHashes.EventsDawning2022Recipe:
				case PlugCategoryHashes.EventsDawning2022NoRecipe:
				case PlugCategoryHashes.EventsDawning2022IngredientA:
				case PlugCategoryHashes.EventsDawning2022IngredientB:
				case PlugCategoryHashes.EventsDawning2022OvenCombine:
				case PlugCategoryHashes.EventsDawning2022OvenEmpty:
				case PlugCategoryHashes.EventsDawning2022OvenEmptyCombination:
					return DeepsightPlugTypeVendor.HolidayOven;
			}
		},
		[DeepsightPlugCategory.Extractable]: context => {
			switch (context.definition.plug?.plugCategoryHash) {
				case PlugCategoryHashes.CraftingPlugsWeaponsModsMemories:
				case PlugCategoryHashes.CraftingPlugsWeaponsModsExtractors:
					return DeepsightPlugTypeExtractable.DeepsightResonance;
			}
		},
		[DeepsightPlugCategory.Intrinsic]: context => {
			if (context.definition.itemTypeDisplayName === "Enhanced Intrinsic")
				return DeepsightPlugTypeIntrinsic.EnhancedFrame;

			if (context.definition.itemTypeAndTierDisplayName === "Exotic Intrinsic")
				return DeepsightPlugTypeIntrinsic.Exotic;

			switch (context.definition.plug?.plugCategoryHash) {
				case PlugCategoryHashes.Intrinsics:
					return DeepsightPlugTypeIntrinsic.Frame;
				case PlugCategoryHashes.Origins:
					return DeepsightPlugTypeIntrinsic.Origin;
			}

			for (const itemCategoryHash of context.definition.itemCategoryHashes ?? []) {
				switch (itemCategoryHash) {
					case ItemCategoryHashes.SparrowModsSpeed:
						return DeepsightPlugTypeIntrinsic.SparrowEngine;
				}
			}
		},
		[DeepsightPlugCategory.Subclass]: context => {
			for (const traitHash of context.definition.traitHashes ?? []) {
				switch (traitHash) {
					case TraitHashes.ItemPlugAspect:
						return DeepsightPlugTypeSubclass.Aspect;
					case TraitHashes.ItemPlugFragment:
						return DeepsightPlugTypeSubclass.Fragment;
				}
			}

			const plugCategoryIdentifiers = context.definition.plug?.plugCategoryIdentifier.split(/\./g);
			const lastPlugCategoryIdentifier = plugCategoryIdentifiers?.[plugCategoryIdentifiers.length - 1];

			switch (lastPlugCategoryIdentifier) {
				case "aspects":
					return DeepsightPlugTypeSubclass.Aspect;
				case "fragments":
				case "trinkets":
					return DeepsightPlugTypeSubclass.Fragment;
				case "class_abilities":
					return DeepsightPlugTypeSubclass.ClassAbility;
				case "supers":
					return DeepsightPlugTypeSubclass.Super;
				case "melee":
					return DeepsightPlugTypeSubclass.Melee;
				case "grenades":
					return DeepsightPlugTypeSubclass.Grenade;
				case "movement":
					return DeepsightPlugTypeSubclass.Movement;
			}
		},
		[DeepsightPlugCategory.Mod]: context => {
			switch (context.definition.hash) {
				case InventoryItemHashes.EmptyModSocket:
					return DeepsightPlugTypeMod.EmptySocket;
			}

			switch (context.definition.plug?.plugCategoryHash) {
				case PlugCategoryHashes.EnhancementsArms:
				case PlugCategoryHashes.EnhancementsChest:
				case PlugCategoryHashes.EnhancementsClass:
				case PlugCategoryHashes.EnhancementsHead:
				case PlugCategoryHashes.EnhancementsLegs:
				case PlugCategoryHashes.EnhancementsExoticAeonCult:
				case PlugCategoryHashes.EnhancementsV2Arms:
				case PlugCategoryHashes.EnhancementsV2Chest:
				case PlugCategoryHashes.EnhancementsV2ClassItem:
				case PlugCategoryHashes.EnhancementsV2Head:
				case PlugCategoryHashes.EnhancementsV2Legs:
				case PlugCategoryHashes.EnhancementsV2General:
				case PlugCategoryHashes.EnhancementsRaidDescent:
				case PlugCategoryHashes.EnhancementsRaidGarden:
				case PlugCategoryHashes.EnhancementsRaidV520:
				case PlugCategoryHashes.EnhancementsRaidV600:
				case PlugCategoryHashes.EnhancementsRaidV620:
				case PlugCategoryHashes.EnhancementsRaidV700:
				case PlugCategoryHashes.EnhancementsRaidV720:
				case PlugCategoryHashes.EnhancementsArtifice:
					return DeepsightPlugTypeMod.Armor;
				case PlugCategoryHashes.EnhancementsGhostsEconomic:
				case PlugCategoryHashes.EnhancementsGhostsActivity:
				case PlugCategoryHashes.EnhancementsGhostsActivityFake:
				case PlugCategoryHashes.EnhancementsGhostsExperience:
				case PlugCategoryHashes.EnhancementsGhostsTracking:
					return DeepsightPlugTypeMod.Ghost;
				case PlugCategoryHashes.IntermediatePlugThatWorksInEveryCategory:
					return DeepsightPlugTypeMod.Fallback;
			}

			switch (context.definition.itemTypeDisplayName) {
				case "Weapon Mod":
					return DeepsightPlugTypeMod.Weapon;
				case "Armor Mod":
					return DeepsightPlugTypeMod.Armor;
				case "Deprecated Weapon Mod":
				case "Deprecated Armor Mod":
					return DeepsightPlugTypeMod.Deprecated;
			}

			for (const itemCategoryHash of context.definition.itemCategoryHashes ?? []) {
				switch (itemCategoryHash) {
					case ItemCategoryHashes.ArmorMods:
						return DeepsightPlugTypeMod.Armor;
				}
			}
		},
		[DeepsightPlugCategory.Perk]: context => {
			switch (context.definition.hash) {
				case InventoryItemHashes.RandomizedPerksIntrinsicDummy:
				case InventoryItemHashes.RandomizedPerks1IntrinsicDummy:
				case InventoryItemHashes.RandomizedPerks1IntrinsicDummy2:
				case InventoryItemHashes.RandomizedPerks1IntrinsicDummy3:
				case InventoryItemHashes.RandomizedPerks2IntrinsicDummy:
					return DeepsightPlugTypePerk.Random;

				case InventoryItemHashes.TraitLocked:
				case InventoryItemHashes.TraitLocked2:
					return DeepsightPlugTypePerk.TraitLocked;
			}

			switch (context.definition.plug?.plugCategoryHash) {
				case PlugCategoryHashes.Scopes:
					return DeepsightPlugTypePerk.Scope;
				case PlugCategoryHashes.Barrels:
					return DeepsightPlugTypePerk.Barrel;
				case PlugCategoryHashes.Batteries:
					return DeepsightPlugTypePerk.Battery;
				case PlugCategoryHashes.Magazines:
					return DeepsightPlugTypePerk.Magazine;
				case PlugCategoryHashes.Grips:
					return DeepsightPlugTypePerk.Grip;
				case PlugCategoryHashes.Stocks:
					return DeepsightPlugTypePerk.Stock;
				case PlugCategoryHashes.Blades:
					return DeepsightPlugTypePerk.Blade;
				case PlugCategoryHashes.Guards:
					return DeepsightPlugTypePerk.Guard;
				case PlugCategoryHashes.Bowstrings:
					return DeepsightPlugTypePerk.Bowstring;
				case PlugCategoryHashes.Arrows:
					return DeepsightPlugTypePerk.Arrow;
				case PlugCategoryHashes.MagazinesGl:
					return DeepsightPlugTypePerk.GrenadeLauncherMagazine;
				case PlugCategoryHashes.Tubes:
					return DeepsightPlugTypePerk.Tube;
				case PlugCategoryHashes.Hafts:
					return DeepsightPlugTypePerk.Haft;
				case PlugCategoryHashes.SocialClansPerks:
					return DeepsightPlugTypePerk.Clan;
				case PlugCategoryHashes.V300GhostsModsPerks:
					return DeepsightPlugTypePerk.Ghost;
				case PlugCategoryHashes.CraftingRecipesEmptySocket:
					return DeepsightPlugTypePerk.EmptyCraftingSocket;
				case PlugCategoryHashes.EmblemPerk:
					return DeepsightPlugTypePerk.EmblemAura;
				case PlugCategoryHashes.RandomPerk:
					return DeepsightPlugTypePerk.Random;
			}

			switch (context.definition.itemTypeDisplayName) {
				case "Trait":
					return DeepsightPlugTypePerk.Trait;
				case "Enhanced Trait":
					return DeepsightPlugTypePerk.EnhancedTrait;
				case "Deprecated Perk":
					return DeepsightPlugTypePerk.Deprecated;
				case "Ship Mod":
					return DeepsightPlugTypePerk.Ship;
			}

			for (const itemCategoryHash of context.definition.itemCategoryHashes ?? []) {
				switch (itemCategoryHash) {
					case ItemCategoryHashes.Dummies:
						return DeepsightPlugTypePerk.Dummy;
					case ItemCategoryHashes.SparrowModsPerks:
						return DeepsightPlugTypePerk.Sparrow;
				}
			}
		},
		[DeepsightPlugCategory.Cosmetic]: context => {
			switch (context.definition.hash) {
				case InventoryItemHashes.DefaultEmblemEmblem:
					return DeepsightPlugTypeCosmetic.EmblemEmpty;
				case InventoryItemHashes.BaseRadiance:
					return DeepsightPlugTypeCosmetic.Radiance;
			}

			switch (context.definition.plug?.plugCategoryHash) {
				case PlugCategoryHashes.Shader:
				case PlugCategoryHashes.DawningShipShader:
					return DeepsightPlugTypeCosmetic.Shader;
				case PlugCategoryHashes.Mementos:
					return DeepsightPlugTypeCosmetic.Memento;
				case PlugCategoryHashes.Emote:
					return DeepsightPlugTypeCosmetic.Emote;
				case PlugCategoryHashes.ShipSpawnfx:
				case PlugCategoryHashes.DawningShipSpawnfx:
					return DeepsightPlugTypeCosmetic.TransmatEffect;
				case PlugCategoryHashes.V500ShipsEventsDawningExoticShip0Engines:
					return DeepsightPlugTypeCosmetic.ShipEngineEffect;
				case PlugCategoryHashes.Hologram:
					return DeepsightPlugTypeCosmetic.GhostProjection;
				case PlugCategoryHashes.ArmorSkinsSharedHead:
				case PlugCategoryHashes.ExoticAllSkins:
					return DeepsightPlugTypeCosmetic.Ornament;
				case PlugCategoryHashes.SocialClansStaves:
					return DeepsightPlugTypeCosmetic.ClanBannerStaff;
			}

			for (const traitHash of context.definition.traitHashes ?? []) {
				switch (traitHash) {
					case TraitHashes.ItemOrnamentArmor:
					case TraitHashes.ItemOrnamentWeapon:
					case TraitHashes.ItemArmorArms:
					case TraitHashes.ItemArmorChest:
					case TraitHashes.ItemArmorClass:
					case TraitHashes.ItemArmorHead:
					case TraitHashes.ItemArmorLegs:
						return DeepsightPlugTypeCosmetic.Ornament;
				}
			}

			for (const itemCategoryHash of context.definition.itemCategoryHashes ?? []) {
				switch (itemCategoryHash) {
					case ItemCategoryHashes.ArmorModsGlowEffects:
						return DeepsightPlugTypeCosmetic.ArmorGlow;
					case ItemCategoryHashes.GhostModsTrackers:
						return DeepsightPlugTypeCosmetic.GhostTracker;
				}
			}

			const plugCategoryIdentifier = context.definition.plug?.plugCategoryIdentifier;
			if (plugCategoryIdentifier?.endsWith(".masterworks.trackers"))
				return DeepsightPlugTypeCosmetic.Tracker;

			if (plugCategoryIdentifier?.startsWith("armor_skins_"))
				return DeepsightPlugTypeCosmetic.Ornament;
		},
	};

	function getArmourModBucketHash (context: DeepsightPlugContextDefinition) {
		switch (context.definition.plug?.plugCategoryHash) {
			case PlugCategoryHashes.EnhancementsV2Arms:
				return InventoryBucketHashes.Gauntlets;
			case PlugCategoryHashes.EnhancementsV2Chest:
				return InventoryBucketHashes.ChestArmor;
			case PlugCategoryHashes.EnhancementsV2ClassItem:
				return InventoryBucketHashes.ClassArmor;
			case PlugCategoryHashes.EnhancementsV2Head:
				return InventoryBucketHashes.Helmet;
			case PlugCategoryHashes.EnhancementsV2Legs:
				return InventoryBucketHashes.LegArmor;
		}

		return InventoryBucketHashes.General;
	}

	function getArmourModRaidActivityHash (context: DeepsightPlugContextDefinition) {
		switch (context.definition.itemTypeDisplayName) {
			case "Deep Stone Crypt Raid Mod":
				return ActivityHashes.DeepStoneCrypt2;
			case "Root of Nightmares Armor Mod":
				return ActivityHashes.RootOfNightmaresNormal;
			case "Crota's End Mod":
				return ActivityHashes.CrotasEndNormal;
			case "Last Wish Raid Mod":
				return ActivityHashes.LastWishNormal;
			case "Garden of Salvation Raid Mod":
				return ActivityHashes.GardenOfSalvation;
			case "Vault of Glass Armor Mod":
				return ActivityHashes.VaultOfGlass;
			case "Vow of the Disciple Raid Mod":
				return ActivityHashes.VowOfTheDiscipleNormal;
			case "King's Fall Mod":
				return ActivityHashes.KingsFallNormal;
		}
	}

	const subclasses: Record<string, InventoryItemHashes[]> = {
		"hunter.void": [InventoryItemHashes.NightstalkerHunterSubclass],
		"hunter.solar": [InventoryItemHashes.GunslingerHunterSubclass],
		"hunter.arc": [InventoryItemHashes.ArcstriderHunterSubclass],
		"hunter.stasis": [InventoryItemHashes.RevenantHunterSubclass],
		"hunter.strand": [InventoryItemHashes.ThreadrunnerHunterSubclass],

		"titan.void": [InventoryItemHashes.SentinelTitanSubclass],
		"titan.solar": [InventoryItemHashes.SunbreakerTitanSubclass],
		"titan.arc": [InventoryItemHashes.StrikerTitanSubclass],
		"titan.stasis": [InventoryItemHashes.BehemothTitanSubclass],
		"titan.strand": [InventoryItemHashes.BerserkerTitanSubclass],

		"warlock.void": [InventoryItemHashes.VoidwalkerWarlockSubclass],
		"warlock.solar": [InventoryItemHashes.DawnbladeWarlockSubclass],
		"warlock.arc": [InventoryItemHashes.StormcallerWarlockSubclass],
		"warlock.stasis": [InventoryItemHashes.ShadebinderWarlockSubclass],
		"warlock.strand": [InventoryItemHashes.BroodweaverWarlockSubclass],

		"shared.void": [InventoryItemHashes.NightstalkerHunterSubclass, InventoryItemHashes.SentinelTitanSubclass, InventoryItemHashes.VoidwalkerWarlockSubclass],
		"shared.solar": [InventoryItemHashes.GunslingerHunterSubclass, InventoryItemHashes.SunbreakerTitanSubclass, InventoryItemHashes.DawnbladeWarlockSubclass],
		"shared.arc": [InventoryItemHashes.ArcstriderHunterSubclass, InventoryItemHashes.StrikerTitanSubclass, InventoryItemHashes.StormcallerWarlockSubclass],
		"shared.stasis": [InventoryItemHashes.RevenantHunterSubclass, InventoryItemHashes.BehemothTitanSubclass, InventoryItemHashes.ShadebinderWarlockSubclass],
		"shared.strand": [InventoryItemHashes.ThreadrunnerHunterSubclass, InventoryItemHashes.BerserkerTitanSubclass, InventoryItemHashes.BroodweaverWarlockSubclass],
	};

	let DestinyInventoryBucketDefinition: Record<number, DestinyInventoryBucketDefinition> | undefined;

	const additionalDetailsHandlers: Partial<Record<DeepsightPlugCategory, (context: DeepsightPlugContextDefinition, type?: number) => any>> = {
		[DeepsightPlugCategory.Masterwork]: (context, type?: number) => {
			const result = {
				stat: -1 as StatHashes,
				complete: false,
			} as Partial<DeepsightPlugCategorisationMasterwork>;

			const primaryInvestmentStat = context.definition.investmentStats[0];
			result.stat = primaryInvestmentStat?.statTypeHash;
			result.value = primaryInvestmentStat?.value;
			result.complete =
				type !== DeepsightPlugTypeMasterwork.Weapon && type !== DeepsightPlugTypeMasterwork.Armor && type !== DeepsightPlugTypeMasterwork.Ghost ? undefined
					: result.value === 10;

			return result;
		},
		[DeepsightPlugCategory.Mod]: (context, type?: DeepsightPlugTypeMod) => {
			const bucketHash = type === DeepsightPlugTypeMod.Armor ? getArmourModBucketHash(context) as InventoryBucketHashes : undefined;
			const activityHash = type === DeepsightPlugTypeMod.Armor ? getArmourModRaidActivityHash(context) as ActivityHashes : undefined;

			const result = {
				bucketHash,
				bucketHashName: EnumHelper.simplifyName(DestinyInventoryBucketDefinition?.[bucketHash!]?.displayProperties?.name),
				adept: type !== DeepsightPlugTypeMod.Weapon ? undefined : context.definition.displayProperties?.name.startsWith("Adept "),
				raid: activityHash !== undefined,
				activityHash,
				artifice: context.definition.plug?.plugCategoryHash === PlugCategoryHashes.EnhancementsArtifice,
			} as Partial<DeepsightPlugCategorisationMod>;

			return result;
		},
		[DeepsightPlugCategory.Subclass]: (context, type?: DeepsightPlugTypeMod) => {
			const plugCategoryIdentifier = context.definition.plug?.plugCategoryIdentifier;
			const result = {
				subclasses: !plugCategoryIdentifier ? undefined
					: subclasses[plugCategoryIdentifier.slice(0, plugCategoryIdentifier.lastIndexOf("."))],
			} as Partial<DeepsightPlugCategorisationSubclass>;

			return result;
		},
	};

	export async function resolve () {
		const DeepsightPlugCategorisation: Record<number, DeepsightPlugCategorisation> = {};

		const plugContexts = await DeepsightPlugContextDefinition.discover();

		const DestinyItemCategoryDefinition = await manifest.DestinyItemCategoryDefinition.all();
		DestinyInventoryBucketDefinition = await manifest.DestinyInventoryBucketDefinition.all();

		const uncategorised: DeepsightPlugContextDefinition[] = [];

		for (const [plugItemHash, context] of Object.entries(plugContexts)) {
			const category = determinePlugCategory(context) as DeepsightPlugCategory;
			const plugTypeEnum = DeepsightPlugTypeMap[category];
			const type = plugTypeEnum ? plugTypeHandlers[category]?.(context) ?? -1 : undefined;
			const categoryName = DeepsightPlugCategory[category];
			const typeName = plugTypeEnum?.[type!];
			DeepsightPlugCategorisation[+plugItemHash] = {
				...process.env.DEEPSIGHT_ENVIRONMENT !== "dev" ? undefined : {
					name: context.definition.displayProperties?.name,
					itemTypeName: context.definition.itemTypeDisplayName,
					itemTypeAndTierName: context.definition.itemTypeAndTierDisplayName,
					itemCategoryHashes: context.definition.itemCategoryHashes,
					itemCategoryIdentifiers: context.definition.itemCategoryHashes?.map(hash => EnumHelper.simplifyName(DestinyItemCategoryDefinition[hash].displayProperties?.name)),
					plugCategoryIdentifier: context.definition.plug?.plugCategoryIdentifier,
					traitIds: context.definition.traitIds,
				},
				category,
				type,
				categoryName,
				typeName,
				...additionalDetailsHandlers[category]?.(context, type),
				context: category as number !== -1 ? undefined : context,
			} as DeepsightPlugCategorisation;

			if (category as number === -1 || type === -1)
				uncategorised.push(context);
		}

		if (uncategorised.length) {
			const message = `Some plugs were not categorised:\n- ${uncategorised
				.map(context =>
					[
						context.definition.hash,
						context.definition.displayProperties?.name ?? "???",
						context.definition.plug?.plugCategoryIdentifier ?? "no plug cat id",
					]
						.join(" / "))
				.join("\n- ")}`;

			if (process.env.DEEPSIGHT_ENVIRONMENT === "dev")
				Log.warn(message);
			else
				throw new Error(message);
		}

		return DeepsightPlugCategorisation;
	}
}

export default DeepsightPlugCategorisation;
