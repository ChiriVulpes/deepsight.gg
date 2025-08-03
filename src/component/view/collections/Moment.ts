import { DestinyClass } from 'bungie-api-ts/destiny2'
import Details from 'component/core/Details'
import Lore from 'component/core/Lore'
import type { DisplayHandlers } from 'component/DisplayBar'
import Item from 'component/Item'
import type Collections from 'conduit.deepsight.gg/Collections'
import type { Item as CollectionsItem, CollectionsMoment } from 'conduit.deepsight.gg/Collections'
import { InventoryBucketHashes } from 'deepsight.gg/Enums'
import { Component, State } from 'kitsui'
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

export default Component((component, { moment, buckets }: CollectionsMoment, collections: Collections, display: State.Or<DisplayHandlers | undefined>) => {
	display = State.get(display)
	const filterText = display.map(component, display => display?.filter.filterText)
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
				.style.bind(details.open, 'collections-view-moment-icon--open')
				.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment-icon--hover')
				.style.setVariable('moment-watermark-icon', `url(https://www.bungie.net${moment.iconWatermark})`)
			)
			.append(Component()
				.style('collections-view-moment-title')
				.style.bind(details.open, 'collections-view-moment-title--open')
				.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment-title--hover')
				.text.set(moment.displayProperties.name)
			)
		)
		.tweak(details => {
			details.content.style('collections-view-moment-content')

			const weapons = ([InventoryBucketHashes.KineticWeapons, InventoryBucketHashes.EnergyWeapons, InventoryBucketHashes.PowerWeapons] as const)
				.flatMap(hash => buckets[hash].items)

			const armour = ([InventoryBucketHashes.Helmet, InventoryBucketHashes.Gauntlets, InventoryBucketHashes.ChestArmor, InventoryBucketHashes.LegArmor, InventoryBucketHashes.ClassArmor] as const)
				.flatMap(hash => buckets[hash].items)

			const armourWarlock = armour.filter(item => item.class === DestinyClass.Warlock)
			const armourTitan = armour.filter(item => item.class === DestinyClass.Titan)
			const armourHunter = armour.filter(item => item.class === DestinyClass.Hunter)

			const ItemFilterState = (item: CollectionsItem) => State.Map(details, [display, filterText],
				(display, _) => display?.filter.filter(item, false) ?? true,
			)

			const itemFilterStates = new Map([...weapons, ...armour].map(item => [item, ItemFilterState(item)]))
			const hasAnyItemFilteredIn = State.Some(details, ...itemFilterStates.values())

			State.Use(details, { filterText, hasAnyItemFilteredIn }, ({ filterText, hasAnyItemFilteredIn }) => {
				if (!filterText) {
					details.open.value = details.manualOpenState.value
					return
				}

				details.open.value = hasAnyItemFilteredIn
			})

			void details.open.await(details, true).then(() => {
				Lore()
					.style('collections-view-moment-lore')
					.text.set(moment.displayProperties.description)
					.appendTo(details.content)

				const bucketsWrapper = Component()
					.style('collections-view-moment-buckets')
					.appendTo(details.content)

				const addFilteredItems = (bucket: MomentBucket, items: CollectionsItem[]) => {
					const filterStates: State<boolean>[] = []
					for (const item of items) {
						const filterState = itemFilterStates.get(item)
						if (!filterState)
							continue

						const shouldShowItem = State(false)
						let timeUpdatedWasShowing = 0
						let oldShouldShow = false
						let wasShowing = false
						let wasOpen = false
						let timeUpdatedWasOpen = 0
						let forceRecheckTimeout: number | undefined
						State.Use(details, { filterState, filterText, hasAnyItemFilteredIn, open: details.open, transitioning: details.transitioning }, (state, old) => {
							clearTimeout(forceRecheckTimeout)
							const newShouldShow = state.filterState && state.open

							if (wasShowing || wasOpen) {
								if (newShouldShow !== oldShouldShow)
									timeUpdatedWasShowing = Date.now()
								oldShouldShow = newShouldShow
								if (state.open !== wasOpen)
									timeUpdatedWasOpen = Date.now()
								wasOpen = state.open
							}

							if (Date.now() - timeUpdatedWasShowing < 10 || Date.now() - timeUpdatedWasOpen < 10) {
								setTimeout(applyNewShouldShow, 10)
								return
							}

							if (state.transitioning)
								return

							applyNewShouldShow()
							function applyNewShouldShow () {
								shouldShowItem.value = newShouldShow
								oldShouldShow = newShouldShow
								wasShowing = newShouldShow
								wasOpen = state.open
							}
						})

						void shouldShowItem.await(bucket, true).then(() => {
							const itemComponent = Item(item, collections)
							Object.assign(itemComponent, { shouldShowItem, filterState })
							filterText.use(itemComponent, () => {
								itemComponent.rect.markDirty()
								Item.Tooltip?.anchor.markDirty()
							})
							itemComponent.appendToWhen(shouldShowItem, bucket.content)
						})
						filterStates.push(shouldShowItem)
					}

					const shouldShowBucket = State.Some(details, ...filterStates)
					bucket.appendToWhen(shouldShowBucket, bucketsWrapper)
				}

				if (weapons.length)
					MomentBucket()
						.titleText.set(quilt => quilt['view/collections/bucket/weapons/title']())
						.tweak(addFilteredItems, weapons)

				if (armourTitan.length)
					MomentBucket()
						.titleText.set(quilt => quilt['view/collections/bucket/armour/titan/title']())
						.tweak(addFilteredItems, armourTitan)

				if (armourHunter.length)
					MomentBucket()
						.titleText.set(quilt => quilt['view/collections/bucket/armour/hunter/title']())
						.tweak(addFilteredItems, armourHunter)

				if (armourWarlock.length)
					MomentBucket()
						.titleText.set(quilt => quilt['view/collections/bucket/armour/warlock/title']())
						.tweak(addFilteredItems, armourWarlock)
			})
		})
})
