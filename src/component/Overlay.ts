import { Component, State } from 'kitsui'

interface OverlayExtensions {
	bind (state: State<boolean>): this
}

interface Overlay extends Component, OverlayExtensions { }

const visibleOverlays = new Set<Overlay>()
const hasOverlayVisible = State(false)
hasOverlayVisible.subscribeManual(hasOverlayVisible => {
	Component.getDocument().style.toggle(hasOverlayVisible, 'has-overlay')
})

export default Component((component, owner: State.Owner): Overlay => {
	let unsubscribe: State.Unsubscribe | undefined
	return component
		.setOwner(owner)
		.appendTo(document.body)
		.style('overlay')
		.extend<OverlayExtensions>(overlay => ({
			bind (state) {
				unsubscribe?.()
				overlay.style.bind(state, 'overlay--visible')
				unsubscribe = state.use(overlay, visible => {
					if (visible)
						visibleOverlays.add(overlay)
					else
						visibleOverlays.delete(overlay)

					hasOverlayVisible.value = visibleOverlays.size > 0
				})
				return overlay
			},
		}))
		.onRemoveManual(overlay => {
			visibleOverlays.delete(overlay)
			hasOverlayVisible.value = visibleOverlays.size > 0
		})
})
