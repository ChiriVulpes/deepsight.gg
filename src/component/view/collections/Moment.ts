import { DestinyClass } from 'bungie-api-ts/destiny2'
import Details from 'component/core/Details'
import Lore from 'component/core/Lore'
import Item from 'component/Item'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { CollectionsMoment } from 'conduit.deepsight.gg/Collections'
import { InventoryBucketHashes } from 'deepsight.gg/Enums'
import { Component } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'

interface MomentBucketExtensions {
	readonly title: Component
	readonly titleText: TextManipulator<this>
	readonly content: Component
}

interface MomentBucket extends Component, MomentBucketExtensions { }

const MomentBucket = Component((component): MomentBucket => {
	component.style('collections-view-moment-bucket')

	const title = Component()
		.style('collections-view-moment-bucket-title')
		.appendTo(component)

	const content = Component()
		.style('collections-view-moment-bucket-content')
		.appendTo(component)

	return component.extend<MomentBucketExtensions>(bucket => ({
		title,
		titleText: undefined!,
		content,
	}))
		.extendJIT('titleText', bucket => bucket.title.text.rehost(bucket))
})

export default Component((component, { moment, buckets }: CollectionsMoment, collections: Collections) => {
	return component.and(Details)
		.tweak(details => details
			.style('collections-view-moment')
			.style.bind(details.open, 'details--open', 'collections-view-moment--open')
			.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment--hover')
			.viewTransitionSwipe(`collections-view-moment-${moment.id}`)
		)
		.tweak(details => details.summary
			.style('collections-view-moment-summary')
			.style.bind(details.open, 'collections-view-moment-summary--open')
			.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment-summary--hover')
			.append(moment.iconWatermark && Component()
				.style('collections-view-moment-icon')
				.style.setVariable('moment-watermark-icon', `url(https://www.bungie.net${moment.iconWatermark})`)
			)
			.append(Component()
				.text.set(moment.displayProperties.name)
			)
		)
		.tweak(details => {
			details.content.style('collections-view-moment-content')

			void details.open.await(details, true).then(() => {
				Lore()
					.style('collections-view-moment-lore')
					.text.set(moment.displayProperties.description)
					.appendTo(details.content)

				const bucketsWrapper = Component()
					.style('collections-view-moment-buckets')
					.appendTo(details.content)

				const weapons = ([InventoryBucketHashes.KineticWeapons, InventoryBucketHashes.EnergyWeapons, InventoryBucketHashes.PowerWeapons] as const)
					.flatMap(hash => buckets[hash].items)
					.map(item => Item(item, collections))

				const armour = ([InventoryBucketHashes.Helmet, InventoryBucketHashes.Gauntlets, InventoryBucketHashes.ChestArmor, InventoryBucketHashes.LegArmor, InventoryBucketHashes.ClassArmor] as const)
					.flatMap(hash => buckets[hash].items)
					.map(item => Item(item, collections))

				const warlockArmour = armour.filter(item => item.item.value.class === DestinyClass.Warlock)
				const titanArmour = armour.filter(item => item.item.value.class === DestinyClass.Titan)
				const hunterArmour = armour.filter(item => item.item.value.class === DestinyClass.Hunter)

				if (weapons.length)
					MomentBucket()
						.titleText.set(quilt => quilt['view/collections/bucket/weapons/title']())
						.tweak(bucket => bucket.content.append(...weapons))
						.appendTo(bucketsWrapper)

				if (titanArmour.length)
					MomentBucket()
						.titleText.set(quilt => quilt['view/collections/bucket/armour/titan/title']())
						.tweak(bucket => bucket.content.append(...titanArmour))
						.appendTo(bucketsWrapper)

				if (hunterArmour.length)
					MomentBucket()
						.titleText.set(quilt => quilt['view/collections/bucket/armour/hunter/title']())
						.tweak(bucket => bucket.content.append(...hunterArmour))
						.appendTo(bucketsWrapper)

				if (warlockArmour.length)
					MomentBucket()
						.titleText.set(quilt => quilt['view/collections/bucket/armour/warlock/title']())
						.tweak(bucket => bucket.content.append(...warlockArmour))
						.appendTo(bucketsWrapper)
			})
		})
})
