import ArrayPrototypes from '@deepsight.gg/utility/prototype/ArrayPrototypes'
import { Task } from 'task'
import bump_versions from './bump_versions'
import copy_manifest from './copy_manifest'
import destiny_manifest from './destiny_manifest'
import generate_enums from './generate_enums'
import DeepsightAdeptDefinition from './manifest/DeepsightAdeptDefinition'
import DeepsightBreakerTypeDefinition from './manifest/DeepsightBreakerTypeDefinition'
import DeepsightCatalystDefinition from './manifest/DeepsightCatalystDefinition'
import DeepsightCollectionsDefinition from './manifest/DeepsightCollectionsDefinition'
import DeepsightDropTableDefinition from './manifest/DeepsightDropTableDefinition'
import DeepsightEmblemDefinition from './manifest/DeepsightEmblemDefinition'
import DeepsightItemDamageTypesDefinition from './manifest/DeepsightItemDamageTypesDefinition'
import DeepsightMomentDefinition from './manifest/DeepsightMomentDefinition'
import DeepsightPlugCategorisation from './manifest/DeepsightPlugCategorisation'
import DeepsightSocketCategorisation from './manifest/DeepsightSocketCategorisation'
import DeepsightSocketExtendedDefinition from './manifest/DeepsightSocketExtendedDefinition'
import DeepsightStats from './manifest/DeepsightStats'
import DeepsightTierTypeDefinition from './manifest/DeepsightTierTypeDefinition'
import DeepsightTypes from './manifest/DeepsightTypes'
import DeepsightWallpaperDefinition from './manifest/DeepsightWallpaperDefinition'
import refresh_token from './refresh_token'

ArrayPrototypes()

export default Task('deepsight_manifest', task => task.series(
	copy_manifest,
	destiny_manifest,
	generate_enums,
	refresh_token,
	task.parallel(
		DeepsightDropTableDefinition,
		DeepsightWallpaperDefinition,
		DeepsightTierTypeDefinition,
		// DeepsightVendorDefinition,
		DeepsightTypes,
		DeepsightStats,
		DeepsightEmblemDefinition,
		DeepsightSocketExtendedDefinition,
		DeepsightBreakerTypeDefinition,
		DeepsightItemDamageTypesDefinition,

		task.series(
			task.parallel(
				DeepsightMomentDefinition,
			),
			task.parallel(
				DeepsightPlugCategorisation,
				DeepsightSocketCategorisation,
			),
			task.parallel(
				DeepsightCollectionsDefinition,
				DeepsightAdeptDefinition,
				DeepsightCatalystDefinition,
			),
		),
	),
	bump_versions,
))
