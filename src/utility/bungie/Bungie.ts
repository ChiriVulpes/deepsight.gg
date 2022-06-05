import BungieEndpoint from "utility/bungie/BungieEndpoint";
import RequestOAuthToken from "utility/bungie/endpoint/RequestOAuthToken";
import Env from "utility/Env";
import { EventManager } from "utility/EventManager";
import Store from "utility/Store";
import URL from "utility/URL";

export interface IBungieApiEvents {
	resetAuthentication: Event;
	error: BungieEndpoint.IEvents["error"];
}

export class BungieAPI {

	public get lastDailyReset () {
		return new Date().setUTCHours(17, 0, 0);
	}

	public get lastWeeklyReset () {
		const day = (new Date().getUTCDay() + 5) % 7;
		return this.lastDailyReset - day * 24 * 60 * 60 * 1000;
	}

	public event = new EventManager<this, IBungieApiEvents>(this)
		.pipe("error", BungieEndpoint.event);

	public constructor () {
		BungieEndpoint.event.subscribe("authenticationFailed", () =>
			this.resetAuthentication());
		BungieEndpoint.event.subscribe("validateAuthorisation", () =>
			this.validateAuthorisation())
	}

	public get authenticated () {
		return !!(Store.items.bungieAuthCode && Store.items.bungieAccessToken);
	}

	public async authenticate (type: "start" | "complete"): Promise<void> {
		if (!Store.items.bungieAuthCode && !URL.params.code) {
			if (type !== "start") {
				// the user didn't approve of starting auth yet
				return;
			}

			// step 1: get an auth code for this user

			const clientId = Env.FVM_BUNGIE_CLIENT_ID;
			if (!clientId)
				throw new Error("Cannot authenticate with Bungie, no client ID in environment");

			location.href = `https://www.bungie.net/en/oauth/authorize?client_id=${clientId}&response_type=code`; // &state=${state}`;
			return;
		}

		if (!Store.items.bungieAuthCode) {
			// step 2: receive auth code from bungie oauth

			// received auth code
			Store.items.bungieAuthCode = URL.params.code!;
		}

		delete URL.params.code;
		// delete URL.params.state;

		if (!Store.items.bungieAccessToken) {
			// step 3: get an access token
			await this.requestToken();
		}
	}

	public resetAuthentication () {
		delete URL.params.code;
		delete URL.params.state;
		delete Store.items.bungieAuthCode;
		delete Store.items.bungieAccessToken;
		delete Store.items.bungieAccessTokenExpireTime;
		delete Store.items.bungieAccessTokenMembershipId;
		delete Store.items.bungieAccessTokenRefreshExpireTime;
		delete Store.items.bungieAccessTokenRefreshToken;
		this.event.emit("resetAuthentication");
	}

	private async validateAuthorisation () {
		if ((Store.items.bungieAccessTokenExpireTime ?? 0) > Date.now())
			return; // authorisation valid

		await this.requestToken();
	}

	private async requestToken () {
		const result = await RequestOAuthToken.query();

		if ("error" in result) {
			if (result.error === "invalid_grant") {
				this.resetAuthentication();
				throw Object.assign(new Error(result.error_description as string | undefined ?? "Invalid grant"), result);
			}

			return;
		}

		Store.items.bungieAccessToken = result.access_token;
		Store.items.bungieAccessTokenExpireTime = Date.now() + result.expires_in * 1000;
		Store.items.bungieAccessTokenMembershipId = result.membership_id;
		Store.items.bungieAccessTokenRefreshExpireTime = Date.now() + result.refresh_expires_in * 1000;
		Store.items.bungieAccessTokenRefreshToken = result.refresh_token;
	}
}

export default new BungieAPI;
