import { DestinationHashes, EventCardHashes, MomentHashes, VendorGroupHashes, VendorHashes } from "@deepsight.gg/enums";
import Arrays from "@deepsight.gg/utility/Arrays";
import type { DestinyDisplayPropertiesDefinition, DestinyItemComponentSetOfint32, DestinyVendorsResponse, DictionaryComponentResponse } from "bungie-api-ts/destiny2";
import { ComponentPrivacySetting } from "bungie-api-ts/destiny2";
import { diff } from "json-diff";
import type { DeepsightDisplayPropertiesDefinition, DeepsightVendorDefinition, DeepsightVendorItemDefinition } from "../../../../static/manifest/Interfaces";
import Env from "../../../utility/Env";
import Model from "../../../utility/Model";
import Rotation from "../Rotations";
import DestinyCharacters from "./DestinyCharacters";
import DestinyComponents from "./DestinyComponents";
import DestinyManifest from "./DestinyManifest";
import DestinyProfile from "./DestinyProfile";
import DestinyRequest from "./DestinyRequest";

const VENDOR_BACKGROUNDS: Partial<Record<VendorHashes, string | Partial<Record<DestinationHashes | EventCardHashes, string>>>> = {
	[VendorHashes.LordSaladin]: "lordsaladin",
	[VendorHashes.Nimbus]: "nimbus",
	[VendorHashes.SpiritOfRiven_Enabledtrue]: "spiritofriven",
	[VendorHashes.Fynch]: "fynch",
	[VendorHashes.Xur_LocationsLength1]: "xurxurstreasurehoard",
	[VendorHashes.Xur_LocationsLength3]: {
		[DestinationHashes.TheLastCity1737926756]: "xurthelastcity",
		[DestinationHashes.EuropeanDeadZone697502628]: "xureuropeandeadzone",
		[DestinationHashes.ArcadianValley3607432451]: "xurarcadianvalley",
	},
	[VendorHashes.Ada1_Enabledtrue]: "ada1",
	[VendorHashes.Banshee44_Enabledtrue]: "banshee44",
	[VendorHashes.CommanderZavala_Enabledtrue]: "commanderzavala",
	[VendorHashes.TheDrifter_Enabledtrue]: "thedrifter",
	[VendorHashes.Saint14]: "saint14",
	[VendorHashes.LordShaxx_Enabledtrue]: "lordshaxx",
	[VendorHashes.DevrimKay]: "devrimkay",
	[VendorHashes.Failsafe]: "failsafe",
	[VendorHashes.ErisMorn]: "erismorn",
	[VendorHashes.LecternOfEnchantment]: "lecternofenchantment",
	[VendorHashes.ShawHan]: "shawhan",
	[VendorHashes.PetraVenj]: `petravenj${Rotation.resolve({ anchor: "2024-01-16T17:00:00Z" }, ["thestrand", "divalianmists", "rheasilvia"])}`,
	[VendorHashes.VariksTheLoyal]: "varikstheloyal",
	[VendorHashes.RitualTable]: "ritualtable",
	[VendorHashes.LecternOfDivination]: "lecternofdivination",
	[VendorHashes.WarTable]: "wartable",
	[VendorHashes.SonarStation]: "sonarstation",
	[VendorHashes.Starhorse]: "starhorse",
	[VendorHashes.EvaLevante]: {
		[EventCardHashes.GuardianGames]: "evalevanteguardiangames",
	},
};

const VENDOR_GROUP_OVERRIDES: Partial<Record<VendorHashes, VendorGroupHashes[]>> = {
	[VendorHashes.EvaLevante]: [VendorGroupHashes.Tower, VendorGroupHashes.LimitedTime],
	[VendorHashes.LordSaladin]: [VendorGroupHashes.Tower, VendorGroupHashes.LimitedTime],
	[VendorHashes.Nimbus]: [VendorGroupHashes.Destination, VendorGroupHashes.Lightfall],
	[VendorHashes.Fynch]: [VendorGroupHashes.Destination, VendorGroupHashes.TheWitchQueen],
	[VendorHashes.Xur_LocationsLength1]: [VendorGroupHashes.Destination, VendorGroupHashes["30thAnniversary"]],
};

const VENDOR_MOMENTS: Partial<Record<VendorHashes, MomentHashes>> = {
	[VendorHashes.Nimbus]: MomentHashes.Lightfall,
	[VendorHashes.SpiritOfRiven_Enabledtrue]: MomentHashes.SeasonOfTheWish,
	[VendorHashes.LecternOfDivination]: MomentHashes.SeasonOfTheWitch,
	[VendorHashes.RitualTable]: MomentHashes.SeasonOfTheWitch,
	[VendorHashes.SonarStation]: MomentHashes.SeasonOfTheDeep,
	[VendorHashes.WarTable]: MomentHashes.SeasonOfDefiance,
	[VendorHashes.Fynch]: MomentHashes.TheWitchQueen,
	[VendorHashes.Xur_LocationsLength1]: MomentHashes.Bungie30thAnniversary,
	[VendorHashes.DevrimKay]: MomentHashes.TheRedWar,
	[VendorHashes.Failsafe]: MomentHashes.TheRedWar,
	[VendorHashes.ErisMorn]: MomentHashes.Shadowkeep,
	[VendorHashes.LecternOfEnchantment]: MomentHashes.Shadowkeep,
	[VendorHashes.ShawHan]: MomentHashes.BeyondLight,
	[VendorHashes.PetraVenj]: MomentHashes.Forsaken,
	[VendorHashes.VariksTheLoyal]: MomentHashes.BeyondLight,
};

function one<T> (array: T[], id: string, def: { displayProperties: DestinyDisplayPropertiesDefinition }, hash?: (value: T) => any) {
	if (array.length === 0)
		return undefined;

	if (array.length === 1)
		return array[0];

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const compare = hash ? hash(array[0]) : array[0];
	for (let i = 1; i < array.length; i++) {
		const d = diff(compare, hash ? hash(array[i]) : array[i]);
		if (d)
			throw new Error(`More than one ${id} for ${def.displayProperties.name} served by vendors response:\n${array.map(h => `- ${String(h)}`).join("\n")}\nDiff: ${JSON.stringify(d, null, "\t")}`);
	}

	return array[0];
}

export default Model(async () =>
	Promise.resolve(DestinyCharacters.get())
		.then(characters => characters?.map(character =>
			DestinyRequest<DestinyVendorsResponse>(`Destiny2/${Env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_TYPE}/Profile/${Env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_ID}/Character/${character.characterId}/Vendors/?components=${DestinyComponents.join(",")}`)))
		.then(responses => Promise.all(responses ?? []))
		.then(responses => responses.filter((v): v is DestinyVendorsResponse => !!v))
		.then(async responses => {
			const hashes = Array.from(new Set(responses
				.flatMap(response => Object.keys(response.vendors.data ?? {})
					.map(key => +key as VendorHashes))));

			const vendorDefs = await DestinyManifest.DestinyVendorDefinition.all();
			const itemDefs = await DestinyManifest.DestinyInventoryItemDefinition.all();
			const factionDefs = await DestinyManifest.DestinyFactionDefinition.all();

			const profile = await DestinyProfile.get();
			const activeEvent = await DestinyManifest.DestinyEventCardDefinition.get(profile?.profile.data?.activeEventCardHash);

			return Object.fromEntries(hashes.map((vendorHash): [number, DeepsightVendorDefinition] => {
				const vendors = responses.map(response => response.vendors.data![vendorHash]).filter(v => v);

				const def = vendorDefs[vendorHash];
				if (!def)
					throw new Error(`Unable to find definition for vendor ${vendorHash}`);

				const sales = responses.map(response => response.sales.data?.[vendorHash])
					.filter(Arrays.filterNullish);

				const itemComponents = responses.map(response => response.itemComponents);

				const location = def.locations
					?.[vendors.map(vendor => vendor.vendorLocationIndex)
						.collect(one, "location", def)!];

				let background = VENDOR_BACKGROUNDS[vendorHash];
				if (typeof background === "object") {
					if (vendorHash === VendorHashes.EvaLevante) {
						if (!activeEvent)
							throw new Error("Eva Levante is here, but she has no event!!!! Spooky!");

						background = background[activeEvent.hash as Exclude<EventCardHashes, EventCardHashes.Invalid>];

					} else {
						background = background[location?.destinationHash as Exclude<DestinationHashes, DestinationHashes.Invalid>];
					}
				}

				const subtitle = factionDefs[def.factionHash]?.displayProperties?.name ?? def.displayProperties.subtitle;
				return [vendorHash, {
					hash: vendorHash,
					displayProperties: {
						...def.displayProperties,
						subtitle: subtitle.length > 36 ? undefined : subtitle,
					} as DeepsightDisplayPropertiesDefinition,
					background: background === undefined ? undefined : `./image/png/vendor/background/${background}.png`,
					location,
					moment: VENDOR_MOMENTS[vendorHash],
					groups: (undefined
						?? VENDOR_GROUP_OVERRIDES[vendorHash]
						?? responses.flatMap(response => response.vendorGroups.data?.groups ?? [])
							.filter(group => group.vendorHashes.includes(vendorHash))
							.map(group => group.vendorGroupHash))
						.distinct(),
					categories: responses.map(response => response.categories.data?.[vendorHash])
						.filter(Arrays.filterNullish)
						.flatMap(categories => categories.categories)
						.groupBy(category => category.displayCategoryIndex)
						.map(([categoryIndex, categories]) => {
							const items = categories
								.map(category => category.itemIndexes)
								.concat(def.categories[categoryIndex]?.vendorItemIndexes ?? [])
								.splat(Arrays.mergeSorted)
								.map((itemIndex, _1, _2, hash = def.itemList[itemIndex].itemHash, itemDef = itemDefs[hash]): DeepsightVendorItemDefinition => ({
									displayProperties: itemDef.displayProperties,
									...def.itemList[itemIndex],
									...sales.map(sale => sale.saleItems[itemIndex])
										.filter(Arrays.filterNullish)
										.collect(sales => !sales.length ? undefined : {
											quantity: sales.map(sale => sale.quantity).collect(one, "quantity", itemDef),
											overrideNextRefreshDate: sales.map(sale => sale.overrideNextRefreshDate).collect(one, "overridden value of next refresh date", itemDef),
											apiPurchasable: sales.map(sale => sale.apiPurchasable).collect(one, "state of purchasable via API", itemDef),
											costs: sales.map(sale => sale.costs)
												.collect(costs => one(costs, "costs", itemDef, costs => costs
													.sort((a, b) => a.itemHash - b.itemHash)
													.map(cost => `${cost.itemHash}#${cost.quantity}`)
													.join(""))),
										}),
									itemComponent: itemComponents.map(itemComponents => itemComponents[vendorHash])
										.filter(Arrays.filterNullish)
										.collect(itemComponents =>
											([
												"instances",
												"renderData",
												"stats",
												"sockets",
												"reusablePlugs",
												"plugObjectives",
												"talentGrids",
												"plugStates",
												"objectives",
												"perks",
											] as (keyof DestinyItemComponentSetOfint32)[])
												.map(component => [component, {
													data: {
														[itemIndex]: itemComponents.map(itemComponents => itemComponents[component]?.data?.[itemIndex])
															.filter(Arrays.filterNullish)
															?.[0],
													},
													privacy: ComponentPrivacySetting.None,
												} satisfies DictionaryComponentResponse<any>] as const)
												.toObject() as DeepsightVendorItemDefinition["itemComponent"]),
								}));

							const displayCategory = def.displayCategories[categoryIndex];
							return {
								...displayCategory,
								sortValue: def.categories[items[0].categoryIndex]?.sortValue ?? 0,
								items: items.sort(
									item => -def.originalCategories[item.originalCategoryIndex]?.sortValue,
									item => -item.vendorItemIndex),
							};
						})
						.sort((a, b) => a.sortValue - b.sortValue)
						.map(category => ({ ...category, sortValue: undefined })),
				} satisfies DeepsightVendorDefinition];
			}));
		}));
