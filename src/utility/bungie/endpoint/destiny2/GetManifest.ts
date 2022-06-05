import { DestinyManifest } from "bungie-api-ts/destiny2";
import BungieEndpoint from "utility/bungie/BungieEndpoint";

export default BungieEndpoint("/Destiny2/Manifest/")
	.returning<DestinyManifest>();
