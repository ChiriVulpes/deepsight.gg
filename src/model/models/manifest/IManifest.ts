import type { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import type { IModelCache } from "model/ModelCacheDatabase";
import type Database from "utility/Database";
import type { AllClarityDatabaseComponents } from "utility/endpoint/clarity/endpoint/GetClarityDatabase";
import type { AllDeepsightManifestComponents } from "utility/endpoint/deepsight/endpoint/GetDeepsightManifest";

let manifestCacheUpdateTimeout: number;
function updateManifestCache () {
	clearTimeout(manifestCacheUpdateTimeout);
	// eslint-disable-next-line @typescript-eslint/no-misused-promises
	manifestCacheUpdateTimeout = window.setTimeout(async () => {
		await IManifest.ManifestCacheModel?.reset()
		await IManifest.ManifestCacheModel?.await();
	}, 1000);
}

let setLoadedManifestCache1!: () => void;
const loadedManifestCache = new Promise<void>(resolve => setLoadedManifestCache1 = resolve);

export namespace IManifest {
	export function elapsed (elapsed: number) {
		if (elapsed < 1)
			return `${Math.floor(elapsed * 1_000)} μs`

		if (elapsed < 1_000)
			return `${Math.floor(elapsed)} ms`;

		if (elapsed < 60_000)
			return `${+(elapsed / 1_000).toFixed(2)} s`;

		return `${+(elapsed / 60_000).toFixed(2)} m`;
	}

	export interface CombinedManifest extends AllDestinyManifestComponents, AllDeepsightManifestComponents, AllClarityDatabaseComponents { }

	export type AllComponentNames = keyof CombinedManifest;

	export type Indices<COMPONENT_NAME extends AllComponentNames> =
		{
			DeepsightSourceDefinition: "iconWatermark" | "id";
			DestinyInventoryItemDefinition: "iconWatermark";
			DestinyRecordDefinition: "icon" | "name";
		} extends infer ALL_INDICES ?
		ALL_INDICES[COMPONENT_NAME & keyof ALL_INDICES]
		: never;

	export type Component<COMPONENT_NAME extends AllComponentNames> = CombinedManifest[COMPONENT_NAME][number];

	export type ComponentKey<COMPONENT_NAME extends AllComponentNames = AllComponentNames> =
		`manifest [${COMPONENT_NAME}]`;

	export type IModelCacheManifestComponents =
		{ [COMPONENT_NAME in AllComponentNames as ComponentKey<COMPONENT_NAME>]: Component<COMPONENT_NAME> };

	export type ManifestItemCache<COMPONENT_NAME extends AllComponentNames = AllComponentNames> = Record<string, Component<COMPONENT_NAME> | Promise<Component<COMPONENT_NAME> | undefined> | undefined>;

	export type ManifestCache = { [COMPONENT_NAME in AllComponentNames]: ManifestItemCache };

	export namespace CacheComponentKey {
		export function get<COMPONENT_NAME extends AllComponentNames> (componentName: COMPONENT_NAME) {
			return `manifest [${componentName}]` as const;
		}
	}

	export const MANIFEST_CACHE_MODEL_KEY = "manifest cache";

	export let ManifestCacheModel: Model<ManifestCache> | undefined;

	export let loadCache: (() => Promise<void>) | undefined;
	export const setLoadedManifestCache = setLoadedManifestCache1;
}

declare module "model/ModelCacheDatabase" {
	interface IModelCache extends IManifest.IModelCacheManifestComponents { }
}

export class ManifestItem<COMPONENT_NAME extends IManifest.AllComponentNames> {

	private memoryCache: IManifest.ManifestItemCache<COMPONENT_NAME> = {};

	private readonly stagedTransaction: Database.StagedTransaction<Pick<IModelCache, IManifest.ComponentKey<COMPONENT_NAME>>, [IManifest.ComponentKey<COMPONENT_NAME>]>;

	public constructor (private readonly componentName: IManifest.ComponentKey<COMPONENT_NAME>) {
		this.stagedTransaction = Model.cacheDB.stagedTransaction([componentName]);
	}

	public get (key?: string | number | null, cached?: boolean): IManifest.Component<COMPONENT_NAME> | Promise<IManifest.Component<COMPONENT_NAME>> | undefined;
	public get (index: IManifest.Indices<COMPONENT_NAME>, key: string | number | null, cached?: boolean): IManifest.Component<COMPONENT_NAME> | Promise<IManifest.Component<COMPONENT_NAME>> | undefined;
	public get (index?: string | number | null, key?: string | number | null | boolean, cached = true): any {
		if (typeof key === "boolean")
			cached = key, key = undefined;

		if (key === undefined)
			key = index, index = undefined;

		if (key === undefined || key === null)
			return undefined;

		const memoryCacheKey = `${index ?? "/"}:${key}`;
		if (this.memoryCache[memoryCacheKey])
			return this.memoryCache[memoryCacheKey] ?? undefined;

		return this.resolve(memoryCacheKey, key, index, cached);
	}

	private async resolve (memoryCacheKey: string, key: string | number, index?: string | number | null, cached = true) {
		void IManifest.loadCache?.();
		await loadedManifestCache;

		if (memoryCacheKey in this.memoryCache)
			return this.memoryCache[memoryCacheKey] ?? undefined;

		const promise = this.stagedTransaction.get(this.componentName, `${key}`, index as string | undefined)
			.then(value => {
				if (cached) {
					this.memoryCache[memoryCacheKey] = value ?? null as never;
					updateManifestCache();
				}

				return value ?? undefined;
			});

		if (cached)
			this.memoryCache[memoryCacheKey] = promise;

		return promise;
	}

	public all (): Promise<IManifest.Component<COMPONENT_NAME>[]>;
	public all (index: IManifest.Indices<COMPONENT_NAME>, key: string | number | null): Promise<IManifest.Component<COMPONENT_NAME>[]>;
	public all (index?: string, key?: string | number | null) {
		if (index)
			return this.stagedTransaction.all(this.componentName, `${key!}`, index);
		return this.stagedTransaction.all(this.componentName);
	}

	public createCache () {
		return JSON.parse(JSON.stringify(this.memoryCache));
	}

	public updateCache (value: IManifest.ManifestItemCache<COMPONENT_NAME>) {
		this.memoryCache = value;
	}
}
