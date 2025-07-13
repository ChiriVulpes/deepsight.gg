import { Component } from 'kitsui'
import { StringApplicatorSource } from 'kitsui/utility/StringApplicator'
import type { Quilt, Weave, Weft } from 'lang'
import quilt, { WeavingArg } from 'lang'

declare module 'kitsui/utility/StringApplicator' {
	interface StringApplicatorSources {
		weave: Quilt.Handler
	}
}

namespace Text {
	export function init () {
		StringApplicatorSource.register('weave', {
			match (source): source is Quilt.Handler {
				return typeof source === 'function'
			},
			toNodes (source: Quilt.Handler): Node[] {
				return renderWeave(source(quilt))
			},
			toString (source: Quilt.Handler): string {
				return source(quilt).toString()
			},
		})
	}

	export function renderWeave (weave: Weave): Node[] {
		return weave.content.map(renderWeft)
	}

	function renderWeft (weft: Weft): Node {
		if (isPlaintextWeft(weft))
			return document.createTextNode(weft.content)

		const tag = weft.tag?.toLowerCase()

		let element = !tag ? undefined : createTagElement(tag)
		element ??= document.createElement('span')

		if (Array.isArray(weft.content))
			element.append(...weft.content.map(renderWeft))
		else if (typeof weft.content === 'object' && weft.content) {
			if (!WeavingArg.isRenderable(weft.content))
				element.append(...renderWeave(weft.content))
			else if (Component.is(weft.content))
				element.append(weft.content.element)
			else if (weft.content instanceof Node)
				element.append(weft.content)
			else
				console.warn('Unrenderable weave content:', weft.content)
		}
		else {
			const value = `${weft.content ?? ''}`
			const texts = value.split('\n')
			for (let i = 0; i < texts.length; i++) {
				if (i > 0)
					element.append(Component('br').element, Component().style('break').element)

				element.append(document.createTextNode(texts[i]))
			}
		}

		return element
	}

	function isPlaintextWeft (weft: Weft): weft is Weft & { content: string } {
		return true
			&& typeof weft.content === 'string'
			&& !weft.content.includes('\n')
			&& !weft.tag
	}

	export function createTagElement (tag: string): HTMLElement | undefined {
		tag = tag.toLowerCase()

		if (tag.startsWith('link(')) {
			let href = tag.slice(5, -1)
			// const link = href.startsWith('/')
			// 	? Link(href as RoutePath)
			// 	: ExternalLink(href)

			if (!href.startsWith('/') && !href.startsWith('.'))
				href = `https://${href}`

			return Component('a')
				.attributes.set('href', href)
				.element
		}

		// if (tag.startsWith('.')) {
		// 	const className = tag.slice(1)
		// 	if (className in style.value)
		// 		return Component()
		// 			.style(className as keyof typeof style.value)
		// 			.element
		// }

		// if (tag.startsWith('icon.')) {
		// 	const className = `button-icon-${tag.slice(5)}`
		// 	if (className in style.value)
		// 		return Component()
		// 			.style('button-icon', className as keyof typeof style.value, 'button-icon--inline')
		// 			.element
		// }

		switch (tag) {
			case 'b': return document.createElement('strong')
			case 'i': return document.createElement('em')
			case 'u': return document.createElement('u')
			case 's': return document.createElement('s')
			case 'code': return Component('code').style('code').element

			// case 'sm': return Component('small')
			// 	.style('small')
			// 	.element
		}
	}
}

export default Text
