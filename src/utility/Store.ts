export interface ILocalStorage {
	bungieAuthCode?: string;
	bungieAccessToken?: string;
	bungieAccessTokenExpireTime?: number;
	bungieAccessTokenMembershipId?: string;
	bungieAccessTokenRefreshExpireTime?: number;
	bungieAccessTokenRefreshToken?: string;
	databases?: IDBDatabaseInfo[];
}

let storage: ILocalStorage | undefined;

export default class Store {
	public static get items () {
		return storage ??= new Proxy({}, {
			has (_, key) {
				return localStorage.getItem(key as string) !== null;
			},
			get (_, key) {
				const value = localStorage.getItem(key as string);
				try {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-return
					return value === null ? null : JSON.parse(value);
				} catch {
					localStorage.removeItem(key as string);
					return null;
				}
			},
			set (_, key, value) {
				localStorage.setItem(key as string, JSON.stringify(value));
				return true;
			},
			deleteProperty (_, key) {
				localStorage.removeItem(key as string);
				return true;
			},
		}) as any as ILocalStorage;
	}
}