export interface ILocalStorage {
	bungieAuthCode?: string;
	bungieAccessToken?: string;
	bungieAccessTokenExpireTime?: number;
	bungieAccessTokenMembershipId?: string;
	bungieAccessTokenRefreshExpireTime?: number;
	bungieAccessTokenRefreshToken?: string;
}

let storage: ILocalStorage | undefined;

export default class Store {
	public static get items () {
		return storage ??= new Proxy({}, {
			has (_, key) {
				return localStorage.getItem(key as string) !== undefined;
			},
			get (_, key) {
				return localStorage.getItem(key as string);
			},
			set (_, key, value) {
				localStorage.setItem(key as string, value as string);
				return true;
			},
			deleteProperty (_, key) {
				localStorage.removeItem(key as string);
				return true;
			},
		}) as any as ILocalStorage;
	}
}