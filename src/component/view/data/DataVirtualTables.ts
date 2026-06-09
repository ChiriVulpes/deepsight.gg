import type { PgcrsPageEntry, PgcrStatus } from 'conduit.deepsight.gg/ConduitMessageRegistry'
import type { AllComponentNames } from 'conduit.deepsight.gg/DefinitionComponents'
import type { DefinitionLinks, DefinitionsPage, DefinitionWithLinks } from 'conduit.deepsight.gg/DefinitionComponents'
import type { DefinitionsFilter } from 'conduit.deepsight.gg/Definitions'
import type { Profile } from 'conduit.deepsight.gg/Profile'
import ProfileModel from 'model/Profile'
import Relic from 'Relic'
import { _ } from 'utility/Objects'
import { setDataPresentation } from './DataPresentation'
import type { VirtualTableName } from './DataTable'

type VirtualDefinition = VirtualProfileDefinition | VirtualPgcrDefinition

interface VirtualProfileDefinition extends Profile {
	hash: string
}

interface VirtualPgcrDefinition extends PgcrsPageEntry {
	hash: string
	profile: Profile
	pgcrStatus: PgcrStatus
}

namespace DataVirtualTables {

	const singleCache = new Map<string, DefinitionWithLinks<object>>()

	export async function page (table: VirtualTableName, pageSize: number, page: number, filters?: DefinitionsFilter<object>): Promise<DefinitionsPage<object>> {
		switch (table) {
			case 'profiles':
				return toPage(table, await getProfiles(), pageSize, page, filters)
			case 'pgcrs':
				return await getPgcrsPage(pageSize, page, filters)
		}
	}

	export async function full (table: VirtualTableName, filters?: DefinitionsFilter<object>): Promise<DefinitionWithLinks<object>> {
		const definitions = await page(table, Number.MAX_SAFE_INTEGER, 0, filters)
		return {
			definition: definitions.definitions,
		}
	}

	export async function getWithLinks (table: VirtualTableName, hash: number | string): Promise<DefinitionWithLinks<object> | undefined> {
		const cacheKey = getCacheKey(table, hash)
		const cached = singleCache.get(cacheKey)
		if (cached)
			return cached

		if (table === 'profiles') {
			const profile = (await getProfiles()).find(profile => `${profile.hash}` === `${hash}`)
			return profile && cache(table, hash, profile, await getLinks(table, profile))
		}

		const page = await getPgcrsPage(250, 0)
		const pgcr = page.definitions[hash]
		if (!pgcr)
			return undefined

		return singleCache.get(cacheKey)
	}

	export async function getReferencesPage (pageSize: number, page: number) {
		return {
			page,
			pageSize,
			totalPages: 0,
			totalReferences: 0,
			references: {},
		}
	}

	async function getProfiles (): Promise<VirtualProfileDefinition[]> {
		await ProfileModel.init()
		return ProfileModel.STATE.value.all.map(profile => ({
			...profile,
			hash: profile.id,
		}))
	}

	async function getPgcrsPage (pageSize: number, page: number, filters?: DefinitionsFilter<object>): Promise<DefinitionsPage<object>> {
		const empty = {
			definitions: {},
			page,
			pageSize,
			totalPages: 0,
			totalDefinitions: 0,
		}
		if (!componentMatchesFilter('pgcrs', filters))
			return empty

		await ProfileModel.init()
		const profile = _
			?? ProfileModel.STATE.value.selected
			?? ProfileModel.STATE.value.all.find(profile => profile.authed)
		if (!profile?.authed)
			return empty

		const conduit = await Relic.connected
		const pgcrs = await conduit.getPgcrs(profile.name, profile.code ?? 0, pageSize, page)
		if (!pgcrs)
			return empty

		const entries = (await Promise.all(pgcrs.entries
			.map(async entry => {
				const definition = {
					...entry,
					hash: entry.activity.activityDetails.instanceId,
					profile: pgcrs.profile,
				} satisfies VirtualPgcrDefinition
				return await hydratePgcrPresentation(definition)
			})))
			.filter(definition => definitionMatchesFilter(definition, filters))

		for (const entry of entries)
			void getLinks('pgcrs', entry).then(links => cache('pgcrs', entry.hash, entry, links))

		return {
			definitions: entries.toObject(entry => [entry.hash, entry]),
			page: pgcrs.page,
			pageSize: pgcrs.pageSize,
			totalPages: pgcrs.totalPages ?? pgcrs.page + (pgcrs.hasMore ? 2 : 1),
			totalDefinitions: pgcrs.totalActivities ?? pgcrs.page * pgcrs.pageSize + pgcrs.entries.length + (pgcrs.hasMore ? 1 : 0),
		}
	}

	async function hydratePgcrPresentation (definition: VirtualPgcrDefinition): Promise<VirtualPgcrDefinition> {
		const conduit = await Relic.connected
		const activityHash = definition.activity.activityDetails.directorActivityHash || definition.activity.activityDetails.referenceId
		const activity = await conduit.definitions.en.DestinyActivityDefinition.get(activityHash)
			?? await conduit.definitions.en.DestinyActivityDefinition.get(definition.activity.activityDetails.referenceId)

		const durationSeconds = Number(definition.activity.values.activityDurationSeconds?.basic?.value)
		return setDataPresentation(definition, {
			pgcr: {
				activityName: activity?.displayProperties.name,
				activityIcon: activity?.displayProperties.icon || activity?.pgcrImage,
				durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : undefined,
				period: definition.activity.period,
			},
		})
	}

	function toPage (table: VirtualTableName, definitions: VirtualDefinition[], pageSize: number, page: number, filters?: DefinitionsFilter<object>): DefinitionsPage<object> {
		if (!componentMatchesFilter(table, filters))
			definitions = []
		else
			definitions = definitions.filter(definition => definitionMatchesFilter(definition, filters))

		const start = page * pageSize
		for (const definition of definitions)
			void getLinks(table, definition).then(links => cache(table, definition.hash, definition, links))

		return {
			definitions: definitions
				.slice(start, start + pageSize)
				.toObject(definition => [definition.hash, definition]),
			page,
			pageSize,
			totalPages: Math.ceil(definitions.length / pageSize),
			totalDefinitions: definitions.length,
		}
	}

	async function getLinks (table: VirtualTableName, definition: object): Promise<DefinitionLinks> {
		const conduit = await Relic.connected
		const { components, enums } = await conduit.definitions.en.DeepsightLinksDefinition.all()
		const links = (components as Partial<Record<VirtualTableName, NonNullable<typeof components[keyof typeof components]>>>)[table]?.links

		const usedEnums: DefinitionLinks['enums'] = {}
		const definitions: DefinitionLinks['definitions'] = {}
		const defsToGrab = new Map<AllComponentNames, Set<number | string>>()

		for (const link of links ?? []) {
			if ('enum' in link) {
				usedEnums[link.enum] ??= enums[link.enum]
				continue
			}

			const hashes = followLinkPath(definition, link.path.split('.'))
			if (!hashes.length)
				continue

			let set = defsToGrab.get(link.component)
			if (!set) {
				set = new Set()
				defsToGrab.set(link.component, set)
			}

			for (const hash of hashes)
				set.add(hash)
		}

		await Promise.all(defsToGrab.entries().toArray()
			.map(async ([component, hashes]) => {
				await Promise.all(hashes.values().toArray().map(async hash => {
					const def = await conduit.definitions.en[component as Exclude<AllComponentNames, 'DeepsightStats'>].get(hash)
					if (!def)
						return

					definitions[component] ??= {} as never
					definitions[component][hash as never] = def as never
				}))
			})
		)

		return {
			links,
			enums: Object.keys(usedEnums).length ? usedEnums : undefined,
			definitions: Object.keys(definitions).length ? definitions : undefined,
		}
	}

	function cache (table: VirtualTableName, hash: number | string, definition: object, links?: DefinitionLinks) {
		const result = { definition, links }
		singleCache.set(getCacheKey(table, hash), result)
		return result
	}

	function getCacheKey (table: VirtualTableName, hash: number | string) {
		return `${table}:${hash}`
	}

	function componentMatchesFilter (table: VirtualTableName, filters?: DefinitionsFilter<object>) {
		const componentNameContains = toArray(filters?.componentNameContains)
		if (!componentNameContains.length)
			return true

		return componentNameContains.some(term => table.includes(term.toLowerCase()))
	}

	function definitionMatchesFilter (definition: object, filters?: DefinitionsFilter<object>) {
		const searchText = JSON.stringify(definition).toLowerCase()
		const nameContainsOrHashIs = toArray(filters?.nameContainsOrHashIs)
		if (nameContainsOrHashIs.some(term => !searchText.includes(term.toLowerCase())))
			return false

		const deepContains = toArray(filters?.deepContains)
		if (deepContains.some(term => !searchText.includes(term.toLowerCase())))
			return false

		if (filters?.jsonPathExpression)
			return false

		return true
	}

	function toArray (value?: string | string[]) {
		return !value ? [] : Array.isArray(value) ? value : [value]
	}

	function followLinkPath (obj: any, path: (string | number)[]): (number | string)[] {
		if (!path.length && (typeof obj === 'number' || typeof obj === 'string'))
			return [obj]

		if (!obj || typeof obj !== 'object')
			return []

		const key = path.shift()
		if (!key)
			return []

		if (key === '[]') {
			if (!Array.isArray(obj))
				return []

			if (!path.length)
				return obj.filter(item => typeof item === 'number' || typeof item === 'string')

			return obj.flatMap((item: any) => followLinkPath(item, path.slice()))
		}

		if (key === '{}') {
			if (!path.length)
				return Object.keys(obj)

			return Object.values(obj).flatMap(value => followLinkPath(value, path.slice()))
		}

		return followLinkPath(obj[key], path)
	}
}

export default DataVirtualTables
