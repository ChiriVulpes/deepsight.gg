import Arrays from "utility/Arrays";
import { EventManager } from "utility/EventManager";
import Objects from "utility/Objects";
import Store from "utility/Store";

type Version = [major: number, minor: number];
namespace Version {
	export function encode (...[major, minor]: Version) {
		return (Math.min(major, 2 ** 16) << 16) | Math.min(minor, 2 ** 16);
	}

	export function decode (encoded: number): Version {
		return [encoded >> 16, encoded & 0b1111_1111_1111_1111];
	}
}

class Database<SCHEMA> {

	public readonly event = new EventManager<this, Database.IEvents>(this);

	private database?: IDBDatabase | Promise<IDBDatabase>;

	public async getDatabase () {
		if (this.database)
			return this.database;

		return this.open();
	}

	public constructor (private readonly schema: Database.Schema<SCHEMA>) { }

	public async get<KEY extends keyof SCHEMA> (store: KEY, key: string, index?: string): Promise<SCHEMA[KEY] | undefined> {
		return this.transaction([store], "readonly", transaction => transaction.get(store, key, index));
	}

	public async all<KEY extends keyof SCHEMA> (store: KEY, range?: IDBKeyRange): Promise<SCHEMA[KEY][]>;
	public async all<KEY extends keyof SCHEMA> (store: KEY, key: IDBKeyRange | string, index: string): Promise<SCHEMA[KEY][]>;
	public async all<KEY extends keyof SCHEMA> (store: KEY, rangeOrKey?: IDBKeyRange | string, index?: string): Promise<SCHEMA[KEY][]> {
		return this.transaction([store], "readonly", transaction => transaction.all(store, rangeOrKey as string, index as string));
	}

	public async set<KEY extends keyof SCHEMA> (store: KEY, key: string, value: SCHEMA[KEY]) {
		return this.transaction([store], transaction => transaction.set(store, key, value));
	}

	public async delete (store: keyof SCHEMA, key: string) {
		return this.transaction([store], transaction => transaction.delete(store, key));
	}

	public async keys (store: keyof SCHEMA) {
		return this.transaction([store], "readonly", transaction => transaction.keys(store));
	}

	public async count (store: keyof SCHEMA) {
		return this.transaction([store], "readonly", transaction => transaction.count(store));
	}

	public async clear (store: keyof SCHEMA) {
		return this.transaction([store], transaction => transaction.clear(store));
	}

	public async transaction<STORES extends (keyof SCHEMA)[], T> (over: STORES, mode: IDBTransactionMode, transaction: Database.Transaction.Initialiser<SCHEMA, STORES, T>): Promise<T>;
	public async transaction<STORES extends (keyof SCHEMA)[], T> (over: STORES, transaction: Database.Transaction.Initialiser<SCHEMA, STORES, T>): Promise<T>;
	public async transaction<STORES extends (keyof SCHEMA)[], T> (over: STORES, modeOrTransaction: IDBTransactionMode | Database.Transaction.Initialiser<SCHEMA, STORES, T>, transaction?: Database.Transaction.Initialiser<SCHEMA, STORES, T>) {
		if (typeof modeOrTransaction !== "string") {
			transaction = modeOrTransaction;
			modeOrTransaction = "readwrite";
		}

		const database = await this.getDatabase();
		const instance = new Database.Transaction<Pick<SCHEMA, STORES[number]>>(database.transaction(over as string[], modeOrTransaction));
		const result = await transaction!(instance);
		await instance.commit();
		return result;
	}

	public stagedTransaction<STORES extends (keyof SCHEMA)[]> (over: STORES, mode: IDBTransactionMode = "readwrite"): Database.StagedTransaction<Pick<SCHEMA, STORES[number]>, STORES> {
		return new Database.StagedTransaction<Pick<SCHEMA, STORES[number]>, STORES>(this, over, mode);
	}

	public async upgrade (upgrade: Database.Upgrade) {
		await this.close();
		const [, databaseVersionMinor] = (await this.getVersion()) ?? [];
		await this.open((databaseVersionMinor ?? 0) + 1, upgrade);
	}

	public async stores () {
		const database = await this.getDatabase();
		return database.objectStoreNames;
	}

	public async hasStore (...stores: (keyof SCHEMA)[]) {
		const database = await this.getDatabase();
		return stores.every(store => database.objectStoreNames.contains(store as string));
	}

	public async createStore (store: keyof SCHEMA, options?: IDBObjectStoreParameters, init?: (store: IDBObjectStore) => any) {
		if (await this.hasStore(store))
			return;

		await this.upgrade(async upgrade => {
			await init?.(upgrade.createObjectStore(store as string, options));
		});
	}

	public async dispose () {
		await this.close();
		return new Promise<void>((resolve, reject) => {
			const request = indexedDB.deleteDatabase(this.schema.id);
			request.addEventListener("success", () => resolve());
			request.addEventListener("blocked", () =>
				reject(new Error(`Cannot delete database '${this.schema.id}', blocked`)));
			request.addEventListener("error", () =>
				reject(new Error(`Cannot delete database '${this.schema.id}', error: ${request.error?.message ?? "Unknown error"}`)));
		});
	}

	private getVersion () {
		// const databaseInfo = (await indexedDB.databases()).find(({ name }) => name === this.schema.id);
		const databaseInfo = Store.items.databases?.find(({ name }) => name === this.schema.id);
		return databaseInfo?.version ? Version.decode(databaseInfo.version) : undefined;
	}

	private async open (versionMinor?: number, upgrade?: Database.Upgrade) {
		if (!this.schema.versions.length)
			throw new Error(`No versions in schema for database '${this.schema.id}'`);

		// eslint-disable-next-line @typescript-eslint/no-misused-promises,  no-async-promise-executor
		const databasePromise = new Promise<IDBDatabase>(async (resolve, reject) => {
			const [, databaseVersionMinor] = (await this.getVersion()) ?? [];
			const newVersion = Version.encode(this.schema.versions.length, versionMinor ?? databaseVersionMinor ?? 0);
			const request = indexedDB.open(this.schema.id, newVersion);

			request.addEventListener("blocked", () => {
				console.log("blocked");
			});

			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			request.addEventListener("upgradeneeded", async (event: IDBVersionChangeEvent) => {
				const transaction = request.transaction;
				if (!transaction)
					return;

				const database = request.result;
				const [versionMajor] = Version.decode(event.newVersion ?? newVersion);
				const [oldVersionMajor] = Version.decode(event.oldVersion);
				for (let i = oldVersionMajor; i < versionMajor; i++)
					await this.schema.versions[i](database, transaction);

				await upgrade?.(database, transaction);

				const databases = Store.items.databases ?? [];
				const databaseInfo = databases.find(({ name }) => name === this.schema.id);
				if (databaseInfo)
					databaseInfo.version = newVersion;
				else
					databases.push({ name: this.schema.id, version: newVersion });

				Store.items.databases = databases;
			});

			request.addEventListener("error", () => {
				console.log("aaaaaaaaaaaaaaaaaaaa");
				if (request.error?.message.includes("version")) {
					console.info(`Database '${this.schema.id}' is from the future and must be disposed`);
					delete this.database;
					void this.dispose().then(() => {
						resolve(this.open(versionMinor, upgrade));
					});
					return;
				}

				reject(new Error(`Cannot create database '${this.schema.id}', error: ${request.error?.message ?? "Unknown error"}`));
			});

			request.addEventListener("success", () =>
				resolve(request.result));
		});

		this.database = databasePromise;

		const database = await databasePromise;

		database.addEventListener("close", () => {
			delete this.database;
			this.event.emit("close");
		});

		this.database = database;
		this.event.emit("open");
		return database;
	}

	private async close () {
		if (!this.database)
			return;

		const database = this.database;
		delete this.database;
		(await database).close();
	}
}

namespace Database {

	export type Upgrade = (database: IDBDatabase, transaction: IDBTransaction) => any;
	export interface Schema<SCHEMA> {
		_schema: SCHEMA;
		id: string;
		versions: Database.Upgrade[];
	}

	export function schema<SCHEMA> (id: string, ...versions: Database.Upgrade[]): Schema<SCHEMA> {
		return {
			_schema: null as any as SCHEMA,
			id,
			versions,
		};
	}

	export interface IEvents {
		open: Event;
		close: Event;
	}

	export class Transaction<SCHEMA> {

		public readonly event = new EventManager<this, Transaction.IEvents>(this);

		private complete = false;
		private errored = false;

		public constructor (private readonly transaction: IDBTransaction) {
			this.transaction.addEventListener("complete", () => {
				this.complete = true;
				this.event.emit("complete");
			});
			this.transaction.addEventListener("error", () => {
				this.errored = true;
				this.event.emit("error", { error: this.transaction.error! });
			});
		}

		public async get<KEY extends keyof SCHEMA> (name: KEY, key: string, index?: string) {
			return this.do<SCHEMA[KEY] | undefined>(() => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				let store: IDBObjectStore | IDBIndex = this.transaction.objectStore(name as string);

				if (index !== undefined)
					store = store.index(index);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return store.get(key);
			});
		}

		public async all<KEY extends keyof SCHEMA> (name: KEY, range?: IDBValidKey | IDBKeyRange): Promise<SCHEMA[KEY][]>;
		public async all<KEY extends keyof SCHEMA> (name: KEY, key: IDBValidKey | IDBKeyRange | string, index?: string): Promise<SCHEMA[KEY][]>;
		public async all<KEY extends keyof SCHEMA> (name: KEY, rangeOrKey?: IDBValidKey | IDBKeyRange | string, index?: string) {
			if (Array.isArray(rangeOrKey)) {
				return new Promise<SCHEMA[KEY][]>((resolve, reject) => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-return
					let store: IDBObjectStore | IDBIndex = this.transaction.objectStore(name as string);

					if (index !== undefined)
						store = store.index(index);

					const result: SCHEMA[KEY][] = [];
					const request = store.openCursor();
					request.addEventListener("error", () => reject(request.error));
					request.addEventListener("success", event => {
						const cursor = request.result;
						if (!cursor)
							return resolve(result);

						if (rangeOrKey.includes(cursor.key) || (!isNaN(+cursor.key) && rangeOrKey.includes(+cursor.key)))
							result.push(cursor.value as SCHEMA[KEY]);

						cursor.continue();
					});
				});
			}

			return this.do<SCHEMA[KEY][]>(() => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				let store: IDBObjectStore | IDBIndex = this.transaction.objectStore(name as string);

				if (index !== undefined)
					store = store.index(index);

				if (typeof rangeOrKey === "string")
					return store.getAll(rangeOrKey);

				return store.getAll(rangeOrKey);
			});
		}

		public async primaryKeys<KEY extends keyof SCHEMA> (name: KEY, range?: IDBKeyRange): Promise<IDBValidKey[]>;
		public async primaryKeys<KEY extends keyof SCHEMA> (name: KEY, key?: IDBKeyRange | string, index?: string): Promise<IDBValidKey[]>;
		public async primaryKeys<KEY extends keyof SCHEMA> (name: KEY, rangeOrKey?: IDBKeyRange | string, index?: string) {
			return this.do<IDBValidKey[]>(() => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				let store: IDBObjectStore | IDBIndex = this.transaction.objectStore(name as string);

				if (index !== undefined)
					store = store.index(index);

				return store.getAllKeys(rangeOrKey);
			});
		}


		public async indexKeys<KEY extends keyof SCHEMA> (store: KEY, index: string): Promise<IDBValidKey[]>;
		public async indexKeys<KEY extends keyof SCHEMA, R> (store: KEY, index: string, mapper: (key: IDBValidKey, value: SCHEMA[KEY]) => R): Promise<R[]>;
		public async indexKeys<KEY extends keyof SCHEMA> (name: KEY, index: string, mapper?: (key: IDBValidKey, value: SCHEMA[KEY]) => any) {
			return new Promise<IDBValidKey[]>((resolve, reject) => {
				const store = this.transaction.objectStore(name as string).index(index);

				const regexDot = /\./g;
				const keyPath = Arrays.resolve(store.keyPath)
					.flatMap(key => key.split(regexDot));

				const result = new Map<IDBValidKey, any>();
				const request = store.openCursor();
				request.addEventListener("error", () => reject(request.error));
				request.addEventListener("success", event => {
					const cursor = request.result;
					if (!cursor)
						return resolve([...result.values()]);

					// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
					const key = Objects.followPath(cursor.value, keyPath);
					if ((typeof key === "string" || typeof key === "number") && !result.has(key))
						// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
						result.set(key, !mapper ? key : mapper(key, cursor.value));

					cursor.continue();
				});
			});
		}

		public async set<KEY extends keyof SCHEMA> (name: KEY, key: string, value: SCHEMA[KEY]) {
			return this.do(() =>
				this.transaction.objectStore(name as string)
					.put(value, key))
				.then(() => { });
		}

		public async delete (name: keyof SCHEMA, key: string) {
			return this.do(() =>
				this.transaction.objectStore(name as string)
					.delete(key));
		}

		public async keys (name: keyof SCHEMA) {
			return this.do(() =>
				this.transaction.objectStore(name as string)
					.getAllKeys() as IDBRequest<string[]>);
		}

		public async count (name: keyof SCHEMA) {
			return this.do(() =>
				this.transaction.objectStore(name as string)
					.count());
		}

		public async clear (name: keyof SCHEMA) {
			return this.do(() =>
				this.transaction.objectStore(name as string)
					.clear());
		}

		private async do (operation: () => IDBRequest<undefined>): Promise<void>;
		private async do<T> (operation: () => IDBRequest<T>): Promise<T>;
		private async do<T> (operation: () => IDBRequest<T>) {
			if (this.errored || this.complete)
				throw new Error("Transaction is complete or has errored, no further operations are allowed");

			return new Promise<T>((resolve, reject) => {
				const request = operation();
				request.addEventListener("error", () => reject(request.error));
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				request.addEventListener("success", () => resolve(request.result as any));
			});
		}

		public async commit () {
			if (this.complete || this.errored)
				return;

			this.complete = true;
			this.transaction.commit();
			return this.event.waitFor("complete");
		}
	}

	export namespace Transaction {
		export type Initialiser<SCHEMA, STORES extends (keyof SCHEMA)[], T> = (transaction: Transaction<Pick<SCHEMA, STORES[number]>>) => Promise<T>;

		export interface IEvents {
			complete: Event;
			error: { error: Error };
		}
	}

	type StagedTransactionFunction<SCHEMA, RETURN, DATA extends any[] = []> = (transaction: Transaction<SCHEMA>, ...data: DATA) => Promise<RETURN>;
	interface IStagedTransactionDefinition<SCHEMA, RETURN, DATA extends any[] = []> {
		id: string;
		function: StagedTransactionFunction<SCHEMA, RETURN[], DATA>;
		data: DATA;
		resolve?(value: RETURN): void;
	}
	type IStagedTransaction<SCHEMA, RETURN, DATA extends any[] = []> = StagedTransactionFunction<SCHEMA, RETURN, DATA> | IStagedTransactionDefinition<SCHEMA, RETURN, DATA>;

	export class StagedTransaction<SCHEMA, STORES extends (keyof SCHEMA)[]> {
		public constructor (
			private readonly database: Database<SCHEMA>,
			private readonly over: STORES,
			private readonly mode: IDBTransactionMode,
		) { }

		private readonly pending: IStagedTransaction<SCHEMA, any, any[]>[] = [];
		private activeTransaction?: Promise<void>;

		private queue<RETURN, DATA extends any[] = []> (staged: IStagedTransaction<SCHEMA, RETURN, DATA>) {
			const resultPromise = new Promise<RETURN>(resolve => {
				if (typeof staged === "function")
					this.pending.push(async transaction => resolve(await staged(transaction, ...[] as any[] as DATA)));
				else {
					staged.resolve = resolve;
					this.pending.push(staged as any as IStagedTransactionDefinition<SCHEMA, any, any[]>);
				}
			});

			void this.tryExhaustQueue();

			return resultPromise;
		}

		private async tryExhaustQueue () {
			if (this.activeTransaction)
				return this.activeTransaction;

			// eslint-disable-next-line @typescript-eslint/no-misused-promises
			this.activeTransaction = (async () => {
				while (this.pending.length) {
					const transactions = this.pending.splice(0, Infinity);
					console.debug(`Found ${transactions.length} staged transactions over:`, ...this.over);
					const start = performance.now();
					await this.database.transaction(this.over, this.mode, async transaction => {
						const transactionsByType: Record<string, IStagedTransactionDefinition<SCHEMA, any, any[]>[]> = {};
						for (const staged of transactions) {
							if (typeof staged === "function") {
								// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
								await staged(transaction);
								continue;
							}

							transactionsByType[staged.id] ??= [];
							// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
							transactionsByType[staged.id].push(staged);
						}

						for (const transactions of Object.values(transactionsByType)) {
							const data = transactions.flatMap(staged => staged.data);
							// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
							const results = await transactions[0].function(transaction, ...data);
							if (results.length !== data.length)
								throw new Error(`Invalid number of results for ${transactions[0].id} over ${this.over.join(", ")}`);

							for (let i = 0; i < results.length; i++) {
								transactions[i].resolve!(results[i]);
							}
						}
					});

					console.debug(`Completed ${transactions.length} staged transactions in ${performance.now() - start}ms over:`, ...this.over);
				}
			})();

			await this.activeTransaction;

			delete this.activeTransaction;
		}

		public await () {
			return this.tryExhaustQueue();
		}

		public async transaction<T> (initialiser: Transaction.Initialiser<SCHEMA, STORES, T>) {
			return this.queue(transaction => initialiser(transaction));
		}

		public async get<KEY extends keyof SCHEMA> (store: KEY, key: string, index?: string) {
			return this.queue(transaction => transaction.get(store, key, index));
			// return this.queue({
			// 	id: `get:${String(store)}:${index ?? "/"}`,
			// 	data: [key],
			// 	function: async (transaction, ...data) =>
			// 		data.length === 1 ? [await transaction.get(store, key, index)]
			// 			: transaction.all(store, data, index),
			// });
		}

		public async all<KEY extends keyof SCHEMA> (store: KEY, range?: IDBValidKey | IDBKeyRange | string): Promise<SCHEMA[KEY][]>;
		public async all<KEY extends keyof SCHEMA> (store: KEY, range: IDBValidKey | IDBKeyRange | string, index?: string): Promise<SCHEMA[KEY][]>;
		public async all<KEY extends keyof SCHEMA> (store: KEY, range?: IDBValidKey | IDBKeyRange | string, index?: string) {
			return this.queue(transaction => transaction.all(store, range!, index));
		}

		public async primaryKeys<KEY extends keyof SCHEMA> (store: KEY): Promise<IDBValidKey[]>;
		public async primaryKeys<KEY extends keyof SCHEMA> (store: KEY, range?: IDBKeyRange | string, index?: string): Promise<IDBValidKey[]>;
		public async primaryKeys<KEY extends keyof SCHEMA> (store: KEY, range?: IDBKeyRange | string, index?: string) {
			return this.queue(transaction => transaction.primaryKeys(store, range, index));
		}

		public async indexKeys<KEY extends keyof SCHEMA> (store: KEY, index: string): Promise<IDBValidKey[]>;
		public async indexKeys<KEY extends keyof SCHEMA, R> (store: KEY, index: string, mapper: (key: IDBValidKey, value: SCHEMA[KEY]) => R): Promise<R[]>;
		public async indexKeys<KEY extends keyof SCHEMA> (store: KEY, index: string, mapper?: (key: IDBValidKey, value: SCHEMA[KEY]) => any) {
			return this.queue(transaction => transaction.indexKeys(store, index, mapper!));
		}

		public async set<KEY extends keyof SCHEMA> (store: KEY, key: string, value: SCHEMA[KEY]) {
			if (this.mode === "readonly")
				throw new Error("Cannot modify store in readonly mode");
			return this.queue(transaction => transaction.set(store, key, value));
		}

		public async delete (store: keyof SCHEMA, key: string) {
			if (this.mode === "readonly")
				throw new Error("Cannot modify store in readonly mode");
			return this.queue(transaction => transaction.delete(store, key));
		}

		public async keys (store: keyof SCHEMA) {
			return this.queue(transaction => transaction.keys(store));
		}

		public async count (store: keyof SCHEMA) {
			return this.queue(transaction => transaction.count(store));
		}

		public async clear (store: keyof SCHEMA) {
			if (this.mode === "readonly")
				throw new Error("Cannot modify store in readonly mode");
			return this.queue(transaction => transaction.clear(store));
		}
	}
}

export default Database;
