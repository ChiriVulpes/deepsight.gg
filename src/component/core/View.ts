import type { DisplayHandlers } from 'component/DisplayBar'
import DisplayBar from 'component/DisplayBar'
import Navbar from 'component/Navbar'
import Overlay from 'component/Overlay'
import { Component, State } from 'kitsui'
import Loading from 'kitsui/component/Loading'
import type { StringApplicatorSource } from 'kitsui/utility/StringApplicator'
import Task from 'kitsui/utility/Task'
import ViewTransition from 'utility/ViewTransition'

interface LoadingAPI {
	signal: AbortSignal
	setProgress (progress: number | null, source: StringApplicatorSource): void
}

interface ViewLoading extends Loading {
	start (): Promise<LoadingAPI>
	finish (): Promise<void>
}

interface ViewExtensions<PARAMS extends object | undefined> {
	readonly loading: ViewLoading
	readonly hasNavbar: State.Mutable<boolean>
	readonly displayBarConfig: State.Mutable<DisplayBar.Config | undefined>
	readonly displayHandlers: State<DisplayHandlers | undefined>
	readonly params: State<PARAMS>
	refresh (): Promise<void>
}

interface View<PARAMS extends object | undefined> extends Component, ViewExtensions<PARAMS> { }

const SYMBOL_VIEW_PARAMS = Symbol('VIEW_PARAMS')

namespace View {
	export type Builder<PARAMS extends object | undefined> = (PARAMS extends undefined
		? Builder.NoParams
		: Builder.WithParams<PARAMS>
	)
	export namespace Builder {
		export interface NoParams extends Component.BuilderExtensions<[], View<undefined>> {
			[SYMBOL_VIEW_PARAMS]: undefined
			(): View<undefined>
		}
		export interface WithParams<PARAMS extends object | undefined> extends Component.BuilderExtensions<[PARAMS], View<PARAMS>> {
			[SYMBOL_VIEW_PARAMS]: PARAMS
			(params: PARAMS): View<PARAMS>
		}
	}
}

const ViewExt = Component.Extension(view => view)

let viewContainer: Component | undefined
let navbar: Navbar | undefined
let displayBar: DisplayBar | undefined
function View (builder: (view: View<undefined>) => unknown): View.Builder.NoParams
function View<PARAMS extends object | undefined> (builder: (view: View<PARAMS>) => unknown): View.Builder.WithParams<PARAMS>
function View<PARAMS extends object | undefined> (builder: (view: View<PARAMS>) => unknown): View.Builder<PARAMS> {
	const hasNavbar = State(true)
	const displayBarConfig = State<DisplayBar.Config | undefined>(undefined)
	return Component((component, paramsIn) => {
		const params = State(paramsIn)
		const view = component
			.and(ViewExt)
			.style('view')
			.extend<ViewExtensions<PARAMS>>(view => ({
				loading: undefined!,
				hasNavbar,
				displayBarConfig,
				displayHandlers: displayBarConfig.map(view, config => config ? displayBar?.handlers : undefined),
				refresh: navigate.refresh,
				params,
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
			for (const view of viewContainer?.getChildren(ViewExt) ?? [])
				view.remove()

			builderPromise = builder(view)

			viewContainer ??= Component()
				.style('view-container')
				.tweak(container => {
					let savedScroll = 0
					Overlay.hasVisible.use(container, async hasVisible => {
						if (hasVisible) {
							savedScroll = document.documentElement.scrollTop
							document.documentElement.scrollTop = 0
							container.style('view-container--has-overlay')
								.style.setVariable('overlay-scroll-margin-top', `${savedScroll}px`)
							Component.getDocument().style.removeVariables('overlay-scroll-margin-top')
							return
						}

						const overlayScrollTop = document.documentElement.scrollTop
						Component.getDocument().style.setVariable('overlay-scroll-margin-top', `${-overlayScrollTop}px`)
						document.documentElement.scrollTop = 0
						container.style.remove('view-container--has-overlay')
						await Task.yield()
						Component.getDocument().style.setVariable('overlay-scroll-margin-top', `${savedScroll - overlayScrollTop}px`)
						container.style.removeVariables('overlay-scroll-margin-top')
						document.documentElement.scrollTop = savedScroll
					})
				})
				.appendTo(document.body)

			view.appendTo(viewContainer)

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
