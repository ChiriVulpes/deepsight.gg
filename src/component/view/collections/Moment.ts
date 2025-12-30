import { DestinyClass } from 'bungie-api-ts/destiny2'
import Details from 'component/core/Details'
import Image from 'component/core/Image'
import Lore from 'component/core/Lore'
import type { DisplayHandlers } from 'component/DisplayBar'
import Item from 'component/item/Item'
import type Collections from 'conduit.deepsight.gg/item/Collections'
import type { CollectionsMoment } from 'conduit.deepsight.gg/item/Collections'
import type { Item as CollectionsItem, ItemSourceDefined, ItemSourceDropTable } from 'conduit.deepsight.gg/item/Item'
import { InventoryBucketHashes } from 'deepsight.gg/Enums'
import type { DeepsightDropTableDefinition, DeepsightItemSourceDefinition } from 'deepsight.gg/Interfaces'
import { Component, State } from 'kitsui'
import type TextManipulator from 'kitsui/utility/TextManipulator'
import type { ItemState } from 'model/Items'

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

export const FILTER_CHANGING_CLASS = 'collections-view-content--filter-changing'

export default Component((component, { moment, buckets }: CollectionsMoment, provider: Collections, display: State.Or<DisplayHandlers | undefined>) => {
	display = State.get(display)
	const filterText = display.map(component, display => display?.filter.filterText).delay(component, 10)
	return component.and(Details)
		.tweak(details => {
			details
				.style('collections-view-moment')
				.classes.bind(filterText.delayed, FILTER_CHANGING_CLASS)
				.style.bind(details.open, 'details--open', 'collections-view-moment--open')
				.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment--hover')
				.viewTransitionSwipe(`collections-view-moment-${moment.id}`)

			if (moment.primaryImage) {
				const url = `https://www.bungie.net${moment.primaryImage}`
				const image = document.createElement('img')
				image.src = url
				image.onload = e => {
					details.style.setVariable('event-background', `url(${url})`)
					details.style.setVariable('event-background-width', `${image.naturalWidth}`)
					details.style.setVariable('event-background-height', `${image.naturalHeight}`)
				}
			}
		})
		.tweak(details => details.summary
			.style('collections-view-moment-summary')
			.style.bind(details.open, 'collections-view-moment-summary--open')
			.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment-summary--hover')
			.append(moment.iconWatermark && Component()
				.style('collections-view-moment-icon', 'collections-view-moment-icon--watermark')
				.style.bind(details.open, 'collections-view-moment-icon--open')
				.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment-icon--hover')
				.style.setVariable('moment-watermark-icon', `url(https://www.bungie.net${moment.iconWatermark})`)
			)
			.append(!moment.iconWatermark && moment.displayProperties.icon && Image(`https://www.bungie.net${moment.displayProperties.icon}`)
				.style('collections-view-moment-icon')
				.style.bind(details.open, 'collections-view-moment-icon--open')
				.style.bind(details.summary.hoveredOrHasFocused, 'collections-view-moment-icon--hover')
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
				.flatMap(hash => buckets[hash].items.map(hash => provider.items[hash]))

			const armour = ([InventoryBucketHashes.Helmet, InventoryBucketHashes.Gauntlets, InventoryBucketHashes.ChestArmor, InventoryBucketHashes.LegArmor, InventoryBucketHashes.ClassArmor] as const)
				.flatMap(hash => buckets[hash].items.map(hash => provider.items[hash]))

			const armourWarlock = armour.filter(item => item.classType === DestinyClass.Warlock)
			const armourTitan = armour.filter(item => item.classType === DestinyClass.Titan)
			const armourHunter = armour.filter(item => item.classType === DestinyClass.Hunter)

			const ItemFilterState = (item: ItemState) => State.Map(details, [display, filterText, details.manualOpenState, details.transitioning],
				(display, filterText, open, transitioning) => ({
					filterText,
					filterState: display?.filter.filter(item, false) ?? true,
					open: filterText ? false : open,
					transitioning,
				})
			).delay(details, 10)

			const itemFilterStates = [...weapons, ...armour].toMap(item => [item, ItemFilterState({ definition: item, provider })])
			const hasAnyItemFilteredIn = State.Map(details, [...itemFilterStates.values()], (...states) => states.some(state => state.filterState))

			State.Use(details, {
				filterText,
				hasAnyItemFilteredIn,
				delayed: State.Delayed(details, { filterText, hasAnyItemFilteredIn }, 100),
			}).use(details, ({ filterText, hasAnyItemFilteredIn, delayed }) => {
				if (!filterText) {
					details.open.value = details.manualOpenState.value
					return
				}

				if (delayed.filterText && delayed.hasAnyItemFilteredIn && hasAnyItemFilteredIn)
					details.open.value = true
				else if (!hasAnyItemFilteredIn)
					details.open.value = false
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
					const sortValues = Object.fromEntries(items.map(item => [
						item.hash,
						[
							item.rarity,
							(item.sources
								?.map(sourceRef => {
									const def = sourceRef.type === 'table' ? provider.dropTables[sourceRef.id] : provider.sources[sourceRef.id]
									return { ...sourceRef, def } as ItemSourceDropTable & { def: DeepsightDropTableDefinition } | ItemSourceDefined & { def: DeepsightItemSourceDefinition }
								})
								.filter(source => source.type !== 'table' || source.def.type === 'raid' || source.def.type === 'dungeon' || source.def.type === 'exotic-mission')
								.map(source => `${source.type}:${source.id}`)
								.join(',')
								|| ''),
							item.itemSetHash,
						].map(v => v ?? 0),
					])) as Record<number, (string | number)[]>
					items = items.toSorted((a, b) => {
						const aValues = sortValues[a.hash]
						const bValues = sortValues[b.hash]
						for (let i = 0; i < aValues.length; i++)
							if (aValues[i] !== bValues[i])
								return typeof aValues[i] === 'number'
									? (aValues[i] as number) - (bValues[i] as number)
									: +(aValues[i] === '') - +(bValues[i] === '') || (aValues[i] as string).localeCompare(bValues[i] as string)
						return 0
					})

					const filterStates: State<boolean>[] = []
					for (const item of items) {
						const filterState = itemFilterStates.get(item)
						if (!filterState)
							continue

						const shouldShowItem = State(false)
						let wasOpen = false

						filterState.use(bucket, (state, old) => {
							const newShouldShow = state.filterText ? state.filterState : state.open

							if (old?.open)
								wasOpen = true
							else if (!state.open && !state.transitioning)
								wasOpen = false

							shouldShowItem.value = newShouldShow || (!state.filterText && wasOpen && shouldShowItem.value)
						})

						void shouldShowItem.await(bucket, true).then(() => {
							const itemComponent = Item({ definition: item, provider })
								.classes.bind(filterState.delayed, FILTER_CHANGING_CLASS)
							Object.assign(itemComponent, { shouldShowItem, filterState })
							filterText.use(itemComponent, () => {
								itemComponent.rect.markDirty()
								Item.Tooltip?.anchor.markDirty()
							})
							const ownIndex = items.indexOf(item)
							const itemComponentToPositionAfter = bucket.content.getDescendants(Item).toArray().findLast(item => items.indexOf(item.state.value.definition) < ownIndex)
							itemComponent.insertToWhen(shouldShowItem, bucket.content, 'after', itemComponentToPositionAfter?.parent)
						})
						filterStates.push(shouldShowItem)
					}

					const shouldShowBucket = State.Some(details, ...filterStates)
					bucket.appendToWhen(shouldShowBucket, bucketsWrapper)
				}

				if (weapons.length)
					MomentBucket()
						.style('collections-view-moment-bucket--weapons')
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
