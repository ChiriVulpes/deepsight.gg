import { VendorHashes } from "@deepsight.gg/enums";
import fs from "fs-extra";
import Task from "../utility/Task";
import DestinyVendors from "./utility/endpoint/DestinyVendors";

export default Task("DeepsightVendorDefinition", async () => {
	const vendors = await DestinyVendors.get();

	const DeepsightVendorDefinition = {
		[VendorHashes.LordSaladin]: vendors[VendorHashes.LordSaladin],
		[VendorHashes.Nimbus]: vendors[VendorHashes.Nimbus],
		[VendorHashes.SpiritOfRiven_Enabledtrue]: vendors[VendorHashes.SpiritOfRiven_Enabledtrue],
		[VendorHashes.Fynch]: vendors[VendorHashes.Fynch],
		[VendorHashes.Starhorse]: vendors[VendorHashes.Starhorse],
		[VendorHashes.Xur_LocationsLength1]: vendors[VendorHashes.Xur_LocationsLength1],
		[VendorHashes.Xur_LocationsLength3]: vendors[VendorHashes.Xur_LocationsLength3],
		[VendorHashes.Ada1_Enabledtrue]: vendors[VendorHashes.Ada1_Enabledtrue],
		[VendorHashes.Banshee44_Enabledtrue]: vendors[VendorHashes.Banshee44_Enabledtrue],
		[VendorHashes.TessEveris]: vendors[VendorHashes.TessEveris],
		[VendorHashes.CommanderZavala_Enabledtrue]: vendors[VendorHashes.CommanderZavala_Enabledtrue],
		[VendorHashes.TheDrifter_Enabledtrue]: vendors[VendorHashes.TheDrifter_Enabledtrue],
		[VendorHashes.Saint14]: vendors[VendorHashes.Saint14],
		[VendorHashes.LordShaxx_Enabledtrue]: vendors[VendorHashes.LordShaxx_Enabledtrue],
		[VendorHashes.DevrimKay]: vendors[VendorHashes.DevrimKay],
		[VendorHashes.Failsafe]: vendors[VendorHashes.Failsafe],
		[VendorHashes.ErisMorn]: vendors[VendorHashes.ErisMorn],
		[VendorHashes.LecternOfEnchantment]: vendors[VendorHashes.LecternOfEnchantment],
		[VendorHashes.ShawHan]: vendors[VendorHashes.ShawHan],
		[VendorHashes.PetraVenj]: vendors[VendorHashes.PetraVenj],
		[VendorHashes.VariksTheLoyal]: vendors[VendorHashes.VariksTheLoyal],
	};

	////////////////////////////////////
	// Write!

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightVendorDefinition.json", DeepsightVendorDefinition, { spaces: "\t" });
});
