import { EventManager } from "utility/EventManager";

class Database<SCHEMA> {

	public readonly event = new EventManager<this, Database.IEvents>(this);

	private database?: IDBDatabase;

	public async getDatabase () {
		if (this.database)
			return this.database;

		return this.open();
	}

	public constructor (private readonly schema: Database.Schema<SCHEMA>) { }

	public async get<KEY extends keyof SCHEMA> (store: KEY, key: string): Promise<SCHEMA[KEY] | undefined> {
		return this.transaction([store], "readonly", transaction => transaction.get(store, key));
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

	private async open () {
		if (!this.schema.versions.length)
			throw new Error(`No versions in schema for database '${this.schema.id}'`);

		const database = await new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open(this.schema.id, this.schema.versions.length);

			request.addEventListener("upgradeneeded", (event: IDBVersionChangeEvent) => {
				const database = request.result;
				const version = event.newVersion ?? this.schema.versions.length;
				for (let i = event.oldVersion; i < version; i++)
					this.schema.versions[i](database);
			});

			request.addEventListener("error", () =>
				reject(new Error(`Cannot create database '${this.schema.id}', error: ${request.error?.message ?? "Unknown error"}`)));

			request.addEventListener("success", () =>
				resolve(request.result));
		});

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

		this.database.close();
		return this.event.waitFor("close");
	}
}

namespace Database {

	export type Upgrade = (database: IDBDatabase) => any;
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

		public async get<KEY extends keyof SCHEMA> (name: KEY, key: string) {
			return this.do<SCHEMA[KEY] | undefined>(() =>
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				this.transaction.objectStore(name as string)
					.get(key));
		}

		public async set<KEY extends keyof SCHEMA> (name: KEY, key: string, value: SCHEMA[KEY]) {
			return this.do(() =>
				this.transaction.objectStore(name as string)
					.put(value, key))
				// eslint-disable-next-line @typescript-eslint/no-empty-function
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
}

export default Database;
