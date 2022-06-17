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

	public static get (key: string) {
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
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	}

	public static delete (key: string) {
		localStorage.removeItem(key);
		return true;
	}
}