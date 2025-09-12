import type { DeepsightEmblemDefinition } from '@deepsight.gg/Interfaces'
import type { DestinyInventoryItemDefinition } from 'bungie-api-ts/destiny2'
import { DestinyItemType } from 'bungie-api-ts/destiny2'
import fs from 'fs-extra'
import { Task } from 'task'
import Log from '../utility/Log'
import manifest from './utility/endpoint/DestinyManifest'
import ImageManager from './utility/ImageManager'

export default Task('DeepsightEmblemDefinition', async () => {
	const { DestinyInventoryItemDefinition } = manifest
	const invItems = Object.entries(await DestinyInventoryItemDefinition.all())

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const DeepsightEmblemDefinition: Record<number, DeepsightEmblemDefinition>
		= await fs.readJson('static/manifest/DeepsightEmblemDefinition.json').catch(() => ({}))

	let i = 0
	let logI = 0
	function logCurrent (item: DestinyInventoryItemDefinition) {
		i++
		if (logI++ % 20)
			return

		const count = 20
		const fraction = Math.floor((i / promises.length) * count)
		Log.info('Getting median emblem colour', `[${'#'.repeat(fraction)}${' '.repeat(count - fraction)}]`, item.displayProperties.name)
	}

	const promises: Promise<void>[] = []
	for (let i = 0; i < invItems.length; i++) {
		const [itemHash, item] = invItems[i]
		if (item.itemType !== DestinyItemType.Emblem || (!item.displayProperties.name && +itemHash !== 4133455811))
			continue

		const emblemIconURL = item.displayProperties.icon
		if (!emblemIconURL)
			continue

		if (DeepsightEmblemDefinition[+itemHash]) // already calculated
			continue

		promises.push((async () => {
			let red = -1, green = -1, blue = -1
			const url = `https://www.bungie.net${emblemIconURL}`
			const sharp = await ImageManager.get(url)

			logCurrent(item);

			[red, green, blue] = await ImageManager.getMedianColour(sharp)
				.catch(() => [-1, -1, -1])

			if (red < 0 || green < 0 || blue < 0)
				return

			DeepsightEmblemDefinition[+itemHash] = {
				hash: +itemHash,
				displayProperties: item.displayProperties,
				collectibleHash: item.collectibleHash,
				secondaryIcon: item.secondaryIcon,
				secondaryOverlay: item.secondaryOverlay,
				secondarySpecial: item.secondarySpecial,
				backgroundColor: { red, green, blue, alpha: 255 },
			}
		})())
	}

	await Promise.all(promises)

	await fs.mkdirp('docs/manifest')
	await fs.writeJson('static/manifest/DeepsightEmblemDefinition.json', DeepsightEmblemDefinition, { spaces: '\t' })
	await fs.copyFile('static/manifest/DeepsightEmblemDefinition.json', 'docs/manifest/DeepsightEmblemDefinition.json')
})
