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
import { Inventory as ConduitInventory } from 'conduit.deepsight.gg'
import type { ItemTransferReference } from 'conduit.deepsight.gg/ConduitMessageRegistry'
import type { InventoryTransferDisplayState, InventoryTransferOperationState } from 'conduit.deepsight.gg/Inventory'
import type Inventory from 'conduit.deepsight.gg/item/Inventory'
import type { ItemInstance } from 'conduit.deepsight.gg/item/Item'
import { InventoryBucketHashes, InventoryItemHashes, PresentationNodeHashes, VendorHashes } from 'deepsight.gg/Enums'
import { Component, State } from 'kitsui'
import Breakdown from 'kitsui/component/Breakdown'
import Loading from 'kitsui/component/Loading'
import Slot from 'kitsui/component/Slot'
import Task from 'kitsui/utility/Task'
import DisplayProperties from 'model/DisplayProperties'
import type { ItemReference, ItemStateOptional } from 'model/Items'
import { ItemState } from 'model/Items'
import type { RoutePath } from 'navigation/RoutePath'
import { ItemLocation } from 'node_modules/bungie-api-ts/destiny2'
import Relic from 'Relic'
import type { IconsKey } from 'style/icons'
import ConduitBroadcastHandler from 'utility/ConduitBroadcastHandler'
import Diagnostic from 'utility/Diagnostic'
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

const INVENTORY_DIAGNOSTIC = Diagnostic.scope<
	| 'data-ready'
	| 'loading-finish-requested'
	| 'loading-finished'
	| 'render-start'
	| 'first-bucket-rendered'
	| 'render-complete'
>('inventory-view')

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

type InventoryLoadMode = 'cached' | 'fresh'
type InventoryTransferDisplay = 'pending' | 'failure' | undefined

const EMPTY_TRANSFER_DISPLAY_STATE: InventoryTransferDisplayState = {
	pending: [],
	failures: [],
}

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

function getTransferDisplay (transfers: InventoryTransferDisplayState, item: ItemStateOptional): InventoryTransferDisplay {
	if (!item.instance)
		return undefined

	if (transfers.failures.some(transfer => matchesTransferItem(transfer, item)))
		return 'failure'

	if (transfers.pending.some(transfer => matchesTransferItem(transfer, item)))
		return 'pending'

	return undefined
}

function matchesTransferItem (transfer: InventoryTransferOperationState, item: ItemStateOptional) {
	return transfer.affectedItems.some(reference => matchesTransferReference(reference, item))
}

function matchesTransferReference (reference: ItemTransferReference, item: ItemStateOptional) {
	const instance = item.instance
	if (!instance)
		return false

	if (reference.instanceId)
		return instance.id === reference.instanceId

	return instance.id === undefined &&
		instance.itemHash === reference.itemHash &&
		instance.quantity === reference.stackSize &&
		item.characterId === reference.characterId
}

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
	const inventoryLoadRequest = State<{ mode: InventoryLoadMode, nonce: number }>({ mode: 'cached', nonce: 0 })
	const requestInventoryLoad = (mode: InventoryLoadMode) => {
		inventoryLoadRequest.value = {
			mode,
			nonce: inventoryLoadRequest.value.nonce + 1,
		}
	}

	let currentProfileId: string | undefined
	const inventoryDisplayState = State<Inventory | undefined>(undefined)
	const transferDisplayState = State<InventoryTransferDisplayState>(EMPTY_TRANSFER_DISPLAY_STATE)
	const state = State.Async(view, inventoryLoadRequest, async ({ mode }) => {
		lastCheck.value = undefined
		const [profile] = await conduit.getProfiles()
		currentProfileId = profile?.id
		lastCheck.value = Date.now()
		const inventory = profile && await (mode === 'fresh' ? conduit.getInventory : conduit.getInventoryCached)(profile.name, profile.code ?? 0)
		inventoryDisplayState.value = inventory
		return inventory
	})
	const unsubscribeInventoryUpdated = conduit.on.inventoryUpdated(({ profile, inventory }) => {
		if (profile.id !== currentProfileId)
			return

		inventoryDisplayState.value = inventory
	})
	const inventoryTransfers = ConduitInventory.transfers(conduit, {
		getInventory: () => inventoryDisplayState.value,
		setInventory: inventory => inventoryDisplayState.value = inventory,
		refreshInventory: () => requestInventoryLoad('cached'),
		getCurrentProfileId: () => currentProfileId,
		onTransferStateChange: state => transferDisplayState.value = state,
	})
	Diagnostic.add({ inventoryTransferDisplayState: transferDisplayState })
	view.onRemoveManual(unsubscribeInventoryUpdated)
	view.onRemoveManual(() => inventoryTransfers.unsubscribe())

	await Promise.all([state.promise, bucketIcons.promise])
	INVENTORY_DIAGNOSTIC.mark('data-ready')
	if (signal.aborted)
		return

	const inventoryOrUndefined = inventoryDisplayState.map(view, (inventory, lastInventory) => inventory ?? lastInventory)

	const homeLinkURL = navigate.state.map(view, url => {
		const route = new URL(url).pathname as RoutePath
		return route === '/inventory' ? '/' : '/inventory'
	})

	view.getNavbar()
		?.overrideHomeLink(homeLinkURL, view)

	const filterText = view.displayHandlers.map(view, display => display?.filter.filterText)
	let completeInitialContentRender!: () => void
	const initialContentRendered = new Promise<void>(resolve => completeInitialContentRender = resolve)
	let isInitialContentRender = true
	let initialContent: Component | undefined
	let initialContentHost: Component | undefined
	let initialScrollTopState: State.Mutable<number> | undefined

	setProgress(null, quilt => quilt['view/inventory/load/rendering']())

	Slot().appendTo(view)
		.if(inventoryOrUndefined.falsy, slot => {
			Component().appendTo(slot).text.set('No inventory data available')
			completeInitialContentRender()
		})
		.else(slot => {
			const inventory = inventoryOrUndefined as State<Inventory>
			inventory.useManual(inventory => {
				ConduitBroadcastHandler.provider.value = inventory
				Diagnostic.add({ inventory })
			})

			const scrollTopState = State(document.documentElement.scrollTop)
			initialScrollTopState = scrollTopState
			let bucketRenderEpoch = 0
			const bucketHydratedStates = new Map<InventoryBucketHashes, State.Mutable<boolean>>()
			const bucketHydrating = new Set<InventoryBucketHashes>()
			const bucketHydrators = new Map<InventoryBucketHashes, () => void>()
			Component.getWindow().event.until(slot, event => event
				.subscribe('scroll', () => {
					scrollTopState.value = document.documentElement.scrollTop
					for (const hydrate of bucketHydrators.values())
						hydrate()
				})
			)

			const contentHost = Component()
				.appendTo(slot)
			initialContentHost = contentHost

			const content = Component()
				.setOwner(slot)
				.style('inventory-view-content')
				.viewTransitionSwipe('inventory-view-content')
			initialContent = content
			Component.getDomController(content).realiseForInsertion()

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
			Breakdown(slot, State.Use(slot, { inventory, bucketIcons, display: view.displayHandlers, filterText }), async ({ inventory, bucketIcons, display, filterText }, Part, Store) => {
				const renderEpoch = ++bucketRenderEpoch
				INVENTORY_DIAGNOSTIC.mark('render-start')
				const renderTask = new Task()
				let renderedFirstBucket = false
				const shouldFilterItems = !!filterText && !!display
				const yieldRender = async () => {
					await renderTask.yield()
				}
				const shouldCancelRender = () => slot.removed.value || renderEpoch !== bucketRenderEpoch

				const BucketRow = (bucketHash: InventoryBucketHashes) => {
					bucketItemsVisibleCount = 0
					const bucketDef = inventory.buckets[bucketHash]
					return Part(`bucket:${bucketHash}/row`, part => part
						.style('inventory-view-bucket-row')
						.style.toggle(bucketDef.location !== ItemLocation.Inventory && bucketDef.location !== ItemLocation.Postmaster, 'inventory-view-bucket-row--profile')
						.append(BucketTitle(bucketHash))
						.append(Part(`bucket:${bucketHash}/content`, content => content
							.style.setProperty('display', 'contents')
						))
					)
				}

				const BucketTitle = (bucketHash: InventoryBucketHashes) => Component()
					.style('inventory-view-bucket-title')
					.text.set(inventory.buckets[bucketHash].displayProperties.name)

				const BucketWrapper = (id: string) => Part(id, part => part
					.style('inventory-view-bucket-wrapper')
				)

				const ItemList = (id: string) => Part(id, part => part
					.style('inventory-view-bucket-item-list')
				)

				const PlaceholderItem = (id: string) => Part(id, part => part
					.style('item', 'inventory-view-bucket-item-list-empty-slot', 'inventory-view-bucket-item-list-placeholder-slot')
				)

				const InventoryItem = (id: string, item: ItemInstance) => {
					const itemState = ItemState.resolve(item, inventory)
					return Part(id, itemState, (part, item) => {
						const transferDisplay = transferDisplayState.map(part, (transfers: InventoryTransferDisplayState) => getTransferDisplay(transfers, item.value))
						const itemComponent = part.and(Item, item)
						transferDisplay.use(itemComponent, (display: InventoryTransferDisplay) => {
							itemComponent.moving.value = display === 'pending'
							itemComponent.transferFailed.value = display === 'failure'
						})
						itemComponent.event.subscribe('click', event => transferItemOnClick(itemComponent, event))
					}) as Item
				}

				const appendPlaceholders = (list: Component, prefix: string, count: number) => {
					for (let i = 0; i < count; i++)
						PlaceholderItem(`${prefix}/placeholder:${i}`)
							.appendTo(list)
				}

				const ItemListFilteredDestination = (destination: Component) => ({
					isInsertionDestination: true as const,
					append (...contents: Parameters<Component['append']>) {
						for (const content of contents) {
							if (!content)
								continue

							const item = Component.get(content)?.as(Item)
							if (!item) {
								destination.append(content)
								continue
							}

							if (shouldFilterItems && display.filter.filter(item.state.value, false) === false) {
								Store.append(content)
								continue
							}

							bucketItemsVisibleCount++
							destination.append(content)
						}

						return this
					},
					prepend (...contents: Parameters<Component['append']>) {
						for (const content of [...contents].reverse()) {
							if (!content)
								continue

							const item = Component.get(content)?.as(Item)
							if (!item) {
								destination.prepend(content)
								continue
							}

							if (shouldFilterItems && display.filter.filter(item.state.value, false) === false) {
								Store.append(content)
								continue
							}

							bucketItemsVisibleCount++
							destination.prepend(content)
						}

						return this
					},
					insert (direction: 'before' | 'after', sibling: Component | Element | undefined, ...contents: Parameters<Component['append']>) {
						let cursor = sibling
						for (const content of contents) {
							if (!content)
								continue

							const item = Component.get(content)?.as(Item)
							if (!item) {
								destination.insert(direction, cursor, content)
								if (direction === 'after')
									cursor = Component.is(content) ? content : content instanceof Element ? content : cursor
								continue
							}

							if (shouldFilterItems && display.filter.filter(item.state.value, false) === false) {
								Store.append(content)
								continue
							}

							bucketItemsVisibleCount++
							destination.insert(direction, cursor, content)
							if (direction === 'after')
								cursor = item
						}

						return this
					},
				})

				const characters = Object.values(inventory.characters).sort((a, b) => new Date(b.metadata.dateLastPlayed).getTime() - new Date(a.metadata.dateLastPlayed).getTime())
				const equippedItemsByCharacterBucket = new Map<string, Map<InventoryBucketHashes, ItemInstance[]>>()
				const inventoryItemsByCharacterBucket = new Map<string, Map<InventoryBucketHashes, ItemInstance[]>>()
				const profileItemsByBucket = new Map<InventoryBucketHashes, ItemInstance[]>()
				const vaultItemsByBucket = new Map<InventoryBucketHashes, ItemInstance[]>()
				const bucketHashes = new Set<InventoryBucketHashes>()

				const addBucketItem = (map: Map<InventoryBucketHashes, ItemInstance[]>, bucketHash: InventoryBucketHashes, item: ItemInstance) => {
					bucketHashes.add(bucketHash)
					const items = map.get(bucketHash) ?? []
					items.push(item)
					map.set(bucketHash, items)
				}

				for (const character of characters) {
					const equippedByBucket = new Map<InventoryBucketHashes, ItemInstance[]>()
					const inventoryByBucket = new Map<InventoryBucketHashes, ItemInstance[]>()
					equippedItemsByCharacterBucket.set(character.id, equippedByBucket)
					inventoryItemsByCharacterBucket.set(character.id, inventoryByBucket)

					for (const item of character.equippedItems)
						addBucketItem(equippedByBucket, item.bucketHash, item)

					for (const item of character.items)
						addBucketItem(inventoryByBucket, item.bucketHash, item)
				}

				for (const item of inventory.profileItems) {
					const definitionBucketHash = inventory.items[item.itemHash].bucketHash
					if (!definitionBucketHash)
						continue

					addBucketItem(
						item.bucketHash === InventoryBucketHashes.General ? vaultItemsByBucket : profileItemsByBucket,
						definitionBucketHash,
						item,
					)
				}

				const transferItemOnClick = (itemComponent: Item, event: Event) => {
					if (!(event instanceof MouseEvent) || itemComponent.moving.value)
						return

					event.preventDefault()
					event.stopPropagation()
					void (event.ctrlKey
						? inventoryTransfers.vaultItem(itemComponent.state.value)
						: inventoryTransfers.equipItem(itemComponent.state.value)
					)
				}

				for (const character of characters) {
					Part(`character:${character.id}/header`, character, (part, character) => part
						.and(CharacterButton, character)
						.tweak(button => button.mode.value = 'expanded')
						.style('inventory-view-header-character-button')
					).appendTo(header)
				}

				const bucketOrder = [...bucketIcons?.keys() ?? []]
				const buckets = ([] as InventoryBucketHashes[])
					.concat([...bucketHashes])
					.distinct()
					.sort((a, b) => (bucketOrder.indexOf(a) + 1 || Infinity) - (bucketOrder.indexOf(b) + 1 || Infinity))

				for (const bucketHash of buckets) {
					const bucketIcon = bucketIcons?.get(bucketHash)
					if (!bucketIcon)
						continue

					const bucketRow = BucketRow(bucketHash)
					const bucketContent = Part(`bucket:${bucketHash}/content`)
					if (!bucketContent)
						continue

					// const inView = scrollTopState.map(bucketRow, scrollTop => scrollTop > bucketRow.element.offsetTop - 100)
					// await inView.await(bucketRow, true)

					////////////////////////////////////
					//#region Init bucket row

					const bucketDef = inventory.buckets[bucketHash]
					let hydrateBucketForClick: (() => void) | undefined
					const bucketButton = !bucketDef.displayProperties.name ? undefined :
						Part(`bucket:${bucketHash}/button`, part => part
							.and(Button)
							.style('inventory-view-nav-button', 'item')
							.tweak(GenericTooltip.apply, tooltip => tooltip
								.titleText.set(bucketDef.displayProperties.name)
								.descriptionText.set(bucketDef.displayProperties.description)
							)
							.event.subscribe('click', () => {
								hydrateBucketForClick?.()
								bucketRow.element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

					const renderBucketContents = async (destination: Parameters<Component['appendTo']>[0], cooperative = true) => {
						let hadOverfilledCharacter = false
						if (bucketDef.location === ItemLocation.Inventory || bucketDef.location === ItemLocation.Postmaster)
							for (const character of characters) {
								if (shouldCancelRender())
									return

								const bucketWrapper = BucketWrapper(`character:${character.id}/bucket:${bucketHash}`)
									.style('inventory-view-bucket-wrapper--character')
									.style.toggle(bucketHash === InventoryBucketHashes.LostItems, 'inventory-view-bucket-wrapper--lost-items')
									.appendTo(destination)

								const equippedItemList = ItemList(`character:${character.id}/bucket:${bucketHash}/equipped`)
									.style('inventory-view-bucket-item-list--equipped')
									.appendTo(bucketWrapper)
								const equippedItemListFiltered = ItemListFilteredDestination(equippedItemList)
								for (const item of equippedItemsByCharacterBucket.get(character.id)?.get(bucketHash) ?? []) {
									InventoryItem(`item:${item.id ?? `hash:${item.itemHash}`}`, item)
										.appendTo(equippedItemListFiltered)
									if (cooperative)
										await yieldRender()
									if (shouldCancelRender())
										return
								}

								const itemList = ItemList(`character:${character.id}/bucket:${bucketHash}/items`)
									.style('inventory-view-bucket-item-list--inventory')
									.style.toggle(bucketHash === InventoryBucketHashes.LostItems, 'inventory-view-bucket-item-list--lost-items')
									.appendTo(bucketWrapper)
								const itemListFiltered = ItemListFilteredDestination(itemList)
								let i = 0
								const hashAppearances: Record<number, number> = {}
								for (const item of inventoryItemsByCharacterBucket.get(character.id)?.get(bucketHash) ?? []) {
									i++
									hashAppearances[item.itemHash] ??= 0
									InventoryItem(`item:${item.id ?? `hash:${item.itemHash}/character:${character.id}/stack:${hashAppearances[item.itemHash]++}`}`, item)
										.appendTo(itemListFiltered)
									if (cooperative)
										await yieldRender()
									if (shouldCancelRender())
										return
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
									if (cooperative)
										await yieldRender()
									if (shouldCancelRender())
										return
								}
							}
						else {
							const profileBucketWrapper = BucketWrapper(`profile/bucket:${bucketHash}`)
								.style('inventory-view-bucket-wrapper--profile')
								.appendTo(destination)
							const itemList = ItemList(`profile/bucket:${bucketHash}/items`)
								.style('inventory-view-bucket-item-list--profile')
								.appendTo(profileBucketWrapper)
							const itemListFiltered = ItemListFilteredDestination(itemList)

							let i = 0
							const hashAppearances: Record<number, number> = {}
							for (const item of profileItemsByBucket.get(bucketHash) ?? []) {
								i++
								hashAppearances[item.itemHash] ??= 0
								InventoryItem(`profile/item:${item.id ?? `hash:${item.itemHash}`}/stack:${hashAppearances[item.itemHash]++}`, item)
									.appendTo(itemListFiltered)
								if (cooperative)
									await yieldRender()
								if (shouldCancelRender())
									return
							}

							const bucketInventorySlots = filterText ? 0 : bucketDef.itemCount
							for (; i < bucketInventorySlots; i++) {
								Part(`profile/bucket:${bucketHash}/empty:${i}`)
									.style('item', 'inventory-view-bucket-item-list-empty-slot')
									.appendTo(itemList)
								if (cooperative)
									await yieldRender()
								if (shouldCancelRender())
									return
							}
						}

						bucketRow.style.toggle(hadOverfilledCharacter, 'inventory-view-bucket-row--warning')
						bucketButton?.style.toggle(hadOverfilledCharacter, 'inventory-view-nav-button--warning')

						const vaultBucketWrapper = BucketWrapper(`vault/bucket:${bucketHash}`)
							.style('inventory-view-bucket-wrapper--vault')
							.style.toggle(bucketDef.location !== ItemLocation.Inventory, 'inventory-view-bucket-wrapper--vault--profile')
							.appendTo(destination)
						const itemList = ItemList(`vault/bucket:${bucketHash}/items`)
							.appendTo(vaultBucketWrapper)
						const itemListFiltered = ItemListFilteredDestination(itemList)

						const hashAppearances: Record<number, number> = {}
						for (const item of vaultItemsByBucket.get(bucketHash) ?? []) {
							hashAppearances[item.itemHash] ??= 0
							InventoryItem(`vault/item:${item.id ?? `hash:${item.itemHash}`}/stack:${hashAppearances[item.itemHash]++}`, item)
								.appendTo(itemListFiltered)
							if (cooperative)
								await yieldRender()
							if (shouldCancelRender())
								return
						}
					}

					const renderBucketPlaceholders = (destination: Parameters<Component['appendTo']>[0]) => {
						let hadOverfilledCharacter = false
						if (bucketDef.location === ItemLocation.Inventory || bucketDef.location === ItemLocation.Postmaster)
							for (const character of characters) {
								const bucketWrapper = Component()
									.style('inventory-view-bucket-wrapper', 'inventory-view-bucket-wrapper--character')
									.style.toggle(bucketHash === InventoryBucketHashes.LostItems, 'inventory-view-bucket-wrapper--lost-items')
									.appendTo(destination)

								const equippedItems = equippedItemsByCharacterBucket.get(character.id)?.get(bucketHash) ?? []
								const equippedItemList = Component()
									.style('inventory-view-bucket-item-list', 'inventory-view-bucket-item-list--equipped')
									.appendTo(bucketWrapper)
								appendPlaceholders(equippedItemList, `character:${character.id}/bucket:${bucketHash}/equipped`, equippedItems.length)

								const itemList = Component()
									.style('inventory-view-bucket-item-list', 'inventory-view-bucket-item-list--inventory')
									.style.toggle(bucketHash === InventoryBucketHashes.LostItems, 'inventory-view-bucket-item-list--lost-items')
									.appendTo(bucketWrapper)
								const bucketItems = inventoryItemsByCharacterBucket.get(character.id)?.get(bucketHash) ?? []
								const hasEquippedItem = +character.equippedItems.some(item => item.bucketHash === bucketHash)
								const bucketInventorySlots = bucketDef.itemCount - hasEquippedItem
								appendPlaceholders(itemList, `character:${character.id}/bucket:${bucketHash}/items`, Math.max(bucketItems.length, bucketInventorySlots))

								const isOverfilled = bucketHash === InventoryBucketHashes.LostItems && bucketItems.length / bucketDef.itemCount > 2 / 3
								hadOverfilledCharacter ||= isOverfilled
								bucketWrapper.style.toggle(isOverfilled, 'inventory-view-bucket-wrapper--warning')
							}
						else {
							const profileBucketWrapper = Component()
								.style('inventory-view-bucket-wrapper', 'inventory-view-bucket-wrapper--profile')
								.appendTo(destination)
							const itemList = Component()
								.style('inventory-view-bucket-item-list', 'inventory-view-bucket-item-list--profile')
								.appendTo(profileBucketWrapper)
							appendPlaceholders(itemList, `profile/bucket:${bucketHash}/items`, bucketDef.itemCount)
						}

						bucketRow.style.toggle(hadOverfilledCharacter, 'inventory-view-bucket-row--warning')
						bucketButton?.style.toggle(hadOverfilledCharacter, 'inventory-view-nav-button--warning')

						const vaultBucketWrapper = Component()
							.style('inventory-view-bucket-wrapper', 'inventory-view-bucket-wrapper--vault')
							.style.toggle(bucketDef.location !== ItemLocation.Inventory, 'inventory-view-bucket-wrapper--vault--profile')
							.appendTo(destination)
						const itemList = Component()
							.style('inventory-view-bucket-item-list')
							.appendTo(vaultBucketWrapper)
						appendPlaceholders(itemList, `vault/bucket:${bucketHash}/items`, vaultItemsByBucket.get(bucketHash)?.length ?? 0)
					}

					const isBucketNearViewport = () => {
						const rect = bucketRow.element?.getBoundingClientRect()
						if (!rect)
							return false

						const margin = 200
						return rect.bottom > -margin && rect.top < window.innerHeight + margin
					}

					const hydrateBucket = async (bucketHydrated: State.Mutable<boolean>) => {
						if (shouldCancelRender() || bucketHydrated.value || bucketHydrating.has(bucketHash))
							return

						bucketHydrating.add(bucketHash)
						const stagedContent = Component()
							.style.setProperty('display', 'contents')
						try {
							await renderBucketContents(stagedContent)
							if (shouldCancelRender())
								return

							bucketHydrated.value = true
							bucketRow
								.style.remove('inventory-view-bucket-row--placeholder')
								.style('inventory-view-bucket-row--hydrated')
							bucketContent.removeContents()
							bucketContent.append(...Component.getDomController(stagedContent).takeChildren())
							bucketHydrators.delete(bucketHash)
						}
						finally {
							stagedContent.remove()
							bucketHydrating.delete(bucketHash)
						}
					}

					//#endregion
					////////////////////////////////////

					const bucketHydrated = bucketHydratedStates.get(bucketHash) ?? State(false)
					bucketHydratedStates.set(bucketHash, bucketHydrated)
					hydrateBucketForClick = () => void hydrateBucket(bucketHydrated)
					if (shouldFilterItems || buckets.indexOf(bucketHash) === 0)
						bucketHydrated.value = true

					if (bucketHydrated.value) {
						bucketRow
							.style.remove('inventory-view-bucket-row--placeholder')
							.style('inventory-view-bucket-row--hydrated')
						bucketHydrators.delete(bucketHash)
						await renderBucketContents(bucketContent, false)
					}
					else {
						bucketContent.removeContents()
						bucketRow
							.style.remove('inventory-view-bucket-row--hydrated')
							.style('inventory-view-bucket-row--placeholder')
						renderBucketPlaceholders(bucketContent)
						bucketHydrators.set(bucketHash, () => {
							if (!bucketHydrated.value && isBucketNearViewport())
								void hydrateBucket(bucketHydrated)
						})
					}

					bucketRow.appendTo(bucketItemsVisibleCount || !filterText ? bucketList : Store)
					bucketButton?.appendTo(bucketItemsVisibleCount || !filterText ? bucketNavButtonList : Store)

					//#endregion
					////////////////////////////////////

					if (!renderedFirstBucket) {
						renderedFirstBucket = true
						INVENTORY_DIAGNOSTIC.mark('first-bucket-rendered')
						INVENTORY_DIAGNOSTIC.measure('data-to-first-bucket', 'data-ready', 'first-bucket-rendered')
					}

				}

				INVENTORY_DIAGNOSTIC.mark('render-complete')
				INVENTORY_DIAGNOSTIC.measure('data-to-render-complete', 'data-ready', 'render-complete')
				INVENTORY_DIAGNOSTIC.measure('render-duration', 'render-start', 'render-complete')

				if (isInitialContentRender) {
					isInitialContentRender = false
					completeInitialContentRender()
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

			Overlay(view).and(ItemOverlay, overlayState).bind(overlayState.map(view, s => !!s.definition))
		})

	await initialContentRendered
	if (signal.aborted)
		return

	view.loading.onLoad((loading, display) => {
		document.documentElement.scrollTop = 0
		initialScrollTopState && (initialScrollTopState.value = 0)
		if (initialContent && initialContentHost)
			initialContent.appendTo(initialContentHost)

		Loading()
			.style('inventory-view-refresh-wrapper')
			.setNormalTransitions()
			.viewTransitionSwipe('inventory-view-refresh-wrapper')
			.set(state, slot => Button()
				.style('inventory-view-refresh-button')
				.tweak(button => button
					.text.bind(State.Map(view, [Time.state, lastCheck, button.hoveredOrHasFocused], (elapsed, last, hovered) => quilt => quilt['view/data/versions/action/check'](!last || !hovered ? undefined : Time.relative(last, { components: 1 }))))
				)
				.event.subscribe('click', () => requestInventoryLoad('fresh'))
				.appendTo(slot)
			)
			.appendTo(view)

		display()
	})

	INVENTORY_DIAGNOSTIC.mark('loading-finish-requested')
	await view.loading.finish()
	INVENTORY_DIAGNOSTIC.mark('loading-finished')
})
