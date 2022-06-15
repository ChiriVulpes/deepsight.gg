import type { CoreSettingsConfiguration } from "bungie-api-ts/core";
import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";

export default BungieEndpoint.at("/Settings/")
	.returning<CoreSettingsConfiguration>();
