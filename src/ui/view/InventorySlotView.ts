import type { DestinyCharacterComponent } from "bungie-api-ts/destiny2";
import { DestinyComponentType } from "bungie-api-ts/destiny2";
import type { DestinyGeneratedEnums, ItemCategoryHashes } from "bungie-api-ts/generated-enums";
import type { DestinyEnumHelper } from "model/models/DestinyEnums";
import DestinyEnums from "model/models/DestinyEnums";
import type { BucketId } from "model/models/Items";
import Items from "model/models/Items";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import { InventoryClasses } from "ui/Classes";
import Component from "ui/Component";
import Bucket from "ui/inventory/Bucket";
import View from "ui/View";

export enum InventorySlotViewClasses {
	Main = "view-inventory-slot",
	CharacterBuckets = "view-inventory-slot-character-buckets",
	CharacterBucket = "view-inventory-slot-character-bucket",
	CharacterBucketEmblem = "view-inventory-slot-character-bucket-emblem",
	CharacterBucketEquipped = "view-inventory-slot-character-bucket-equipped",
	CharacterBucketInventory = "view-inventory-slot-character-bucket-inventory",
	VaultBucket = "view-inventory-slot-vault-bucket",
}

interface ICharacterBucket {
	character: DestinyCharacterComponent;
	bucketComponent: Bucket;
	equippedComponent: Component;
	inventoryComponent: Component;
}

export default new View.Factory()
	.using(Items)
	.define<{ slot: (hashes: DestinyEnumHelper<DestinyGeneratedEnums["ItemCategoryHashes"]>) => ItemCategoryHashes }>()
	.initialise(async (component, items) => {
		const { characters: characterData } = await Profile(DestinyComponentType.Characters).await();
		if (!characterData.data || !Object.keys(characterData.data).length) {
			console.warn("No characters");
			return;
		}

		component.classes.add(InventorySlotViewClasses.Main);

		const { DestinyClassDefinition, DestinyInventoryItemDefinition } = await Manifest.await();
		const { ItemCategoryHashes } = await DestinyEnums.await();
		const slot = component.definition.slot(ItemCategoryHashes);
		console.log(slot, ItemCategoryHashes.byHash(slot));

		const characterBuckets = Component.create()
			.classes.add(InventorySlotViewClasses.CharacterBuckets)
			.appendTo(component);

		const vaultBucket = Bucket.create()
			.classes.add(InventorySlotViewClasses.VaultBucket)
			.tweak(vault => vault.icon.style.set("--icon",
				"url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/vault2.svg\")"))
			.tweak(vault => vault.title.text.add("Vault"))
			.appendTo(component);

		function initialiseCharacterComponent (character: DestinyCharacterComponent): ICharacterBucket {
			const bucketComponent = Bucket.create()
				.classes.add(InventorySlotViewClasses.CharacterBucket)
				.appendTo(characterBuckets); // this has to be before any awaits or else they won't be sorted correctly

			Component.create()
				.classes.add(InventorySlotViewClasses.CharacterBucketEmblem, InventoryClasses.Slot)
				.appendTo(bucketComponent.header);

			const equippedComponent = Component.create()
				.classes.add(InventorySlotViewClasses.CharacterBucketEquipped, InventoryClasses.Slot)
				.appendTo(bucketComponent);

			const inventoryComponent = Component.create()
				.classes.add(InventorySlotViewClasses.CharacterBucketInventory)
				.appendTo(bucketComponent);

			return {
				character,
				bucketComponent,
				equippedComponent,
				inventoryComponent,
			};
		}

		const characters: Partial<Record<string, ICharacterBucket>> = Object.fromEntries(Object.entries(characterData.data)
			.sort(([, { dateLastPlayed: dateLastPlayedA }], [, { dateLastPlayed: dateLastPlayedB }]) =>
				new Date(dateLastPlayedB).getTime() - new Date(dateLastPlayedA).getTime())
			.map(([id, character]) => [id, initialiseCharacterComponent(character)] as const));

		for (const bucketId of Object.keys(items) as BucketId[]) {
			if (bucketId === "inventory")
				continue;

			if (bucketId === "vault")
				continue;

			const character = characters[bucketId];
			if (!character) {
				console.warn(`Unknown character '${bucketId}'`);
				continue;
			}

			console.log(await DestinyInventoryItemDefinition.get(character.character.emblemHash));
			console.log(character.character);

			const cls = await DestinyClassDefinition.get(character.character.classHash);
			const className = cls?.displayProperties.name ?? "Unknown";
			console.log(cls, await DestinyInventoryItemDefinition.get(character.character.classHash));
			character.bucketComponent.icon
				.style.set("--icon", `url("https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_${className.toLowerCase()}.svg")`);

			character.bucketComponent.title
				.text.add(className);

			const emblem = await DestinyInventoryItemDefinition.get(character.character.emblemHash);
			character.bucketComponent
				.style.set("--background", `url("https://www.bungie.net${emblem?.secondarySpecial ?? character.character.emblemBackgroundPath}")`)
				.style.set("--emblem", `url("https://www.bungie.net${emblem?.secondaryOverlay ?? character.character.emblemPath}")`);
		}
	});
