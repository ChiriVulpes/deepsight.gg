import type { ClarityComponentMain, ClarityDefinition, ClarityDescription, ClarityLabelledLineComponent, ClarityNumericComponent, ClarityStackSeparatorComponent, ClarityTableComponent, ClarityTextComponent } from '@deepsight.gg/Interfaces'
import fs from 'fs-extra'
import { Task } from 'task'
import type { ClarityDescriptionComponent, ClarityDescriptionTableRow, ClarityDescriptionTextComponent } from './utility/endpoint/ClarityDescriptions'
import ClarityDescriptions from './utility/endpoint/ClarityDescriptions'

const Strings = {
	trimTextMatchingFromStart: (text: string, ...matches: string[]) => {
		for (const match of matches)
			if (text.startsWith(match))
				text = text.slice(match.length)
		return text
	},
	includesOnce: (text: string, searchString: string) => {
		const index = text.indexOf(searchString)
		return index !== -1 && text.indexOf(searchString, index + 1) === -1
	},
	extractFromSquareBrackets: (text: string) => {
		const match = text.match(/\[(.*?)\]/)
		return match ? match[1] : text
	},
}

const numericSplitNumericStart = /(?:(?<![\w\d.!+%-])|(?<=\d(?:st|nd|rd|th)-))(?=[x+-]?[.\d])/
const numericSplitUnknownStart = /(?<![\w\d.!+%-])(?=\?)/
const numericSplitNumericEnd = /(?<=[\d?][%x°+]?\??)(?![\dx?%°+.])/
const numericSplitRegex = new RegExp([numericSplitNumericStart.source, numericSplitUnknownStart.source, numericSplitNumericEnd.source].join('|'), 'g')
const stackSizeSplitRegex = /(?=\|)|(?<=\|)/g
const unknownValueBracketsRegex = /\(\?\)|\[\?\]/g
const nonNumericNumberRegex = /^\?$|x[\d?]|[\d?](?:th|[%°-])/

function extractText (content: ClarityDescriptionComponent | string | ClarityDescriptionComponent[]): string {
	content = typeof content === 'string' ? [{ text: content }] : Array.isArray(content) ? content : [content]
	let result = ''
	for (const component of content) {
		result += component.text ?? ''
		if (component.linesContent?.length)
			result += extractText(component.linesContent)
		if (component.table?.length)
			result += component.table.map(row => row.rowContent.map(cell => extractText(cell.cellContent)).join(' ')).join('\n')
	}
	return result
}

function trimTextMatchingFromStart (content: ClarityDescriptionComponent, ...matching: string[]): ClarityDescriptionComponent
function trimTextMatchingFromStart (content: string, ...matching: string[]): string
function trimTextMatchingFromStart (content: undefined, ...matching: string[]): undefined
function trimTextMatchingFromStart (content: ClarityDescriptionComponent[], ...matching: string[]): ClarityDescriptionComponent[]
function trimTextMatchingFromStart (content: ClarityDescriptionComponent | string | ClarityDescriptionComponent[] | undefined, ...matching: string[]): ClarityDescriptionComponent | string | ClarityDescriptionComponent[] | undefined {
	if (!content)
		return undefined

	if (typeof content === 'string')
		return Strings.trimTextMatchingFromStart(content, ...matching)

	if (Array.isArray(content)) {
		if (!content.length) return content
		content = [...content]
		content[0] = trimTextMatchingFromStart(content[0], ...matching)
		return content
	}

	const newContent = { ...content }
	if (newContent.text)
		newContent.text = trimTextMatchingFromStart(newContent.text, ...matching)

	if (newContent.linesContent)
		newContent.linesContent = trimTextMatchingFromStart(newContent.linesContent, ...matching)

	return newContent
}

export default Task('DeepsightFormattedClarityDescriptions', async task => {
	const descriptions = await ClarityDescriptions.get()

	type ClarityDescriptionComponentWithTitle = ClarityDescriptionComponent & { title: string | ClarityDescriptionComponent[] }
	function extractDefinitions (content?: string | ClarityDescriptionComponent | ClarityDescriptionComponent[]): ClarityDescriptionComponentWithTitle[] {
		if (!content || typeof content === 'string')
			return []

		if (Array.isArray(content))
			return content.flatMap(component => extractDefinitions(component))

		const results: ClarityDescriptionComponentWithTitle[] = []
		if (content.title && content.text)
			results.push(content as ClarityDescriptionComponentWithTitle)

		if (content.linesContent)
			results.push(...extractDefinitions(content.linesContent))

		if (content.table)
			results.push(...content.table.flatMap(row => row.rowContent.flatMap(cell => extractDefinitions(cell.cellContent))))

		return results
	}

	function parseClarityText (text: string, isPVEVP: boolean): (ClarityTextComponent | ClarityStackSeparatorComponent | ClarityNumericComponent)[] {
		text = Strings.trimTextMatchingFromStart(text, '• ')
		if (isPVEVP)
			text = Strings.extractFromSquareBrackets(text)

		text = text.replace(unknownValueBracketsRegex, '?')

		const components: (ClarityTextComponent | ClarityStackSeparatorComponent | ClarityNumericComponent)[] = []
		const sections = text.split(numericSplitRegex)
		for (const section of sections) {
			if (!section)
				continue

			const parsedFloat = !isNaN(parseFloat(Strings.trimTextMatchingFromStart(section, 'x')))
			const nonNumericNumber = nonNumericNumberRegex.test(section)
			if (parsedFloat || nonNumericNumber) {
				const isEstimate = !nonNumericNumber && section.endsWith('?')
				components.push({
					type: 'numeric',
					text: isEstimate ? section.slice(0, -1) : section,
					isUnknown: nonNumericNumber,
					isEstimate,
				})
				continue
			}

			const stackSections = section.split(stackSizeSplitRegex)
			for (const stackSection of stackSections) {
				if (stackSection.trim() === '|')
					components.push({ type: 'stackSeparator' })
				else if (stackSection)
					components.push({ type: 'text', text: stackSection })
			}
		}
		return components
	}

	function parseClarityDescription (content: string | ClarityDescriptionComponent[], definitionMap: Map<ClarityDescriptionComponentWithTitle, number>, parentClassNames: string[] = []): ClarityComponentMain[] {
		if (typeof content === 'string')
			content = [{ text: content }]

		const result: ClarityComponentMain[] = []
		for (let i = 0; i < content.length; i++) {
			let component = content[i]
			const singleChild = component.linesContent?.length === 1 ? component.linesContent?.[0] : undefined
			if (component.formula || singleChild?.formula)
				continue

			const isLast = i >= content.length - 1 || content.slice(i + 1).every(c => c.classNames?.includes('spacer') || c.formula || (c.linesContent?.length === 1 && c.linesContent[0].formula))
			const isLine = !!component.linesContent?.length
			const isLabel = isLine && extractText(component.linesContent![component.linesContent!.length - 1]).trimEnd().endsWith(':')
			const isListItem = isLine && extractText(component.linesContent![0]).trimStart().startsWith('• ')
			const isLabelledLine = isLine && Strings.includesOnce(extractText(component), ': ')
			const isEnhancedEffect = isLine && isLast && extractText(component.linesContent![0]).trimStart().startsWith('🡅')
			const isEnhancedArrow = component.classNames?.includes('enhancedArrow') ?? false
			const isSpacer = component.classNames?.includes('spacer') ?? false
			const isPVE = !parentClassNames.includes('pve') && (component.classNames?.includes('pve') || singleChild?.classNames?.includes('pve') || false)
			const isPVP = !parentClassNames.includes('pvp') && (component.classNames?.includes('pvp') || singleChild?.classNames?.includes('pvp') || false)
			const isIcon = component.classNames?.length && !component.text && !component.linesContent?.length && !component.table?.length && !isEnhancedArrow && !isSpacer

			if (isPVE || isPVP)
				component = trimTextMatchingFromStart(component, '[PVE] ', '[PVP] ', '[PVE]', '[PVP]', '[PvE] ', '[PvP] ', '[PvE]', '[PvP]')

			let parsedComponent: ClarityComponentMain | undefined

			if (isSpacer)
				parsedComponent = { type: 'spacer', classNames: component.classNames }
			else if (isEnhancedArrow)
				parsedComponent = { type: 'enhancedArrow', classNames: component.classNames }
			else if (isIcon)
				parsedComponent = { type: 'icon', classNames: component.classNames }
			else if (component.table?.length)
				parsedComponent = parseClarityTable(component.table, definitionMap)
			else if (isLabelledLine)
				parsedComponent = parseClarityLabelledLine(component.linesContent!, definitionMap)
			else if (isLine) {
				const lineContent = parseClarityDescription(component.linesContent!, definitionMap, [...parentClassNames, ...isListItem ? ['list-item'] : []])
				parsedComponent = {
					type: 'line',
					isListItem: isListItem ? true : undefined,
					isEnhanced: isEnhancedEffect ? true : undefined,
					isLabel: isLabel ? true : undefined,
					content: lineContent,
					classNames: component.classNames,
				}
			}
			else if (component.text) {
				result.push(...parseClarityText(component.text, isPVE || isPVP))
			}

			if (component.title) {
				const def = component as ClarityDescriptionComponentWithTitle
				const index = definitionMap.get(def)
				if (index !== undefined) {
					result.push({ type: 'definitionReference', index })
				}
			}

			if (parsedComponent) {
				if (isPVE || isPVP) {
					result.push({
						type: isPVE ? 'pve' : 'pvp',
						content: [parsedComponent],
						classNames: component.classNames,
					})
				}
				else {
					result.push(parsedComponent)
				}
			}
		}
		return result
	}

	function parseClarityTable (rows: ClarityDescriptionTableRow[], definitionMap: Map<ClarityDescriptionComponentWithTitle, number>): ClarityTableComponent {
		let processedRows = rows.map(row => ({ ...row, rowContent: [...row.rowContent] }))
		for (let c = 0; c < (processedRows[0]?.rowContent.length ?? 0); c++) {
			const shouldDeleteColumn = processedRows.every((row, i) => {
				const columnText = extractText(row.rowContent[c].cellContent).trim()
				return !columnText || columnText === '-' || (!i && !parseFloat(columnText))
			})
			if (shouldDeleteColumn) {
				processedRows = processedRows.map(row => ({ ...row, rowContent: row.rowContent.filter((_, i) => i !== c) }))
				c--
			}
		}

		const isFirstColumnAllLabels = processedRows.every(row => {
			if (!row.rowContent.length) return true
			const columnText = extractText(row.rowContent[0].cellContent).trim()
			return !columnText || (!parseFloat(columnText) && !nonNumericNumberRegex.test(columnText))
		})

		return {
			type: 'table',
			isFirstColumnAllLabels: isFirstColumnAllLabels ? true : undefined,
			rows: processedRows.map(row => ({
				type: 'tableRow',
				classNames: row.classNames,
				cells: row.rowContent.map(cell => {
					const cellContent = extractText(cell.cellContent).trim()
					const isNumeric = !isNaN(parseFloat(cellContent)) || nonNumericNumberRegex.test(cellContent.replace(unknownValueBracketsRegex, '?'))
					return {
						type: 'tableCell',
						classNames: cell.classNames,
						isNumeric: isNumeric ? true : undefined,
						content: parseClarityDescription(cellContent === '-' ? [] : cell.cellContent, definitionMap),
					}
				}),
			})),
		}
	}

	function parseClarityLabelledLine (content: ClarityDescriptionComponent[], definitionMap: Map<ClarityDescriptionComponentWithTitle, number>): ClarityLabelledLineComponent {
		const label: ClarityDescriptionComponent[] = []
		const value: ClarityDescriptionComponent[] = []
		let split = false
		for (const component of content) {
			const sections = component.text?.split(': ')
			if (!split && sections?.length === 2) {
				split = true
				label.push({ ...component, text: sections[0] } as ClarityDescriptionTextComponent)
				value.push({ ...component, text: sections[1] } as ClarityDescriptionTextComponent)
			}
			else {
				(split ? value : label).push(component)
			}
		}
		label.push({ text: ': ' })
		return {
			type: 'labelledLine',
			label: parseClarityDescription(label, definitionMap),
			value: parseClarityDescription(value, definitionMap),
		}
	}

	const DeepsightFormattedClarityDescriptions: Record<number, ClarityDescription> = {}

	for (const [hash, description] of Object.entries(descriptions)) {
		const rawDescription = description.descriptions?.en
		if (!rawDescription || (Array.isArray(rawDescription) && !rawDescription.length))
			continue

		const rawDefinitions = extractDefinitions(rawDescription)
		const definitionMap = new Map(rawDefinitions.map((def, i) => [def, i + 1]))

		const definitions: ClarityDefinition[] = rawDefinitions.map(def => ({
			name: extractText(def.text ?? ''),
			description: parseClarityDescription(def.title, definitionMap),
			classNames: def.classNames,
		}))

		DeepsightFormattedClarityDescriptions[hash as any as number] = {
			...description,
			descriptions: parseClarityDescription(rawDescription, definitionMap),
			definitions,
		}
	}

	await fs.mkdirp('docs/manifest')
	await fs.writeJson('docs/manifest/DeepsightFormattedClarityDescriptions.json', DeepsightFormattedClarityDescriptions, { spaces: '\t' })
})
