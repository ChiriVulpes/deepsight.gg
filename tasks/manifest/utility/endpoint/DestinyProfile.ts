import type { DestinyProfileResponse } from "bungie-api-ts/destiny2";
import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Env from "../../../utility/Env";
import Model from "../../../utility/Model";
import DestinyRequest from "./DestinyRequest";

const components = [
	DestinyComponentType.Profiles,
	DestinyComponentType.VendorReceipts,
	DestinyComponentType.ProfileInventories,
	DestinyComponentType.ProfileCurrencies,
	DestinyComponentType.ProfileProgression,
	DestinyComponentType.PlatformSilver,
	DestinyComponentType.Characters,
	DestinyComponentType.CharacterInventories,
	DestinyComponentType.CharacterProgressions,
	DestinyComponentType.CharacterRenderData,
	DestinyComponentType.CharacterActivities,
	DestinyComponentType.CharacterEquipment,
	DestinyComponentType.CharacterLoadouts,
	DestinyComponentType.ItemInstances,
	DestinyComponentType.ItemObjectives,
	DestinyComponentType.ItemPerks,
	DestinyComponentType.ItemRenderData,
	DestinyComponentType.ItemStats,
	DestinyComponentType.ItemSockets,
	DestinyComponentType.ItemTalentGrids,
	DestinyComponentType.ItemCommonData,
	DestinyComponentType.ItemPlugStates,
	DestinyComponentType.ItemPlugObjectives,
	DestinyComponentType.ItemReusablePlugs,
	DestinyComponentType.Vendors,
	DestinyComponentType.VendorCategories,
	DestinyComponentType.VendorSales,
	DestinyComponentType.Kiosks,
	DestinyComponentType.CurrencyLookups,
	DestinyComponentType.PresentationNodes,
	DestinyComponentType.Collectibles,
	DestinyComponentType.Records,
	DestinyComponentType.Transitory,
	DestinyComponentType.Metrics,
	DestinyComponentType.StringVariables,
	DestinyComponentType.Craftables,
	DestinyComponentType.SocialCommendations,
];

const membershipId = Env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_ID;
const membershipType = Env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_TYPE;

export default Model(async () =>
	DestinyRequest<DestinyProfileResponse>(`Destiny2/${membershipType}/Profile/${membershipId}/?components=${components.join(",")}`));
