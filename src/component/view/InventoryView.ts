import Button from 'component/core/Button'
import Icon from 'component/core/Icon'
import Image from 'component/core/Image'
import View from 'component/core/View'
import FilterAmmo from 'component/display/filter/FilterAmmo'
import FilterBreakerType from 'component/display/filter/FilterBreakerType'
import FilterElement from 'component/display/filter/FilterElement'
import FilterRarity from 'component/display/filter/FilterRarity'
import FilterSource from 'component/display/filter/FilterSource'
import FilterWeaponFoundry from 'component/display/filter/FilterWeaponFoundry'
import FilterWeaponFrame from 'component/display/filter/FilterWeaponFrame'
import FilterWeaponType from 'component/display/filter/FilterWeaponType'
import DisplayBar from 'component/DisplayBar'
import Item from 'component/item/Item'
import Overlay from 'component/Overlay'
import ItemOverlay from 'component/overlay/ItemOverlay'
import CharacterButton from 'component/profile/CharacterButton'
import GenericTooltip from 'component/tooltip/GenericTooltip'
import type Inventory from 'conduit.deepsight.gg/item/Inventory'
import type { ItemInstance } from 'conduit.deepsight.gg/item/Item'
import { InventoryBucketHashes, InventoryItemHashes, PresentationNodeHashes, VendorHashes } from 'deepsight.gg/Enums'
import { Component, State } from 'kitsui'
import Breakdown from 'kitsui/component/Breakdown'
import Loading from 'kitsui/component/Loading'
import Slot from 'kitsui/component/Slot'
import { NonNullish } from 'kitsui/utility/Arrays'
import DisplayProperties from 'model/DisplayProperties'
import type { ItemReference, ItemStateOptional } from 'model/Items'
import { ItemState } from 'model/Items'
import type { RoutePath } from 'navigation/RoutePath'
import { ItemLocation } from 'node_modules/bungie-api-ts/destiny2'
import Relic from 'Relic'
import type { IconsKey } from 'style/icons'
import { sleep } from 'utility/Async'
import Time from 'utility/Time'

const INVENTORY_DISPLAY = DisplayBar.Config({
	id: 'inventory',
	sortConfig: {},
	filterConfig: {
		id: 'inventory',
		filters: [FilterElement, FilterAmmo, FilterBreakerType, FilterWeaponType, FilterWeaponFrame, FilterWeaponFoundry, FilterSource, FilterRarity],
		debounceTime: 500,
	},
})

// interface BucketIconDisplayProperties {
// 	type: 'display-properties'
// 	displayProperties: DestinyDisplayPropertiesDefinition
// }

// interface BucketIconIconDefForeground {
// 	type: 'icon-def-foreground'
// 	iconDef: DestinyIconDefinition
// }

interface BucketIconBungiePath {
	type: 'bungie-path'
	path: string
}

interface BucketIconFont {
	type: 'font'
	icon: IconsKey
}

type BucketIcon =
	// | BucketIconDisplayProperties
	// | BucketIconIconDefForeground
	| BucketIconBungiePath
	| BucketIconFont

const bucketIcons = State.Async(State.Owner.create(), async (): Promise<Map<InventoryBucketHashes, BucketIcon | undefined>> => {
	const conduit = await Relic.connected
	const [
		DestinyPresentationNodeDefinition,
		heavyAmmoOrderIcon,
		kineticOrderIcon,
		postBoxVendor,
	] = await Promise.all([
		conduit.definitions.en.DestinyPresentationNodeDefinition.all(),
		conduit.definitions.en.DestinyInventoryItemDefinition.get(InventoryItemHashes.HeavyLiftGunsmithOrder).then(def => conduit.definitions.en.DestinyIconDefinition.get(def?.displayProperties.iconHash)),
		conduit.definitions.en.DestinyInventoryItemDefinition.get(InventoryItemHashes.KineticEnergyGunsmithOrder).then(def => conduit.definitions.en.DestinyIconDefinition.get(def?.displayProperties.iconHash)),
		conduit.definitions.en.DestinyVendorDefinition.get(VendorHashes.PostBox1143270268),
	])
	return new Map([
		[InventoryBucketHashes.LostItems, postBoxVendor && {
			type: 'bungie-path',
			path: postBoxVendor.displayProperties.smallTransparentIcon,
		}],
		[InventoryBucketHashes.KineticWeapons, kineticOrderIcon && {
			type: 'bungie-path',
			path: kineticOrderIcon.foreground,
		}],
		[InventoryBucketHashes.EnergyWeapons, {
			type: 'font',
			icon: 'InventoryBucketEnergyWeapons',
		}],
		[InventoryBucketHashes.PowerWeapons, heavyAmmoOrderIcon && {
			type: 'bungie-path',
			path: heavyAmmoOrderIcon.foreground,
		}],
		[InventoryBucketHashes.Helmet, {
			type: 'font',
			icon: 'InventoryBucketHeadArmor',
		}],
		[InventoryBucketHashes.Gauntlets, {
			type: 'font',
			icon: 'InventoryBucketArmArmor',
		}],
		[InventoryBucketHashes.ChestArmor, {
			type: 'font',
			icon: 'InventoryBucketChestArmor',
		}],
		[InventoryBucketHashes.LegArmor, {
			type: 'font',
			icon: 'InventoryBucketLegArmor',
		}],
		[InventoryBucketHashes.ClassArmor, {
			type: 'font',
			icon: 'InventoryBucketClassArmor',
		}],
		[InventoryBucketHashes.Ghost, {
			type: 'bungie-path',
			path: DestinyPresentationNodeDefinition[PresentationNodeHashes.GhostShells_ParentNodeHashesLength2].displayProperties.icon,
		}],
		[InventoryBucketHashes.Vehicle, {
			type: 'bungie-path',
			path: DestinyPresentationNodeDefinition[PresentationNodeHashes.Vehicles_ParentNodeHashesLength2].displayProperties.icon,
		}],
		[InventoryBucketHashes.Ships, {
			type: 'bungie-path',
			path: DestinyPresentationNodeDefinition[PresentationNodeHashes.Ships].displayProperties.icon,
		}],
		[InventoryBucketHashes.Consumables, {
			type: 'bungie-path',
			path: DestinyPresentationNodeDefinition[PresentationNodeHashes.UpgradeMaterials].displayProperties.icon,
		}],
		[InventoryBucketHashes.Modifications, {
			type: 'bungie-path',
			path: DestinyPresentationNodeDefinition[PresentationNodeHashes.Mods].originalIcon,
		}],
	])
})

export interface InventoryParamsItemInstanceId {
	itemInstanceId: string
}

export default View<InventoryParamsItemInstanceId | undefined>(async view => {
	view.displayBarConfig.value = INVENTORY_DISPLAY

	view.style('inventory-view')
		.style.bind(view.loading.loaded, 'inventory-view--ready')

	// const changingFilter = State(false)

	view.title
		// .style('inventory-view-title')
		.text.set(quilt => quilt['view/inventory/title']())
	// .appendWhen(changingFilter, Loading().showForever().style('collections-view-title-loading'))

	const { signal, setProgress } = await view.loading.start()
	setProgress(null, quilt => quilt['view/inventory/load/connecting']())
	const conduit = await Relic.connected
	if (signal.aborted)
		return

	setProgress(null, quilt => quilt['view/inventory/load/fetching']())

	const lastCheck = State<number | undefined>(undefined)
	const state = State.Async(view, async () => {
		lastCheck.value = undefined
		const [profile] = await conduit.getProfiles()
		lastCheck.value = Date.now()
		return profile && await conduit.getInventory(profile.name, profile.code ?? 0)
	})

	await state.promise
	if (signal.aborted)
		return

	await view.loading.finish()

	// allow transitions to finish
	await sleep(500)

	const inventoryOrUndefined = state.map(view, (inventory, lastInventory) => inventory ?? lastInventory)

	const homeLinkURL = navigate.state.map(view, url => {
		const route = new URL(url).pathname as RoutePath
		return route === '/inventory' ? '/' : '/inventory'
	})

	view.getNavbar()
		?.overrideHomeLink(homeLinkURL, view)

	Loading()
		.style('inventory-view-refresh-wrapper')
		.setNormalTransitions()
		.set(state, slot => Button()
			.style('inventory-view-refresh-button')
			.tweak(button => button
				.text.bind(State.Map(view, [Time.state, lastCheck, button.hoveredOrHasFocused], (elapsed, last, hovered) => quilt => quilt['view/data/versions/action/check'](!last || !hovered ? undefined : Time.relative(last, { components: 1 }))))
			)
			.event.subscribe('click', () => state.refresh())
			.appendTo(slot)
		)
		.appendTo(view)

	const filterText = view.displayHandlers.map(view, display => display?.filter.filterText)

	Slot().appendTo(view)
		.if(inventoryOrUndefined.falsy, slot => {
			Component().appendTo(slot).text.set('No inventory data available')
		})
		.else(slot => {
			const inventory = inventoryOrUndefined as State<Inventory>
			inventory.useManual(inventory => console.log('Inventory:', inventory))

			const scrollTopState = State(document.documentElement.scrollTop)
			Component.getWindow().event.until(slot, event => event
				.subscribe('scroll', () => scrollTopState.value = document.documentElement.scrollTop)
			)

			const content = Component()
				.style('inventory-view-content')
				.appendTo(slot)

			const bucketNav = Component()
				.style('inventory-view-nav')
				.appendTo(content)

			const bucketNavButtonList = Component()
				.style('inventory-view-nav-button-list')
				.appendTo(bucketNav)

			const bucketList = Component()
				.style('inventory-view-bucket-list')
				.appendTo(content)

			const header = Component()
				.style('inventory-view-header', 'inventory-view-bucket-row')
				.style.bind(scrollTopState.map(slot, scrollTop => scrollTop > 50), 'inventory-view-header--stuck')
				.appendTo(bucketList)

			let bucketItemsVisibleCount = 0
			Breakdown(slot, State.Use(slot, { inventory, bucketIcons, display: view.displayHandlers, filterText }), ({ inventory, bucketIcons, display, filterText }, Part, Store) => {
				const BucketRow = (bucketHash: InventoryBucketHashes) => {
					bucketItemsVisibleCount = 0
					const bucketDef = inventory.buckets[bucketHash]
					return Part(`bucket:${bucketHash}/row`, part => part
						.style('inventory-view-bucket-row')
						.style.toggle(bucketDef.location !== ItemLocation.Inventory && bucketDef.location !== ItemLocation.Postmaster, 'inventory-view-bucket-row--profile')
						.append(Component()
							.style('inventory-view-bucket-title')
							.text.set(inventory.buckets[bucketHash].displayProperties.name)
						)
					)
				}

				const BucketWrapper = (id: string) => Part(id, part => part
					.style('inventory-view-bucket-wrapper')
				)

				const ItemList = (id: string) => Part(id, part => part
					.style('inventory-view-bucket-item-list')
				)

				const InventoryItem = (id: string, item: ItemInstance, handler?: (item: Item) => unknown) => {
					const itemState = ItemState.resolve(item, inventory)
					return Part(id, itemState, (part, item) => {
						const itemComponent = part.and(Item, item)
						handler?.(itemComponent)
						const baseAppendTo = itemComponent.appendTo
						const basePrependTo = itemComponent.prependTo
						const baseInsertTo = itemComponent.insertTo
						Object.assign(
							part,
							{
								appendTo (destination: Component) {
									const shouldShow = display?.filter.filter(itemState, false) ?? true
									if (shouldShow)
										bucketItemsVisibleCount++
									return baseAppendTo(shouldShow ? destination : Store)
								},
								prependTo (destination: Component) {
									const shouldShow = display?.filter.filter(itemState, false) ?? true
									if (shouldShow)
										bucketItemsVisibleCount++
									return basePrependTo(shouldShow ? destination : Store)
								},
								insertTo (destination: Component, direction: 'before' | 'after', sibling: Component) {
									const shouldShow = display?.filter.filter(itemState, false) ?? true
									if (shouldShow)
										bucketItemsVisibleCount++
									return baseInsertTo(shouldShow ? destination : Store, direction, sibling)
								},
							}
						)
					}) as Item
				}

				const characters = Object.values(inventory.characters).sort((a, b) => new Date(b.metadata.dateLastPlayed).getTime() - new Date(a.metadata.dateLastPlayed).getTime())

				for (const character of characters) {
					Part(`character:${character.id}/header`, character, (part, character) => part
						.and(CharacterButton, character)
						.tweak(button => button.mode.value = 'expanded')
						.style('inventory-view-header-character-button')
					).appendTo(header)
				}

				const bucketOrder = [...bucketIcons?.keys() ?? []]
				const buckets = ([] as InventoryBucketHashes[])
					.concat(characters.flatMap(character => character.equippedItems.map(item => item.bucketHash)))
					.concat(characters.flatMap(character => character.items.map(item => item.bucketHash)))
					.concat(inventory.profileItems.map(item => inventory.items[item.itemHash].bucketHash).filter(NonNullish))
					.distinct()
					.sort((a, b) => (bucketOrder.indexOf(a) + 1 || Infinity) - (bucketOrder.indexOf(b) + 1 || Infinity))
				for (const bucketHash of buckets) {
					const bucketIcon = bucketIcons?.get(bucketHash)
					if (!bucketIcon)
						continue

					const bucketRow = BucketRow(bucketHash)

					const bucketDef = inventory.buckets[bucketHash]
					const bucketButton = !bucketDef.displayProperties.name ? undefined :
						Part(`bucket:${bucketHash}/button`, part => part
							.and(Button)
							.style('inventory-view-nav-button', 'item')
							.tweak(GenericTooltip.apply, tooltip => tooltip
								.titleText.set(bucketDef.displayProperties.name)
								.descriptionText.set(bucketDef.displayProperties.description)
							)
							.event.subscribe('click', () => {
								bucketRow.element.scrollIntoView({ behavior: 'smooth', block: 'start' })
							})
							.tweak(button => {
								// if (bucketIcon?.type === 'display-properties')
								// 	Image(DisplayProperties.icon(bucketIcon.displayProperties.icon))
								// 		.style('item-image')
								// 		.appendTo(button)
								// else if (bucketIcon?.type === 'icon-def-foreground')
								// 	Image(DisplayProperties.icon(bucketIcon.iconDef.foreground))
								// 		.style('item-image')
								// 		.appendTo(button)
								if (bucketIcon?.type === 'bungie-path')
									Image(DisplayProperties.icon(bucketIcon.path))
										.style('item-image', 'inventory-view-nav-button-icon', 'inventory-view-nav-button-icon--image')
										.appendTo(button)
								else if (bucketIcon?.type === 'font')
									Icon[bucketIcon.icon]
										.style('inventory-view-nav-button-icon', 'inventory-view-nav-button-icon--font')
										.appendTo(button)
							})
						)

					////////////////////////////////////
					//#region Bucket content

					let hadOverfilledCharacter = false
					if (bucketDef.location === ItemLocation.Inventory || bucketDef.location === ItemLocation.Postmaster)
						for (const character of characters) {
							const bucketWrapper = BucketWrapper(`character:${character.id}/bucket:${bucketHash}`)
								.style('inventory-view-bucket-wrapper--character')
								.style.toggle(bucketHash === InventoryBucketHashes.LostItems, 'inventory-view-bucket-wrapper--lost-items')
								.appendTo(bucketRow)

							const equippedItemList = ItemList(`character:${character.id}/bucket:${bucketHash}/equipped`)
								.style('inventory-view-bucket-item-list--equipped')
								.appendTo(bucketWrapper)
							for (const item of character.equippedItems) {
								if (item.bucketHash !== bucketHash)
									continue

								InventoryItem(`item:${item.id ?? `hash:${item.itemHash}`}`, item)
									.appendTo(equippedItemList)
							}

							const itemList = ItemList(`character:${character.id}/bucket:${bucketHash}/items`)
								.style('inventory-view-bucket-item-list--inventory')
								.style.toggle(bucketHash === InventoryBucketHashes.LostItems, 'inventory-view-bucket-item-list--lost-items')
								.appendTo(bucketWrapper)
							let i = 0
							const hashAppearances: Record<number, number> = {}
							for (const item of character.items) {
								if (item.bucketHash !== bucketHash)
									continue

								i++
								hashAppearances[item.itemHash] ??= 0
								InventoryItem(`item:${item.id ?? `hash:${item.itemHash}/character:${character.id}/stack:${hashAppearances[item.itemHash]++}`}`, item)
									.appendTo(itemList)
							}

							const isOverfilled = bucketHash === InventoryBucketHashes.LostItems && i / bucketDef.itemCount > 2 / 3
							hadOverfilledCharacter ||= isOverfilled
							bucketWrapper.style.toggle(isOverfilled, 'inventory-view-bucket-wrapper--warning')

							const hasEquippedItem = +character.equippedItems.some(item => item.bucketHash === bucketHash)
							const bucketInventorySlots = filterText ? 0 : bucketDef.itemCount - hasEquippedItem
							for (; i < bucketInventorySlots; i++) {
								Part(`character:${character.id}/bucket:${bucketHash}/empty:${i}`)
									.style('item', 'inventory-view-bucket-item-list-empty-slot')
									.appendTo(itemList)
							}
						}
					else {
						const profileBucketWrapper = BucketWrapper(`profile/bucket:${bucketHash}`)
							.style('inventory-view-bucket-wrapper--profile')
							.appendTo(bucketRow)
						const itemList = ItemList(`profile/bucket:${bucketHash}/items`)
							.style('inventory-view-bucket-item-list--profile')
							.appendTo(profileBucketWrapper)

						let i = 0
						const hashAppearances: Record<number, number> = {}
						for (const item of inventory.profileItems) {
							if (item.bucketHash === InventoryBucketHashes.General || inventory.items[item.itemHash].bucketHash !== bucketHash)
								continue

							i++
							hashAppearances[item.itemHash] ??= 0
							InventoryItem(`profile/item:${item.id ?? `hash:${item.itemHash}`}/stack:${hashAppearances[item.itemHash]++}`, item)
								.appendTo(itemList)
						}

						const bucketInventorySlots = filterText ? 0 : bucketDef.itemCount
						for (; i < bucketInventorySlots; i++)
							Part(`profile/bucket:${bucketHash}/empty:${i}`)
								.style('item', 'inventory-view-bucket-item-list-empty-slot')
								.appendTo(itemList)
					}

					bucketRow.style.toggle(hadOverfilledCharacter, 'inventory-view-bucket-row--warning')
					bucketButton?.style.toggle(hadOverfilledCharacter, 'inventory-view-nav-button--warning')

					const vaultBucketWrapper = BucketWrapper(`vault/bucket:${bucketHash}`)
						.style('inventory-view-bucket-wrapper--vault')
						.style.toggle(bucketDef.location !== ItemLocation.Inventory, 'inventory-view-bucket-wrapper--vault--profile')
						.appendTo(bucketRow)
					const itemList = ItemList(`vault/bucket:${bucketHash}/items`)
						.appendTo(vaultBucketWrapper)

					const hashAppearances: Record<number, number> = {}
					for (const item of inventory.profileItems) {
						const definition = inventory.items[item.itemHash]
						if (item.bucketHash !== InventoryBucketHashes.General || definition.bucketHash !== bucketHash)
							continue

						hashAppearances[item.itemHash] ??= 0
						InventoryItem(`vault/item:${item.id ?? `hash:${item.itemHash}`}/stack:${hashAppearances[item.itemHash]++}`, item)
							.appendTo(itemList)
					}

					//#endregion
					////////////////////////////////////

					bucketRow.appendTo(bucketItemsVisibleCount || !filterText ? bucketList : Store)
					bucketButton?.appendTo(bucketItemsVisibleCount || !filterText ? bucketNavButtonList : Store)
				}
			})

			const overlayState = State.Map(view, [view.params, inventory], (params, inventory): ItemStateOptional => {
				if (!params)
					return ItemState.resolve(undefined, inventory)

				const result: ItemReference | undefined = 'itemInstanceId' in params
					? { is: 'item-reference', hash: +params.itemInstanceId }
					: undefined

				if (result !== undefined) {
					view.loading.skipViewTransition()
					return ItemState.resolve(result, inventory)
				}

				return ItemState.resolve(undefined, inventory)
			})

			Overlay(view).bind(overlayState.map(view, s => !!s.definition)).and(ItemOverlay, overlayState)
		})
})
