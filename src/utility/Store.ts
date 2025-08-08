import { State } from 'kitsui'

export interface ILocalStorage {
}

// export type IStoreEvents =
// 	& { [KEY in keyof ILocalStorage as `set${Capitalize<KEY>}`]: { value: ILocalStorage[KEY]; oldValue: ILocalStorage[KEY] } }
// 	& { [KEY in keyof ILocalStorage as `delete${Capitalize<KEY>}`]: { oldValue: ILocalStorage[KEY] } }

let storage: Partial<ILocalStorage> | undefined

type States = { [KEY in keyof ILocalStorage]: State.Mutable<ILocalStorage[KEY] | undefined> }
let statesProxy: States | undefined
let states: Partial<States> | undefined

export default class Store {

	// public static readonly event = EventManager.make<IStoreEvents>()

	public static get items () {
		return storage ??= new Proxy({}, {
			has (_, key) {
				return Store.has(key as string)
			},
			get (_, key) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return Store.get(key as string)
			},
			set (_, key, value) {
				return Store.set(key as string, value)
			},
			deleteProperty (_, key) {
				return Store.delete(key as string)
			},
		}) as any as Partial<ILocalStorage>
	}

	public static get state () {
		const s = states ??= {}
		return statesProxy ??= new Proxy({}, {
			has (_, key) {
				return Store.has(key as string)
			},
			get (_, key: keyof ILocalStorage) {
				return s[key] ??= State(Store.get(key)) as never
			},
		}) as any as States
	}

	public static get full () {
		const result: any = {}
		for (const [key, value] of Object.entries(localStorage))
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
			result[key] = JSON.parse(value)
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		return result
	}

	public static has (key: string) {
		return localStorage.getItem(key) !== null
	}

	public static get<T> (key: string): T | null {
		const value = localStorage.getItem(key)
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-return
			return value === null ? null : JSON.parse(value)
		}
		catch {
			localStorage.removeItem(key)
			return null
		}
	}

	public static set (key: string, value: any) {
		// const oldValue = Store.get(key)
		if (value === undefined)
			localStorage.removeItem(key)
		else
			localStorage.setItem(key, JSON.stringify(value))

		// Store.event.emit(`set${key[0].toUpperCase()}${key.slice(1)}` as keyof IStoreEvents, { value, oldValue } as never)
		const state = states?.[key as keyof ILocalStorage]
		if (state)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			state.value = value
		return true
	}

	public static delete (key: string) {
		// const oldValue = Store.get(key)
		localStorage.removeItem(key)

		// Store.event.emit(`delete${key[0].toUpperCase()}${key.slice(1)}` as keyof IStoreEvents, { oldValue } as never)
		const state = states?.[key as keyof ILocalStorage]
		if (state)
			state.value = undefined
		return true
	}

}

Object.assign(window, { Store })
