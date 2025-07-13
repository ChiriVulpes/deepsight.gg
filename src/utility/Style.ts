import { style } from "kitsui/utility/StyleManipulator"
import chiristyle from 'style'
import Script from "utility/Script"

type Chiristyles = typeof chiristyle
declare module 'kitsui/utility/StyleManipulator' {
	interface Styles extends Chiristyles { }
}

style.value = chiristyle

namespace Style {
	export async function reload () {
		reloadStylesheet('./style/index.css')
		Script.allowModuleRedefinition('style')
		await Script.reload(`./style/index.js`)
		style.value = await import('style').then(module => module.default)
	}

	async function reloadStylesheet (path: string) {
		const oldStyle = document.querySelector(`link[rel=stylesheet][href^="${path}"]`)
		const style = document.createElement('link')
		style.rel = 'stylesheet'
		style.href = `${path}?${Date.now()}`
		return new Promise<void>((resolve, reject) => {
			style.onload = () => resolve()
			style.onerror = reject
			document.head.appendChild(style)
		}).finally(() => oldStyle?.remove())
	}
}

export default Style
