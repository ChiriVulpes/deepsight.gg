import { Component } from 'kitsui'

interface ViewExtensions {
	show (): this
}

interface View extends Component, ViewExtensions { }

const View = Component((view): View => {
	return view.style('view').extend<ViewExtensions>(view => ({
		show () {
			document.startViewTransition(() => {
				for (const view of Component.getBody().getChildren(View))
					view.remove()

				view.appendTo(document.body)
			})
			return view
		},
	}))
})

export default View
