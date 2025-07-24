import View from 'component/core/View'
import Moment from 'component/view/collections/Moment'
import { Component } from 'kitsui'
import Relic from 'Relic'

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

	for (const moment of collections.moments)
		Moment(moment, collections).appendTo(view)
})
