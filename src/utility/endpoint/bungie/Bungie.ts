import BungieEndpoint from "utility/endpoint/bungie/BungieEndpoint";
import RequestOAuthToken from "utility/endpoint/bungie/endpoint/RequestOAuthToken";
import Env from "utility/Env";
import { EventManager } from "utility/EventManager";
import Store from "utility/Store";
import Time from "utility/Time";
import URL from "utility/URL";

export interface IBungieApiEvents {
	authenticated: Event;
	resetAuthentication: Event;
	error: BungieEndpoint.IEvents["error"];
	apiDown: BungieEndpoint.IEvents["apiDown"];
	querySuccess: BungieEndpoint.IEvents["querySuccess"];
}

export class BungieAPI {

	public get lastDailyReset () {
		const time = new Date().setUTCHours(17, 0, 0, 0);
		return time > Date.now() ? time - Time.days(1) : time;
	}

	public get lastWeeklyReset () {
		return this.nextWeeklyReset - Time.weeks(1);
	}

	public get lastTrialsReset () {
		return this.nextWeeklyReset - Time.days(4);
	}

	public get nextDailyReset () {
		return this.lastDailyReset + Time.days(1);
	}

	public get nextWeeklyReset () {
		const now = Date.now();
		const week = now + (Time.weeks(1) - (now % Time.weeks(1))) - Time.days(1) - Time.hours(7);
		return week < Date.now() ? week + Time.weeks(1) : week;
	}

	public event = new EventManager<this, IBungieApiEvents>(this)
		.pipe("error", BungieEndpoint.event)
		.pipe("apiDown", BungieEndpoint.event)
		.pipe("querySuccess", BungieEndpoint.event);

	public apiDown = false;

	public constructor () {
		BungieEndpoint.event.subscribe("authenticationFailed", () =>
			this.resetAuthentication());
		BungieEndpoint.event.subscribe("validateAuthorisation", ({ setAuthorisationPromise, force }) =>
			setAuthorisationPromise(this.validateAuthorisation(force)));
		BungieEndpoint.event.subscribe("apiDown", () => this.apiDown = true);
		BungieEndpoint.event.subscribe("querySuccess", () => this.apiDown = false);

		Object.assign(window, { Bungie: this });
	}

	public get authenticated () {
		return !!(Store.items.bungieAuthCode && Store.items.bungieAccessToken);
	}

	public async authenticate (type: "start" | "complete"): Promise<boolean> {
		if (!Store.items.bungieAuthCode && !URL.params.code) {
			if (type !== "start") {
				// the user didn't approve of starting auth yet
				return false;
			}

			// step 1: get an auth code for this user

			const clientId = Env.DEEPSIGHT_BUNGIE_CLIENT_ID;
			if (!clientId)
				throw new Error("Cannot authenticate with Bungie, no client ID in environment");

			location.href = `https://www.bungie.net/en/oauth/authorize?client_id=${clientId}&response_type=code`; // &state=${state}`;
			return false;
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
			return await this.requestToken();
		}

		return false;
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

	private async validateAuthorisation (force = false) {
		if (!force && (Store.items.bungieAccessTokenExpireTime ?? 0) > Date.now())
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

			return false;
		}

		Store.items.bungieAccessToken = result.access_token;
		Store.items.bungieAccessTokenExpireTime = Date.now() + result.expires_in * 1000;
		Store.items.bungieAccessTokenMembershipId = result.membership_id;
		Store.items.bungieAccessTokenRefreshExpireTime = Date.now() + result.refresh_expires_in * 1000;
		Store.items.bungieAccessTokenRefreshToken = result.refresh_token;
		this.event.emit("authenticated");
		return true;
	}
}

export default new BungieAPI;
