import BungieEndpoint from "utility/bungie/BungieEndpoint";
import Env from "utility/Env";
import Store from "utility/Store";

export interface IBungieRequestOAuthTokenError {
	error: string;
	error_description: string;
}

export interface IBungieRequestOAuthTokenResult {
	access_token: string;
	expires_in: number;
	membership_id: string;
	token_type: "Bearer";
}

export default BungieEndpoint("/app/oauth/token/")
	.request(() => ({
		method: "POST",
		headers: {
			Authorization: undefined,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: {
			client_id: Env.FVM_BUNGIE_CLIENT_ID,
			grant_type: "authorization_code",
			code: Store.items.bungieAuthCode,
		},
	}))
	.returning<IBungieRequestOAuthTokenError | IBungieRequestOAuthTokenResult>();