import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
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
	refresh_expires_in: number;
	refresh_token: string;
	token_type: "Bearer";
}

export default BungieEndpoint
	.at("/app/oauth/token/")
	.request(() => ({
		method: "POST",
		headers: {
			Authorization: `Basic ${btoa(`${Env.DEEPSIGHT_BUNGIE_CLIENT_ID}:${Env.DEEPSIGHT_BUNGIE_API_SECRET}`)}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: Store.items.bungieAccessTokenRefreshToken
			? {
				grant_type: "refresh_token",
				refresh_token: Store.items.bungieAccessTokenRefreshToken,
			}
			: {
				grant_type: "authorization_code",
				code: Store.items.bungieAuthCode,
			},
	}))
	.returning<IBungieRequestOAuthTokenError | IBungieRequestOAuthTokenResult>();