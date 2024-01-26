import type { VendorHashes } from "@deepsight.gg/enums";
import Arrays from "@deepsight.gg/utility/Arrays";
import type { DestinyDisplayPropertiesDefinition, DestinyItemComponentSetOfint32, DestinyVendorsResponse } from "bungie-api-ts/destiny2";
import { diff } from "json-diff";
import type { DeepsightDisplayPropertiesDefinition, DeepsightVendorDefinition, DeepsightVendorItemDefinition } from "../../../../static/manifest/Interfaces";
import Env from "../../../utility/Env";
import Model from "../../../utility/Model";
import DestinyCharacters from "./DestinyCharacters";
import DestinyComponents from "./DestinyComponents";
import DestinyManifest from "./DestinyManifest";
import DestinyRequest from "./DestinyRequest";

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

			return Object.fromEntries(hashes.map((catHash): [number, DeepsightVendorDefinition] => {
				const vendors = responses.map(response => response.vendors.data![catHash]).filter(v => v);

				const def = vendorDefs[catHash];
				if (!def)
					throw new Error(`Unable to find definition for vendor ${catHash}`);

				const sales = responses.map(response => response.sales.data?.[catHash])
					.filter(Arrays.filterNullish);

				const itemComponents = responses.map(response => response.itemComponents);

				return [catHash, {
					hash: catHash,
					displayProperties: def.displayProperties as DeepsightDisplayPropertiesDefinition,
					groups: responses.flatMap(response => response.vendorGroups.data?.groups ?? [])
						.filter(group => group.vendorHashes.includes(catHash))
						.map(group => group.vendorGroupHash)
						.distinct(),
					location: def.locations
						?.[vendors.map(vendor => vendor.vendorLocationIndex)
							.collect(one, "location", def)!],
					categories: responses.map(response => response.categories.data?.[catHash])
						.filter(Arrays.filterNullish)
						.flatMap(categories => categories.categories)
						.groupBy(category => category.displayCategoryIndex)
						.map(([categoryIndex, categories]) => ({
							...def.categories[categoryIndex],
							vendorItemIndexes: undefined,
							items: categories
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
									itemComponent: itemComponents.map(itemComponents => itemComponents[catHash])
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
												.map(component => [component, itemComponents.map(itemComponents => itemComponents[component]?.data?.[itemIndex])
													.filter(Arrays.filterNullish)
													?.[0]] as const)
												.toObject() as DeepsightVendorItemDefinition["itemComponent"]),
								})),
						})),
				} satisfies DeepsightVendorDefinition];
			}));
		}));
