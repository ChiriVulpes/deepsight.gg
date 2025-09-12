import type { DestinyIconDefinition, DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2'
import fs from 'fs-extra'
import type { Metadata, Sharp } from 'sharp'
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

	let logI = 0
	function logCurrent (i: number, stage: string, item: DestinyInventoryItemDefinition) {
		if (logI++ % 20)
			return

		const count = 20
		const fraction = Math.floor((i / queued.length) * count)
		Log.info(`${stage} icon`, `[${'#'.repeat(fraction)}${' '.repeat(count - fraction)}]`, item.displayProperties.name)
	}

	interface ImageLoadQueueItem {
		(): Promise<Sharp>
		processing?: true
	}
	const imageLoadingQueue: ImageLoadQueueItem[] = []
	function queueGet (url: string) {
		let sharp: Sharp | undefined
		const queueItem: ImageLoadQueueItem = async () => {
			if (sharp)
				return sharp

			while (imageLoadingQueue.filter(i => i.processing).length > 20)
				await new Promise(r => setTimeout(r, 10))

			queueItem.processing = true
			sharp = await ImageManager.get(url)

			const index = imageLoadingQueue.indexOf(queueItem)
			if (index !== -1)
				imageLoadingQueue.splice(index, 1)

			return sharp
		}
		imageLoadingQueue.push(queueItem)
		return queueItem
	}

	interface QueuedIconExtraction {
		// itemHash: number
		def: DestinyInventoryItemDefinition
		iconHash: number
		iconDef: DestinyIconDefinition
		modIcon: string
		getSharp (): Promise<Sharp>
	}
	const queued: QueuedIconExtraction[] = []
	for (let i = 0; i < invItems.length; i++) {
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

		iconURLsExtracted.add(iconHash)
		queued.push({
			// itemHash: +itemHash,
			def,
			iconHash,
			iconDef,
			modIcon,
			getSharp: queueGet(`https://www.bungie.net${modIcon}`),
		})
	}

	const promises: Promise<void>[] = []
	let i = 0
	for (const { def, iconHash, iconDef, modIcon, getSharp } of queued) {
		promises.push((async () => {
			const sharp = await getSharp()

			logCurrent(i++, 'Extracting', def)

			const emptySeasonal = 'task/manifest/icon/mod_empty_seasonal.png'
			const emptyVariants = [
				'task/manifest/icon/mod_empty.png',
				'task/manifest/icon/mod_empty_2.png',
				'task/manifest/icon/mod_empty_3.png',
				'task/manifest/icon/mod_empty_4.png',
				'task/manifest/icon/mod_empty_5.png',
				emptySeasonal,
			]

			let { variant, result } = false
				|| await resolveVariants(emptyVariants, async variant => await ImageManager.extractForeground(
					sharp,
					variant,
					validate,
				))
				// fallback for one mod that produces artifacting and i can't figure out why
				|| {
				variant: 'fallback',
				result: await ImageManager.extractForeground(
					sharp,
					'task/manifest/icon/mod_empty_3.png',
				),
			}

			if (!result) {
				console.warn('Failed to extract mod foreground', iconHash, `https://www.bungie.net${modIcon}`)
				return
			}

			const enhancedOverlay = 'task/manifest/icon/mod_enhanced_overlay.png'
			const fragileOverlays = [
				'task/manifest/icon/mod_fragile_overlay.png',
				'task/manifest/icon/mod_fragile_overlay_3.png',
				'task/manifest/icon/mod_fragile_overlay_2.png',
				'task/manifest/icon/mod_fragile_overlay_4.png',
			]
			const artifactsToStrip = [
				'task/manifest/icon/mod_empty_artifacts_1.png',
				'task/manifest/icon/mod_empty_artifacts_2.png',
				'task/manifest/icon/mod_empty_artifacts_3.png',
				'task/manifest/icon/mod_empty_artifacts_4.png',
			]

			const outputPath = `${iconDir}/${iconHash}.png`
			if (result) {
				const subtractionResult = await ImageManager.subtractOverlays([enhancedOverlay, ...fragileOverlays, ...artifactsToStrip], result)
				result = subtractionResult.result
				DeepsightIconDefinition[iconHash] = {
					hash: iconHash,
					foreground: `/image/generated/icon/${iconHash}.png`,
					background: `/image/png/mod/${variant === emptySeasonal ? 'mod_empty_seasonal' : 'mod_empty'}.png`,
					secondaryBackground: subtractionResult.subtracted.includes(enhancedOverlay) ? '/image/png/mod/mod_enhanced_overlay.png' : '',
					specialBackground: fragileOverlays.some(overlay => subtractionResult.subtracted.includes(overlay)) ? '/image/png/mod/mod_fragile_overlay.png' : '',
					highResForeground: '',
					index: iconDef?.index ?? 0,
					redacted: false,
					...{ blacklisted: false },
				}
			}

			await result.png().toFile(outputPath)
		})())
	}

	await Promise.all(promises)

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
			return {
				result,
				variant,
			}
	}
	return undefined
}
