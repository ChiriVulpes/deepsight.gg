import { ActivityModeHashes, ActivityTypeHashes } from '@deepsight.gg/enums'
import type { DeepsightDropTableDefinition } from '@deepsight.gg/interfaces'
import { DestinyActivityModeType } from 'bungie-api-ts/destiny2/interfaces'
import type Inventory from 'model/models/Inventory'
import type Manifest from 'model/models/Manifest'
import type ProfileBatch from 'model/models/ProfileBatch'
import Item from 'model/models/items/Item'
import Component from 'ui/component/Component'
import Details from 'ui/component/Details'
import Paginator from 'ui/component/Paginator'
import type { DisplayPropertied } from 'ui/utility/DisplayProperties'
import { CollectionsCurrentlyAvailableActivity } from 'ui/view/collections/CollectionsCurrentlyAvailableActivity'
import { CollectionsMomentClasses } from 'ui/view/collections/CollectionsMoment'
import Arrays from 'utility/Arrays'
import Objects from 'utility/Objects'

export enum CollectionsCurrentlyAvailableClasses {
	Main = 'view-collections-currently-available',
	Heading = 'view-collections-currently-available-heading',
	ActivityWrapperPaginator = 'view-collections-currently-available-activity-wrapper-paginator',
	ActivityWrapperPaginatorButton = 'view-collections-currently-available-activity-wrapper-paginator-button',
	ActivityWrapper = 'view-collections-currently-available-activity-wrapper',
	ActivityWrapperPage = 'view-collections-currently-available-activity-wrapper-page',
}

const activityOrder = Object.keys({
	'trials': true,
	'lost-sector': true,
	'nightfall': true,
	'raid': true,
	'dungeon': true,
	'exotic-mission': true,
	'bonus-focus': true,
} satisfies Record<DeepsightDropTableDefinition['type'], true>)

const availabilityOrder = ['rotator', 'new', 'repeatable', undefined]

export default class CollectionsCurrentlyAvailable extends Details<[manifest: Manifest, profile?: ProfileBatch, inventory?: Inventory]> {

	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	protected override async onMake (manifest: Manifest, profile?: ProfileBatch, inventory?: Inventory) {
		super.onMake(manifest, profile, inventory)
		this.classes.add(CollectionsCurrentlyAvailableClasses.Main, CollectionsMomentClasses.Moment)

		this.summary.text.set('Currently Available')
		this.open()

		const items = await this.discoverItems(manifest, profile)

		const sources = items.flatMap(item => item.sources ?? Arrays.EMPTY)
			.map(source => source.masterActivityDefinition && (source.isActiveMasterDrop || source.masterActivityDefinition?.activityModeTypes?.includes(DestinyActivityModeType.ScoredNightfall))
				? Arrays.tuple(source.dropTable.hash, source.masterActivityDefinition, source)
				: Arrays.tuple(source.dropTable.hash, source.activityDefinition, source))
			.sort(([, , a], [, , b]) => a.type - b.type)
		// .filter((source): source is [number, DestinyActivityDefinition, ISource] => !!source);

		const activityWrapper = Paginator.create()
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPaginator)
			.appendTo(this)

		activityWrapper.pageWrapper.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapper)
		activityWrapper.buttonNext.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPaginatorButton)
		activityWrapper.buttonPrev.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPaginatorButton)

		const activityFiller = activityWrapper.filler(Component.window.width < 1200 ? 3 : 4, page => page
			.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPage))

		const { DestinyActivityTypeDefinition, DestinyActivityModeDefinition } = manifest

		const added = new Set<number>()
		const activityCards: CollectionsCurrentlyAvailableActivity[] = []
		for (const [hash, activity, source] of sources) {
			if (added.has(hash))
				continue

			if (source.endTime && new Date(source.endTime).getTime() < Date.now())
				continue

			added.add(hash)

			const sourceItems = items.filter(item => item.sources?.some(source => source.dropTable.hash === hash && (false
				|| item.definition.hash in (source.dropTable.dropTable ?? Objects.EMPTY)
				|| source.dropTable.encounters?.some(encounter => item.definition.hash in (encounter.dropTable ?? Objects.EMPTY))
				|| source.isActiveDrop
				|| source.isActiveMasterDrop)))

			if (!sourceItems.length)
				continue

			// eslint-disable-next-line no-constant-condition
			const activityType: DisplayPropertied | undefined = false ? undefined
				// dungeon type doesn't have icon, use mode instead
				: activity.activityTypeHash === ActivityTypeHashes.Dungeon ? await DestinyActivityModeDefinition.get(ActivityModeHashes.Dungeon)
					// trials type doesn't have icon, use mode instead
					: activity.activityTypeHash === ActivityTypeHashes.TrialsOfOsiris ? await DestinyActivityModeDefinition.get(ActivityModeHashes.TrialsOfOsiris)
						// lost sector type doesn't have icon, use mode instead
						: activity.activityTypeHash === ActivityTypeHashes.LostSector ? await DestinyActivityModeDefinition.get(ActivityModeHashes.LostSector)
							: await DestinyActivityTypeDefinition.get(activity.activityTypeHash)

			activityCards.push(CollectionsCurrentlyAvailableActivity.create([activity, source, activityType, sourceItems, inventory])
				.event.subscribe('mouseenter', () => console.log(activity?.displayProperties?.name, activity, source)))
		}

		activityCards
			.sort((a, b) => activityOrder.indexOf(a.source.dropTable.type) - activityOrder.indexOf(b.source.dropTable.type))
			.sort((a, b) => availabilityOrder.indexOf(a.source.dropTable.availability) - availabilityOrder.indexOf(b.source.dropTable.availability))
			.forEach(card => card.appendTo(activityFiller.increment()))
	}

	private async discoverItems (manifest: Manifest, profile?: ProfileBatch) {
		const itemHashes = new Set<number>()

		const { DeepsightDropTableDefinition, DestinyInventoryItemDefinition, DestinyActivityDefinition } = manifest

		const bonusFocusHashes = new Set<number>()
		const dropTables = await DeepsightDropTableDefinition.all()
		for (const source of dropTables) {
			const masterActivityDefinition = await DestinyActivityDefinition.get(source.master?.activityHash)

			const intervals = source.rotations?.current ?? 0

			if (source.availability) {
				for (const dropHash of Object.keys(source.dropTable ?? Objects.EMPTY)) {
					if (source.type === 'bonus-focus')
						bonusFocusHashes.add(+dropHash)

					itemHashes.add(+dropHash)
				}

				for (const encounter of source.encounters ?? [])
					for (const dropHash of Object.keys(encounter.dropTable ?? Objects.EMPTY))
						itemHashes.add(+dropHash)

				if (source.rotations) {
					const drop = resolveRotation(source.rotations.drops, intervals)
					if (typeof drop === 'number')
						itemHashes.add(drop)
					else if (typeof drop === 'object')
						for (const id of Object.keys(drop))
							itemHashes.add(+id)
				}
			}

			if (masterActivityDefinition) {
				if (source.rotations) {
					const masterDrop = resolveRotation(source.rotations.masterDrops, intervals)
					if (typeof masterDrop === 'number')
						itemHashes.add(masterDrop)
					else if (typeof masterDrop === 'object')
						for (const id of Object.keys(masterDrop))
							itemHashes.add(+id)
				}

				for (const dropHash of Object.keys(source.master?.dropTable ?? Objects.EMPTY))
					itemHashes.add(+dropHash)
			}
		}

		// let start = Date.now();
		const defs = await Promise.all(Array.from(itemHashes).map(hash => DestinyInventoryItemDefinition.get(hash)))
		// console.log("defs", Date.now() - start);
		// start = Date.now();
		const items = await Promise.all(defs.map(def => def && Item.createFake(manifest, profile ?? {}, def)))
		// console.log("fake items", Date.now() - start);
		return items.filter((item): item is Item => !!item && (bonusFocusHashes.has(item.definition.hash) || item.isWeapon() || item.isExotic()))
	}

}

function resolveRotation<T> (rotation: T[] | undefined, interval: number) {
	return !rotation?.length ? undefined : rotation?.[interval % rotation.length]
}
