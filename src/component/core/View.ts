import type { DisplayHandlers } from 'component/DisplayBar'
import DisplayBar from 'component/DisplayBar'
import Navbar from 'component/Navbar'
import { Component, State } from 'kitsui'
import Loading from 'kitsui/component/Loading'
import type { StringApplicatorSource } from 'kitsui/utility/StringApplicator'
import ViewTransition from 'utility/ViewTransition'

interface LoadingAPI {
	signal: AbortSignal
	setProgress (progress: number | null, source: StringApplicatorSource): void
}

interface ViewLoading extends Loading {
	start (): Promise<LoadingAPI>
	finish (): Promise<void>
}

interface ViewExtensions {
	readonly loading: ViewLoading
	readonly hasNavbar: State.Mutable<boolean>
	readonly displayBarConfig: State.Mutable<DisplayBar.Config | undefined>
	readonly displayHandlers: State<DisplayHandlers | undefined>
	refresh (): Promise<void>
}

interface View extends Component, ViewExtensions { }

const SYMBOL_VIEW_PARAMS = Symbol('VIEW_PARAMS')

namespace View {
	export type Builder<PARAMS extends object | undefined> = (PARAMS extends undefined
		? Builder.NoParams
		: Builder.WithParams<PARAMS>
	)
	export namespace Builder {
		export interface NoParams extends Component.BuilderExtensions<[], View> {
			[SYMBOL_VIEW_PARAMS]: undefined
			(): View
		}
		export interface WithParams<PARAMS extends object | undefined> extends Component.BuilderExtensions<[PARAMS], View> {
			[SYMBOL_VIEW_PARAMS]: PARAMS
			(params: PARAMS): View
		}
	}
}

const ViewExt = Component.Extension(view => view)

let navbar: Navbar | undefined
let displayBar: DisplayBar | undefined
function View (builder: (view: View) => unknown): View.Builder.NoParams
function View<PARAMS extends object> (builder: (view: View, params: PARAMS) => unknown): View.Builder.WithParams<PARAMS>
function View<PARAMS extends object | undefined> (builder: (view: View, params: PARAMS) => unknown): View.Builder<PARAMS> {
	const hasNavbar = State(true)
	const displayBarConfig = State<DisplayBar.Config | undefined>(undefined)
	return Component((component, params) => {
		const view = component
			.and(ViewExt)
			.style('view')
			.extend<ViewExtensions>(view => ({
				loading: undefined!,
				hasNavbar,
				displayBarConfig,
				displayHandlers: displayBarConfig.map(view, config => config ? displayBar?.handlers : undefined),
				refresh: navigate.refresh,
			}))

		let loading: ViewLoading | undefined
		let setLoadingApi: ((api: LoadingAPI) => void) | undefined
		const loadingApiPromise = new Promise<LoadingAPI>(resolve => setLoadingApi = resolve)
		let markLoadFinished: (() => void) | undefined
		let markFinishResolved: (() => void) | undefined
		const finishResolvedPromise = new Promise<void>(resolve => markFinishResolved = resolve)
		view.extendJIT('loading', () => loading ??= Object.assign(Loading(), {
			start () {
				return loadingApiPromise
			},
			finish () {
				markLoadFinished?.()
				markLoadFinished = undefined
				setLoadingApi = undefined
				return finishResolvedPromise
			},
		}))

		let builderPromise: unknown
		const trans = ViewTransition.perform('view', () => {
			for (const view of Component.getBody().getChildren(ViewExt))
				view.remove()

			builderPromise = builder(view, params)
			view.appendTo(document.body)

			navbar ??= Navbar()
			displayBar ??= DisplayBar()
			const newShowNavbar = view.hasNavbar.value
			if (navbar.visible.value !== newShowNavbar) {
				navbar.viewTransitionsEnabled.value = true
				navbar.visible.value = newShowNavbar
			}

			if (!view.displayBarConfig.value && displayBar)
				displayBar.config.value = undefined
		})

		void trans.finished.then(() => {
			if (navbar)
				navbar.viewTransitionsEnabled.value = false

			if (!loading) {
				displayBar?.config.bind(view, view.displayBarConfig)
				return
			}

			const loadFinishedPromise = new Promise<void>(resolve => markLoadFinished = resolve)
			loading.set(
				async (signal, setProgress) => {
					setLoadingApi!({
						signal,
						setProgress,
					})
					await loadFinishedPromise
					return {}
				},
				async () => {
					markFinishResolved!()
					await builderPromise
					void Promise.resolve(loading?.transitionFinished).then(() => {
						displayBar?.config.bind(view, view.displayBarConfig)
					})
				},
			)
		})

		return view
	}) as View.Builder<PARAMS>
}

export default View
