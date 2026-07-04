import { Sort } from 'component/display/sort/SortDefinition'
import { InventoryBucketHashes } from 'deepsight.gg/Enums'

const logicalOrder = [
	InventoryBucketHashes.KineticWeapons,
	InventoryBucketHashes.EnergyWeapons,
	InventoryBucketHashes.PowerWeapons,
	InventoryBucketHashes.Helmet,
	InventoryBucketHashes.Gauntlets,
	InventoryBucketHashes.ChestArmor,
	InventoryBucketHashes.LegArmor,
	InventoryBucketHashes.ClassArmor,
	InventoryBucketHashes.Artifacts,
	InventoryBucketHashes.Ghost,
	InventoryBucketHashes.Vehicle,
	InventoryBucketHashes.Ships,
	InventoryBucketHashes.Consumables,
	InventoryBucketHashes.Modifications,
]

export default Sort.Definition({
	id: 'bucket',
	label: quilt => quilt['display-bar/sort/bucket/title'](),
	shortLabel: quilt => quilt['display-bar/sort/bucket/short'](),
	compare: (a, b) => logicalOrder.indexOf(a.definition?.bucketHash!) - logicalOrder.indexOf(b.definition?.bucketHash!),
})
