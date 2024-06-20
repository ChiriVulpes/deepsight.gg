import type { BungieMembershipType } from "bungie-api-ts/common";
import type { DestinyClass } from "bungie-api-ts/destiny2";
import type BungieID from "utility/BungieID";
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

	// inventory
	stateModifications?: IStateModification[];
}

export interface IStateModification {
	type: string;
	time: number;
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
}

Object.assign(window, { Store });
