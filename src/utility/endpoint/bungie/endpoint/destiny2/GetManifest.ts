import type { DestinyManifest } from "bungie-api-ts/destiny2";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";

export default BungieEndpoint
	.at("/Destiny2/Manifest/")
	.returning<DestinyManifest>();
