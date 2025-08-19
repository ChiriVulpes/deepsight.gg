import { Component, State } from 'kitsui'

interface OverlayExtensions {
	bind (state: State<boolean>): this
}

interface Overlay extends Component, OverlayExtensions { }

const visibleOverlays = new Set<Overlay>()
const hasVisible = State(false)

const Overlay = Object.assign(
	Component((component, owner: State.Owner): Overlay => {
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

						hasVisible.value = visibleOverlays.size > 0
					})
					return overlay
				},
			}))
			.onRemoveManual(overlay => {
				visibleOverlays.delete(overlay)
				hasVisible.value = visibleOverlays.size > 0
			})
	}),
	{
		hasVisible,
	}
)

export default Overlay
