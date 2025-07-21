import type { VendorHashes } from "@deepsight.gg/Enums";
import type { DestinyComponentType, DestinyVendorResponse } from "bungie-api-ts/destiny2";
import Env from "../../../utility/Env";
import Model from "../../../utility/Model";
import DestinyCharacters from "./DestinyCharacters";
import DestinyRequest from "./DestinyRequest";

export default Model(async (vendorHash: VendorHashes, ...components: DestinyComponentType[]) =>
	Promise.resolve(DestinyCharacters.get())
		.then(characters => characters?.map(character =>
			DestinyRequest<DestinyVendorResponse>(`Destiny2/${Env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_TYPE}/Profile/${Env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_ID}/Character/${character.characterId}/Vendors/${vendorHash}/?components=${components.join(",")}`)))
		.then(vendors => Promise.all(vendors ?? []))
		.then(vendors => vendors.filter((v): v is DestinyVendorResponse => !!v)));
