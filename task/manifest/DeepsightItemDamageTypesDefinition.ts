import { DamageTypeHashes, InventoryItemHashes } from '@deepsight.gg/Enums'
import fs from 'fs-extra'
import { Task } from 'task'

export default Task('DeepsightItemDamageTypesDefinition', async () => {
	const DeepsightItemDamageTypesDefinition = {
		[InventoryItemHashes.HardLightAutoRifle]: { damageTypes: [DamageTypeHashes.Void, DamageTypeHashes.Arc, DamageTypeHashes.Solar] },
		[InventoryItemHashes.BorealisSniperRifle]: { damageTypes: [DamageTypeHashes.Void, DamageTypeHashes.Arc, DamageTypeHashes.Solar] },
		[InventoryItemHashes.ConditionalFinalityShotgun]: { damageTypes: [DamageTypeHashes.Stasis, DamageTypeHashes.Solar] },
		[InventoryItemHashes.GravitonSpikeHandCannon]: { damageTypes: [DamageTypeHashes.Arc, DamageTypeHashes.Stasis] },
		[InventoryItemHashes.DeadMessengerGrenadeLauncher_TooltipNotificationsLength3]: { damageTypes: [DamageTypeHashes.Void, DamageTypeHashes.Arc, DamageTypeHashes.Solar] },
		[InventoryItemHashes.TessellationFusionRifle]: { damageTypes: [DamageTypeHashes.Void, DamageTypeHashes.Arc, DamageTypeHashes.Solar, DamageTypeHashes.Stasis, DamageTypeHashes.Strand] },
		[InventoryItemHashes.TwoTailedFoxRocketLauncher]: { damageTypes: [DamageTypeHashes.Void, DamageTypeHashes.Solar, DamageTypeHashes.Arc] },
	}

	await fs.mkdirp('docs/manifest')

	const damageTypes = Object.fromEntries(Object.entries(DeepsightItemDamageTypesDefinition)
		.map(([hash, source]) => [parseInt(hash), {
			hash: parseInt(hash),
			...source,
		}]))
	await fs.writeJson('docs/manifest/DeepsightItemDamageTypesDefinition.json', damageTypes, { spaces: '\t' })
})
