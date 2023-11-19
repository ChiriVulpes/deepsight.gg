import type { DestinyVendorSaleItemComponent } from "bungie-api-ts/destiny2";
import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import { getCurrentMembershipAndCharacter } from "model/models/Characters";
import Manifest from "model/models/Manifest";
import ItemEquippableDummies from "model/models/items/ItemEquippableDummies";
import Objects from "utility/Objects";
import Strings from "utility/Strings";
import Time from "utility/Time";
import GetVendor, { VendorHashes } from "utility/endpoint/bungie/endpoint/destiny2/GetVendor";

type WeaponRotation = Partial<Record<VendorHashes, number[]>>;

const WeaponRotation = Model.createDynamic(Time.minutes(15), async api => {
	const vendors: VendorHashes[] = [VendorHashes.CommanderZavala, VendorHashes.Saint14];

	const result: WeaponRotation = {};
	const membership = await getCurrentMembershipAndCharacter(api, 1 / vendors.length);
	if (!membership?.characterId)
		return result;

	// const manifest = await Manifest.await();
	const { DestinyInventoryItemDefinition } = await Manifest.await();

	// const profile = await ProfileBatch.await();

	api.emitProgress(1 / vendors.length, "Loading weapon rotation");
	for (let i = 0; i < vendors.length; i++) {
		const vendorHash = vendors[i];
		api.emitProgress((1 + i) / vendors.length, "Loading weapon rotation");
		const vendor = await GetVendor.query(membership.membershipType, membership.membershipId, membership.characterId, vendorHash, [
			DestinyComponentType.VendorSales,
		]).catch(() => undefined);

		if (!vendor)
			continue;

		for (const sale of Object.values<DestinyVendorSaleItemComponent>(vendor.sales.data ?? Objects.EMPTY)) {
			const definition = await DestinyInventoryItemDefinition.get(sale.itemHash);
			const name = definition?.displayProperties?.name.trimEnd();
			if (!name?.endsWith("(Adept)"))
				continue;

			const item = await ItemEquippableDummies.findPreferredCopy(definition!);
			const nonAdept = await ItemEquippableDummies.findPreferredCopy(Strings.trimTextMatchingFromEnd(name, " (Adept)"));

			result[vendorHash] ??= [];
			if (item)
				result[vendorHash]!.push(item.hash);
			if (nonAdept)
				result[vendorHash]!.push(nonAdept.hash);
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			// console.log(item?.displayProperties.name, item && await ((window as any).Item as typeof Item).createFake(manifest, profile, item, false));
		}
	}

	api.emitProgress(1, "Loaded weapon rotation");
	return result;
}, "Weapon Rotation");

export default WeaponRotation;
