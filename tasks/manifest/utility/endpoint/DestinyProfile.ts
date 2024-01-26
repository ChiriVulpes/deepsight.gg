import type { DestinyProfileResponse } from "bungie-api-ts/destiny2";
import Env from "../../../utility/Env";
import Model from "../../../utility/Model";
import DestinyComponents from "./DestinyComponents";
import DestinyRequest from "./DestinyRequest";

const membershipId = Env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_ID;
const membershipType = Env.DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_TYPE;

export default Model(async () =>
	DestinyRequest<DestinyProfileResponse>(`Destiny2/${membershipType}/Profile/${membershipId}/?components=${DestinyComponents.join(",")}`));
