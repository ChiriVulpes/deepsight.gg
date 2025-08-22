import type { DestinyIconDefinition, DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2'
import fs from 'fs-extra'
import type { Metadata } from 'sharp'
import { Log, Task } from 'task'
import { DeepsightPlugCategory } from './IDeepsightPlugCategorisation'
import DeepsightPlugCategorisationSource from './plugtype/DeepsightPlugCategorisation'
import ImageManager from './utility/ImageManager'
import DestinyManifest from './utility/endpoint/DestinyManifest'

const iconDir = 'docs/image/generated/icon'
export default Task('DeepsightIconDefinition', async task => {
	await fs.mkdirp(iconDir)

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const DeepsightIconDefinition: Record<number, DestinyIconDefinition>
		= await fs.readJson('static/manifest/DeepsightIconDefinition.json').catch(() => ({}))

	const [DestinyInventoryItemDefinition, DestinyIconDefinition, DeepsightPlugCategorisation] = await Promise.all([
		DestinyManifest.DestinyInventoryItemDefinition.all(),
		DestinyManifest.DestinyIconDefinition.all(),
		DeepsightPlugCategorisationSource.resolve(),
	])

	const invItems = Object.entries(DestinyInventoryItemDefinition)

	const iconURLsExtracted = new Set<number>()

	let i = 0
	let logI = 0
	function logCurrent (item: DestinyInventoryItemDefinition) {
		if (!(logI++ % 20))
			return

		const count = 20
		const fraction = Math.floor((i / invItems.length) * count)
		Log.info('Extacting icon', `[${'#'.repeat(fraction)}${' '.repeat(count - fraction)}]`, item.displayProperties.name)
	}

	for (; i < invItems.length; i++) {
		const [itemHash, def] = invItems[i]
		const cat = DeepsightPlugCategorisation[+itemHash]
		if (cat?.category !== DeepsightPlugCategory.Mod)
			continue

		const skippedStates = ['Empty', 'Deprecated', 'Fallback', 'Default', 'Locked', 'Action', 'Exotic']
		if (skippedStates.some(state => cat.fullName.includes(state)))
			continue

		const iconHash = def.displayProperties.iconHash || +itemHash
		const iconDef = DestinyIconDefinition[iconHash]
		const modIcon = iconDef?.foreground ?? def.displayProperties.icon
		if (!modIcon || iconURLsExtracted.has(iconHash))
			continue

		if (!modIcon.endsWith('.png')) {
			console.warn('Can\'t extract foreground layer for non-png mod icon', itemHash, `https://www.bungie.net${modIcon}`)
			continue
		}

		if (DeepsightIconDefinition[iconHash]) // already extracted
			continue

		logCurrent(def)

		const emptyVariants = [
			'task/manifest/icon/mod_empty.png',
			'task/manifest/icon/mod_empty_2.png',
			'task/manifest/icon/mod_empty_3.png',
			'task/manifest/icon/mod_empty_4.png',
			'task/manifest/icon/mod_empty_5.png',
		]

		let result = false
			|| await resolveVariants(emptyVariants, async variant => await ImageManager.extractForeground(
				`https://www.bungie.net${modIcon}`,
				variant,
				validate,
			))
			// fallback for one mod that produces artifacting and i can't figure out why
			|| await ImageManager.extractForeground(
				`https://www.bungie.net${modIcon}`,
				'task/manifest/icon/mod_empty_3.png',
			)

		if (!result) {
			console.warn('Failed to extract mod foreground', itemHash, `https://www.bungie.net${modIcon}`)
			continue
		}

		const enhancedOverlay = 'task/manifest/icon/mod_enhanced_overlay.png'
		const fragileOverlay = 'task/manifest/icon/mod_fragile_overlay.png'
		const artifactsToStrip = [
			'task/manifest/icon/mod_empty_artifacts_1.png',
			'task/manifest/icon/mod_empty_artifacts_2.png',
		]
		const outputPath = `${iconDir}/${itemHash}.png`
		if (result) {
			const subtractionResult = await ImageManager.subtractOverlays([enhancedOverlay, fragileOverlay, ...artifactsToStrip], result)
			result = subtractionResult.result
			DeepsightIconDefinition[iconHash] = {
				hash: iconHash,
				foreground: `/image/generated/icon/${itemHash}.png`,
				background: '/image/png/mod/mod_empty.png',
				secondaryBackground: subtractionResult.subtracted.includes(enhancedOverlay) ? '/image/png/mod/mod_enhanced_overlay.png' : '',
				specialBackground: subtractionResult.subtracted.includes(fragileOverlay) ? '/image/png/mod/mod_fragile_overlay.png' : '',
				highResForeground: '',
				index: iconDef?.index ?? 0,
				redacted: false,
				...{ blacklisted: false },
			}
		}

		await result.png().toFile(outputPath)
		iconURLsExtracted.add(iconHash)
	}

	await fs.mkdirp('docs/manifest')
	await fs.writeJson('static/manifest/DeepsightIconDefinition.json', DeepsightIconDefinition, { spaces: '\t' })
	await fs.copyFile('static/manifest/DeepsightIconDefinition.json', 'docs/manifest/DeepsightIconDefinition.json')
})

const ensureTransparentCoords = [
	[0, 0],
	[9, 9],
	[9, 89],
]
function validate (buffer: Buffer, metadata: Metadata) {
	for (const [x, y] of ensureTransparentCoords) {
		const channels = 4

		const i = (y * metadata.width + x) * channels
		if (buffer[i + 3] >= 5)
			return false
	}

	return true
}

async function resolveVariants<T> (variants: string[], action: (variant: string) => Promise<T>) {
	for (const variant of variants) {
		const result = await action(variant)
		if (result)
			return result
	}
	return undefined
}
