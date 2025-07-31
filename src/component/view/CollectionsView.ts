import View from 'component/core/View'
import DisplayBar from 'component/DisplayBar'
import Moment from 'component/view/collections/Moment'
import { Component } from 'kitsui'
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

	let year: number | undefined = NaN
	let yearWrapper: Component | undefined
	for (const moment of collections.moments) {
		if (moment.moment.year !== year) {
			year = moment.moment.year
			yearWrapper = !year ? undefined : Component()
				.style('collections-view-year')
				.append(Component()
					.style('collections-view-year-label')
					.text.set(quilt => quilt['view/collections/year'](year))
				)
				.appendTo(view)
		}

		Moment(moment, collections).appendTo(yearWrapper ?? view)
	}
})
