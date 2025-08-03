import View from 'component/core/View'
import DisplayBar from 'component/DisplayBar'
import Moment from 'component/view/collections/Moment'
import { Component, State } from 'kitsui'
import Relic from 'Relic'

const COLLECTIONS_DISPLAY = DisplayBar.Config({
	id: 'collections',
	sortConfig: {},
	filterConfig: {},
})

export default View(async view => {
	view.style('collections-view')
		.style.bind(view.loading.loaded, 'collections-view--ready')

	Component()
		.style('view-title')
		.viewTransitionSwipe('collections-view-title')
		.text.set(quilt => quilt['view/collections/title']())
		.appendTo(view)

	view.loading.appendTo(view)

	const { signal, setProgress } = await view.loading.start()
	setProgress(null, quilt => quilt['view/collections/load/connecting']())
	const conduit = await Relic.connected
	if (signal.aborted)
		return

	setProgress(null, quilt => quilt['view/collections/load/fetching']())
	const collections = await conduit.getCollections()
	if (signal.aborted)
		return

	await view.loading.finish()

	console.log(collections)
	view.displayBarConfig.value = COLLECTIONS_DISPLAY

	const filterText = view.displayHandlers.map(view, display => display?.filter.filterText)

	let year: number | undefined = NaN
	let yearWrapper: Component | undefined
	let yearMomentVisibilityStates: State<boolean>[] = []
	for (const moment of collections.moments) {
		if (moment.moment.year !== year) {
			handleYearWrapperEnd()

			year = moment.moment.year
			yearWrapper = !year ? undefined : Component()
				.style('collections-view-year')
				.append(Component()
					.style('collections-view-year-label')
					.text.set(quilt => quilt['view/collections/year'](year))
				)
		}

		const momentComponent = Moment(moment, collections, view.displayHandlers)
		const shouldShow = State.Map(momentComponent, [momentComponent.open, filterText], (open, filterText) => open || !filterText)
		yearMomentVisibilityStates.push(shouldShow)
		momentComponent.appendToWhen(shouldShow, yearWrapper ?? view)
	}

	handleYearWrapperEnd()
	function handleYearWrapperEnd () {
		if (!yearWrapper)
			return

		const momentVisibilityStates = yearMomentVisibilityStates.slice()
		yearMomentVisibilityStates = []
		const shouldShow = State.Map(yearWrapper, momentVisibilityStates, (...states) => states.includes(true))
		yearWrapper.appendToWhen(shouldShow, view)
	}
})
