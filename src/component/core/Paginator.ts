import Button from 'component/core/Button'
import DisplaySlot from 'component/core/DisplaySlot'
import { Component, State } from 'kitsui'
import Loading from 'kitsui/component/Loading'
import type ComponentInsertionTransaction from 'kitsui/ext/ComponentInsertionTransaction'

interface PaginatorDefinition<T> {
	get (page: number): Promise<T>
	init (paginator: Paginator<T>, slot: ComponentInsertionTransaction, page: number, data: T): unknown
}

interface PaginatorExtensions<T> {
	config<T> (definition: PaginatorDefinition<T>): Paginator<T>
	setTotalPages (totalPages: number): this
	getTotalPages (): number
}

interface Paginator<T> extends Component, PaginatorExtensions<T> { }

const Paginator = Component((component): Paginator<unknown> => {
	const state = State<PaginatorDefinition<unknown> | undefined>(undefined)
	const currentPage = State(-1)
	const totalPages = State(0)
	const isLastPage = State.MapManual([currentPage, totalPages], (page, total) => page >= total - 1)
	const lastDirection = State<-1 | 1>(1)

	const pageData: State<unknown>[] = []
	const pages: Component[] = []

	const hasPageData = State(false)
	const loading = State(false)

	const shouldDisplay = State.MapManual([hasPageData, totalPages], (hasPageData, totalPages) => hasPageData && totalPages >= 1)

	Loading()
		.style('paginator-loading')
		.showForever()
		.appendToWhen(loading, component)

	const Page = Component((pageComponent, page: number) => {
		pageData[page] ??= State<unknown>(undefined)
		return pageComponent.style('paginator-page')
			.and(DisplaySlot)
			.use(pageData[page], (slot, data) => {
				if (data === undefined)
					return

				hasPageData.value = true
				loading.value = false
				state.value?.init(component as Paginator<unknown>, slot, page, data)
			})
	})

	Button()
		.style('paginator-button', 'paginator-button--prev')
		.bindDisabled(currentPage.equals(0), 'no previous pages')
		.event.subscribe('click', () => currentPage.value = Math.max(0, currentPage.value - 1))
		.appendToWhen(shouldDisplay, component)

	const pageContainer = Component()
		.style('paginator-page-container')
		.style.bindVariable('direction', lastDirection)
		.appendToWhen(shouldDisplay, component)

	currentPage.subscribeManual((page, lastPage) => {
		if (!state.value)
			return

		lastDirection.value = page > (lastPage ?? -1) ? 1 : -1

		pageData[page] ??= State.Async(component, async () => {
			if (!hasPageData.value)
				loading.value = true

			return await state.value?.get(page)
		})
		pages[page] ??= Page(page)
			.style.bind(currentPage.equals(page), 'paginator-page--active')
			.appendTo(pageContainer)
	})

	Button()
		.style('paginator-button', 'paginator-button--next')
		.bindDisabled(isLastPage, 'no more pages')
		.event.subscribe('click', () => currentPage.value = Math.min(totalPages.value - 1, currentPage.value + 1))
		.appendToWhen(shouldDisplay, component)

	DisplaySlot()
		.style('paginator-display')
		.use(totalPages, (slot, totalPages) => {
			for (let i = 0; i < totalPages; i++) {
				Component()
					.style('paginator-display-page')
					.tweak(pageDot => pageDot
						.style.bindVariable('distance', currentPage.map(pageDot, page => Math.abs(page - i)))
						.style.bind(currentPage.equals(i), 'paginator-display-page--active')
					)
					.appendTo(slot)
			}
		})
		.appendToWhen(shouldDisplay, component)

	return component.style('paginator')
		.extend<PaginatorExtensions<unknown>>(component => ({
			config (definition) {
				pageContainer.removeContents()
				pageData.length = 0
				pages.length = 0
				state.value = definition
				totalPages.value = 1
				currentPage.value = 0
				hasPageData.value = false
				return component
			},
			getTotalPages () {
				return totalPages.value
			},
			setTotalPages (pages) {
				totalPages.value = pages
				return component
			},
		}))
})

export default Paginator
