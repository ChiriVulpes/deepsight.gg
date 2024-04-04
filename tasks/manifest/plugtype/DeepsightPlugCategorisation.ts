import { ActivityHashes, DamageTypeHashes, InventoryBucketHashes, InventoryItemHashes, ItemCategoryHashes, ItemTierTypeHashes, PlugCategoryHashes, StatHashes, TraitHashes } from "@deepsight.gg/enums";
import type { DestinyInventoryBucketDefinition } from "bungie-api-ts/destiny2";
import { DestinyClass, DestinyItemType } from "bungie-api-ts/destiny2";
import { EnumHelper } from "../../generate_enums";
import Env from "../../utility/Env";
import Log from "../../utility/Log";
import type { DeepsightItemInvestmentStatDefinition, DeepsightPlugCategorisationMasterwork, DeepsightPlugCategorisationMod, DeepsightPlugCategorisationSubclass } from "../IDeepsightPlugCategorisation";
import { DeepsightPlugCategorisation, DeepsightPlugCategory, DeepsightPlugTypeCosmetic, DeepsightPlugTypeExtractable, DeepsightPlugTypeIntrinsic, DeepsightPlugTypeMap, DeepsightPlugTypeMasterwork, DeepsightPlugTypeMod, DeepsightPlugTypePerk, DeepsightPlugTypeSubclass, DeepsightPlugTypeVendor } from "../IDeepsightPlugCategorisation";
import manifest from "../utility/endpoint/DestinyManifest";
import DeepsightPlugContextDefinition from "./DeepsightPlugContextDefinition";

namespace DeepsightPlugCategorisation {

	function determinePlugCategory (context: DeepsightPlugContextDefinition) {
		switch (context.definition.hash) {
			case InventoryItemHashes.RandomizedPerksIntrinsicDummyPlug:
			case InventoryItemHashes.RandomizedPerks1IntrinsicDummyPlug2443995506:
			case InventoryItemHashes.RandomizedPerks1IntrinsicDummyPlug4114716976:
			case InventoryItemHashes.RandomizedPerks1IntrinsicDummyPlug440670601:
			case InventoryItemHashes.RandomizedPerks2IntrinsicDummyPlug:
			case InventoryItemHashes.TraitLockedPlug2106726848:
			case InventoryItemHashes.TraitLockedPlug3665398231:
				return DeepsightPlugCategory.Perk;

			case InventoryItemHashes.EmptyModSocketPlug:
				return DeepsightPlugCategory.Mod;

			case InventoryItemHashes.EmptyMementoSocketPlug:
				return DeepsightPlugCategory.Cosmetic;
		}

		switch (context.definition.plug?.plugCategoryHash) {
			case PlugCategoryHashes.Intrinsics:
			case PlugCategoryHashes.Origins:
			case PlugCategoryHashes.V300VehiclesModControls:
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
			case PlugCategoryHashes.V420PlugsWeaponsMasterworksToggleVfx:
				return DeepsightPlugCategory.Cosmetic;

			case PlugCategoryHashes.PlugsGhostsMasterworks:
			case PlugCategoryHashes.EventsSolsticeEmbers:
			case PlugCategoryHashes.EventsSolsticeEmbersEmpty:
			case PlugCategoryHashes.EventsSolsticeKindling:
			case PlugCategoryHashes.CraftingPlugsWeaponsModsTransfusersLevel:
			case PlugCategoryHashes.EventsDawningTurnkeyOvenNotMasterworked:
			case PlugCategoryHashes.EventsDawningOvenMasterworked:
			case PlugCategoryHashes.V400PlugsWeaponsMasterworks:
			case PlugCategoryHashes.V700WeaponsModsMissionAvalon:
			case PlugCategoryHashes.ExoticWeaponMasterworkUpgrade:
			case PlugCategoryHashes.V400EmptyExoticMasterwork:
			case PlugCategoryHashes.CraftingPlugsWeaponsModsEnhancers:
				return DeepsightPlugCategory.Masterwork;

			case PlugCategoryHashes.EventsDawningTurnkeyRecipe:
			case PlugCategoryHashes.EventsDawningTurnkeyNoRecipe:
			case PlugCategoryHashes.EventsDawningTurnkeyIngredientA:
			case PlugCategoryHashes.EventsDawningTurnkeyIngredientB:
			case PlugCategoryHashes.EventsDawningTurnkeyOvenCombine:
			case PlugCategoryHashes.EventsDawningTurnkeyOvenEmpty:
			case PlugCategoryHashes.EventsDawningTurnkeyOvenEmptyCombination:
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

		switch (context.definition.itemTypeDisplayName) {
			case "Deprecated Perk":
			case "Trait":
			case "Enhanced Trait":
				return DeepsightPlugCategory.Perk;
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
				case InventoryItemHashes.EmptyEnhancementSocketPlug:
					return DeepsightPlugTypeMasterwork.EnhancementEmpty;
				case InventoryItemHashes.MasterworkUpgradePlug1176735155:
					return DeepsightPlugTypeMasterwork.ArmorEmpty;
				case InventoryItemHashes.ReworkArmorPlug:
					return DeepsightPlugTypeMasterwork.Legacy;
				case InventoryItemHashes.ProtocolSocketPlug:
					return DeepsightPlugTypeMasterwork.AuthorizationEmpty;
				case InventoryItemHashes.NoEmberImbuedSolsticeEmbersPlug:
					return DeepsightPlugTypeMasterwork.EventSolsticeEmbersEmpty;
				case InventoryItemHashes.NoKindlingAddedKindlingPlug:
					return DeepsightPlugTypeMasterwork.EventSolsticeKindlingEmpty;
				case InventoryItemHashes.EmptyWeaponLevelBoostSocketPlug:
					return DeepsightPlugTypeMasterwork.ShapedWeaponEmpty;
				case InventoryItemHashes.MasterworkUpgradePlug236077174:
					return DeepsightPlugTypeMasterwork.WeaponEmpty;
			}

			switch (context.definition.plug?.plugCategoryHash) {
				case PlugCategoryHashes.EventsSolsticeEmbers:
					return DeepsightPlugTypeMasterwork.EventSolsticeEmbers;
				case PlugCategoryHashes.EventsSolsticeKindling:
					return DeepsightPlugTypeMasterwork.EventSolsticeKindling;
				case PlugCategoryHashes.CraftingPlugsWeaponsModsTransfusersLevel:
					return DeepsightPlugTypeMasterwork.ShapedWeapon;
				case PlugCategoryHashes.EventsDawningTurnkeyOvenNotMasterworked:
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
				case PlugCategoryHashes.EventsDawningTurnkeyRecipe:
				case PlugCategoryHashes.EventsDawningTurnkeyNoRecipe:
				case PlugCategoryHashes.EventsDawningTurnkeyIngredientA:
				case PlugCategoryHashes.EventsDawningTurnkeyIngredientB:
				case PlugCategoryHashes.EventsDawningTurnkeyOvenCombine:
				case PlugCategoryHashes.EventsDawningTurnkeyOvenEmpty:
				case PlugCategoryHashes.EventsDawningTurnkeyOvenEmptyCombination:
					return DeepsightPlugTypeVendor.HolidayOven;
			}
		},
		[DeepsightPlugCategory.Extractable]: context => {
			switch (context.definition.hash) {
				case InventoryItemHashes.EmptyDeepsightSocketPlug:
					return DeepsightPlugTypeExtractable.DeepsightActivation;
			}
			switch (context.definition.plug?.plugCategoryHash) {
				case PlugCategoryHashes.CraftingPlugsWeaponsModsMemories:
				case PlugCategoryHashes.CraftingPlugsWeaponsModsExtractors:
					return DeepsightPlugTypeExtractable.DeepsightResonance;
			}
		},
		[DeepsightPlugCategory.Intrinsic]: context => {
			switch (context.definition.hash) {
				case InventoryItemHashes.ArtificeArmorIntrinsicPlug:
					return DeepsightPlugTypeIntrinsic.ArmorArtifice;

				case InventoryItemHashes.FriendlyCompetitionIntrinsicPlug2596471870:
				case InventoryItemHashes.FriendlyCompetitionIntrinsicPlug2596471871:
				case InventoryItemHashes.SpiritOfCompetitionIntrinsicPlug:
					return DeepsightPlugTypeIntrinsic.Armor; // special case weird guardian games armour perks

				case InventoryItemHashes.Collector1IntrinsicPlug:
				case InventoryItemHashes.Collector2IntrinsicPlug:
				case InventoryItemHashes.Collector3IntrinsicPlug:
				case InventoryItemHashes.Reaper1IntrinsicPlug:
				case InventoryItemHashes.Reaper2IntrinsicPlug:
				case InventoryItemHashes.Reaper3IntrinsicPlug:
				case InventoryItemHashes.Invader1IntrinsicPlug:
				case InventoryItemHashes.Invader2IntrinsicPlug:
				case InventoryItemHashes.Invader3IntrinsicPlug:
				case InventoryItemHashes.Sentry1IntrinsicPlug:
				case InventoryItemHashes.Sentry2IntrinsicPlug:
				case InventoryItemHashes.Sentry3IntrinsicPlug:
				case InventoryItemHashes.DeepStoneCryptArmorIntrinsicPlug:
				case InventoryItemHashes.GardenOfSalvationArmorIntrinsicPlug:
				case InventoryItemHashes.LastWishArmorIntrinsicPlug:
					return DeepsightPlugTypeIntrinsic.ArmorLegacy;

				case InventoryItemHashes.UnrepentantIntrinsicPlug1579862386:
				case InventoryItemHashes.ExhumationIntrinsicPlug1563633475:
					return DeepsightPlugTypeIntrinsic.Exotic; // these are old/dummy versions of these perks

				case InventoryItemHashes.AdaptiveFrameIntrinsicPlug2189829540:
					return DeepsightPlugTypeIntrinsic.Frame; // rose's adaptive frame is considered exotic tier
			}

			if (context.definition.itemTypeDisplayName === "Enhanced Intrinsic")
				return DeepsightPlugTypeIntrinsic.FrameEnhanced;

			if (context.definition.itemTypeAndTierDisplayName === "Exotic Intrinsic")
				return DeepsightPlugTypeIntrinsic.Exotic;

			switch (context.definition.plug?.plugCategoryHash) {
				case PlugCategoryHashes.Origins:
					return DeepsightPlugTypeIntrinsic.Origin;
				case PlugCategoryHashes.V300VehiclesModControls:
					return DeepsightPlugTypeIntrinsic.Controls;
				case PlugCategoryHashes.Intrinsics:
					if (DeepsightPlugContextDefinition.isExoticOnly(context))
						return DeepsightPlugTypeIntrinsic.Exotic;

					if (DeepsightPlugContextDefinition.isOnOnlyType(DestinyItemType.Armor, context)) {
						if (context.definition.inventory?.tierTypeHash === ItemTierTypeHashes.Common)
							return DeepsightPlugTypeIntrinsic.ArmorLegacy; // catches all the old armour stat perks

						return DeepsightPlugTypeIntrinsic.Armor;
					}

					return DeepsightPlugTypeIntrinsic.Frame;
			}

			for (const itemCategoryHash of context.definition.itemCategoryHashes ?? []) {
				switch (itemCategoryHash) {
					case ItemCategoryHashes.SparrowModsSpeed:
						return DeepsightPlugTypeIntrinsic.SparrowEngine;
				}
			}
		},
		[DeepsightPlugCategory.Subclass]: context => {
			const plugType = (() => {
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
			})();

			if (context.definition.displayProperties?.name?.endsWith(" Socket")) {
				switch (plugType) {
					case DeepsightPlugTypeSubclass.Aspect: return DeepsightPlugTypeSubclass.AspectEmpty;
					case DeepsightPlugTypeSubclass.Fragment: return DeepsightPlugTypeSubclass.FragmentEmpty;
					case DeepsightPlugTypeSubclass.Super: return DeepsightPlugTypeSubclass.SuperEmpty;
					case DeepsightPlugTypeSubclass.Grenade: return DeepsightPlugTypeSubclass.GrenadeEmpty;
					case DeepsightPlugTypeSubclass.Melee: return DeepsightPlugTypeSubclass.MeleeEmpty;
					case DeepsightPlugTypeSubclass.ClassAbility: return DeepsightPlugTypeSubclass.ClassAbilityEmpty;
					case DeepsightPlugTypeSubclass.Movement: return DeepsightPlugTypeSubclass.MovementEmpty;
				}
			}

			return plugType;
		},
		[DeepsightPlugCategory.Mod]: context => {
			const plugType = (() => {
				switch (context.definition.itemTypeDisplayName) {
					case "Deprecated Weapon Mod":
					case "Deprecated Armor Mod":
						return DeepsightPlugTypeMod.Deprecated;
				}

				if (context.definition.displayProperties?.description?.includes("This mod has been deprecated"))
					return DeepsightPlugTypeMod.Deprecated;

				switch (context.definition.displayProperties?.name?.trim()) {
					case "":
						return DeepsightPlugTypeMod.Deprecated;
					case "Locked Armor Mod":
						return DeepsightPlugTypeMod.ArmorLocked;
				}

				switch (context.definition.plug?.plugCategoryHash) {
					case PlugCategoryHashes.Deprecated:
					case PlugCategoryHashes.V404ArmorFotlMasksAbyssPerks:
						return DeepsightPlugTypeMod.Deprecated;

					case PlugCategoryHashes.EnhancementsExoticAeonCult:
						return DeepsightPlugTypeMod.ArmorExotic;

					case PlugCategoryHashes.EnhancementsArms:
					case PlugCategoryHashes.EnhancementsChest:
					case PlugCategoryHashes.EnhancementsClass:
					case PlugCategoryHashes.EnhancementsHead:
					case PlugCategoryHashes.EnhancementsLegs:
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
				}

				for (const itemCategoryHash of context.definition.itemCategoryHashes ?? []) {
					switch (itemCategoryHash) {
						case ItemCategoryHashes.ArmorMods:
							return DeepsightPlugTypeMod.Armor;
					}
				}

				switch (context.definition.displayProperties?.name) {
					case "Empty Mod Socket":
						return DeepsightPlugTypeMod.UniversalEmpty;
				}
			})();

			if (plugType === DeepsightPlugTypeMod.Weapon && context.definition.plug?.insertionRules.some(rule => rule.failureMessage === "Requires Adept Weapon"))
				return DeepsightPlugTypeMod.WeaponAdept;

			if (context.definition.displayProperties?.name.endsWith("Mod Socket")) {
				switch (plugType) {
					case DeepsightPlugTypeMod.Armor:
						return DeepsightPlugTypeMod.ArmorEmpty;
					case DeepsightPlugTypeMod.Weapon:
						return DeepsightPlugTypeMod.WeaponEmpty;
					case DeepsightPlugTypeMod.Ghost:
						return DeepsightPlugTypeMod.GhostEmpty;
				}
			}

			return plugType;
		},
		[DeepsightPlugCategory.Perk]: context => {
			switch (context.definition.hash) {
				case InventoryItemHashes.RandomizedPerksIntrinsicDummyPlug:
				case InventoryItemHashes.RandomizedPerks1IntrinsicDummyPlug2443995506:
				case InventoryItemHashes.RandomizedPerks1IntrinsicDummyPlug4114716976:
				case InventoryItemHashes.RandomizedPerks1IntrinsicDummyPlug440670601:
				case InventoryItemHashes.RandomizedPerks2IntrinsicDummyPlug:
					return DeepsightPlugTypePerk.Random;

				case InventoryItemHashes.TraitLockedPlug2106726848:
				case InventoryItemHashes.TraitLockedPlug3665398231:
					return DeepsightPlugTypePerk.TraitLocked;

				case InventoryItemHashes.DeconstructTraitPlug_InventoryTierType3:
					return DeepsightPlugTypePerk.TraitEnhanced;
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
					return DeepsightPlugTypePerk.TraitEnhanced;
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
			const plugType = (() => {
				switch (context.definition.itemTypeDisplayName) {
					case "Mask Ornament":
						return DeepsightPlugTypeCosmetic.OrnamentMask;
				}

				switch (context.definition.hash) {
					case InventoryItemHashes.DefaultEmblemEmblemPlug:
						return DeepsightPlugTypeCosmetic.EmblemEmpty;
					case InventoryItemHashes.BaseRadiancePlug:
						return DeepsightPlugTypeCosmetic.Radiance;
					case InventoryItemHashes.EmptyMementoSocketPlug:
						return DeepsightPlugTypeCosmetic.MementoEmpty;
					case InventoryItemHashes.NoProjectionRestoreDefaultsPlug:
						return DeepsightPlugTypeCosmetic.GhostProjectionEmpty;
					case InventoryItemHashes.DefaultEffectPlug:
						return DeepsightPlugTypeCosmetic.TransmatEffectEmpty;
					case InventoryItemHashes.RandomModPlug_PlugPlugCategoryHashShipSpawnfx:
						return DeepsightPlugTypeCosmetic.TransmatEffectRandom;
					case InventoryItemHashes.DefaultWeaponEffectsPlug:
						return DeepsightPlugTypeCosmetic.WeaponEffectsDefault;
				}

				switch (context.definition.displayProperties?.name) {
					case "Default Shader":
						return DeepsightPlugTypeCosmetic.ShaderDefault;
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
						return DeepsightPlugTypeCosmetic.OrnamentArmor;
					case PlugCategoryHashes.ExoticAllSkins:
					case PlugCategoryHashes.ArmorSkinsEmpty:
						return DeepsightPlugTypeCosmetic.OrnamentDefault;
					case PlugCategoryHashes.SocialClansStaves:
						return DeepsightPlugTypeCosmetic.ClanBannerStaff;
					case PlugCategoryHashes.V420PlugsWeaponsMasterworksToggleVfx:
						return DeepsightPlugTypeCosmetic.WeaponEffects;
				}

				for (const traitHash of context.definition.traitHashes ?? []) {
					switch (traitHash) {
						case TraitHashes.ItemOrnamentWeapon:
							return DeepsightPlugTypeCosmetic.OrnamentWeapon;
						case TraitHashes.ItemOrnamentArmor:
						case TraitHashes.ItemArmorArms:
						case TraitHashes.ItemArmorChest:
						case TraitHashes.ItemArmorClass:
						case TraitHashes.ItemArmorHead:
						case TraitHashes.ItemArmorLegs:
							return DeepsightPlugTypeCosmetic.OrnamentArmor;
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
					return DeepsightPlugTypeCosmetic.OrnamentArmor;
			})();

			switch (context.definition.inventory?.tierTypeHash) {
				case ItemTierTypeHashes.Exotic:
					switch (plugType) {
						case DeepsightPlugTypeCosmetic.OrnamentArmor:
							return DeepsightPlugTypeCosmetic.OrnamentArmorExotic;
						case DeepsightPlugTypeCosmetic.OrnamentWeapon:
							return DeepsightPlugTypeCosmetic.OrnamentWeaponExotic;
					}
			}

			return plugType;
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
				return ActivityHashes.DeepStoneCrypt_RewardsLength0;
			case "Root of Nightmares Armor Mod":
				return ActivityHashes.RootOfNightmaresNormal;
			case "Crota's End Mod":
				return ActivityHashes.CrotasEndNormal;
			case "Last Wish Raid Mod":
				return ActivityHashes.LastWishNormal;
			case "Garden of Salvation Raid Mod":
				return ActivityHashes.GardenOfSalvation1042180643;
			case "Vault of Glass Armor Mod":
				return ActivityHashes.VaultOfGlass;
			case "Vow of the Disciple Raid Mod":
				return ActivityHashes.VowOfTheDiscipleNormal;
			case "King's Fall Mod":
				return ActivityHashes.KingsFallNormal_ModifiersLength8;
		}
	}

	const subclasses: Record<string, InventoryItemHashes[]> = {
		"hunter.void": [InventoryItemHashes.NightstalkerHunterSubclass_ClassType1],
		"hunter.solar": [InventoryItemHashes.GunslingerHunterSubclass_ClassType1],
		"hunter.arc": [InventoryItemHashes.ArcstriderHunterSubclass_ClassType1],
		"hunter.stasis": [InventoryItemHashes.RevenantHunterSubclass],
		"hunter.strand": [InventoryItemHashes.ThreadrunnerHunterSubclass],

		"titan.void": [InventoryItemHashes.SentinelTitanSubclass_ClassType0],
		"titan.solar": [InventoryItemHashes.SunbreakerTitanSubclass_ClassType0],
		"titan.arc": [InventoryItemHashes.StrikerTitanSubclass_ClassType0],
		"titan.stasis": [InventoryItemHashes.BehemothTitanSubclass],
		"titan.strand": [InventoryItemHashes.BerserkerTitanSubclass],

		"warlock.void": [InventoryItemHashes.VoidwalkerWarlockSubclass_ClassType2],
		"warlock.solar": [InventoryItemHashes.DawnbladeWarlockSubclass_ClassType2],
		"warlock.arc": [InventoryItemHashes.StormcallerWarlockSubclass_ClassType2],
		"warlock.stasis": [InventoryItemHashes.ShadebinderWarlockSubclass],
		"warlock.strand": [InventoryItemHashes.BroodweaverWarlockSubclass],

		"shared.void": [InventoryItemHashes.NightstalkerHunterSubclass_ClassType1, InventoryItemHashes.SentinelTitanSubclass_ClassType0, InventoryItemHashes.VoidwalkerWarlockSubclass_ClassType2],
		"shared.solar": [InventoryItemHashes.GunslingerHunterSubclass_ClassType1, InventoryItemHashes.SunbreakerTitanSubclass_ClassType0, InventoryItemHashes.DawnbladeWarlockSubclass_ClassType2],
		"shared.arc": [InventoryItemHashes.ArcstriderHunterSubclass_ClassType1, InventoryItemHashes.StrikerTitanSubclass_ClassType0, InventoryItemHashes.StormcallerWarlockSubclass_ClassType2],
		"shared.stasis": [InventoryItemHashes.RevenantHunterSubclass, InventoryItemHashes.BehemothTitanSubclass, InventoryItemHashes.ShadebinderWarlockSubclass],
		"shared.strand": [InventoryItemHashes.ThreadrunnerHunterSubclass, InventoryItemHashes.BerserkerTitanSubclass, InventoryItemHashes.BroodweaverWarlockSubclass],
	};

	const classStats: Record<DestinyClass, StatHashes | undefined> = {
		[DestinyClass.Hunter]: StatHashes.Mobility,
		[DestinyClass.Titan]: StatHashes.Resilience,
		[DestinyClass.Warlock]: StatHashes.Recovery,
		[DestinyClass.Unknown]: undefined,
	};

	const damageTypes: Record<string, DamageTypeHashes> = {
		"void": DamageTypeHashes.Void,
		"solar": DamageTypeHashes.Solar,
		"arc": DamageTypeHashes.Arc,
		"stasis": DamageTypeHashes.Stasis,
		"strand": DamageTypeHashes.Strand,
	};

	const baseArmourChargeStat = {
		value: [30, 50, 60],
		isConditionallyActive: true,
	};
	const armourChargeStats: Partial<Record<InventoryItemHashes, DeepsightItemInvestmentStatDefinition[]>> = {
		[InventoryItemHashes.FontOfAgilityLegArmorModPlug_PlugEnabledRulesLength3]: [{ statTypeHash: StatHashes.Mobility, ...baseArmourChargeStat }],
		[InventoryItemHashes.FontOfEnduranceChestArmorModPlug_PlugEnabledRulesLength2]: [{ statTypeHash: StatHashes.Resilience, ...baseArmourChargeStat }],
		[InventoryItemHashes.FontOfRestorationClassItemArmorModPlug_PlugEnabledRulesLength2]: [{ statTypeHash: StatHashes.Recovery, ...baseArmourChargeStat }],
		[InventoryItemHashes.FontOfFocusArmsArmorModPlug_PlugEnabledRulesLength2]: [{ statTypeHash: StatHashes.Discipline, ...baseArmourChargeStat }],
		[InventoryItemHashes.FontOfWisdomHelmetArmorModPlug_PlugEnabledRulesLength2]: [{ statTypeHash: StatHashes.Intellect, ...baseArmourChargeStat }],
		[InventoryItemHashes.FontOfVigorArmsArmorModPlug_PlugEnabledRulesLength2]: [{ statTypeHash: StatHashes.Strength, ...baseArmourChargeStat }],
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
			const bucketHash = type === DeepsightPlugTypeMod.Armor || type === DeepsightPlugTypeMod.ArmorEmpty ? getArmourModBucketHash(context) as InventoryBucketHashes : undefined;
			const activityHash = type === DeepsightPlugTypeMod.Armor || type === DeepsightPlugTypeMod.ArmorEmpty ? getArmourModRaidActivityHash(context) as ActivityHashes : undefined;

			const result = {
				bucketHash,
				bucketHashName: EnumHelper.simplifyName(DestinyInventoryBucketDefinition?.[bucketHash!]?.displayProperties?.name),
				adept: type !== DeepsightPlugTypeMod.Weapon ? undefined : context.definition.displayProperties?.name.startsWith("Adept "),
				raid: activityHash !== undefined,
				activityHash,
				artifice: context.definition.plug?.plugCategoryHash === PlugCategoryHashes.EnhancementsArtifice,
				armourChargeStats: armourChargeStats[context.definition.hash as InventoryItemHashes],
			} as Partial<DeepsightPlugCategorisationMod>;

			return result;
		},
		[DeepsightPlugCategory.Subclass]: (context, type?: DeepsightPlugTypeMod) => {
			const plugCategoryIdentifier = context.definition.plug?.plugCategoryIdentifier;
			const subclassIdentifier = plugCategoryIdentifier?.slice(0, plugCategoryIdentifier.lastIndexOf("."));
			const damageTypeIdentifier = subclassIdentifier?.slice(subclassIdentifier.lastIndexOf(".") + 1);

			const affectsClassStat = !!plugCategoryIdentifier?.startsWith("shared.")
				&& Object.values(classStats).every(hash => !hash || context.definition.investmentStats.some(stat => stat.statTypeHash === hash && stat.value));

			return {
				subclasses: !subclassIdentifier ? undefined : subclasses[subclassIdentifier],
				damageType: !damageTypeIdentifier ? undefined : damageTypes[damageTypeIdentifier],
				affectsClassStat: affectsClassStat,
			} as Partial<DeepsightPlugCategorisationSubclass>;
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
				...Env.DEEPSIGHT_ENVIRONMENT !== "dev" ? undefined : {
					name: context.definition.displayProperties?.name,
					itemTypeName: context.definition.itemTypeDisplayName,
					itemTypeAndTierName: context.definition.itemTypeAndTierDisplayName,
					itemCategoryHashes: context.definition.itemCategoryHashes,
					itemCategoryIdentifiers: context.definition.itemCategoryHashes?.map(hash => EnumHelper.simplifyName(DestinyItemCategoryDefinition[hash].displayProperties?.name)),
					plugCategoryIdentifier: context.definition.plug?.plugCategoryIdentifier,
					traitIds: context.definition.traitIds,
				},
				hash: +plugItemHash,
				category,
				type,
				categoryName,
				typeName,
				fullName: `${categoryName}${typeName ? `/${typeName}` : ""}`,
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

			if (Env.DEEPSIGHT_ENVIRONMENT === "dev")
				Log.warn(message);
			else
				throw new Error(message);
		}

		return DeepsightPlugCategorisation;
	}
}

export default DeepsightPlugCategorisation;
