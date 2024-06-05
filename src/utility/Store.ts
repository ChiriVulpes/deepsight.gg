import type { BungieMembershipType } from "bungie-api-ts/common";
import type { DestinyClass } from "bungie-api-ts/destiny2";
import BungieID from "utility/BungieID";
import { EventManager } from "utility/EventManager";

export interface IItemPerkWishlist {
	name: string;
	plugs: number[];
}

type WishlistKey = `item${number}PerkWishlists`;
type IItemPerkWishlistStorage = {
	[key in WishlistKey]?: IItemPerkWishlist[];
}

export interface IProfileStorage {
	lastModified: string;

	// display
	emblemHash?: number;
	class?: DestinyClass;
	callsign?: string;
	callsignLastModified?: string;

	// auth
	authCode?: string;
	accessToken?: string;
	accessTokenExpireTime?: number;
	accessTokenMembershipId?: string;
	accessTokenRefreshExpireTime?: number;
	accessTokenRefreshToken?: string;
	membershipType?: BungieMembershipType;
	membershipId?: string;
}

export interface IProfile {
	id: BungieID;
	data: IProfileStorage;
}

export interface ILocalStorage extends IItemPerkWishlistStorage {
	databases?: IDBDatabaseInfo[];
	settingsAlwaysShowExtra?: true;
	settingsToggleExtra?: true;
	settingsDisplayLocksOnItems?: true;
	settingsClearItemFilterOnSwitchingViews?: true;
	settingsDisableReturnOnFailure?: true;
	settingsBackgroundBlur?: true | number;
	settingsBackgroundNoUseDefault?: true;
	settingsBackgroundFollowMouse?: true;
	settingsBackground?: string;
	settingsBackgroundRainbowVibrancy?: number;
	settingsBackgroundDarkness?: number;
	settingsDisplayWishlistedHighlights?: true;
	settingsDisableDisplayNonWishlistedHighlights?: true;
	settingsTrustTransfersUntil?: number;
	itemFilter?: string;
	profiles?: Record<string, IProfileStorage>;
	selectedProfile?: string;
}

export type IStoreEvents =
	& { [KEY in keyof ILocalStorage as `set${Capitalize<KEY>}`]: { value: ILocalStorage[KEY]; oldValue: ILocalStorage[KEY] } }
	& { [KEY in keyof ILocalStorage as `delete${Capitalize<KEY>}`]: { oldValue: ILocalStorage[KEY] } }

let storage: ILocalStorage | undefined;

export default class Store {

	public static readonly event = EventManager.make<IStoreEvents>();

	public static subscribeBackgroundChange (handler: () => any) {
		Store.event.subscribe("setSettingsBackground", handler);
		Store.event.subscribe("deleteSettingsBackground", handler);
		Store.event.subscribe("setSettingsBackgroundNoUseDefault", handler);
		Store.event.subscribe("deleteSettingsBackgroundNoUseDefault", handler);
	}

	public static get items () {
		return storage ??= new Proxy({}, {
			has (_, key) {
				return Store.has(key as string);
			},
			get (_, key) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return Store.get(key as string);
			},
			set (_, key, value) {
				return Store.set(key as string, value);
			},
			deleteProperty (_, key) {
				return Store.delete(key as string);
			},
		}) as any as ILocalStorage;
	}

	public static has (key: string) {
		return localStorage.getItem(key) !== null;
	}

	public static get<T> (key: string): T | null {
		const value = localStorage.getItem(key);
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return value === null ? null : JSON.parse(value);
		} catch {
			localStorage.removeItem(key);
			return null;
		}
	}

	public static set (key: string, value: any) {
		const oldValue = Store.get(key);
		if (oldValue === (value ?? null))
			return true;

		if (value === undefined)
			localStorage.removeItem(key);
		else
			localStorage.setItem(key, JSON.stringify(value));

		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		Store.event.emit(`set${key[0].toUpperCase()}${key.slice(1)}` as keyof IStoreEvents, { value, oldValue });
		return true;
	}

	public static delete (key: string) {
		const oldValue = Store.get(key);
		if (oldValue === null)
			return true;

		localStorage.removeItem(key);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		Store.event.emit(`delete${key[0].toUpperCase()}${key.slice(1)}` as keyof IStoreEvents, { oldValue });
		return true;
	}

	public static isAuthenticated () {
		return !!Store.getProfile()?.data.accessToken;
	}

	public static getProfile (): IProfile | undefined {
		const selectedProfileId = Store.items.selectedProfile;
		if (!selectedProfileId) {
			const profiles = Object.entries(Store.items.profiles ?? {});
			const authenticatedProfiles = profiles.filter(([, profile]) => profile.accessToken);

			if (!profiles.length || authenticatedProfiles.length > 1)
				return undefined;

			const [idString, data] = authenticatedProfiles[0] ?? profiles[0];

			const id = BungieID.parse(idString);
			if (!id || !data)
				return undefined;

			return { id, data };
		}

		const data = Store.items.profiles?.[selectedProfileId];
		if (!data)
			return undefined;

		const id = BungieID.parse(selectedProfileId);
		if (!id)
			return undefined;

		return { id, data };
	}

	public static updateProfile (bungieId: BungieID, profile: Partial<IProfileStorage> = {}) {
		const profiles = Store.items.profiles ?? {};
		profile = profiles[BungieID.stringify(bungieId)] = {
			...profiles[BungieID.stringify(bungieId)],
			...profile,
			lastModified: new Date().toISOString(),
		};
		Store.items.profiles = profiles;
		return profile as IProfileStorage;
	}

	public static removeProfile (bungieId: BungieID) {
		const profiles = Store.items.profiles ?? {};
		delete profiles[BungieID.stringify(bungieId)];
		Store.items.profiles = profiles;
	}
}

Object.assign(window, { Store });
