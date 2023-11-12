import type { DeepsightMomentDefinition } from "@deepsight.gg/interfaces";
import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import Item from "model/models/items/Item";
import ItemEquippableDummies from "model/models/items/ItemEquippableDummies";
import Display from "ui/bungie/DisplayProperties";
import { Debug } from "utility/Debug";

namespace Collections {

	const moments: Record<number, Model<Item[]>> = {};
	export function moment (moment: DeepsightMomentDefinition) {
		return moments[moment.hash] ??= Model.createDynamic("Daily", async () => {
			const manifest = await Manifest.await();
			const { DestinyInventoryItemDefinition } = manifest;
			const profile = await ProfileBatch.await();

			const itemDefs = await DestinyInventoryItemDefinition.all("iconWatermark", typeof moment.iconWatermark === "string" ? moment.iconWatermark : "?")
				.then(items => items
					.filter(item => item.displayProperties.name && !ItemEquippableDummies.is(item)));

			const map = new Map<string, Set<DestinyInventoryItemDefinition>>();
			const issues = new Set<DestinyInventoryItemDefinition>();

			for (const itemB of itemDefs) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
				const name = `${Display.name(itemB)!} ${itemB.equippingBlock?.equipmentSlotTypeHash!}`;
				const existing = map.get(name);
				if (existing?.size) {
					const [itemA] = existing;

					const itemAIndex = await ItemEquippableDummies.getPreferredCopySortIndex(itemA);
					const itemBIndex = await ItemEquippableDummies.getPreferredCopySortIndex(itemB);

					if (itemBIndex < itemAIndex)
						// don't replace itemA copy if itemB copy is worse
						continue;

					if (itemAIndex === itemBIndex) {
						if (itemA.displayProperties.icon !== itemB.displayProperties.icon) {
							// allow identical items with different icons
							existing.add(itemB);
							continue;
						}

						if (Debug.collectionsDuplicates)
							console.warn("Could not find difference between:", name, itemA, itemB);

						issues.add(itemA);
						issues.add(itemB);
						continue;
					}
				}

				map.set(name, new Set([itemB]));
			}

			let useItemDefs: DestinyInventoryItemDefinition[];
			if (Debug.collectionsDuplicates && issues.size > 0) {
				useItemDefs = [...issues.values()];
			} else {
				useItemDefs = [...map.values()].flatMap(items => [...items.values()]);
			}

			// eslint-disable-next-line no-constant-condition
			return Promise.all(useItemDefs
				.map(item => Item.createFake(manifest, profile, item)));
		});
	}
}

export default Collections;
