import Details from 'component/core/Details'
import Image from 'component/core/Image'
import Link from 'component/core/Link'
import Paginator from 'component/core/Paginator'
import Tabinator from 'component/core/Tabinator'
import DataDefinitionButton from 'component/view/data/DataDefinitionButton'
import DataHelper from 'component/view/data/DataHelper'
import DataProvider from 'component/view/data/DataProvider'
import type { AllComponentNames, DefinitionLinks } from 'conduit.deepsight.gg/DefinitionComponents'
import { Component, State } from 'kitsui'
import Loading from 'kitsui/component/Loading'
import Slot from 'kitsui/component/Slot'
import InputBus from 'kitsui/utility/InputBus'
import Task from 'kitsui/utility/Task'
import type { RoutePath } from 'navigation/RoutePath'
import Arrays from 'utility/Arrays'

export interface DataOverlayParams {
	table: AllComponentNames
	hash: number | string
	definition: object | undefined
	links?: DefinitionLinks
}

export default Component((component, params: State<DataOverlayParams | undefined>) => {
	component.style('data-overlay')

	const dedupedParams = params.delay(component, 10, params => params, (a, b) => true
		&& a?.table === b?.table
		&& a?.hash === b?.hash
		&& a?.definition === b?.definition
		&& a?.links === b?.links
	)

	interface Links extends Omit<DefinitionLinks, 'links'> {
		links?: {
			link: NonNullable<DefinitionLinks['links']>[number]
			pathRegex: RegExp
		}[]
	}
	const links = dedupedParams.map(component, (params): Links | undefined => {
		return resolveLinks(params?.links)
	})

	function resolveLinks (links?: DefinitionLinks): Links | undefined {
		if (!links)
			return undefined

		return {
			...links,
			links: links?.links?.map(link => ({
				link,
				pathRegex: new RegExp(`^${(link.path
					.replaceAll('.', '\\.')
					.replaceAll('[]', '\\d+')
					.replaceAll('{}', '[^\\.]+')
				)}$`),
			})),
		}
	}

	const JSONRender = Component((component, value?: unknown, links?: State<Links | undefined>) => {
		links ??= State(undefined)

		////////////////////////////////////
		//#region JSON

		const JSONComponent = Component.Tag()

		const JSONPunctuation = Component((component, punctuationString: string) => component.and(JSONComponent)
			.style('data-overlay-json-punctuation')
			.text.set(punctuationString)
		)

		const JSONPlaceholder = Component((component, text: string) => component.and(JSONComponent)
			.style('data-overlay-json-placeholder')
			.text.set(text)
		)

		////////////////////////////////////
		//#region Copypaste

		const JSONCopyPaste = Component('input', (component, value: string | number) => component.and(JSONComponent)
			.replaceElement('input')
			.style('data-overlay-json-copypaste')
			.attributes.set('readonly', 'true')
			.tweak(input => {
				const string = `${value}`
				input.element.value = string
				input.style.setVariable('chars', string.length)
			})
			.event.subscribe('mousedown', e => {
				const input = e.host
				if (document.activeElement !== input.element) {
					void Task.yield().then(() => input.element.select())
				}
			})
			.event.subscribe('blur', e => {
				window.getSelection()?.removeAllRanges()
			})
		)

		//#endregion
		////////////////////////////////////

		////////////////////////////////////
		//#region Container

		interface JSONContainerExtensions {
			readonly key: Component
			readonly path: (string | number)[]
		}

		interface JSONContainer extends Details, JSONContainerExtensions { }

		const JSONContainer = Component((component, key: string | number | Component | Component[], value: any, path: (string | number)[], holdIn?: State<boolean>, isSoloKey = false): JSONContainer => {
			const pathString = path.join('/')
			const highlighted = navigate.hash.map(component, hash => hash.startsWith(`#${pathString}`))

			let container: JSONContainer
			const keyComponent = Component('a')
				.setOwner(component)
				.style('data-overlay-json-container-key')
				.attributes.set('href', `#${pathString}`)
				.append(...typeof key === 'object' ? Arrays.resolve(key) : [])
				.text.append(typeof key !== 'object' ? `${key}` : '')
				.event.subscribe('click', e => {
					if (e.targetComponent?.is(JSONCopyPaste))
						return

					e.preventDefault()
					container.open.value = !container.open.value
				})

			const hold = State(false)
			if (holdIn)
				hold.bind(component, holdIn)

			if (highlighted.value)
				hold.value = false

			let hasInit = false

			return container = component.and(Details).and(JSONComponent)
				.style('data-overlay-json-container-entry')
				.tweak(details => hold.use(details, hold => {
					if (hold)
						return

					if (hasInit)
						return

					hasInit = true

					const valueComponent = JSONValue(value, path, details.open.falsy)
					const expandable = valueComponent.as(JSONObject) ?? valueComponent.as(JSONArray)

					details.summary
						.style('data-overlay-json-container-entry-summary')
						.style.toggle(!expandable, 'data-overlay-json-container-entry-summary--simple')
						.append(keyComponent)
						.append(JSONPunctuation(':'))
						.text.append(' ')
						.append(expandable ? undefined : valueComponent)
						.append(!expandable ? undefined : (expandable.is(JSONObject)
							? JSONPlaceholder(`{} ${expandable.size} ${expandable.size === 1 ? 'entry' : 'entries'}`)
							: JSONPlaceholder(`[] ${expandable.length} ${expandable.length === 1 ? 'item' : 'items'}`))
						)
						.event.subscribe('click', e => {
							if (e.targetComponent?.is(JSONCopyPaste))
								e.preventDefault()
						})

					details.content
						.append(Component()
							.style('data-overlay-json-container-expandable')
							.append(expandable)
						)
				}))
				.onRooted(() => {
					if (isSoloKey)
						container.open.value = true

					highlighted.use(keyComponent, highlighted => {
						if (!highlighted)
							return

						container.key.style('data-overlay-json-container-key--highlighted')
						container.open.value = true
						const highlightedContainers = container.getAncestorComponents(JSONContainer).toArray()
						for (const ancestorContainer of highlightedContainers) {
							ancestorContainer.key.style('data-overlay-json-container-key--highlighted')
							ancestorContainer.open.value = true
						}

						highlightedContainers.push(container)

						const jsonRoot = container.getAncestorComponents(JSONComponent).toArray().at(-1)
						for (const container of jsonRoot?.getDescendants(JSONContainer) ?? []) {
							if (highlightedContainers.includes(container))
								continue

							container.open.value = false
							container.key.style.remove('data-overlay-json-container-key--highlighted')
						}
					})
				})
				.extend<JSONContainerExtensions>(container => ({
					key: keyComponent,
					path,
				}))
		})

		//#endregion
		////////////////////////////////////

		////////////////////////////////////
		//#region Object

		interface JSONObjectExtensions {
			readonly size: number
		}

		interface JSONObject extends Component, JSONObjectExtensions { }

		const JSONObject = Component((component, object: object, path?: (string | number)[], hold?: State<boolean>): JSONObject => {
			component.style('data-overlay-json', 'data-overlay-json-object')
			const entries = Object.entries(object)
			for (const [key, value] of entries) {
				JSONContainer(key, value, [...path ?? [], key], hold, entries.length === 1)
					.tweak(container => container.key.style('data-overlay-json-object-key'))
					.appendTo(component)
			}
			return component.and(JSONComponent).extend<JSONObjectExtensions>(obj => ({
				size: entries.length,
			}))
		})

		//#endregion
		////////////////////////////////////

		////////////////////////////////////
		//#region Array

		interface JSONArrayExtensions {
			readonly length: number
		}

		interface JSONArray extends Component, JSONArrayExtensions { }

		const JSONArray = Component((component, array: any[], path?: (string | number)[], hold?: State<boolean>): JSONArray => {
			component.style('data-overlay-json', 'data-overlay-json-array')

			JSONCascade(array.map((_, i) => i), path, hold,
				i => JSONContainer(
					[JSONPunctuation('['), JSONNumber(i), JSONPunctuation(']')],
					array[i],
					[...path ?? [], i],
					hold,
					array.length === 1,
				)
					.tweak(container => container.key.style('data-overlay-json-array-index'))
			)
				.appendTo(component)

			return component.and(JSONComponent).extend<JSONArrayExtensions>(arr => ({
				length: array.length,
			}))
		})

		const JSONCascade = <T> (array: T[], path: (string | number)[] | undefined, hold: State<boolean> | undefined, init: (value: T) => Component): Component => {
			const CASCADE_SIZE = 25
			const chunks = array.groupBy((v, index) => Math.floor(index / CASCADE_SIZE)).map(([, chunk]) => chunk)
			if (chunks.length > CASCADE_SIZE)
				return JSONCascade(chunks, path, hold, chunk => cascadeChunk(chunk))

			const result = Component()
			for (const chunk of chunks)
				cascadeChunk(chunk)
					.appendTo(result)

			return result

			function cascadeChunk (chunk: T[]) {
				const [start, end] = getEnds(chunk as CascadedKeys)
				return Component()
					.style('data-overlay-json-container-entry')
					.and(Details)
					.tweak(details => {
						const pathBeforeKey = path?.join('/')
						const highlighted = navigate.hash.map(component, hash => {
							if (!pathBeforeKey)
								return false

							if (!hash.startsWith(`#${pathBeforeKey}`))
								return false

							const nextSegment = hash.slice(pathBeforeKey.length + 2).split('/')[0]
							const nextKey = isNaN(+nextSegment) ? nextSegment : +nextSegment
							return containsKey(chunk as CascadedKeys, nextKey)
						})

						details.summary
							.style('data-overlay-json-container-entry-summary')
							.append(Component()
								.style('data-overlay-json-container-key')
								.style.bind(highlighted, 'data-overlay-json-container-key--highlighted')
								.append(
									JSONPunctuation('['),
									JSONValue(start),
									JSONPunctuation('..'),
									JSONValue(end),
									JSONPunctuation(']'),
								)
							)

						const expandable = Component()
							.style('data-overlay-json-container-expandable')
							.appendTo(details.content)

						const openedOnce = State(false)
						State.Every(details, details.open, openedOnce.falsy).use(details, open => {
							if (!open)
								return

							openedOnce.value = true
							for (const item of chunk)
								init(item).appendTo(expandable)
						})

						highlighted.use(details, highlighted => {
							if (!highlighted)
								return

							details.open.value = highlighted
						})
					})
			}

			type CascadedKeys = (string | number)[] | CascadedKeys[]
			function getEnds (arr: CascadedKeys) {
				return [getStart(arr), getEnd(arr)]

				function getStart (arr: CascadedKeys): string | number {
					if (typeof arr[0] !== 'object')
						return arr[0] ?? '???'

					return getStart(arr[0])
				}

				function getEnd (arr: CascadedKeys): string | number {
					const last = arr.at(-1)
					if (typeof last !== 'object')
						return last ?? '???'

					return getEnd(last)
				}
			}

			function containsKey (arr: CascadedKeys, key: string | number): boolean {
				if (typeof arr[0] !== 'object')
					return (arr as (string | number)[]).includes(key)

				return arr.some(subArr => containsKey(subArr as CascadedKeys, key))
			}
		}

		//#endregion
		////////////////////////////////////

		////////////////////////////////////
		//#region Literals

		const JSONString = Component((component, string: string) => component.and(JSONComponent)
			.style('data-overlay-json', 'data-overlay-json-string')
			.append(JSONPunctuation('"'))
			.append(string && JSONCopyPaste(string).style('data-overlay-json-string-value'))
			.append(JSONPunctuation('"'))
		)

		const JSONNumber = Component((component, number: number, path?: (string | number)[]) => component.and(JSONComponent)
			.style('data-overlay-json', 'data-overlay-json-number')
			.append(JSONCopyPaste(number))
			.append(Slot().use(links, (slot, links) => {
				if (!links)
					return

				const pathString = path?.join('.') ?? ''

				const { link } = links.links?.find(({ pathRegex }) => pathRegex.test(pathString)) ?? {}
				if (!link)
					return

				const ref = Component()
					.style('data-overlay-json-reference')
					.appendTo(slot)

				if ('enum' in link) {
					const enumDef = links.enums?.[link.enum]

					////////////////////////////////////
					//#region Reference Enum

					const enumMember = enumDef?.members.find(e => e.value === number)
					if (enumDef && enumMember) ref
						.style('data-overlay-json-reference-enum')
						.append(JSONPunctuation('enum'))
						.text.append(' ')
						.append(Component()
							.style('data-overlay-json-reference-enum-name')
							.text.set(enumDef.name)
						)
						.append(JSONPunctuation('.'))
						.append(Component()
							.style('data-overlay-json-reference-enum-member')
							.text.set(enumMember.name)
						)

					//#endregion
					////////////////////////////////////

					else if (enumDef?.bitmask) {
						////////////////////////////////////
						//#region Reference Bitmask

						const enumMembers = number === 0
							? enumDef.members.filter(e => e.value === 0)
							: enumDef.members.filter(e => (e.value & number) === e.value && e.value !== 0)
						if (enumMembers.length > 0) ref
							.style('data-overlay-json-reference-enum')
							.append(JSONPunctuation('bitmask'))
							.text.append(' ')
							.append(Component()
								.style('data-overlay-json-reference-enum-name')
								.text.set(enumDef.name)
							)
							.text.append(' ')
							.append(JSONPunctuation('['))
							.text.append(' ')
							.append(...enumMembers.flatMap((e, i) => [
								i && JSONPunctuation(' | '),
								(Component()
									.style('data-overlay-json-reference-enum-member')
									.text.set(e.name)
								),
							]))
							.text.append(' ')
							.append(JSONPunctuation(']'))

						//#endregion
						////////////////////////////////////
					}
				}
				else {
					////////////////////////////////////
					//#region Reference Def

					const defs = links.definitions?.[link.component] as Partial<Record<number, object>> | undefined
					const linkedDef = defs?.[number]
					DataProvider.SINGLE.prep(link.component, number)
					if (linkedDef) ref
						.style('data-overlay-json-reference-definition')
						.append(Link(`/data/${link.component}/${number}`)
							.style('data-overlay-json-reference-definition-link')
							.append(Component()
								.style('data-overlay-json-reference-label')
								.text.set(DataHelper.getComponentName(link.component))
							)
							.text.append(' "')
							.append(Component()
								.style('data-overlay-json-reference-definition-link-title')
								.text.set(DataHelper.getTitle(link.component, linkedDef))
							)
							.text.append('"')
						)

					//#endregion
					////////////////////////////////////
				}

				if (ref.element.childNodes.length)
					slot.prepend(JSONPunctuation(' // '))
			}))
		)

		const JSONBool = Component((component, bool: boolean) => component.and(JSONComponent)
			.style('data-overlay-json', 'data-overlay-json-boolean')
			.text.set(bool ? 'true' : 'false')
		)

		const JSONNull = Component(component => component.and(JSONComponent)
			.style('data-overlay-json', 'data-overlay-json-null')
			.text.set('null')
		)

		//#endregion
		////////////////////////////////////

		////////////////////////////////////
		//#region Image

		const imageRegex = /^(?:\/|\.\/|https?:\/\/).*?\.(?:png|gif|jpg|jpeg)$/
		const JSONImage = Component((component, url: string) => component.and(JSONComponent)
			.style('data-overlay-json', 'data-overlay-json-image')
			.append(JSONString(url)
				.style('data-overlay-json-image-link')
			)
			.tweak(wrapper => {
				const preview = Component()
					.style('data-overlay-json-image-preview')
					.appendTo(wrapper)

				const actualURL = DataHelper.resolveImagePath(url)
				const image = Image(actualURL, DataHelper.FALLBACK_ICON)
					.style('data-overlay-json-image-preview-image')
				Component('a')
					.style('data-overlay-json-image-anchor')
					.attributes.set('href', actualURL)
					.attributes.set('target', '_blank')
					.append(image)
					.appendTo(preview)

				Component()
					.style('data-overlay-json-image-preview-metadata')
					.append(Component()
						.style('data-overlay-json-image-preview-metadata-number')
						.text.bind(image.dimensions.map(preview, dimensions => `${dimensions?.width}`))
					)
					.append(JSONPunctuation(' x '))
					.append(Component()
						.style('data-overlay-json-image-preview-metadata-number')
						.text.bind(image.dimensions.map(preview, dimensions => `${dimensions?.height}`))
					)
					.appendToWhen(image.dimensions.truthy, preview)
			})
		)

		//#endregion
		////////////////////////////////////

		const JSONValue = (value: unknown, path?: (string | number)[], hold?: State<boolean>) => {
			if (typeof value === 'string' && imageRegex.test(value))
				return JSONImage(value)

			if (typeof value === 'string')
				return JSONString(value)

			if (typeof value === 'number')
				return JSONNumber(value, path)

			if (typeof value === 'boolean')
				return JSONBool(value)

			if (Array.isArray(value))
				return JSONArray(value, path, hold)

			if (value === null)
				return JSONNull()

			return JSONObject(value as object, path, hold)
		}

		//#endregion
		////////////////////////////////////

		return JSONValue(value)
	})

	const dataTabs = Tabinator()
		.tweak(tabinator => tabinator.header.style('data-overlay-tabinator-header'))
		.appendTo(component)

	const jsonLink = params.map(component, (params): RoutePath => `/data/${params?.table ?? ''}/${params?.hash ?? ''}`)
	const jsonTab = dataTabs.Tab(jsonLink)
		.bindEnabled(params.truthy)
		.text.set(quilt => quilt['view/data/overlay/tab/main']())

	params.use(component, params => {
		if (!params)
			jsonTab.select()
	})

	Loading()
		.showForever()
		.appendToWhen(params.map(component, p => !p?.definition), jsonTab.content)

	Slot()
		.use(params, (slot, params) => {
			if (!params)
				return

			const defsTabs = Tabinator()
				.tweak(tabinator => tabinator.header.style('data-overlay-augmentations-tabinator-header'))
				.hideWhenSingleTab()
				.setDisplayMode('vertical')
				.appendTo(slot)

			const mainTab = defsTabs.Tab(jsonLink)
				.text.set(DataHelper.getComponentName(params.table))
			JSONRender(params.definition, links).appendTo(mainTab.content)

			for (const [augTable, augDef] of Object.entries(params.links?.augmentations ?? {}) as [AllComponentNames, object][]) {
				const augTab = defsTabs.Tab(`/data/${params.table}/${params.hash}/${augTable}`)
					.text.set(DataHelper.getComponentName(augTable))

				const augLinks = DataProvider.SINGLE.get(augTable, params.hash).map(augTab, data => resolveLinks(data?.links))
				JSONRender(augDef, augLinks).appendTo(augTab.content)
			}
		})
		.appendTo(jsonTab.content)

	////////////////////////////////////
	//#region References

	const referencesCount = State<number | undefined>(undefined)

	const refLink = params.map(component, (params): RoutePath => `/data/${params?.table ?? ''}/${params?.hash ?? ''}/references`)
	const referencesTab = dataTabs.Tab(refLink)
		.bindEnabled(params.truthy)
		.text.bind(referencesCount.map(component, count => quilt => quilt['view/data/overlay/tab/references'](count, count === undefined)))

	Slot().appendTo(referencesTab.content).use(dedupedParams, (slot, params) => {
		if (!params)
			return

		referencesCount.value = undefined

		const pageSize = 50
		const referencePageProvider = DataProvider.createReferencesPaged(params.table, params.hash)
		Paginator()
			.config({
				async get (page) {
					const state = referencePageProvider.get(pageSize, page)
					await state.promise
					return state.value
				},
				init (paginator, slot, page, data) {
					if (!data)
						return

					referencesCount.value = data.totalReferences
					for (let i = -5; i <= 5; i++)
						if (page + i >= 0 && page + i < data.totalPages)
							referencePageProvider.prep(pageSize, page + i)

					paginator.setTotalPages(!data.totalPages ? 0 : Math.max(paginator.getTotalPages(), data.totalPages))
					const list = Component()
						.style('data-view-definition-list')
						.appendTo(slot)

					for (const [component, defs] of Object.entries(data.references)) {
						for (const definition of Object.values(defs)) {
							DataProvider.SINGLE.prep(component as AllComponentNames, definition.hash)
							DataDefinitionButton()
								.tweak(button => button.data.value = { component: component as AllComponentNames, definition })
								.appendTo(list)
						}
					}
				},
			})
			.appendTo(slot)
	})

	//#endregion
	////////////////////////////////////

	InputBus.event.until(component, event => event.subscribe('Down', (_, event) => {
		if (event.use('Escape')) {
			void navigate.toURL('/data')
		}
	}))

	return component
})
