import type { AllDestinyManifestComponents, DestinyDisplayPropertiesDefinition } from 'bungie-api-ts/destiny2'
import type { BungieIconPath, DeepsightDisplayPropertiesDefinition, DeepsightIconPath } from '../../static/manifest/Interfaces'
import Log from '../utility/Log'
import type { DestinyManifestComponentValue } from './utility/endpoint/DestinyManifest'
import manifest, { DESTINY_MANIFEST_MISSING_ICON_PATH } from './utility/endpoint/DestinyManifest'

const _ = undefined

interface HasDisplayPropertiesOrIconWatermark {
	displayProperties?: DestinyDisplayPropertiesDefinition
	iconWatermark?: string
	iconWatermarkShelved?: string
}

interface ManifestReferenceWhich {
	hash: number
	iconSequence: number
	frame: number
}

type DestinyManifestReference = { [KEY in keyof AllDestinyManifestComponents]?: number | ManifestReferenceWhich }
namespace DestinyManifestReference {
	export interface DisplayPropertiesDefinition {
		name?: string | DestinyManifestReference
		subtitle?: string | DestinyManifestReference
		description?: string | DestinyManifestReference
		icon?: string | DestinyManifestReference
	}

	export async function resolve (ref: string | DestinyManifestReference | undefined, type: 'name' | 'subtitle' | 'description' | 'icon' | 'iconWatermark' | 'iconWatermarkShelved', alternativeSources?: Record<string, HasDisplayPropertiesOrIconWatermark | undefined>) {
		if (typeof ref === 'string')
			return ref

		for (const [key, which] of Object.entries(ref ?? {})) {
			const hash = typeof which === 'number' ? which : which.hash
			const componentName = key as keyof AllDestinyManifestComponents
			const definition = await manifest[componentName].get(hash) as DestinyManifestComponentValue | undefined
			if (!definition)
				continue

			if (typeof which === 'object' && 'displayProperties' in definition) {
				const icon = definition.displayProperties.iconSequences[which.iconSequence]?.frames[which.frame]
				if (!icon) {
					Log.error(`Unable to resolve icon from manifest reference: ${definition.displayProperties.name} (${componentName}), icon sequence ${which.iconSequence}, frame ${which.frame}`)
					return undefined
				}

				return icon
			}

			const result = resolveSource(definition, type)
			if (result)
				return result
		}

		for (const [key, definition] of Object.entries(alternativeSources ?? {})) {
			if (!definition)
				continue

			const result = resolveSource(definition as DestinyManifestComponentValue, type)
			if (result)
				return result
		}

		return undefined
	}

	function resolveSource (definition: DestinyManifestComponentValue, type: 'name' | 'subtitle' | 'description' | 'icon' | 'iconWatermark' | 'iconWatermarkShelved') {
		if (!definition)
			return undefined

		if (type === 'iconWatermark') {
			if ('iconWatermark' in definition)
				return definition.iconWatermark || undefined
			return undefined
		}

		if (type === 'iconWatermarkShelved') {
			if ('iconWatermarkShelved' in definition)
				return definition.iconWatermarkShelved || undefined
			return undefined
		}

		const displayProperties = 'displayProperties' in definition ? definition.displayProperties : undefined
		if (!displayProperties)
			return undefined

		return displayProperties[type as keyof typeof displayProperties] as string || undefined
	}

	export async function resolveAll (displayProperties?: DestinyManifestReference.DisplayPropertiesDefinition, alternativeSources?: Record<string, HasDisplayPropertiesOrIconWatermark | undefined>) {
		const givenDisplayProperties = displayProperties
		displayProperties ??= {}
		if (givenDisplayProperties || alternativeSources) {
			displayProperties.name = await DestinyManifestReference.resolve(givenDisplayProperties?.name, 'name', alternativeSources)
			displayProperties.subtitle = _
				?? await DestinyManifestReference.resolve(givenDisplayProperties?.subtitle, 'subtitle', alternativeSources)
				?? await DestinyManifestReference.resolve(givenDisplayProperties?.subtitle, 'name', alternativeSources)
			displayProperties.description = await DestinyManifestReference.resolve(givenDisplayProperties?.description, 'description', alternativeSources)
			const icon = await DestinyManifestReference.resolve(givenDisplayProperties?.icon, 'icon', alternativeSources)
			if (icon !== DESTINY_MANIFEST_MISSING_ICON_PATH)
				displayProperties.icon = icon as DeepsightIconPath | BungieIconPath
		}

		displayProperties.name ??= ''
		displayProperties.description ??= ''

		return displayProperties as DeepsightDisplayPropertiesDefinition
	}

	export async function displayOf (type: keyof AllDestinyManifestComponents, which: number) {
		return (await manifest[type].get(which) as HasDisplayPropertiesOrIconWatermark)?.displayProperties
	}
}

export default DestinyManifestReference
