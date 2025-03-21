import { VendorHashes } from "@deepsight.gg/enums";
import fs from "fs-extra";
import Task from "../utility/Task";
import DestinyVendors from "./utility/endpoint/DestinyVendors";

export default Task("DeepsightVendorDefinition", async () => {
	const vendors = await DestinyVendors.get();

	const DeepsightVendorDefinition = {
		[VendorHashes.ValusSaladin]: vendors[VendorHashes.ValusSaladin],
		[VendorHashes.Nimbus]: vendors[VendorHashes.Nimbus],
		[VendorHashes.Fynch]: vendors[VendorHashes.Fynch],
		[VendorHashes.Starhorse]: vendors[VendorHashes.Starhorse],
		[VendorHashes.Xur_CategoriesLength23]: vendors[VendorHashes.Xur_CategoriesLength23],
		[VendorHashes.Xur_CategoriesLength27]: vendors[VendorHashes.Xur_CategoriesLength27],
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
		[VendorHashes.WarTable]: vendors[VendorHashes.WarTable],
		[VendorHashes.EvaLevante]: vendors[VendorHashes.EvaLevante],
	};

	////////////////////////////////////
	// Write!

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightVendorDefinition.json", DeepsightVendorDefinition, { spaces: "\t" });
});
