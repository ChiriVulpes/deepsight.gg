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

	public event = new EventManager<this, IBungieApiEvents>(this)
		.pipe("error", BungieEndpoint.event);

	public constructor () {
		BungieEndpoint.event.subscribe("authenticationFailed", () =>
			this.resetAuthentication());
	}

	public get authenticated () {
		return !!(Store.items.bungieAuthCode && Store.items.bungieAccessToken);
	}

	public async authenticate (type: "start" | "complete"): Promise<void> {
		if (!Store.items.bungieAuthCode && (!URL.params.code || !URL.params.state)) {
			if (type !== "start") {
				// the user didn't approve of starting auth yet
				return;
			}

			// step 1: get an auth code for this user

			const clientId = Env.FVM_BUNGIE_CLIENT_ID;
			if (!clientId)
				throw new Error("Cannot authenticate with Bungie, no client ID in environment");

			const state = this.generateState();
			Store.items.bungieAuthState = state;
			location.href = `https://www.bungie.net/en/oauth/authorize?client_id=${clientId}&response_type=code&state=${state}`;
			return;
		}

		if (!Store.items.bungieAuthCode) {
			// step 2: receive auth code from bungie oauth

			const state = Store.items.bungieAuthState;
			if (state !== URL.params.state) {
				this.resetAuthentication();
				throw new Error("Invalid state");
			}

			// received auth code
			Store.items.bungieAuthCode = URL.params.code!;
		}

		delete URL.params.code;
		delete URL.params.state;

		if (!Store.items.bungieAccessToken) {
			// step 3: get an access token

			const result = await RequestOAuthToken.query();

			if ("error" in result) {
				if (result.error === "invalid_grant") {
					this.resetAuthentication();
					throw Object.assign(new Error(result.error_description as string | undefined ?? "Invalid grant"), result);
				}

				return;
			}

			Store.items.bungieAccessToken = result.access_token;
			Store.items.bungieAccessTokenExpiresIn = result.expires_in;
			Store.items.bungieAccessTokenMembershipId = result.membership_id;
		}
	}

	private resetAuthentication () {
		delete URL.params.code;
		delete URL.params.state;
		delete Store.items.bungieAuthCode;
		delete Store.items.bungieAuthState;
		delete Store.items.bungieAccessToken;
		delete Store.items.bungieAccessTokenExpiresIn;
		delete Store.items.bungieAccessTokenMembershipId;
		this.event.emit("resetAuthentication");
	}

	private generateState () {
		return (Math.random().toString().slice(2) + Math.random().toString().slice(2) + Math.random().toString().slice(2)).slice(0, 30);
	}
}

export default new BungieAPI;
