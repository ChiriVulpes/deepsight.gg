import { Component, State } from 'kitsui'
import Loading from 'kitsui/component/Loading'
import Define from 'utility/Define'

interface ToastExtensions {
	readonly content: Component
	readonly removing: State<boolean>
	setLoading (): this
	queueRemove (): void
}

interface Toast extends Component, ToastExtensions { }

const Toast = Component((component): Toast => {
	const loading = State(false)
	const removing = State(false)
	const content = Component()
		.style('toast-content')
	return component
		.style('toast')
		.style.bind(loading, 'toast--loading')
		.style.bind(removing, 'toast--removing')
		.appendWhen(loading, Loading()
			.style('toast-loader')
			.showForever()
		)
		.append(content)
		.extend<ToastExtensions>(toast => ({
			removing,
			content,
			setLoading () {
				loading.value = true
				return toast
			},
			queueRemove () {
				removing.value = true
				setTimeout(() => toast.remove(), 10000)
			},
		}))
})

interface ToastStreamExtensions {
	add (tweaker: (toast: Toast) => unknown): this
}

export interface ToastStream extends Component, ToastStreamExtensions { }

const toastStreamBuilder = Component((component): ToastStream => {
	return component
		.style('toast-stream')
		.extend<ToastStreamExtensions>(stream => ({
			add (tweaker) {
				const wrapper = Component().style('toast-wrapper').prependTo(stream)
				const toast = Toast().tweak(tweaker).appendTo(wrapper)
				wrapper
					.setOwner(toast) // remove wrapper when toast is removed
					.style.bind(toast.removing, 'toast-wrapper--removing')
				return stream
			},
		}))
})
let mainToastStream: ToastStream | undefined
export const ToastStream = Object.assign(
	toastStreamBuilder,
	{
		Main: undefined! as ToastStream,
	}
)
Define.magic(ToastStream, 'Main', {
	get: () => {
		return mainToastStream ??= toastStreamBuilder().appendTo(Component.getBody())
	},
})

export default Toast
