import { State } from 'kitsui'
import Dialog from 'kitsui/component/Dialog'
import Popover from 'kitsui/component/Popover'
import EventManipulator from 'kitsui/utility/EventManipulator'
import type { RoutePath } from 'navigation/RoutePath'
import Routes from 'navigation/Routes'
// import ErrorView from 'ui/view/ErrorView'

declare global {
	export const navigate: Navigator
}

export interface NavigatorEvents {
	Navigate (route: RoutePath | undefined): void
	HashChange (newHash: string, oldHash: string | undefined): void
}

export interface NavigatorSearch extends State<Readonly<Record<string, string>>> {
	get (key: string): string | undefined
	set (key: string, value?: string | null): void
	delete (key: string): void
}

interface Navigator {
	readonly state: State<string>
	readonly hash: State<string>
	readonly search: NavigatorSearch
	readonly event: EventManipulator<this, NavigatorEvents>
	isURL (glob: string): boolean
	fromURL (): Promise<void>
	toURL (route: RoutePath): Promise<void>
	setURL (route: RoutePath): void
	toRawURL (url: string): boolean
	refresh (): Promise<void>
	// ephemeral: ViewContainer['showEphemeral']
}

function Navigator (): Navigator {
	const state = State<string>(location.href)
	const hash = State<string>(location.hash)

	const search = (() => {
		const state = State<Record<string, string>>({})
		state.subscribeManual(() => {
			const pathname = location.pathname
			let search = new URLSearchParams(state.value).toString()
			search = search ? `?${search}` : ''
			if (search === location.search)
				return

			const hash = location.hash
			const url = `${pathname}${search}${hash}`
			history.pushState({}, '', `${location.origin}${url}`)
		})
		return Object.assign(
			state,
			{
				get (key: string) {
					return state.value[key] ?? undefined
				},
				set (key: string, value?: string | null) {
					if ((value === undefined || value === null) && state.value[key] !== undefined) {
						delete state.value[key]
						state.emit()
					}
					else if (value !== undefined && value !== null && state.value[key] !== value) {
						state.value[key] = value
						state.emit()
					}
				},
				delete (key: string) {
					if (state.value[key] !== undefined) {
						delete state.value[key]
						state.emit()
					}
				},
			},
		) as NavigatorSearch
	})()
	const refreshSearchState = () => search.asMutable?.setValue(Object.fromEntries(new URLSearchParams(location.search).entries()))
	refreshSearchState()

	let lastURL: URL | undefined
	const navigate = {
		state,
		hash,
		search,
		event: undefined! as Navigator['event'],
		isURL: (glob: string) => {
			const pattern = glob
				.replace(/(?<=\/)\*(?!\*)/g, '[^/]*')
				.replace(/\/\*\*/g, '.*')
			return new RegExp(`^${pattern}$`).test(location.pathname)
		},
		fromURL: async () => navigateFromCurrentURL(),
		refresh: async () => navigateFromCurrentURL(true),
		toURL: async (url: string) => {
			navigate.setURL(url, false)
			return navigate.fromURL()
		},
		setURL: (url: string, updateLast = true) => {
			if (url !== location.pathname) {
				history.pushState({}, '', `${location.origin}${url}`)
				refreshSearchState()
				if (updateLast)
					lastURL = new URL(location.href)
			}
		},
		toRawURL: (url: string) => {
			if (url.startsWith('http')) {
				location.href = url
				refreshSearchState()
				return true
			}

			if (url.startsWith('/')) {
				void navigate.toURL(url)
				return true
			}

			if (url.startsWith('#')) {
				const id = url.slice(1)
				const element = document.getElementById(id)
				if (!element) {
					console.error(`No element by ID: "${id}"`)
					return false
				}

				location.hash = url
				hash.value = location.hash
				return true
			}

			console.error(`Unsupported raw URL to navigate to: "${url}"`)
			return false
		},
		// ephemeral: (...args: unknown[]) => {
		// 	if (!app)
		// 		throw new Error('Cannot show ephemeral view yet, no app instance')

		// 	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
		// 	return (app.view.showEphemeral as any)(...args)
		// },
	}

	Object.assign(navigate, {
		event: EventManipulator(navigate),
	})

	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	window.addEventListener('popstate', navigate.fromURL)

	Object.assign(window, { navigate })
	return navigate

	async function navigateFromCurrentURL (force?: true) {
		if (location.href === lastURL?.href && !force)
			return

		// if (!app)
		// 	throw new Error('Cannot navigate yet, no app instance')

		const oldURL = lastURL
		lastURL = new URL(location.href)
		state.value = location.href
		hash.value = location.hash

		let matchedRoute: RoutePath | undefined
		if (location.pathname !== oldURL?.pathname || force) {
			const url = location.pathname
			let handled = false
			for (const route of Routes) {
				const params = route.match(url)
				if (!params)
					continue

				matchedRoute = route.path

				await route.handler((!Object.keys(params).length ? undefined : params) as never)
				handled = true
				break
			}

			if (!handled) {
				console.error('TODO implement error view')
				// await app.view.show(ErrorView, { code: 404 })
			}
		}
		else if (location.hash !== oldURL?.hash) {
			hash.value = location.hash
			navigate.event.emit('HashChange', location.hash, oldURL?.hash)
		}

		navigate.event.emit('Navigate', matchedRoute)
		Popover.forceCloseAll()
		Dialog.forceCloseAll()
	}
}

// let app: App | undefined
// namespace Navigator {
// 	export function setApp (instance: App) {
// 		app = instance
// 	}
// }

export default Navigator
