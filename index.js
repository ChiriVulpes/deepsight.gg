var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
define("Constants", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.APP_NAME = void 0;
    exports.APP_NAME = "deepsight.gg / Destiny 2 Item Manager";
});
define("utility/Define", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function Define(proto, key, implementation) {
        try {
            Object.defineProperty(proto, key, {
                configurable: true,
                writable: true,
                value: implementation,
            });
        }
        catch (err) {
        }
    }
    (function (Define) {
        function all(protos, key, implementation) {
            for (const proto of protos) {
                Define(proto, key, implementation);
            }
        }
        Define.all = all;
        function magic(obj, key, implementation) {
            try {
                Object.defineProperty(obj, key, {
                    configurable: true,
                    ...implementation,
                });
            }
            catch (err) {
            }
        }
        Define.magic = magic;
    })(Define || (Define = {}));
    exports.default = Define;
});
define("utility/Arrays", ["require", "exports", "utility/Define"], function (require, exports, Define_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Arrays;
    (function (Arrays) {
        Arrays.EMPTY = [];
        function resolve(or) {
            return Array.isArray(or) ? or : or === undefined ? [] : [or];
        }
        Arrays.resolve = resolve;
        function includes(array, value) {
            return Array.isArray(array) ? array.includes(value) : array === value;
        }
        Arrays.includes = includes;
        function slice(or) {
            return Array.isArray(or) ? or.slice() : or === undefined ? [] : [or];
        }
        Arrays.slice = slice;
        /**
         * Removes one instance of the given value from the given array.
         * @returns `true` if removed, `false` otherwise
         */
        function remove(array, ...values) {
            if (!array)
                return false;
            let removed = false;
            for (const value of values) {
                const index = array.indexOf(value);
                if (index === -1)
                    continue;
                array.splice(index, 1);
                removed = true;
            }
            return removed;
        }
        Arrays.remove = remove;
        /**
         * Adds the given value to the given array if not present.
         * @returns `true` if added, `false` otherwise
         */
        function add(array, value) {
            if (!array)
                return false;
            const index = array.indexOf(value);
            if (index !== -1)
                return false;
            array.push(value);
            return true;
        }
        Arrays.add = add;
        function tuple(...values) {
            return values;
        }
        Arrays.tuple = tuple;
        function range(start, end, step) {
            if (step === 0)
                throw new Error("Invalid step for range");
            const result = [];
            if (end === undefined)
                end = start, start = 0;
            step = end < start ? -1 : 1;
            for (let i = start; step > 0 ? i < end : i > end; i += step)
                result.push(i);
            return result;
        }
        Arrays.range = range;
        function filterNullish(value) {
            return value !== null && value !== undefined;
        }
        Arrays.filterNullish = filterNullish;
        function filterFalsy(value) {
            return !!value;
        }
        Arrays.filterFalsy = filterFalsy;
        function mergeSorted(...arrays) {
            return arrays.reduce((prev, curr) => mergeSorted2(prev, curr), []);
        }
        Arrays.mergeSorted = mergeSorted;
        function mergeSorted2(array1, array2) {
            const merged = [];
            let index1 = 0;
            let index2 = 0;
            while (index1 < array1.length || index2 < array2.length) {
                const v1 = index1 < array1.length ? array1[index1] : undefined;
                const v2 = index2 < array2.length ? array2[index2] : undefined;
                if (v1 === v2) {
                    merged.push(v1);
                    index1++;
                    index2++;
                    continue;
                }
                if (v1 === undefined && v2 !== undefined) {
                    merged.push(v2);
                    index2++;
                    continue;
                }
                if (v2 === undefined && v1 !== undefined) {
                    merged.push(v1);
                    index1++;
                    continue;
                }
                const indexOfPerson1InList2 = array2.indexOf(v1, index2);
                if (indexOfPerson1InList2 === -1) {
                    merged.push(v1);
                    index1++;
                }
                else {
                    merged.push(v2);
                    index2++;
                }
            }
            return merged;
        }
        function applyPrototypes() {
            (0, Define_1.default)(Array.prototype, "findLast", function (predicate) {
                if (this.length > 0)
                    for (let i = this.length - 1; i >= 0; i--)
                        if (predicate(this[i], i, this))
                            return this[i];
                return undefined;
            });
            (0, Define_1.default)(Array.prototype, "findLastIndex", function (predicate) {
                if (this.length > 0)
                    for (let i = this.length - 1; i >= 0; i--)
                        if (predicate(this[i], i, this))
                            return i;
                return -1;
            });
            const originalSort = Array.prototype.sort;
            (0, Define_1.default)(Array.prototype, "sort", function (...sorters) {
                if (this.length <= 1)
                    return this;
                if (!sorters.length)
                    return originalSort.call(this);
                return originalSort.call(this, (a, b) => {
                    for (const sorter of sorters) {
                        if (sorter.length === 1) {
                            const mapper = sorter;
                            const sortValue = mapper(b) - mapper(a);
                            if (sortValue)
                                return sortValue;
                        }
                        else {
                            const sortValue = sorter(a, b);
                            if (sortValue)
                                return sortValue;
                        }
                    }
                    return 0;
                });
            });
            (0, Define_1.default)(Array.prototype, "collect", function (collector, ...args) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return collector?.(this, ...args);
            });
            (0, Define_1.default)(Array.prototype, "splat", function (collector, ...args) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return collector?.(...this, ...args);
            });
            (0, Define_1.default)(Array.prototype, "toObject", function (mapper) {
                return Object.fromEntries(mapper ? this.map(mapper) : this);
            });
            (0, Define_1.default)(Array.prototype, "distinct", function (mapper) {
                const result = [];
                const encountered = mapper ? [] : result;
                for (const value of this) {
                    const encounterValue = mapper ? mapper(value) : value;
                    if (encountered.includes(encounterValue))
                        continue;
                    if (mapper)
                        encountered.push(encounterValue);
                    result.push(value);
                }
                return result;
            });
            (0, Define_1.default)(Array.prototype, "findMap", function (predicate, mapper) {
                for (let i = 0; i < this.length; i++)
                    if (predicate(this[i], i, this))
                        return mapper(this[i], i, this);
                return undefined;
            });
            (0, Define_1.default)(Array.prototype, "groupBy", function (grouper) {
                const result = {};
                for (let i = 0; i < this.length; i++)
                    (result[String(grouper(this[i], i, this))] ??= []).push(this[i]);
                return Object.entries(result);
            });
        }
        Arrays.applyPrototypes = applyPrototypes;
    })(Arrays || (Arrays = {}));
    exports.default = Arrays;
});
define("utility/EventManager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EventManager = void 0;
    class EventManager {
        static make() {
            return new EventManager({});
        }
        static emit(target, event, init) {
            if (init instanceof Event)
                event = init;
            if (typeof event === "string")
                event = new Event(event, { cancelable: true });
            if (typeof init === "function")
                init?.(event);
            else if (init && event !== init)
                Object.assign(event, init);
            target?.dispatchEvent(event);
            return event;
        }
        get target() {
            return this._target instanceof WeakRef ? this._target.deref() : this._target;
        }
        constructor(host, target = new EventTarget()) {
            this.subscriptions = {};
            this.pipeTargets = new Map();
            this.pipes = new Map();
            this.host = new WeakRef(host);
            this._target = target;
        }
        subscribe(type, listener) {
            if (!Array.isArray(type))
                type = [type];
            for (const t of type)
                this.target?.addEventListener(t, listener);
            return this.host.deref();
        }
        subscribeOnce(types, listener) {
            if (!Array.isArray(types))
                types = [types];
            if (this.target) {
                const target = this.target;
                const subscriptions = this.subscriptions;
                function realListener(event) {
                    listener.call(this, event);
                    for (const type of types) {
                        subscriptions[type]?.delete(listener);
                        target?.removeEventListener(type, realListener);
                    }
                }
                for (const type of types) {
                    subscriptions[type] ??= new WeakMap();
                    subscriptions[type].set(listener, realListener);
                    this.target?.addEventListener(type, realListener);
                }
            }
            return this.host.deref();
        }
        unsubscribe(types, listener) {
            if (!Array.isArray(types))
                types = [types];
            for (const type of types) {
                this.target?.removeEventListener(type, listener);
                const realListener = this.subscriptions[type]?.get(listener);
                if (realListener) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    this.target?.removeEventListener(type, realListener);
                    this.subscriptions[type].delete(listener);
                }
            }
            return this.host.deref();
        }
        async waitFor(types) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return new Promise(resolve => this.subscribeOnce(types, resolve));
        }
        until(promise, initialiser) {
            if (typeof promise !== "object")
                promise = this.waitFor(promise);
            const manager = {
                subscribe: (type, listener) => {
                    this.subscribe(type, listener);
                    void promise.then(() => this.unsubscribe(type, listener));
                    return manager;
                },
                subscribeOnce: (type, listener) => {
                    this.subscribeOnce(type, listener);
                    void promise.then(() => this.unsubscribe(type, listener));
                    return manager;
                },
            };
            initialiser?.(manager);
            return this.host.deref();
        }
        emit(event, init) {
            event = EventManager.emit(this.target, event, init);
            const pipeTargets = this.pipeTargets.get(event.type);
            if (pipeTargets) {
                for (let i = 0; i < pipeTargets.length; i++) {
                    const pipeTarget = pipeTargets[i].deref();
                    if (pipeTarget)
                        pipeTarget.dispatchEvent(event);
                    else
                        pipeTargets.splice(i--, 1);
                }
                if (!pipeTargets.length)
                    this.pipeTargets.delete(event.type);
            }
            return this.host.deref();
        }
        pipe(type, on) {
            const typeName = type;
            on.insertPipe(typeName, this._target instanceof WeakRef ? this._target : new WeakRef(this._target));
            let pipes = this.pipes.get(typeName);
            if (!pipes) {
                pipes = [];
                this.pipes.set(typeName, pipes);
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            pipes.push(new WeakRef(on));
            return this;
        }
        insertPipe(type, target) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            let pipeTargets = this.pipeTargets.get(type);
            if (!pipeTargets) {
                pipeTargets = [];
                this.pipeTargets.set(type, pipeTargets);
            }
            pipeTargets.push(target);
            const pipes = this.pipes.get(type);
            if (pipes) {
                for (let i = 0; i < pipes.length; i++) {
                    const pipe = pipes[i].deref();
                    if (pipe)
                        pipe.insertPipe(type, target);
                    else
                        pipes.splice(i--, 1);
                }
                if (!pipes.length)
                    this.pipes.delete(type);
            }
        }
    }
    exports.EventManager = EventManager;
    EventManager.global = EventManager.make();
});
define("utility/Type", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("utility/Objects", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Objects;
    (function (Objects) {
        Objects.EMPTY = {};
        function inherit(obj, inherits) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
            Object.setPrototypeOf(obj, inherits.prototype);
            return obj;
        }
        Objects.inherit = inherit;
        function map(object, mapper) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion
            return Object.fromEntries(Object.entries(object).map(mapper));
        }
        Objects.map = map;
        async function mapAsync(object, mapper) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            return Object.fromEntries(await Promise.all(Object.entries(object).map(mapper)));
        }
        Objects.mapAsync = mapAsync;
        function followPath(obj, keys) {
            for (const key of keys)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                obj = obj?.[key];
            return obj;
        }
        Objects.followPath = followPath;
        function applyJIT(obj, key, compute) {
            const get = (() => {
                const promise = compute();
                delete obj[key];
                obj[key] = promise;
                if (promise instanceof Promise)
                    void promise.then(value => obj[key] = value);
                return promise;
            });
            get.compute = compute;
            Object.defineProperty(obj, key, {
                configurable: true,
                get,
            });
        }
        Objects.applyJIT = applyJIT;
        function copyJIT(target, from, key) {
            const descriptor = Object.getOwnPropertyDescriptor(from, key);
            if (!descriptor)
                return;
            if ("value" in descriptor) {
                target[key] = from[key];
                return;
            }
            const compute = descriptor.get?.compute;
            if (!compute)
                return;
            applyJIT(target, key, compute);
        }
        Objects.copyJIT = copyJIT;
    })(Objects || (Objects = {}));
    exports.default = Objects;
});
define("utility/Store", ["require", "exports", "utility/EventManager"], function (require, exports, EventManager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let storage;
    class Store {
        static get items() {
            return storage ??= new Proxy({}, {
                has(_, key) {
                    return Store.has(key);
                },
                get(_, key) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return Store.get(key);
                },
                set(_, key, value) {
                    return Store.set(key, value);
                },
                deleteProperty(_, key) {
                    return Store.delete(key);
                },
            });
        }
        static has(key) {
            return localStorage.getItem(key) !== null;
        }
        static get(key) {
            const value = localStorage.getItem(key);
            try {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return value === null ? null : JSON.parse(value);
            }
            catch {
                localStorage.removeItem(key);
                return null;
            }
        }
        static set(key, value) {
            const oldValue = Store.get(key);
            if (value === undefined)
                localStorage.removeItem(key);
            else
                localStorage.setItem(key, JSON.stringify(value));
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            Store.event.emit(`set${key[0].toUpperCase()}${key.slice(1)}`, { value, oldValue });
            return true;
        }
        static delete(key) {
            const oldValue = Store.get(key);
            localStorage.removeItem(key);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            Store.event.emit(`delete${key[0].toUpperCase()}${key.slice(1)}`, { oldValue });
            return true;
        }
    }
    Store.event = EventManager_1.EventManager.make();
    exports.default = Store;
});
define("utility/Database", ["require", "exports", "utility/Arrays", "utility/EventManager", "utility/Objects", "utility/Store"], function (require, exports, Arrays_1, EventManager_2, Objects_1, Store_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Version;
    (function (Version) {
        function encode(...[major, minor]) {
            return (Math.min(major, 2 ** 16) << 16) | Math.min(minor, 2 ** 16);
        }
        Version.encode = encode;
        function decode(encoded) {
            return [encoded >> 16, encoded & 65535];
        }
        Version.decode = decode;
    })(Version || (Version = {}));
    class Database {
        async getDatabase() {
            if (this.database)
                return this.database;
            return this.open();
        }
        constructor(schema) {
            this.schema = schema;
            this.event = new EventManager_2.EventManager(this);
        }
        async get(store, key, index) {
            return this.transaction([store], "readonly", transaction => transaction.get(store, key, index));
        }
        async all(store, rangeOrKey, index) {
            return this.transaction([store], "readonly", transaction => transaction.all(store, rangeOrKey, index));
        }
        async set(store, key, value) {
            return this.transaction([store], transaction => transaction.set(store, key, value));
        }
        async delete(store, key) {
            return this.transaction([store], transaction => transaction.delete(store, key));
        }
        async keys(store) {
            return this.transaction([store], "readonly", transaction => transaction.keys(store));
        }
        async count(store) {
            return this.transaction([store], "readonly", transaction => transaction.count(store));
        }
        async clear(store) {
            return this.transaction([store], transaction => transaction.clear(store));
        }
        async transaction(over, modeOrTransaction, transaction) {
            if (typeof modeOrTransaction !== "string") {
                transaction = modeOrTransaction;
                modeOrTransaction = "readwrite";
            }
            const database = await this.getDatabase();
            const instance = new Database.Transaction(database.transaction(over, modeOrTransaction));
            const result = await transaction(instance);
            await instance.commit();
            return result;
        }
        stagedTransaction(over, mode = "readwrite") {
            return new Database.StagedTransaction(this, over, mode);
        }
        async upgrade(upgrade) {
            await this.close();
            const [, databaseVersionMinor] = (await this.getVersion()) ?? [];
            await this.open((databaseVersionMinor ?? 0) + 1, upgrade);
        }
        async stores() {
            const database = await this.getDatabase();
            return database.objectStoreNames;
        }
        async hasStore(...stores) {
            const database = await this.getDatabase();
            return stores.every(store => database.objectStoreNames.contains(store));
        }
        async createStore(store, options, init) {
            if (await this.hasStore(store))
                return;
            await this.upgrade(async (upgrade) => {
                await init?.(upgrade.createObjectStore(store, options));
            });
        }
        async dispose() {
            await this.close();
            return new Promise((resolve, reject) => {
                const request = indexedDB.deleteDatabase(this.schema.id);
                request.addEventListener("success", () => resolve());
                request.addEventListener("blocked", () => reject(new Error(`Cannot delete database '${this.schema.id}', blocked`)));
                request.addEventListener("error", () => reject(new Error(`Cannot delete database '${this.schema.id}', error: ${request.error?.message ?? "Unknown error"}`)));
            });
        }
        getVersion() {
            // const databaseInfo = (await indexedDB.databases()).find(({ name }) => name === this.schema.id);
            const databaseInfo = Store_1.default.items.databases?.find(({ name }) => name === this.schema.id);
            return databaseInfo?.version ? Version.decode(databaseInfo.version) : undefined;
        }
        async open(versionMinor, upgrade) {
            if (!this.schema.versions.length)
                throw new Error(`No versions in schema for database '${this.schema.id}'`);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises,  no-async-promise-executor
            const databasePromise = new Promise(async (resolve, reject) => {
                const [, databaseVersionMinor] = (await this.getVersion()) ?? [];
                const newVersion = Version.encode(this.schema.versions.length, versionMinor ?? databaseVersionMinor ?? 0);
                const request = indexedDB.open(this.schema.id, newVersion);
                request.addEventListener("blocked", () => {
                    console.log("blocked");
                });
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                request.addEventListener("upgradeneeded", async (event) => {
                    const transaction = request.transaction;
                    if (!transaction)
                        return;
                    const database = request.result;
                    const [versionMajor] = Version.decode(event.newVersion ?? newVersion);
                    const [oldVersionMajor] = Version.decode(event.oldVersion);
                    for (let i = oldVersionMajor; i < versionMajor; i++)
                        await this.schema.versions[i](database, transaction);
                    await upgrade?.(database, transaction);
                    const databases = Store_1.default.items.databases ?? [];
                    const databaseInfo = databases.find(({ name }) => name === this.schema.id);
                    if (databaseInfo)
                        databaseInfo.version = newVersion;
                    else
                        databases.push({ name: this.schema.id, version: newVersion });
                    Store_1.default.items.databases = databases;
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
                request.addEventListener("success", () => resolve(request.result));
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
        async close() {
            if (!this.database)
                return;
            const database = this.database;
            delete this.database;
            (await database).close();
        }
    }
    (function (Database) {
        function schema(id, ...versions) {
            return {
                _schema: null,
                id,
                versions,
            };
        }
        Database.schema = schema;
        class Transaction {
            constructor(transaction) {
                this.transaction = transaction;
                this.event = new EventManager_2.EventManager(this);
                this.complete = false;
                this.errored = false;
                this.transaction.addEventListener("complete", () => {
                    this.complete = true;
                    this.event.emit("complete");
                });
                this.transaction.addEventListener("error", () => {
                    this.errored = true;
                    this.event.emit("error", { error: this.transaction.error });
                });
            }
            async get(name, key, index) {
                return this.do(() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    let store = this.transaction.objectStore(name);
                    if (index !== undefined)
                        store = store.index(index);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return store.get(key);
                });
            }
            async all(name, rangeOrKey, index) {
                if (Array.isArray(rangeOrKey)) {
                    return new Promise((resolve, reject) => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        let store = this.transaction.objectStore(name);
                        if (index !== undefined)
                            store = store.index(index);
                        const result = [];
                        const request = store.openCursor();
                        request.addEventListener("error", () => reject(request.error));
                        request.addEventListener("success", event => {
                            const cursor = request.result;
                            if (!cursor)
                                return resolve(result);
                            if (rangeOrKey.includes(cursor.key) || (!isNaN(+cursor.key) && rangeOrKey.includes(+cursor.key)))
                                result.push(cursor.value);
                            cursor.continue();
                        });
                    });
                }
                return this.do(() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    let store = this.transaction.objectStore(name);
                    if (index !== undefined)
                        store = store.index(index);
                    if (typeof rangeOrKey === "string")
                        return store.getAll(rangeOrKey);
                    return store.getAll(rangeOrKey);
                });
            }
            async primaryKeys(name, rangeOrKey, index) {
                return this.do(() => {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    let store = this.transaction.objectStore(name);
                    if (index !== undefined)
                        store = store.index(index);
                    return store.getAllKeys(rangeOrKey);
                });
            }
            async indexKeys(name, index, mapper) {
                return new Promise((resolve, reject) => {
                    const store = this.transaction.objectStore(name).index(index);
                    const regexDot = /\./g;
                    const keyPath = Arrays_1.default.resolve(store.keyPath)
                        .flatMap(key => key.split(regexDot));
                    const result = new Map();
                    const request = store.openCursor();
                    request.addEventListener("error", () => reject(request.error));
                    request.addEventListener("success", event => {
                        const cursor = request.result;
                        if (!cursor)
                            return resolve([...result.values()]);
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        const key = Objects_1.default.followPath(cursor.value, keyPath);
                        if ((typeof key === "string" || typeof key === "number") && !result.has(key))
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            result.set(key, !mapper ? key : mapper(key, cursor.value));
                        cursor.continue();
                    });
                });
            }
            async set(name, key, value) {
                return this.do(() => this.transaction.objectStore(name)
                    .put(value, key))
                    .then(() => { });
            }
            async delete(name, key) {
                return this.do(() => this.transaction.objectStore(name)
                    .delete(key));
            }
            async keys(name) {
                return this.do(() => this.transaction.objectStore(name)
                    .getAllKeys());
            }
            async count(name) {
                return this.do(() => this.transaction.objectStore(name)
                    .count());
            }
            async clear(name) {
                return this.do(() => this.transaction.objectStore(name)
                    .clear());
            }
            async do(operation) {
                if (this.errored || this.complete)
                    throw new Error("Transaction is complete or has errored, no further operations are allowed");
                return new Promise((resolve, reject) => {
                    const request = operation();
                    request.addEventListener("error", () => reject(request.error));
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    request.addEventListener("success", () => resolve(request.result));
                });
            }
            async commit() {
                if (this.complete || this.errored)
                    return;
                this.complete = true;
                this.transaction.commit();
                return this.event.waitFor("complete");
            }
        }
        Database.Transaction = Transaction;
        class StagedTransaction {
            constructor(database, over, mode) {
                this.database = database;
                this.over = over;
                this.mode = mode;
                this.pending = [];
            }
            queue(staged) {
                const resultPromise = new Promise(resolve => {
                    if (typeof staged === "function")
                        this.pending.push(async (transaction) => resolve(await staged(transaction, ...[])));
                    else {
                        staged.resolve = resolve;
                        this.pending.push(staged);
                    }
                });
                void this.tryExhaustQueue();
                return resultPromise;
            }
            async tryExhaustQueue() {
                if (this.activeTransaction)
                    return this.activeTransaction;
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                this.activeTransaction = (async () => {
                    while (this.pending.length) {
                        const transactions = this.pending.splice(0, Infinity);
                        console.debug(`Found ${transactions.length} staged transactions over:`, ...this.over);
                        const start = performance.now();
                        await this.database.transaction(this.over, this.mode, async (transaction) => {
                            const transactionsByType = {};
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
                                    transactions[i].resolve(results[i]);
                                }
                            }
                        });
                        console.debug(`Completed ${transactions.length} staged transactions in ${performance.now() - start}ms over:`, ...this.over);
                    }
                })();
                await this.activeTransaction;
                delete this.activeTransaction;
            }
            await() {
                return this.tryExhaustQueue();
            }
            async transaction(initialiser) {
                return this.queue(transaction => initialiser(transaction));
            }
            async get(store, key, index) {
                return this.queue(transaction => transaction.get(store, key, index));
                // return this.queue({
                // 	id: `get:${String(store)}:${index ?? "/"}`,
                // 	data: [key],
                // 	function: async (transaction, ...data) =>
                // 		data.length === 1 ? [await transaction.get(store, key, index)]
                // 			: transaction.all(store, data, index),
                // });
            }
            async all(store, range, index) {
                return this.queue(transaction => transaction.all(store, range, index));
            }
            async primaryKeys(store, range, index) {
                return this.queue(transaction => transaction.primaryKeys(store, range, index));
            }
            async indexKeys(store, index, mapper) {
                return this.queue(transaction => transaction.indexKeys(store, index, mapper));
            }
            async set(store, key, value) {
                if (this.mode === "readonly")
                    throw new Error("Cannot modify store in readonly mode");
                return this.queue(transaction => transaction.set(store, key, value));
            }
            async delete(store, key) {
                if (this.mode === "readonly")
                    throw new Error("Cannot modify store in readonly mode");
                return this.queue(transaction => transaction.delete(store, key));
            }
            async keys(store) {
                return this.queue(transaction => transaction.keys(store));
            }
            async count(store) {
                return this.queue(transaction => transaction.count(store));
            }
            async clear(store) {
                if (this.mode === "readonly")
                    throw new Error("Cannot modify store in readonly mode");
                return this.queue(transaction => transaction.clear(store));
            }
        }
        Database.StagedTransaction = StagedTransaction;
    })(Database || (Database = {}));
    exports.default = Database;
});
define("model/ModelCacheDatabase", ["require", "exports", "utility/Database"], function (require, exports, Database_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Database_1.default.schema("modelCache", database => {
        database.createObjectStore("models");
    });
});
define("utility/Debug", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Debug = void 0;
    var Debug;
    (function (Debug) {
        // export let emulateBungieError = false;
        Debug.emulateBungieErrorSystemDisabled = false;
        Debug.collectionsDuplicates = false;
    })(Debug || (exports.Debug = Debug = {}));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    window.Debug = Debug;
});
define("utility/endpoint/Endpoint", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Endpoint {
        constructor(path, builder) {
            this.path = path;
            this.builder = builder;
        }
        async query(...args) {
            const path = this.resolvePath(...args);
            let headers;
            return this.fetch(path, ...args)
                .then(response => {
                headers = response.headers;
                return response.text();
            })
                .then(text => {
                if (path.endsWith(".json")) {
                    // text = text
                    // 	.replace(/\s*\/\/[^\n"]*(?=\n)/g, "")
                    // 	.replace(/(?<=\n)\s*\/\/[^\n]*(?=\n)/g, "")
                    // 	.replace(/,(?=[^}\]"\d\w_-]*?[}\]])/gs, "");
                    let parsed;
                    try {
                        parsed = JSON.parse(text);
                    }
                    catch (err) {
                        console.warn(text);
                        throw err;
                    }
                    const result = this.process(parsed);
                    Object.defineProperty(result, "_headers", {
                        enumerable: false,
                        get: () => headers,
                    });
                    return result;
                }
                throw new Error("Unknown file type");
            });
        }
        process(received) {
            return received;
        }
        async fetch(path, ...args) {
            path ??= this.resolvePath(...args);
            const request = {
                ...this.getDefaultRequest(...args),
                ...await this.builder?.(...args) ?? {},
            };
            let body;
            if (typeof request.body === "object") {
                if (request.headers?.["Content-Type"] === "application/x-www-form-urlencoded")
                    body = new URLSearchParams(Object.entries(request.body)).toString();
                else if (request.headers?.["Content-Type"] === undefined || request.headers?.["Content-Type"] === "application/json") {
                    request.headers ??= {};
                    request.headers["Content-Type"] = "application/json";
                    body = JSON.stringify(request.body);
                }
            }
            let search = "";
            if (request.search) {
                search = "?";
                if (typeof request.search === "object")
                    search += new URLSearchParams(Object.entries(request.search)).toString();
                else
                    search += request.search;
            }
            return fetch(`${path}${search}`, {
                ...request,
                body,
                headers: Object.fromEntries(Object.entries(await this.getHeaders(request?.headers)).filter(([key, value]) => typeof value === "string")),
            });
        }
        resolvePath(...args) {
            return typeof this.path === "string" ? this.path : this.path(...args);
        }
        getDefaultRequest(...args) {
            return {};
        }
        // eslint-disable-next-line @typescript-eslint/require-await
        async getHeaders(headers) {
            return { ...headers };
        }
    }
    exports.default = Endpoint;
});
define("utility/Env", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Env {
        async load() {
            const origin = location.origin;
            const root = location.pathname.startsWith("/beta/") ? "/beta/" : "/";
            Object.assign(this, await fetch(origin + root + "env.json").then(response => response.json()));
            document.documentElement.classList.add(`environment-${this.DEEPSIGHT_ENVIRONMENT}`);
        }
    }
    exports.default = new Env;
});
define("utility/endpoint/bungie/BungieEndpoint", ["require", "exports", "utility/Debug", "utility/endpoint/Endpoint", "utility/Env", "utility/EventManager", "utility/Store"], function (require, exports, Debug_1, Endpoint_1, Env_1, EventManager_3, Store_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BungieEndpointImpl extends Endpoint_1.default {
        constructor(path, builder) {
            super(path, builder);
            this.allowedErrorStatuses = [];
            this.subdomain = "www";
        }
        allowErrorStatus(status) {
            this.allowedErrorStatuses.push(status);
            return this;
        }
        setSubdomain(subdomain) {
            this.subdomain = subdomain;
            return this;
        }
        setOptionalAuth(optionalAuth = true) {
            if (optionalAuth)
                this.optionalAuth = optionalAuth;
            else
                delete this.optionalAuth;
            return this;
        }
        async query(...args) {
            const attempts = 3;
            const lastAttempt = attempts - 1;
            for (let attempt = 0; attempt < 3; attempt++) {
                let error401d;
                let headers;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const result = await this.fetch(undefined, ...args)
                    .then(response => {
                    headers = response.headers;
                    if (response.status === 401) {
                        error401d = new Error("Not authenticated");
                        return;
                    }
                    return response.text();
                })
                    .then(text => {
                    if (!text)
                        return;
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        let data = JSON.parse(text);
                        if (data?.ErrorStatus === "WebAuthRequired") {
                            error401d = Object.assign(new Error(data.Message ?? "Not authenticated"), data);
                            return;
                        }
                        if (Debug_1.Debug.emulateBungieErrorSystemDisabled) {
                            data = {
                                ErrorCode: 5,
                                ThrottleSeconds: 0,
                                ErrorStatus: "SystemDisabled",
                                Message: "This system is temporarily disabled for maintenance.",
                                MessageData: {},
                                headers,
                            };
                        }
                        if (data?.ErrorStatus && data.ErrorStatus !== "Success" && !this.allowedErrorStatuses.includes(data.ErrorStatus)) {
                            if (data.ErrorStatus === "SystemDisabled")
                                BungieEndpoint.event.emit("apiDown");
                            throw Object.assign(new Error(data.Message ?? data.ErrorStatus), data);
                        }
                        BungieEndpoint.event.emit("querySuccess");
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                        return ("Response" in data && data.Response ? data.Response : data);
                    }
                    catch (error) {
                        BungieEndpoint.event.emit("error", { error: error, responseText: text, headers });
                        throw error;
                    }
                });
                if (error401d) {
                    if (attempt >= lastAttempt) {
                        BungieEndpoint.event.emit("authenticationFailed");
                        throw error401d;
                    }
                    else {
                        await this.validateAuthorisation(true);
                        continue;
                    }
                }
                Object.defineProperty(result, "_headers", {
                    enumerable: false,
                    get: () => headers,
                });
                return result;
            }
            throw new Error("This should never happen");
        }
        resolvePath(...args) {
            return `https://${this.subdomain}.bungie.net/Platform${super.resolvePath(...args)}`;
        }
        getDefaultRequest() {
            return {
                credentials: "include",
            };
        }
        async getHeaders(headers) {
            return {
                "Authorization": headers?.Authorization ? undefined : await this.getAuthorisation(),
                "X-API-Key": Env_1.default.DEEPSIGHT_BUNGIE_API_KEY,
                ...headers,
            };
        }
        async getAuthorisation() {
            if (!this.optionalAuth)
                await this.validateAuthorisation();
            return Store_2.default.items.bungieAccessToken ? `Bearer ${Store_2.default.items.bungieAccessToken}` : undefined;
        }
        async validateAuthorisation(force) {
            let authorisationPromise;
            BungieEndpoint.event.emit("validateAuthorisation", { setAuthorisationPromise: promise => void (authorisationPromise = promise), force });
            await authorisationPromise;
        }
    }
    var BungieEndpoint;
    (function (BungieEndpoint) {
        BungieEndpoint.event = EventManager_3.EventManager.make();
        function at(url) {
            return {
                request(builder) {
                    return {
                        returning() {
                            return new BungieEndpointImpl(url, builder);
                        },
                    };
                },
                returning() {
                    return new BungieEndpointImpl(url);
                },
            };
        }
        BungieEndpoint.at = at;
    })(BungieEndpoint || (BungieEndpoint = {}));
    exports.default = BungieEndpoint;
});
define("utility/endpoint/bungie/endpoint/RequestOAuthToken", ["require", "exports", "utility/endpoint/bungie/BungieEndpoint", "utility/Env", "utility/Store"], function (require, exports, BungieEndpoint_1, Env_2, Store_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_1.default
        .at("/app/oauth/token/")
        .request(() => ({
        method: "POST",
        headers: {
            Authorization: `Basic ${btoa(`${Env_2.default.DEEPSIGHT_BUNGIE_CLIENT_ID}:${Env_2.default.DEEPSIGHT_BUNGIE_API_SECRET}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: Store_3.default.items.bungieAccessTokenRefreshToken
            ? {
                grant_type: "refresh_token",
                refresh_token: Store_3.default.items.bungieAccessTokenRefreshToken,
            }
            : {
                grant_type: "authorization_code",
                code: Store_3.default.items.bungieAuthCode,
            },
    }))
        .returning();
});
define("utility/Strings", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Strings;
    (function (Strings) {
        function includesAt(string, substring, index) {
            if (index < 0)
                index = string.length + index;
            if (index + substring.length > string.length)
                return false;
            for (let i = 0; i < substring.length; i++)
                if (string[i + index] !== substring[i])
                    return false;
            return true;
        }
        Strings.includesAt = includesAt;
        function sliceTo(string, substring, startAt) {
            const index = string.indexOf(substring, startAt);
            if (index === -1)
                return string;
            return string.slice(0, index);
        }
        Strings.sliceTo = sliceTo;
        function sliceAfter(string, substring, startAt) {
            const index = string.indexOf(substring, startAt);
            if (index === -1)
                return string;
            return string.slice(index + substring.length);
        }
        Strings.sliceAfter = sliceAfter;
        function trimTextMatchingFromStart(string, substring, startAt) {
            if (string.length < substring.length)
                return string;
            const index = string.indexOf(substring, startAt);
            if (index !== 0)
                return string;
            return string.slice(index + substring.length);
        }
        Strings.trimTextMatchingFromStart = trimTextMatchingFromStart;
        function trimTextMatchingFromEnd(string, substring, startAt) {
            if (string.length < substring.length)
                return string;
            const index = string.lastIndexOf(substring, startAt);
            if (index !== string.length - substring.length)
                return string;
            return string.slice(0, index);
        }
        Strings.trimTextMatchingFromEnd = trimTextMatchingFromEnd;
        function extractFromQuotes(string) {
            let substring = (string ?? "").trim();
            if (substring[0] === '"')
                substring = substring.slice(1);
            if (substring[substring.length - 1] === '"')
                substring = substring.slice(0, -1);
            return substring.trim();
        }
        Strings.extractFromQuotes = extractFromQuotes;
        function extractFromSquareBrackets(string) {
            let substring = (string ?? "");
            if (substring[0] === "[")
                substring = substring.slice(1).trimStart();
            if (substring[substring.length - 1] === "]")
                substring = substring.slice(0, -1).trimEnd();
            return substring;
        }
        Strings.extractFromSquareBrackets = extractFromSquareBrackets;
        function mergeRegularExpressions(flags, ...expressions) {
            let exprString = "";
            for (const expr of expressions)
                exprString += "|" + expr.source;
            return new RegExp(exprString.slice(1), flags);
        }
        Strings.mergeRegularExpressions = mergeRegularExpressions;
        function count(string, substring, stopAtCount = Infinity) {
            let count = 0;
            let lastIndex = -1;
            while (count < stopAtCount) {
                const index = string.indexOf(substring, lastIndex + 1);
                if (index === -1)
                    return count;
                count++;
                lastIndex = index;
            }
            return count;
        }
        Strings.count = count;
        function includesOnce(string, substring) {
            return count(string, substring, 2) === 1;
        }
        Strings.includesOnce = includesOnce;
        function getVariations(name) {
            const variations = [name];
            variations.push(name + "d", name + "ed");
            if (name.endsWith("d"))
                variations.push(...getVariations(name.slice(0, -1)));
            if (name.endsWith("ed"))
                variations.push(...getVariations(name.slice(0, -2)));
            if (name.endsWith("ing")) {
                variations.push(name.slice(0, -3));
                if (name[name.length - 4] === name[name.length - 5])
                    variations.push(name.slice(0, -4));
            }
            else {
                variations.push(name + "ing", name + name[name.length - 1] + "ing");
                if (name.endsWith("y"))
                    variations.push(name.slice(0, -1) + "ing");
            }
            if (name.endsWith("ion")) {
                variations.push(...getVariations(name.slice(0, -3)));
                if (name[name.length - 4] === name[name.length - 5])
                    variations.push(name.slice(0, -4));
            }
            else
                variations.push(name + "ion");
            if (name.endsWith("er"))
                variations.push(name.slice(0, -1), name.slice(0, -2));
            else {
                variations.push(name + "r", name + "er");
                if (name.endsWith("y"))
                    variations.push(name.slice(0, -1) + "ier");
            }
            if (name.endsWith("ier"))
                variations.push(name.slice(0, -3) + "y");
            variations.push(name + "s", name + "es");
            if (name.endsWith("s"))
                variations.push(name.slice(0, -1));
            else {
                if (name.endsWith("y"))
                    variations.push(name.slice(0, -1) + "ies");
            }
            return variations;
        }
        Strings.getVariations = getVariations;
        const REGEX_APOSTROPHE = /'/g;
        const REGEX_NON_WORD_MULTI = /\W+/g;
        function getWords(text) {
            return text.toLowerCase()
                .replace(REGEX_APOSTROPHE, "")
                .split(REGEX_NON_WORD_MULTI)
                .filter(Boolean);
        }
        Strings.getWords = getWords;
        function fuzzyMatches(a, b, options) {
            options ??= {};
            options.missingWordsThreshold ??= 0.4;
            options.maxMissingWordsForFuzzy = 4;
            const wordsA = getWords(a).map(getVariations);
            const wordsB = getWords(b).map(getVariations);
            let matches = 0;
            let misses = 0;
            let ia = 0;
            let ib = 0;
            NextMain: while (true) {
                const va = wordsA[ia];
                const vb = wordsB[ib];
                if (!va && !vb)
                    break;
                if (!va || !vb) {
                    ia++;
                    ib++;
                    misses++;
                    continue;
                }
                let loopMisses = 0;
                for (let ia2 = ia; ia2 < wordsA.length && loopMisses <= options.maxMissingWordsForFuzzy; ia2++) {
                    const va = wordsA[ia2];
                    if (va.some(va => vb.includes(va))) {
                        ia = ia2 + 1;
                        ib++;
                        matches++;
                        misses += loopMisses;
                        continue NextMain;
                    }
                    loopMisses++;
                }
                loopMisses = 0;
                for (let ib2 = ib; ib2 < wordsB.length && loopMisses <= options.maxMissingWordsForFuzzy; ib2++) {
                    const vb = wordsB[ib2];
                    if (vb.some(vb => va.includes(vb))) {
                        ia++;
                        ib = ib2 + 1;
                        matches++;
                        misses += loopMisses;
                        continue NextMain;
                    }
                    loopMisses++;
                }
                misses++;
                ia++;
                ib++;
            }
            return matches / (matches + misses) >= options.missingWordsThreshold;
        }
        Strings.fuzzyMatches = fuzzyMatches;
        const REGEX_NON_WORD_MULTI_PREV = /(?<=\W+)/g;
        function toTitleCase(text) {
            return text.split(REGEX_NON_WORD_MULTI_PREV)
                .map(word => word[0].toUpperCase() + word.slice(1))
                .join("");
        }
        Strings.toTitleCase = toTitleCase;
    })(Strings || (Strings = {}));
    exports.default = Strings;
});
define("utility/Time", ["require", "exports", "utility/Strings"], function (require, exports, Strings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Time;
    (function (Time) {
        function floor(interval) {
            return Math.floor(Date.now() / interval) * interval;
        }
        Time.floor = floor;
        function ms(ms) { return ms; }
        Time.ms = ms;
        function seconds(seconds) { return seconds * 1000; }
        Time.seconds = seconds;
        function minutes(minutes) { return minutes * 1000 * 60; }
        Time.minutes = minutes;
        function hours(hours) { return hours * 1000 * 60 * 60; }
        Time.hours = hours;
        function days(days) { return days * 1000 * 60 * 60 * 24; }
        Time.days = days;
        function weeks(weeks) { return weeks * 1000 * 60 * 60 * 24 * 7; }
        Time.weeks = weeks;
        function months(months) { return Math.floor(months * 1000 * 60 * 60 * 24 * (365.2422 / 12)); }
        Time.months = months;
        function years(years) { return Math.floor(years * 1000 * 60 * 60 * 24 * 365.2422); }
        Time.years = years;
        function decades(decades) { return Math.floor(decades * 1000 * 60 * 60 * 24 * 365.2422 * 10); }
        Time.decades = decades;
        function centuries(centuries) { return Math.floor(centuries * 1000 * 60 * 60 * 24 * 365.2422 * 10 * 10); }
        Time.centuries = centuries;
        function millenia(millenia) { return Math.floor(millenia * 1000 * 60 * 60 * 24 * 365.2422 * 10 * 10 * 10); }
        Time.millenia = millenia;
        function relative(ms, options = { style: "short" }) {
            ms -= Date.now();
            const locale = navigator.language || "en-NZ";
            if (!locale.startsWith("en"))
                return relativeIntl(ms, locale, options);
            if (Math.abs(ms) < seconds(1))
                return "now";
            const ago = ms < 0;
            if (ago)
                ms = Math.abs(ms);
            let limit = options.components ?? Infinity;
            let value = ms;
            let result = ms > 0 && options.label !== false ? "in " : "";
            value = Math.floor(ms / years(1));
            ms -= value * years(1);
            if (value && limit-- > 0)
                result += `${value} year${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;
            value = Math.floor(ms / months(1));
            ms -= value * months(1);
            if (value && limit-- > 0)
                result += `${value} month${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;
            value = Math.floor(ms / weeks(1));
            ms -= value * weeks(1);
            if (value && limit-- > 0)
                result += `${value} week${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;
            value = Math.floor(ms / days(1));
            ms -= value * days(1);
            if (value && limit-- > 0)
                result += `${value} day${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;
            value = Math.floor(ms / hours(1));
            ms -= value * hours(1);
            if (value && limit-- > 0)
                result += `${value} hour${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;
            value = Math.floor(ms / minutes(1));
            ms -= value * minutes(1);
            if (value && limit-- > 0)
                result += `${value} minute${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;
            value = Math.floor(ms / seconds(1));
            if (value && limit-- > 0)
                result += `${value} second${value === 1 ? "" : "s"}`;
            result = Strings_1.default.trimTextMatchingFromEnd(result, ", ");
            return `${result}${ago && options.label !== false ? " ago" : ""}`;
        }
        Time.relative = relative;
        function relativeIntl(ms, locale, options) {
            const rtf = new Intl.RelativeTimeFormat(locale, options);
            let value = ms;
            value = Math.floor(ms / years(1));
            if (value)
                return rtf.format(value, "year");
            value = Math.floor(ms / months(1));
            if (value)
                return rtf.format(value, "month");
            value = Math.floor(ms / weeks(1));
            if (value)
                return rtf.format(value, "week");
            value = Math.floor(ms / days(1));
            if (value)
                return rtf.format(value, "day");
            value = Math.floor(ms / hours(1));
            if (value)
                return rtf.format(value, "hour");
            value = Math.floor(ms / minutes(1));
            if (value)
                return rtf.format(value, "minute");
            value = Math.floor(ms / seconds(1));
            return rtf.format(value, "second");
        }
        function absolute(ms, options = { dateStyle: "full", timeStyle: "medium" }) {
            const locale = navigator.language || "en-NZ";
            const rtf = new Intl.DateTimeFormat(locale, options);
            return rtf.format(ms);
        }
        Time.absolute = absolute;
    })(Time || (Time = {}));
    Object.assign(window, { Time });
    exports.default = Time;
});
define("utility/URL", ["require", "exports", "utility/EventManager"], function (require, exports, EventManager_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let params;
    let query;
    function updateURL() {
        let queryString = query.toString();
        if (queryString)
            queryString = `?${queryString}`;
        history.replaceState(null, "", `${location.origin}${location.pathname}${queryString}${location.hash}`);
    }
    let poppingState = false;
    EventManager_4.EventManager.global.subscribe("popstate", () => {
        poppingState = true;
        URL.event.emit("navigate");
        poppingState = false;
    });
    class URL {
        static get hash() {
            return location.hash.slice(1);
        }
        static set hash(value) {
            if (!poppingState)
                history.pushState(null, "", `${location.origin}${location.pathname}${location.search}${value ? `#${value}` : ""}`);
        }
        static get path() {
            const path = location.pathname.slice(location.pathname.startsWith("/beta/") ? 6 : 1);
            return !path || path === "/" ? null : path;
        }
        static set path(value) {
            if (value && location.pathname.startsWith("/beta/"))
                value = `/beta/${value}`;
            if (value && !value?.startsWith("/"))
                value = `/${value}`;
            if (!poppingState)
                history.pushState(null, "", `${location.origin}${value ?? "/"}${location.search}`);
        }
        static get params() {
            return params ??= new Proxy(query ??= new URLSearchParams(location.search), {
                has(params, key) {
                    return params.has(key);
                },
                get(params, key) {
                    return params.get(key);
                },
                set(params, key, value) {
                    params.set(key, value);
                    updateURL();
                    return true;
                },
                deleteProperty(params, key) {
                    params.delete(key);
                    updateURL();
                    return true;
                },
            });
        }
    }
    URL.event = EventManager_4.EventManager.make();
    exports.default = URL;
});
define("utility/endpoint/bungie/Bungie", ["require", "exports", "utility/endpoint/bungie/BungieEndpoint", "utility/endpoint/bungie/endpoint/RequestOAuthToken", "utility/Env", "utility/EventManager", "utility/Store", "utility/Time", "utility/URL"], function (require, exports, BungieEndpoint_2, RequestOAuthToken_1, Env_3, EventManager_5, Store_4, Time_1, URL_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BungieAPI = void 0;
    class BungieAPI {
        get lastDailyReset() {
            return this.nextDailyReset - Time_1.default.days(1);
        }
        get lastWeeklyReset() {
            return this.nextWeeklyReset - Time_1.default.weeks(1);
        }
        get lastTrialsReset() {
            return this.nextWeeklyReset - Time_1.default.days(4);
        }
        get nextDailyReset() {
            const time = new Date().setUTCHours(17, 0, 0, 0);
            return time < Date.now() ? time + Time_1.default.days(1) : time;
        }
        get nextWeeklyReset() {
            const now = Date.now();
            const week = now + (Time_1.default.weeks(1) - (now % Time_1.default.weeks(1))) - Time_1.default.days(1) - Time_1.default.hours(7);
            return week < Date.now() ? week + Time_1.default.weeks(1) : week;
        }
        constructor() {
            this.event = new EventManager_5.EventManager(this)
                .pipe("error", BungieEndpoint_2.default.event)
                .pipe("apiDown", BungieEndpoint_2.default.event)
                .pipe("querySuccess", BungieEndpoint_2.default.event);
            this.apiDown = false;
            BungieEndpoint_2.default.event.subscribe("authenticationFailed", () => this.resetAuthentication());
            BungieEndpoint_2.default.event.subscribe("validateAuthorisation", ({ setAuthorisationPromise, force }) => setAuthorisationPromise(this.validateAuthorisation(force)));
            BungieEndpoint_2.default.event.subscribe("apiDown", () => this.apiDown = true);
            BungieEndpoint_2.default.event.subscribe("querySuccess", () => this.apiDown = false);
            Object.assign(window, { Bungie: this });
        }
        get authenticated() {
            return !!(Store_4.default.items.bungieAuthCode && Store_4.default.items.bungieAccessToken);
        }
        async authenticate(type) {
            if (!Store_4.default.items.bungieAuthCode && !URL_1.default.params.code) {
                if (type !== "start") {
                    // the user didn't approve of starting auth yet
                    return;
                }
                // step 1: get an auth code for this user
                const clientId = Env_3.default.DEEPSIGHT_BUNGIE_CLIENT_ID;
                if (!clientId)
                    throw new Error("Cannot authenticate with Bungie, no client ID in environment");
                location.href = `https://www.bungie.net/en/oauth/authorize?client_id=${clientId}&response_type=code`; // &state=${state}`;
                return;
            }
            if (!Store_4.default.items.bungieAuthCode) {
                // step 2: receive auth code from bungie oauth
                // received auth code
                Store_4.default.items.bungieAuthCode = URL_1.default.params.code;
            }
            delete URL_1.default.params.code;
            // delete URL.params.state;
            if (!Store_4.default.items.bungieAccessToken) {
                // step 3: get an access token
                await this.requestToken();
            }
        }
        resetAuthentication() {
            delete URL_1.default.params.code;
            delete URL_1.default.params.state;
            delete Store_4.default.items.bungieAuthCode;
            delete Store_4.default.items.bungieAccessToken;
            delete Store_4.default.items.bungieAccessTokenExpireTime;
            delete Store_4.default.items.bungieAccessTokenMembershipId;
            delete Store_4.default.items.bungieAccessTokenRefreshExpireTime;
            delete Store_4.default.items.bungieAccessTokenRefreshToken;
            this.event.emit("resetAuthentication");
        }
        async validateAuthorisation(force = false) {
            if (!force && (Store_4.default.items.bungieAccessTokenExpireTime ?? 0) > Date.now())
                return; // authorisation valid
            await this.requestToken();
        }
        async requestToken() {
            const result = await RequestOAuthToken_1.default.query();
            if ("error" in result) {
                if (result.error === "invalid_grant") {
                    this.resetAuthentication();
                    throw Object.assign(new Error(result.error_description ?? "Invalid grant"), result);
                }
                return;
            }
            Store_4.default.items.bungieAccessToken = result.access_token;
            Store_4.default.items.bungieAccessTokenExpireTime = Date.now() + result.expires_in * 1000;
            Store_4.default.items.bungieAccessTokenMembershipId = result.membership_id;
            Store_4.default.items.bungieAccessTokenRefreshExpireTime = Date.now() + result.refresh_expires_in * 1000;
            Store_4.default.items.bungieAccessTokenRefreshToken = result.refresh_token;
            this.event.emit("authenticated");
        }
    }
    exports.BungieAPI = BungieAPI;
    exports.default = new BungieAPI;
});
define("utility/maths/Maths", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Maths;
    (function (Maths) {
        /**
         * Note: This implementation matches DIM's to ensure consistency between apps.
         * See: https://github.com/DestinyItemManager/DIM/blob/83ec236416fae879c09f4aa93be7d3be4843510d/src/app/inventory/store/stats.ts#L582-L585
         * Also see: https://github.com/Bungie-net/api/issues/1029#issuecomment-531849137
         */
        function bankersRound(x) {
            const r = Math.round(x);
            return (x > 0 ? x : -x) % 1 === 0.5 ? (0 === r % 2 ? r : r - 1) : r;
        }
        Maths.bankersRound = bankersRound;
        function sum(...nums) {
            let result = 0;
            for (const num of nums)
                result += num;
            return result;
        }
        Maths.sum = sum;
        function average(...nums) {
            let result = 0;
            for (const num of nums)
                result += num;
            return result / nums.length;
        }
        Maths.average = average;
        function bits(number) {
            const result = new BitsSet();
            for (let i = 52; i >= 0; i--) {
                const v = 1 << i;
                if (number & v)
                    result.add(v);
            }
            return result;
        }
        Maths.bits = bits;
        class BitsSet extends Set {
            everyIn(type) {
                const t = type ?? 0;
                for (const bit of this)
                    if (!(t & bit))
                        return false;
                return true;
            }
            someIn(type) {
                const t = type ?? 0;
                for (const bit of this)
                    if (t & bit)
                        return true;
                return false;
            }
            every(predicate) {
                for (const bit of this)
                    if (!predicate(bit))
                        return false;
                return true;
            }
            some(predicate) {
                for (const bit of this)
                    if (predicate(bit))
                        return true;
                return false;
            }
        }
        Maths.BitsSet = BitsSet;
        function bitsn(flag) {
            const result = new BitsSetN();
            for (let i = 52n; i >= 0n; i--) {
                const v = 1n << i;
                if (flag & v)
                    result.add(v);
            }
            return result;
        }
        Maths.bitsn = bitsn;
        class BitsSetN extends Set {
            everyIn(type) {
                const t = type ?? 0n;
                for (const bit of this)
                    if (!(t & bit))
                        return false;
                return true;
            }
            someIn(type) {
                const t = type ?? 0n;
                for (const bit of this)
                    if (t & bit)
                        return true;
                return false;
            }
            every(predicate) {
                for (const bit of this)
                    if (!predicate(bit))
                        return false;
                return true;
            }
            some(predicate) {
                for (const bit of this)
                    if (predicate(bit))
                        return true;
                return false;
            }
        }
        Maths.BitsSetN = BitsSetN;
        function lerp(from, to, t) {
            return (1 - t) * from + t * to;
        }
        Maths.lerp = lerp;
    })(Maths || (Maths = {}));
    exports.default = Maths;
});
define("model/Model", ["require", "exports", "model/ModelCacheDatabase", "utility/Arrays", "utility/Database", "utility/endpoint/bungie/Bungie", "utility/EventManager", "utility/maths/Maths"], function (require, exports, ModelCacheDatabase_1, Arrays_2, Database_2, Bungie_1, EventManager_6, Maths_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Model;
    (function (Model) {
        Model.cacheDB = new Database_2.default(ModelCacheDatabase_1.default);
        Model.event = EventManager_6.EventManager.make();
        let loadId = Date.now();
        async function clearCache(force = false) {
            console.warn("Clearing cache...");
            loadId = Date.now();
            if (force) {
                await Model.cacheDB.dispose();
                console.warn("Cache cleared.");
                Model.event.emit("clearCache");
                return;
            }
            for (const store of (await Model.cacheDB.stores())) {
                if (store === "models") {
                    for (const key of await Model.cacheDB.keys("models")) {
                        const cached = await Model.cacheDB.get("models", key);
                        if (cached?.persist && !force)
                            continue;
                        await Model.cacheDB.delete("models", key);
                    }
                }
                else if (force) {
                    await Model.cacheDB.clear(store);
                }
            }
            console.warn("Cache cleared.");
            Model.event.emit("clearCache");
        }
        Model.clearCache = clearCache;
        /**
         * Custom model implementation
         */
        function create(name, model) {
            return new Impl(name, model);
        }
        Model.create = create;
        /**
         * Data not cached, with optional name
         */
        function createTemporary(generate, name = "") {
            return new Impl(name, {
                cache: false,
                generate,
            });
        }
        Model.createTemporary = createTemporary;
        /**
         * Data cached only in memory, with optional reset time & name
         */
        function createDynamic(resetTime, generate, name = "") {
            return new Impl(name, {
                cache: "Memory",
                resetTime,
                generate,
            });
        }
        Model.createDynamic = createDynamic;
        class Impl {
            async getModelVersion() {
                this.modelVersion ??= (await (typeof this.model.version === "function" ? this.model.version() : this.model.version)) ?? 0;
                return this.modelVersion;
            }
            getCacheTime() {
                return this.cacheTime ?? Date.now();
            }
            get loading() {
                return this.value === undefined
                    || this.value instanceof Promise
                    || (this.model.cache ? !this.isCacheValid() : false);
            }
            get loadingInfo() {
                return this._loadingInfo;
            }
            get latest() {
                return this._latest;
            }
            constructor(name, model) {
                this.name = name;
                this.model = model;
                this.event = new EventManager_6.EventManager(this);
                this.loadId = loadId;
                this.errored = false;
                Object.assign(this, model.api);
            }
            isCacheValid(cacheTime = this.cacheTime, version = this.version, resetTime = this.model.resetTime) {
                if (cacheTime === undefined)
                    return false;
                if (this.loadId !== loadId)
                    return false;
                if (this.modelVersion === undefined || this.modelVersion !== version)
                    return false;
                if (!this.model.cache)
                    return false;
                if (resetTime === undefined)
                    return true;
                if (typeof resetTime === "number")
                    return Date.now() < cacheTime + resetTime;
                return cacheTime > Bungie_1.default[`last${resetTime}Reset`];
            }
            async resolveCache(includeExpired = false) {
                if (!this.model.cache || this.model.cache === "Memory")
                    return undefined;
                const cached = await Model.cacheDB.get("models", this.name);
                if (!cached)
                    return undefined;
                await this.getModelVersion();
                if (includeExpired === true || this.isCacheValid(cached.cacheTime, cached.version, includeExpired === "initial" ? this.model.useCacheOnInitial : undefined)) {
                    // this cached value is valid
                    console.debug(`Using cached data for '${this.name}', cached at ${new Date(cached.cacheTime).toLocaleString()}`);
                    this._latest = this.value = (this.model.process?.(cached.value) ?? cached.value ?? null);
                    this.cacheTime = cached.cacheTime;
                    this.version = cached.version;
                    this.event.emit("loaded", { value: this.value ?? undefined });
                    return this.value ?? undefined;
                }
                // we don't purge the data anymore so that deepsight.gg can show your inventory even if bungie's api is down
                // console.debug(`Purging expired cache data for '${this.name}'`);
                // await this.reset();
                this.model.cacheInvalidated?.(cached.value);
                this.event.emit("invalidCache");
                return undefined;
            }
            async reset(value) {
                if (!this.model.reset)
                    this._latest = this.value = value = undefined;
                else {
                    if (!value) {
                        const cached = await Model.cacheDB.get("models", this.name);
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        value = cached?.value;
                    }
                    await this.model.reset?.(value);
                }
                await Model.cacheDB.delete("models", this.name);
                delete this.modelVersion;
                await this.getModelVersion();
            }
            get() {
                if (this.value !== undefined && !(this.value instanceof Promise))
                    if (!this.isCacheValid())
                        delete this.value;
                if (this.value === undefined || this.errored) {
                    if (this.name)
                        console.debug(`No value in memory for '${this.name}'`);
                    this.event.emit("loading");
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
                    const promise = new Promise(async (resolve, reject) => {
                        if (this.model.cache && this.model.cache !== "Memory") {
                            const cached = await this.resolveCache();
                            if (cached)
                                return resolve(cached);
                        }
                        if (!this.model.generate)
                            // this model can't be generated on its own, it must be initialised instead
                            // in this case, wait for the loaded event and return the new value
                            return resolve(this.event.waitFor("loaded")
                                .then(({ value }) => value));
                        const subscriptions = new Map();
                        let lastMessage = [];
                        const api = {
                            setCacheTime: (cacheTimeSupplier) => this.getCacheTime = cacheTimeSupplier,
                            emitProgress: (progress, messages, bubbled = false) => {
                                messages = Arrays_2.default.resolve(messages);
                                this._loadingInfo = { progress, messages };
                                // console.debug(`Load progress ${Math.floor(progress * 100)}%: ${messages.join(" ") || "Loading"}`);
                                if (!bubbled) {
                                    lastMessage = messages;
                                    for (const [model, handleSubUpdate] of [...subscriptions]) {
                                        model.event.unsubscribe("loadUpdate", handleSubUpdate);
                                        subscriptions.delete(model);
                                    }
                                }
                                this.event.emit("loadUpdate", { progress, messages });
                            },
                            subscribeProgress: (model, amount, from = 0) => {
                                if (model.loading) {
                                    if (subscriptions.has(model))
                                        return api;
                                    const handleSubUpdate = ({ progress: subAmount, messages }) => 
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                    api.emitProgress(from + subAmount * amount, [...messages, ...lastMessage].filter(m => m), true);
                                    model.event.subscribe("loadUpdate", handleSubUpdate);
                                    subscriptions.set(model, handleSubUpdate);
                                    model.event.subscribeOnce("loaded", () => {
                                        model.event.unsubscribe("loadUpdate", handleSubUpdate);
                                        subscriptions.delete(model);
                                    });
                                }
                                return api;
                            },
                            subscribeProgressAndWait: (model, amount, from) => {
                                api.subscribeProgress(model, amount, from);
                                return model.await();
                            },
                            subscribeProgressAndWaitAll: (models, amount, from = 0) => {
                                const progresses = models.map(() => 0);
                                const messageses = models.map(() => []);
                                for (let i = 0; i < models.length; i++) {
                                    const model = models[i];
                                    if (!model.loading || subscriptions.has(model)) {
                                        progresses[i] = 1;
                                        continue;
                                    }
                                    const handleSubUpdate = ({ progress: subAmount, messages }) => {
                                        const progress = from + subAmount * amount;
                                        progresses[i] = progress;
                                        messageses[i] = messages;
                                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                        api.emitProgress(Maths_1.default.average(...progresses), [...messageses.flat(), ...lastMessage].filter(m => m), true);
                                    };
                                    model.event.subscribe("loadUpdate", handleSubUpdate);
                                    subscriptions.set(model, handleSubUpdate);
                                    model.event.subscribeOnce("loaded", () => {
                                        model.event.unsubscribe("loadUpdate", handleSubUpdate);
                                        subscriptions.delete(model);
                                    });
                                }
                                return Promise.all(models.map(model => model.await()));
                            },
                        };
                        const generated = Promise.resolve(this.model.generate?.(api));
                        void generated.catch(async (error) => {
                            console.error(`Model '${this.name}' failed to load:`, error);
                            if (this.model.useCacheOnError) {
                                const cached = await this.resolveCache(true);
                                if (cached)
                                    return resolve(cached);
                            }
                            this.event.emit("errored", { error: error });
                            this.errored = true;
                            reject(error);
                        });
                        void generated.then(async (value) => {
                            resolve(await this.set(value));
                        });
                    });
                    this.errored = false;
                    this.value = promise ?? null;
                    return undefined;
                }
                if (this.value instanceof Promise)
                    return undefined;
                return this.value ?? undefined;
            }
            async set(value) {
                const filtered = (this.model.process?.(value) ?? value);
                this._latest = this.value = (filtered ?? null);
                this.cacheTime = Date.now();
                this.version = await this.getModelVersion();
                this.loadId = loadId;
                if (this.model.cache && this.model.cache !== "Memory") {
                    const cached = { cacheTime: this.cacheTime, value, version: this.version };
                    if (this.model.cache === "Global")
                        cached.persist = true;
                    void Model.cacheDB.set("models", this.name, cached);
                }
                this.event.emit("loaded", { value: filtered });
                if (this.name)
                    console.debug(`${!this.model.cache || this.model.cache === "Memory" ? "Loaded" : "Cached"} data for '${this.name}'`);
                return filtered;
            }
            async await() {
                return this.get() ?? (await Promise.resolve(this.value)) ?? undefined;
            }
        }
        Model.Impl = Impl;
    })(Model || (Model = {}));
    exports.default = Model;
});
define("utility/endpoint/bungie/endpoint/user/GetMembershipsForCurrentUser", ["require", "exports", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, BungieEndpoint_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_3.default
        .at("/User/GetMembershipsForCurrentUser/")
        .returning();
});
define("model/models/Memberships", ["require", "exports", "model/Model", "utility/endpoint/bungie/Bungie", "utility/endpoint/bungie/endpoint/user/GetMembershipsForCurrentUser", "utility/Store"], function (require, exports, Model_1, Bungie_2, GetMembershipsForCurrentUser_1, Store_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCurrentDestinyMembership = void 0;
    const Memberships = Model_1.default.create("memberships", {
        cache: "Session",
        resetTime: "Daily",
        generate: () => GetMembershipsForCurrentUser_1.default.query(),
    });
    exports.default = Memberships;
    async function getCurrentDestinyMembership(api, amount, from) {
        if (!Bungie_2.default.authenticated)
            return undefined;
        const memberships = await (api?.subscribeProgressAndWait(Memberships, amount ?? 1) ?? Memberships.await());
        if (Store_5.default.items.destinyMembershipType === undefined) {
            const firstMembership = memberships.destinyMemberships[0];
            if (!firstMembership.crossSaveOverride)
                return firstMembership;
            return memberships.destinyMemberships.find(membership => membership.membershipType === firstMembership.crossSaveOverride)
                ?? firstMembership;
        }
        const selectedMembership = memberships.destinyMemberships.find(membership => membership.membershipType === Store_5.default.items.destinyMembershipType)
            ?? memberships.destinyMemberships[0];
        return selectedMembership;
    }
    exports.getCurrentDestinyMembership = getCurrentDestinyMembership;
});
define("utility/endpoint/bungie/endpoint/destiny2/GetProfile", ["require", "exports", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, BungieEndpoint_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_4.default
        .at((membershipType, destinyMembershipId, components) => `/Destiny2/${membershipType}/Profile/${destinyMembershipId}/`)
        .request((membershipType, destinyMembershipId, components) => ({
        search: {
            components: components.join(","),
        },
    }))
        .returning();
});
define("model/models/Profile", ["require", "exports", "model/Model", "model/models/Memberships", "utility/endpoint/bungie/endpoint/destiny2/GetProfile", "utility/Store", "utility/Time"], function (require, exports, Model_2, Memberships_1, GetProfile_1, Store_6, Time_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function makeProfileResponseComponentMap(map) {
        return map;
    }
    const profileResponseComponentMap = makeProfileResponseComponentMap({
        vendorReceipts: 101 /* DestinyComponentType.VendorReceipts */,
        profileInventory: 102 /* DestinyComponentType.ProfileInventories */,
        profileCurrencies: 103 /* DestinyComponentType.ProfileCurrencies */,
        profile: 100 /* DestinyComponentType.Profiles */,
        platformSilver: 105 /* DestinyComponentType.PlatformSilver */,
        profileKiosks: 500 /* DestinyComponentType.Kiosks */,
        profilePlugSets: 305 /* DestinyComponentType.ItemSockets */,
        profileProgression: 104 /* DestinyComponentType.ProfileProgression */,
        profilePresentationNodes: 700 /* DestinyComponentType.PresentationNodes */,
        profileRecords: 900 /* DestinyComponentType.Records */,
        profileCollectibles: 800 /* DestinyComponentType.Collectibles */,
        profileTransitoryData: 1000 /* DestinyComponentType.Transitory */,
        metrics: 1100 /* DestinyComponentType.Metrics */,
        profileStringVariables: 1200 /* DestinyComponentType.StringVariables */,
        characters: 200 /* DestinyComponentType.Characters */,
        characterInventories: 201 /* DestinyComponentType.CharacterInventories */,
        characterProgressions: 202 /* DestinyComponentType.CharacterProgressions */,
        characterRenderData: 203 /* DestinyComponentType.CharacterRenderData */,
        characterActivities: 204 /* DestinyComponentType.CharacterActivities */,
        characterEquipment: 205 /* DestinyComponentType.CharacterEquipment */,
        characterKiosks: 500 /* DestinyComponentType.Kiosks */,
        characterPlugSets: 305 /* DestinyComponentType.ItemSockets */,
        characterUninstancedItemComponents: undefined,
        characterPresentationNodes: 700 /* DestinyComponentType.PresentationNodes */,
        characterRecords: 900 /* DestinyComponentType.Records */,
        characterCollectibles: 800 /* DestinyComponentType.Collectibles */,
        characterStringVariables: 1200 /* DestinyComponentType.StringVariables */,
        characterCraftables: 1300 /* DestinyComponentType.Craftables */,
        itemComponents: [
            300 /* DestinyComponentType.ItemInstances */,
            303 /* DestinyComponentType.ItemRenderData */,
            304 /* DestinyComponentType.ItemStats */,
            305 /* DestinyComponentType.ItemSockets */,
            310 /* DestinyComponentType.ItemReusablePlugs */,
            309 /* DestinyComponentType.ItemPlugObjectives */,
            306 /* DestinyComponentType.ItemTalentGrids */,
            308 /* DestinyComponentType.ItemPlugStates */,
            301 /* DestinyComponentType.ItemObjectives */,
            302 /* DestinyComponentType.ItemPerks */,
        ],
        characterCurrencyLookups: 600 /* DestinyComponentType.CurrencyLookups */,
        profileCommendations: 1400 /* DestinyComponentType.SocialCommendations */,
        characterLoadouts: 206 /* DestinyComponentType.CharacterLoadouts */,
    });
    class ComponentModel extends Model_2.default.Impl {
        constructor(type) {
            const applicableKeys = [];
            for (const [key, applicableComponents] of Object.entries(profileResponseComponentMap)) {
                if (applicableComponents === undefined)
                    continue;
                const applicable = typeof applicableComponents === "number" ? applicableComponents === type
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                    : applicableComponents.includes(type);
                if (applicable)
                    applicableKeys.push(key);
            }
            super(`profile#${type} [${applicableKeys.join(",")}]`, {
                cache: "Session",
                resetTime: Time_2.default.seconds(20),
                useCacheOnInitial: Time_2.default.days(1),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                generate: undefined,
            });
            this.type = type;
            this.applicableKeys = applicableKeys;
        }
        async update(response) {
            const newData = {};
            let hasNewData = false;
            for (const key of this.applicableKeys) {
                if (response[key] !== undefined) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    newData[key] = response[key];
                    hasNewData = true;
                }
            }
            if (hasNewData)
                await this.set(newData);
        }
    }
    const models = {};
    let lastOperation;
    function mergeProfile(profileInto, profileFrom) {
        const keys = new Set([...Object.keys(profileInto), ...Object.keys(profileFrom)]);
        keys.delete("_header");
        for (const key of keys) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            profileInto[key] = mergeProfileKey(key, profileInto[key], profileFrom[key]);
        }
    }
    function mergeProfileKey(key, value1, value2) {
        if (value1 && value2) {
            if (Array.isArray(profileResponseComponentMap[key]))
                return { ...value1, ...value2 };
            // overwrite if this is only a single component
            return value2;
        }
        return value1 ?? value2;
    }
    let isInitial = true;
    function Profile(...components) {
        const initial = isInitial;
        isInitial = false;
        components.sort();
        for (const component of components)
            models[component] ??= new ComponentModel(component);
        // const name = `profile [${components.flatMap(component => models[component]!.applicableKeys).join(",")}]`;
        return Model_2.default.createDynamic(Time_2.default.seconds(30), async (api) => {
            const result = {};
            // only allow one profile query at a time
            while (lastOperation)
                await lastOperation;
            // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
            lastOperation = (async () => {
                api.emitProgress(0, "Fetching profile");
                const missingComponents = [];
                for (const component of components) {
                    const cached = await models[component]?.resolveCache(initial ? "initial" : undefined);
                    if (cached) {
                        mergeProfile(result, cached);
                    }
                    else
                        missingComponents.push(component);
                }
                if (!missingComponents.length)
                    // all components cached, no need to make a request to bungie
                    return;
                if (missingComponents.some(component => profileResponseComponentMap.itemComponents.includes(component)))
                    if (!missingComponents.includes(102 /* DestinyComponentType.ProfileInventories */) && !missingComponents.includes(201 /* DestinyComponentType.CharacterInventories */) && !missingComponents.includes(205 /* DestinyComponentType.CharacterEquipment */)) {
                        if (components.includes(201 /* DestinyComponentType.CharacterInventories */))
                            missingComponents.push(201 /* DestinyComponentType.CharacterInventories */);
                        if (components.includes(205 /* DestinyComponentType.CharacterEquipment */))
                            missingComponents.push(205 /* DestinyComponentType.CharacterEquipment */);
                        if (components.includes(102 /* DestinyComponentType.ProfileInventories */ || (!missingComponents.includes(201 /* DestinyComponentType.CharacterInventories */) && !missingComponents.includes(205 /* DestinyComponentType.CharacterEquipment */))))
                            missingComponents.push(102 /* DestinyComponentType.ProfileInventories */);
                    }
                api.emitProgress(1 / 3, "Fetching profile");
                const membership = await (0, Memberships_1.getCurrentDestinyMembership)();
                if (!membership)
                    throw new Error("Can't load profile without membership");
                const newData = await GetProfile_1.default.query(membership.membershipType, membership.membershipId, missingComponents);
                mergeProfile(result, newData);
                result.lastModified = new Date(newData._headers.get("Last-Modified") ?? Date.now());
                Store_6.default.items.profileLastModified = result.lastModified.toISOString();
                for (let i = 0; i < components.length; i++) {
                    const component = components[i];
                    api.emitProgress(2 / 3 + 1 / 3 * (i / components.length), "Storing profile");
                    await models[component].update(newData);
                }
            })().catch(async () => {
                const missingComponents = [];
                let hadComponents = false;
                for (const component of components) {
                    const cached = await models[component]?.resolveCache(true);
                    if (cached) {
                        hadComponents = true;
                        mergeProfile(result, cached);
                    }
                    else {
                        missingComponents.push(component);
                    }
                }
                if (hadComponents && missingComponents.length)
                    console.warn("Missing profile components in cache:", ...missingComponents);
            });
            await lastOperation;
            lastOperation = undefined;
            api.emitProgress(3 / 3);
            result.lastModified ??= new Date(Store_6.default.items.profileLastModified ?? Date.now());
            return result;
        });
    }
    (function (Profile) {
        function reset() {
            for (const component of Object.values(profileResponseComponentMap).flat()) {
                if (component) {
                    models[component] ??= new ComponentModel(component);
                    void models[component]?.reset();
                }
            }
        }
        Profile.reset = reset;
    })(Profile || (Profile = {}));
    exports.default = Profile;
});
define("model/models/ProfileBatch", ["require", "exports", "model/Model", "model/models/Profile", "utility/Time"], function (require, exports, Model_3, Profile_1, Time_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const allComponentTypes = [
        100 /* DestinyComponentType.Profiles */,
        101 /* DestinyComponentType.VendorReceipts */,
        102 /* DestinyComponentType.ProfileInventories */,
        103 /* DestinyComponentType.ProfileCurrencies */,
        104 /* DestinyComponentType.ProfileProgression */,
        105 /* DestinyComponentType.PlatformSilver */,
        200 /* DestinyComponentType.Characters */,
        201 /* DestinyComponentType.CharacterInventories */,
        202 /* DestinyComponentType.CharacterProgressions */,
        203 /* DestinyComponentType.CharacterRenderData */,
        204 /* DestinyComponentType.CharacterActivities */,
        205 /* DestinyComponentType.CharacterEquipment */,
        206 /* DestinyComponentType.CharacterLoadouts */,
        300 /* DestinyComponentType.ItemInstances */,
        301 /* DestinyComponentType.ItemObjectives */,
        302 /* DestinyComponentType.ItemPerks */,
        303 /* DestinyComponentType.ItemRenderData */,
        304 /* DestinyComponentType.ItemStats */,
        305 /* DestinyComponentType.ItemSockets */,
        306 /* DestinyComponentType.ItemTalentGrids */,
        307 /* DestinyComponentType.ItemCommonData */,
        308 /* DestinyComponentType.ItemPlugStates */,
        309 /* DestinyComponentType.ItemPlugObjectives */,
        310 /* DestinyComponentType.ItemReusablePlugs */,
        400 /* DestinyComponentType.Vendors */,
        401 /* DestinyComponentType.VendorCategories */,
        402 /* DestinyComponentType.VendorSales */,
        500 /* DestinyComponentType.Kiosks */,
        600 /* DestinyComponentType.CurrencyLookups */,
        700 /* DestinyComponentType.PresentationNodes */,
        800 /* DestinyComponentType.Collectibles */,
        900 /* DestinyComponentType.Records */,
        1000 /* DestinyComponentType.Transitory */,
        1100 /* DestinyComponentType.Metrics */,
        1200 /* DestinyComponentType.StringVariables */,
        1300 /* DestinyComponentType.Craftables */,
        1400 /* DestinyComponentType.SocialCommendations */,
    ];
    allComponentTypes;
    const ProfileBatch = Model_3.default.createDynamic(Time_3.default.seconds(30), async (api) => {
        api.emitProgress(0, "Loading profile");
        const ProfileQuery = (0, Profile_1.default)(100 /* DestinyComponentType.Profiles */, 200 /* DestinyComponentType.Characters */, 104 /* DestinyComponentType.ProfileProgression */, 206 /* DestinyComponentType.CharacterLoadouts */, 201 /* DestinyComponentType.CharacterInventories */, 205 /* DestinyComponentType.CharacterEquipment */, 102 /* DestinyComponentType.ProfileInventories */, 300 /* DestinyComponentType.ItemInstances */, 309 /* DestinyComponentType.ItemPlugObjectives */, 304 /* DestinyComponentType.ItemStats */, 900 /* DestinyComponentType.Records */, 305 /* DestinyComponentType.ItemSockets */, 310 /* DestinyComponentType.ItemReusablePlugs */, 308 /* DestinyComponentType.ItemPlugStates */, 302 /* DestinyComponentType.ItemPerks */, 202 /* DestinyComponentType.CharacterProgressions */, 800 /* DestinyComponentType.Collectibles */, 204 /* DestinyComponentType.CharacterActivities */, // displaying whether items are currently obtainable
        1200 /* DestinyComponentType.StringVariables */);
        const profile = await ProfileQuery.await();
        Object.assign(window, { profile });
        // const membership = await getCurrentDestinyMembership();
        // const characters = await Promise.all(Object.keys(profile.characters?.data ?? Objects.EMPTY)
        // 	.map(characterId => GetCharacter.query(membership.membershipType, membership.membershipId, characterId as CharacterId, [
        // 		...allComponentTypes,
        // 	])));
        // console.log(characters);
        return profile;
    }, "Profile");
    exports.default = ProfileBatch;
});
define("utility/decorator/Bound", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Final = exports.Bound = void 0;
    function Bound(target, key, descriptor) {
        return Bounder(target, key, descriptor);
    }
    exports.Bound = Bound;
    function Final(target, key, descriptor) {
        return Bounder(target, key, descriptor);
    }
    exports.Final = Final;
    function Bounder(target, key, descriptor) {
        return {
            configurable: false,
            enumerable: descriptor.enumerable,
            get() {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, no-prototype-builtins
                if (!this || this === target.prototype || this.hasOwnProperty(key) || typeof descriptor.value !== "function") {
                    return descriptor.value;
                }
                const value = descriptor.value.bind(this);
                Object.defineProperty(this, key, {
                    configurable: false,
                    enumerable: descriptor.enumerable,
                    value,
                });
                return value;
            },
        };
    }
    exports.default = Bound;
});
define("utility/endpoint/clarity/ClarityEndpoint", ["require", "exports", "utility/endpoint/Endpoint"], function (require, exports, Endpoint_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ClarityEndpoint extends Endpoint_2.default {
        constructor(path, init) {
            super(path);
            Object.assign(this, init);
        }
        resolvePath() {
            return `https://database-clarity.github.io/Live-Clarity-Database/${super.resolvePath()}`;
        }
    }
    exports.default = ClarityEndpoint;
});
define("utility/endpoint/clarity/endpoint/GetClarityDescriptions", ["require", "exports", "utility/endpoint/clarity/ClarityEndpoint"], function (require, exports, ClarityEndpoint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new ClarityEndpoint_1.default("descriptions/clarity.json");
});
define("utility/endpoint/clarity/endpoint/GetClarityDatabase", ["require", "exports", "utility/endpoint/Endpoint", "utility/endpoint/clarity/endpoint/GetClarityDescriptions"], function (require, exports, Endpoint_3, GetClarityDescriptions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = (new class extends Endpoint_3.default {
        constructor() {
            super("");
        }
        async query() {
            const result = {
                ClarityDescriptions: await GetClarityDescriptions_1.default.query(),
            };
            Object.defineProperty(result, "_headers", {
                enumerable: false,
                get: () => new Headers(),
            });
            return result;
        }
    });
});
define("utility/endpoint/deepsight/DeepsightEndpoint", ["require", "exports", "utility/endpoint/Endpoint"], function (require, exports, Endpoint_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DeepsightEndpoint extends Endpoint_4.default {
        constructor(path, init) {
            super(`/manifest/${path}`);
            Object.assign(this, init);
        }
    }
    exports.default = DeepsightEndpoint;
});
define("utility/endpoint/deepsight/endpoint/GetDeepsightDropTableDefinition", ["require", "exports", "utility/endpoint/deepsight/DeepsightEndpoint"], function (require, exports, DeepsightEndpoint_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new DeepsightEndpoint_1.default("DeepsightDropTableDefinition.json");
});
define("utility/endpoint/deepsight/endpoint/GetDeepsightMomentDefinition", ["require", "exports", "utility/endpoint/deepsight/DeepsightEndpoint"], function (require, exports, DeepsightEndpoint_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new DeepsightEndpoint_2.default("DeepsightMomentDefinition.json");
});
define("utility/endpoint/deepsight/endpoint/GetDeepsightPlugCategorisation", ["require", "exports", "utility/endpoint/deepsight/DeepsightEndpoint"], function (require, exports, DeepsightEndpoint_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new DeepsightEndpoint_3.default("DeepsightPlugCategorisation.json");
});
define("utility/endpoint/deepsight/endpoint/GetDeepsightTierTypeDefinition", ["require", "exports", "utility/endpoint/deepsight/DeepsightEndpoint"], function (require, exports, DeepsightEndpoint_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new DeepsightEndpoint_4.default("DeepsightTierTypeDefinition.json");
});
define("utility/endpoint/deepsight/endpoint/GetDeepsightVendorDefinition", ["require", "exports", "utility/endpoint/deepsight/DeepsightEndpoint"], function (require, exports, DeepsightEndpoint_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new DeepsightEndpoint_5.default("DeepsightVendorDefinition.json");
});
define("utility/endpoint/deepsight/endpoint/GetDeepsightWallpaperDefinition", ["require", "exports", "utility/endpoint/deepsight/DeepsightEndpoint"], function (require, exports, DeepsightEndpoint_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new DeepsightEndpoint_6.default("DeepsightWallpaperDefinition.json");
});
define("utility/endpoint/deepsight/endpoint/GetDeepsightManifest", ["require", "exports", "utility/endpoint/deepsight/endpoint/GetDeepsightDropTableDefinition", "utility/endpoint/deepsight/endpoint/GetDeepsightMomentDefinition", "utility/endpoint/deepsight/endpoint/GetDeepsightPlugCategorisation", "utility/endpoint/deepsight/endpoint/GetDeepsightTierTypeDefinition", "utility/endpoint/deepsight/endpoint/GetDeepsightVendorDefinition", "utility/endpoint/deepsight/endpoint/GetDeepsightWallpaperDefinition", "utility/endpoint/Endpoint"], function (require, exports, GetDeepsightDropTableDefinition_1, GetDeepsightMomentDefinition_1, GetDeepsightPlugCategorisation_1, GetDeepsightTierTypeDefinition_1, GetDeepsightVendorDefinition_1, GetDeepsightWallpaperDefinition_1, Endpoint_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = (new class extends Endpoint_5.default {
        constructor() {
            super("");
        }
        async query() {
            const result = {
                DeepsightMomentDefinition: await GetDeepsightMomentDefinition_1.default.query(),
                DeepsightWallpaperDefinition: await GetDeepsightWallpaperDefinition_1.default.query(),
                DeepsightDropTableDefinition: await GetDeepsightDropTableDefinition_1.default.query(),
                DeepsightPlugCategorisation: await GetDeepsightPlugCategorisation_1.default.query(),
                DeepsightTierTypeDefinition: await GetDeepsightTierTypeDefinition_1.default.query(),
                DeepsightVendorDefinition: await GetDeepsightVendorDefinition_1.default.query(),
            };
            Object.defineProperty(result, "_headers", {
                enumerable: false,
                get: () => new Headers(),
            });
            return result;
        }
    });
});
define("model/models/manifest/IManifest", ["require", "exports", "model/Model", "utility/decorator/Bound"], function (require, exports, Model_4, Bound_1) {
    "use strict";
    var _ManifestItem_instances, _ManifestItem_generate;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ManifestItem = exports.IManifest = void 0;
    var IManifest;
    (function (IManifest) {
        function elapsed(elapsed) {
            if (elapsed < 1)
                return `${Math.floor(elapsed * 1000)} μs`;
            if (elapsed < 1000)
                return `${Math.floor(elapsed)} ms`;
            if (elapsed < 60000)
                return `${+(elapsed / 1000).toFixed(2)} s`;
            return `${+(elapsed / 60000).toFixed(2)} m`;
        }
        IManifest.elapsed = elapsed;
        let CacheComponentKey;
        (function (CacheComponentKey) {
            function get(componentName) {
                return `manifest [${componentName}]`;
            }
            CacheComponentKey.get = get;
            function getBundle(componentName) {
                return `manifest bundle [${componentName}]`;
            }
            CacheComponentKey.getBundle = getBundle;
        })(CacheComponentKey = IManifest.CacheComponentKey || (IManifest.CacheComponentKey = {}));
    })(IManifest || (exports.IManifest = IManifest = {}));
    class ManifestItem {
        static logQueryCounts() {
            console.debug("Query counts:", Object.fromEntries(Object.entries(ManifestItem["queryCounts"])
                .map(([over, counts]) => [over, Object.entries(counts)
                    .sort(([, a], [, b]) => b - a)])));
        }
        constructor(componentName, hostModel) {
            _ManifestItem_instances.add(this);
            this.componentName = componentName;
            this.hostModel = hostModel;
            this.memoryCache = {};
            this.stagedTransaction = Model_4.default.cacheDB.stagedTransaction([IManifest.CacheComponentKey.get(componentName)]);
            this.modelCache = Model_4.default.create(IManifest.CacheComponentKey.getBundle(componentName), {
                cache: "Global",
                generate: () => this.createCache(),
            });
        }
        get(index, key) {
            if (key === undefined)
                key = index, index = undefined;
            if (key === undefined || key === null)
                return undefined;
            const memoryCacheKey = `${index ?? "/"}:${key}`;
            if (memoryCacheKey in this.memoryCache)
                return this.memoryCache[memoryCacheKey] ?? undefined;
            return this.resolve(memoryCacheKey, key, index);
        }
        async resolve(memoryCacheKey, key, index, cached = true) {
            await this.loadCache();
            if (memoryCacheKey in this.memoryCache)
                return this.memoryCache[memoryCacheKey] ?? undefined;
            const counts = ManifestItem.queryCounts[this.componentName] ??= {};
            counts[key] ??= 0;
            counts[key]++;
            ManifestItem.queryCounts.ALL ??= {};
            ManifestItem.queryCounts.ALL[key] ??= 0;
            ManifestItem.queryCounts.ALL[key]++;
            const promise = this.stagedTransaction.get(IManifest.CacheComponentKey.get(this.componentName), `${key}`, index)
                .then(value => {
                if (cached) {
                    this.memoryCache[memoryCacheKey] = value ?? null;
                    this.updateManifestCache();
                }
                return value ?? undefined;
            });
            if (cached)
                this.memoryCache[memoryCacheKey] = promise;
            return promise;
        }
        all(index, key) {
            if (!this.manifestCacheState)
                return this.loadCache()
                    .then(() => this.all(index, key));
            const componentKey = IManifest.CacheComponentKey.get(this.componentName);
            if (index)
                return this.stagedTransaction.all(componentKey, `${key}`, index);
            return this.allCache ??= !this.allCached
                ? this.stagedTransaction.all(componentKey).then(this.filterAllNoDuplicates).then(all => this.allCache = all)
                : this.filterAllNoDuplicates(Object.values(this.memoryCache));
        }
        filterAllNoDuplicates(all) {
            const result = [];
            const hashes = new Set();
            for (const value of all) {
                if (value === null)
                    continue;
                if (value.hash === undefined) {
                    console.warn("Can't filter out duplicates for", this.componentName, "as there is no hash");
                    return all;
                }
                if (hashes.has(value.hash))
                    continue;
                result.push(value);
                hashes.add(value.hash);
            }
            return result;
        }
        primaryKeys(index, key) {
            const componentKey = IManifest.CacheComponentKey.get(this.componentName);
            if (index)
                return this.stagedTransaction.primaryKeys(componentKey, key === undefined ? undefined : `${key}`, index);
            return this.stagedTransaction.primaryKeys(componentKey);
        }
        indexKeys(index, mapper) {
            const componentKey = IManifest.CacheComponentKey.get(this.componentName);
            return this.stagedTransaction.indexKeys(componentKey, index, mapper);
        }
        async loadCache() {
            await (this.generationPromise ??= __classPrivateFieldGet(this, _ManifestItem_instances, "m", _ManifestItem_generate).call(this));
            delete this.generationPromise;
            if (this.manifestCacheState !== undefined)
                return this.manifestCacheState ? undefined : this.loadedManifestCache;
            this.manifestCacheState = false;
            return this.loadedManifestCache = (async () => {
                const bundleKey = IManifest.CacheComponentKey.getBundle(this.componentName);
                console.debug("Loading", bundleKey);
                const hasCache = !!await this.modelCache.resolveCache();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                this.memoryCache = await this.modelCache.await();
                if (!hasCache) {
                    console.debug("Generating initial", bundleKey);
                    const cacheKeyRange = async (keyRange = this.cacheAllKeyRange && this.cacheAllKeyRange !== true ? this.cacheAllKeyRange : undefined) => {
                        const all = await this.stagedTransaction.all(IManifest.CacheComponentKey.get(this.componentName), keyRange);
                        for (const value of all) {
                            if ("hash" in value) {
                                const memoryCacheKey = `/:${value.hash}`;
                                this.memoryCache[memoryCacheKey] = value;
                            }
                        }
                    };
                    if (this.allCached !== undefined || this.cacheAllKeyRange !== undefined) {
                        await cacheKeyRange();
                    }
                    await this.cacheInitialiser?.(this.memoryCache, cacheKeyRange);
                    // save changes
                    clearTimeout(this.manifestCacheUpdateTimeout);
                    await this.modelCache.reset();
                    await this.modelCache.await();
                }
                if (this.allCached === false || this.allCached === true)
                    this.allCached = true;
                this.manifestCacheState = true;
                console.debug("Loaded", bundleKey);
                if (!this.subscribedToClearCache)
                    Model_4.default.event.subscribe("clearCache", () => {
                        delete this.manifestCacheState;
                        if (this.allCached === true)
                            this.allCached = false;
                    });
            })();
        }
        setPreCache(all, initialise) {
            this.cacheInitialiser = initialise;
            if (all) {
                this.allCached = all === true ? false : undefined;
                this.cacheAllKeyRange = all;
            }
        }
        async generate() {
        }
        createCache() {
            return JSON.parse(JSON.stringify(this.memoryCache));
        }
        updateManifestCache() {
            clearTimeout(this.manifestCacheUpdateTimeout);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.manifestCacheUpdateTimeout = window.setTimeout(async () => {
                await this.modelCache.reset();
                await this.modelCache.await();
            }, 2000);
        }
    }
    exports.ManifestItem = ManifestItem;
    _ManifestItem_instances = new WeakSet(), _ManifestItem_generate = async function _ManifestItem_generate() {
        const hostCacheTime = this.hostModel.getCacheTime();
        const cacheTime = await Model_4.default.cacheDB.get("models", IManifest.CacheComponentKey.get(this.componentName)).then(cache => cache?.cacheTime ?? 0);
        if (cacheTime < hostCacheTime) {
            await this.generate();
            await Model_4.default.cacheDB.set("models", IManifest.CacheComponentKey.get(this.componentName), {
                cacheTime: hostCacheTime,
                value: null,
                version: "dynamic",
            });
        }
    };
    ManifestItem.queryCounts = {};
    __decorate([
        Bound_1.default
    ], ManifestItem.prototype, "filterAllNoDuplicates", null);
    Object.assign(window, { ManifestItem });
});
define("utility/endpoint/deepsight/endpoint/GetDeepsightManifestVersions", ["require", "exports", "utility/endpoint/deepsight/DeepsightEndpoint"], function (require, exports, DeepsightEndpoint_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new DeepsightEndpoint_7.default("versions.json");
});
define("model/models/manifest/DeepsightManifest", ["require", "exports", "model/Model", "model/models/manifest/IManifest", "utility/endpoint/deepsight/endpoint/GetDeepsightManifest", "utility/endpoint/deepsight/endpoint/GetDeepsightManifestVersions"], function (require, exports, Model_5, IManifest_1, GetDeepsightManifest_1, GetDeepsightManifestVersions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DeepsightManifest = void 0;
    const DeepsightManifest = Model_5.default.create("deepsight manifest", {
        cache: "Global",
        version: async () => {
            const versions = await GetDeepsightManifestVersions_1.default.query();
            return `${Object.entries(versions)
                .filter((entry) => typeof entry[1] === "number")
                .map(([name, version]) => `${name}.${version}`)
                .sort()
                .join(",")}-2.deepsight.gg`;
        },
        async generate(api) {
            const deepsightComponents = await GetDeepsightManifest_1.default.query();
            const deepsightComponentNames = Object.keys(deepsightComponents);
            const cacheKeys = deepsightComponentNames.map(IManifest_1.IManifest.CacheComponentKey.get);
            await Model_5.default.cacheDB.upgrade((database, transaction) => {
                for (const cacheKey of cacheKeys) {
                    if (database.objectStoreNames.contains(cacheKey))
                        database.deleteObjectStore(cacheKey);
                    const store = database.createObjectStore(cacheKey);
                    switch (cacheKey) {
                        case "manifest [DeepsightMomentDefinition]":
                            if (!store.indexNames.contains("iconWatermark"))
                                store.createIndex("iconWatermark", "iconWatermark");
                            if (!store.indexNames.contains("id"))
                                store.createIndex("id", "id", { unique: true });
                            break;
                    }
                }
            });
            const totalLoad = deepsightComponentNames.length;
            await Model_5.default.cacheDB.transaction(deepsightComponentNames.map(IManifest_1.IManifest.CacheComponentKey.get), async (transaction) => {
                for (let i = 0; i < deepsightComponentNames.length; i++) {
                    const componentName = deepsightComponentNames[i];
                    const cacheKey = IManifest_1.IManifest.CacheComponentKey.get(componentName);
                    const startTime = performance.now();
                    console.info(`Caching objects from ${cacheKey}`);
                    api.emitProgress(i / totalLoad, "Storing manifest");
                    await transaction.clear(cacheKey);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    for (const [itemId, itemValue] of Object.entries(deepsightComponents[componentName])) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        await transaction.set(cacheKey, itemId, itemValue);
                    }
                    console.info(`Finished caching objects from ${cacheKey} after ${IManifest_1.IManifest.elapsed(performance.now() - startTime)}`);
                }
            });
            return [...deepsightComponentNames];
        },
        process: componentNames => {
            const Manifest = Object.fromEntries(componentNames
                .map(componentName => [componentName, new IManifest_1.ManifestItem(componentName, DeepsightManifest)]));
            for (const componentName of componentNames) {
                Manifest[componentName].setPreCache(true);
            }
            Object.assign(window, { DeepsightManifest: Manifest });
            return Manifest;
        },
        reset: async (componentNames) => {
            for (const componentName of componentNames ?? []) {
                await Model_5.default.cacheDB.clear(IManifest_1.IManifest.CacheComponentKey.get(componentName));
                await Model_5.default.cacheDB.delete("models", IManifest_1.IManifest.CacheComponentKey.getBundle(componentName));
            }
        },
        cacheInvalidated: async (componentNames) => {
            for (const componentName of componentNames ?? []) {
                await Model_5.default.cacheDB.delete("models", IManifest_1.IManifest.CacheComponentKey.getBundle(componentName));
            }
        },
    });
    exports.DeepsightManifest = DeepsightManifest;
});
define("utility/endpoint/bungie/endpoint/destiny2/GetManifest", ["require", "exports", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, BungieEndpoint_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_5.default
        .at("/Destiny2/Manifest/")
        .returning()
        .setOptionalAuth();
});
define("model/models/manifest/DestinyManifest", ["require", "exports", "model/Model", "model/models/ProfileBatch", "model/models/manifest/DeepsightManifest", "model/models/manifest/IManifest", "utility/Env", "utility/Objects", "utility/endpoint/bungie/Bungie", "utility/endpoint/bungie/endpoint/destiny2/GetManifest"], function (require, exports, Model_6, ProfileBatch_1, DeepsightManifest_1, IManifest_2, Env_4, Objects_2, Bungie_3, GetManifest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const elapsed = IManifest_2.IManifest.elapsed;
    const CacheComponentKey = IManifest_2.IManifest.CacheComponentKey;
    const ManifestURLs = Model_6.default.create("manifest urls", {
        cache: "Global",
        resetTime: 0,
        useCacheOnError: true,
        generate: () => GetManifest_1.default.query(),
    });
    const DestinyManifest = Model_6.default.create("destiny manifest", {
        cache: "Global",
        version: async () => {
            const manifest = await ManifestURLs.await();
            return `${manifest.version}-23.deepsight.gg`;
        },
        async generate(api) {
            const manifest = await ManifestURLs.await();
            const bungieComponentNames = Object.keys(manifest.jsonWorldComponentContentPaths.en);
            api.emitProgress(0, "Allocating stores for manifest");
            const cacheKeys = bungieComponentNames.map(CacheComponentKey.get);
            await Model_6.default.cacheDB.upgrade((database, transaction) => {
                for (const cacheKey of cacheKeys) {
                    if (database.objectStoreNames.contains(cacheKey))
                        database.deleteObjectStore(cacheKey);
                    const store = database.createObjectStore(cacheKey);
                    switch (cacheKey) {
                        case "manifest [DestinyInventoryItemDefinition]":
                            if (!store.indexNames.contains("iconWatermark"))
                                store.createIndex("iconWatermark", "iconWatermark");
                            if (!store.indexNames.contains("name"))
                                store.createIndex("name", "displayProperties.name");
                            if (!store.indexNames.contains("icon"))
                                store.createIndex("icon", "displayProperties.icon");
                            break;
                        case "manifest [DestinyRecordDefinition]":
                            if (!store.indexNames.contains("icon"))
                                store.createIndex("icon", "displayProperties.icon");
                            if (!store.indexNames.contains("name"))
                                store.createIndex("name", "displayProperties.name");
                            break;
                        case "manifest [DestinyCollectibleDefinition]":
                            if (!store.indexNames.contains("icon"))
                                store.createIndex("icon", "displayProperties.icon");
                            if (!store.indexNames.contains("name"))
                                store.createIndex("name", "displayProperties.name");
                            break;
                    }
                }
            });
            return [...bungieComponentNames, "DeepsightMomentDefinition"];
        },
        process: async (componentNames) => {
            const Manifest = Object.fromEntries(componentNames
                .map(componentName => [componentName, new DestinyManifestItem(componentName, DestinyManifest)]));
            for (const componentName of componentNames)
                await Manifest[componentName].initialise(Manifest);
            Object.assign(window, { Manifest, DestinyManifest: Manifest });
            return Manifest;
        },
        reset: async (componentNames) => {
            for (const componentName of componentNames ?? []) {
                await Model_6.default.cacheDB.clear(CacheComponentKey.get(componentName));
                await Model_6.default.cacheDB.delete("models", CacheComponentKey.getBundle(componentName));
                await Model_6.default.cacheDB.delete("models", CacheComponentKey.get(componentName));
            }
        },
        cacheInvalidated: async (componentNames) => {
            for (const componentName of componentNames ?? []) {
                await Model_6.default.cacheDB.delete("models", CacheComponentKey.getBundle(componentName));
            }
        },
    });
    exports.default = DestinyManifest;
    class DestinyManifestItem extends IManifest_2.ManifestItem {
        async generate() {
            const manifest = await ManifestURLs.await();
            const componentName = this.componentName;
            const cacheKey = CacheComponentKey.get(componentName);
            let startTime = performance.now();
            console.info(`Downloading ${cacheKey}`);
            // api.emitProgress((1 + i * 2) / totalLoad, "Downloading manifest");
            let data;
            let tryAgain = true;
            for (let i = 0; i < 5 && tryAgain; i++) {
                tryAgain = false;
                data = await fetch(Env_4.default.DEEPSIGHT_ENVIRONMENT === "dev" ? `testiny/${componentName}.json` : `https://www.bungie.net${manifest.jsonWorldComponentContentPaths.en[componentName]}?corsfix=${i}`)
                    .then(response => response.json())
                    .catch(err => {
                    if (err.message.includes("Access-Control-Allow-Origin")) {
                        console.warn(`CORS error, trying again with a query string (attempt ${++i})`);
                        tryAgain = true;
                        return {};
                    }
                    throw err;
                });
            }
            console.info(`Finished downloading ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
            startTime = performance.now();
            console.info(`Storing objects from ${cacheKey}`);
            // api.emitProgress((1 + i * 2 + 1) / totalLoad, "Storing manifest");
            const moments = cacheKey !== "manifest [DestinyInventoryItemDefinition]" ? []
                : await (await DeepsightManifest_1.DeepsightManifest.await()).DeepsightMomentDefinition.all();
            await Model_6.default.cacheDB.transaction([cacheKey], async (transaction) => {
                await transaction.clear(cacheKey);
                const replaceWatermarksByItemHash = Object.fromEntries(moments.flatMap(moment => (moment.itemHashes ?? [])
                    .map(itemHash => [itemHash, moment])) ?? []);
                for (const [key, definition] of Object.entries(data)) {
                    if (cacheKey === "manifest [DestinyInventoryItemDefinition]") {
                        const itemDef = definition;
                        // fix red war items that don't have watermarks for some reason
                        const replacementMoment = replaceWatermarksByItemHash[definition.hash];
                        if (replacementMoment) {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            itemDef.iconWatermark = replacementMoment.iconWatermark;
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            itemDef.iconWatermarkShelved = replacementMoment.iconWatermarkShelved;
                        }
                        else if (!itemDef.iconWatermark && itemDef.quality?.displayVersionWatermarkIcons.length) {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            itemDef.iconWatermark = itemDef.quality.displayVersionWatermarkIcons[0];
                        }
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    await transaction.set(cacheKey, key, definition);
                }
            });
            console.info(`Finished caching objects from ${cacheKey} after ${elapsed(performance.now() - startTime)}`);
        }
        async initialise(Manifest) {
            const componentName = this.componentName;
            switch (componentName) {
                case "DestinyInventoryItemDefinition": {
                    ////////////////////////////////////
                    // precache item hashes from profile
                    const profile = Bungie_3.default.authenticated ? await ProfileBatch_1.default.await() : undefined;
                    const itemHashes = new Set((profile?.profileInventory?.data?.items.map(item => item.itemHash) ?? [])
                        .concat(Object.values(profile?.characterInventories?.data ?? Objects_2.default.EMPTY)
                        .concat(Object.values(profile?.characterEquipment?.data ?? Objects_2.default.EMPTY))
                        .flatMap(inventory => inventory.items.map(item => item.itemHash))));
                    for (const itemSockets of Object.values(profile?.itemComponents?.sockets.data ?? Objects_2.default.EMPTY)) {
                        for (const socket of itemSockets.sockets ?? [])
                            if (socket.plugHash)
                                itemHashes.add(socket.plugHash);
                    }
                    for (const itemPlugsByItems of Object.values(profile?.itemComponents?.reusablePlugs.data ?? Objects_2.default.EMPTY)) {
                        for (const plugs of Object.values(itemPlugsByItems.plugs))
                            for (const plug of plugs)
                                itemHashes.add(plug.plugItemHash);
                    }
                    Manifest[componentName].setPreCache([...itemHashes], async (cache, cacheKeyRange) => {
                        ////////////////////////////////////
                        // precache plug items from cached item defs
                        let values = Object.values(cache);
                        const itemHashes = new Set();
                        for await (const itemDef of values)
                            if (itemDef?.inventory?.recipeItemHash)
                                if (!cache[`/:${itemDef.inventory.recipeItemHash}`])
                                    itemHashes.add(itemDef.inventory.recipeItemHash);
                        await cacheKeyRange([...itemHashes]);
                        itemHashes.clear();
                        values = Object.values(cache);
                        for await (const itemDef of values) {
                            for (const socketEntry of itemDef?.sockets?.socketEntries ?? []) {
                                if (!cache[`/:${socketEntry.singleInitialItemHash}`])
                                    itemHashes.add(socketEntry.singleInitialItemHash);
                                for (const plug of socketEntry.reusablePlugItems)
                                    if (!cache[`/:${plug.plugItemHash}`])
                                        itemHashes.add(plug.plugItemHash);
                                let plugSet = await Manifest.DestinyPlugSetDefinition.get(socketEntry.reusablePlugSetHash);
                                for (const plugItem of plugSet?.reusablePlugItems ?? [])
                                    if (!cache[`/:${plugItem.plugItemHash}`])
                                        itemHashes.add(plugItem.plugItemHash);
                                plugSet = await Manifest.DestinyPlugSetDefinition.get(socketEntry.randomizedPlugSetHash);
                                for (const plugItem of plugSet?.reusablePlugItems ?? [])
                                    if (!cache[`/:${plugItem.plugItemHash}`])
                                        itemHashes.add(plugItem.plugItemHash);
                            }
                        }
                        return cacheKeyRange([...itemHashes]);
                    });
                    break;
                }
                case "DestinyInventoryItemLiteDefinition":
                    break;
                case "DestinyRecordDefinition":
                    Manifest[componentName].setPreCache(true, async (cache) => {
                        const values = Object.values(cache);
                        for await (const value of values) {
                            if (value?.displayProperties.icon)
                                cache[`icon:${value.displayProperties.icon}`] ??= value;
                            if (value?.displayProperties.name)
                                cache[`name:${value.displayProperties.name}`] ??= value;
                        }
                        ////////////////////////////////////
                        // precache by precached invitems
                        await Manifest.DestinyInventoryItemDefinition.loadCache();
                        await Manifest.DestinyCollectibleDefinition.loadCache();
                        const itemDefs = Object.values(Manifest.DestinyInventoryItemDefinition["memoryCache"]);
                        for await (const itemDef of itemDefs) {
                            if (!itemDef)
                                continue;
                            const collectible = await Manifest.DestinyCollectibleDefinition.get(itemDef.collectibleHash);
                            if (collectible?.displayProperties.icon)
                                cache[`icon:${collectible.displayProperties.icon}`] ??= null;
                            if (itemDef.displayProperties.name)
                                cache[`name:${itemDef.displayProperties.name}`] ??= null;
                        }
                    });
                    break;
                default:
                    this.setPreCache(true);
            }
        }
    }
});
define("utility/endpoint/clarity/endpoint/GetClarityDatabaseVersions", ["require", "exports", "utility/endpoint/clarity/ClarityEndpoint"], function (require, exports, ClarityEndpoint_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = new ClarityEndpoint_2.default("versions.json");
});
define("model/models/manifest/ClarityManifest", ["require", "exports", "model/Model", "model/models/manifest/DestinyManifest", "model/models/manifest/IManifest", "utility/endpoint/clarity/endpoint/GetClarityDatabase", "utility/endpoint/clarity/endpoint/GetClarityDatabaseVersions"], function (require, exports, Model_7, DestinyManifest_1, IManifest_3, GetClarityDatabase_1, GetClarityDatabaseVersions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClarityManifest = void 0;
    const ClarityManifest = Model_7.default.create("clarity database", {
        cache: "Global",
        version: async () => {
            const versions = await GetClarityDatabaseVersions_1.default.query();
            return `${Object.entries(versions)
                .filter((entry) => typeof entry[1] === "number")
                .map(([name, version]) => `${name}.${version}`)
                .sort()
                .join(",")}-3.deepsight.gg`;
        },
        async generate(api) {
            const clarityComponents = await GetClarityDatabase_1.default.query();
            const clarityComponentNames = Object.keys(clarityComponents);
            const cacheKeys = clarityComponentNames.map(IManifest_3.IManifest.CacheComponentKey.get);
            await Model_7.default.cacheDB.upgrade((database, transaction) => {
                for (const cacheKey of cacheKeys) {
                    if (database.objectStoreNames.contains(cacheKey))
                        database.deleteObjectStore(cacheKey);
                    database.createObjectStore(cacheKey);
                }
            });
            const totalLoad = clarityComponentNames.length;
            await Model_7.default.cacheDB.transaction(clarityComponentNames.map(IManifest_3.IManifest.CacheComponentKey.get), async (transaction) => {
                for (let i = 0; i < clarityComponentNames.length; i++) {
                    const componentName = clarityComponentNames[i];
                    const cacheKey = IManifest_3.IManifest.CacheComponentKey.get(componentName);
                    const startTime = performance.now();
                    console.info(`Caching objects from ${cacheKey}`);
                    api.emitProgress(i / totalLoad, "Storing manifest");
                    await transaction.clear(cacheKey);
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    for (const [itemId, itemValue] of Object.entries(clarityComponents[componentName])) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                        await transaction.set(cacheKey, itemId, itemValue);
                    }
                    console.info(`Finished caching objects from ${cacheKey} after ${IManifest_3.IManifest.elapsed(performance.now() - startTime)}`);
                }
            });
            return clarityComponentNames;
        },
        process: async (componentNames) => {
            const Manifest = Object.fromEntries(componentNames
                .map(componentName => [componentName, new IManifest_3.ManifestItem(componentName, ClarityManifest)]));
            const { DestinyInventoryItemDefinition } = await DestinyManifest_1.default.await();
            await DestinyInventoryItemDefinition.loadCache();
            const itemHashes = await DestinyInventoryItemDefinition.primaryKeys();
            for (const componentName of componentNames) {
                Manifest[componentName].setPreCache(true, cache => {
                    if (componentName === "ClarityDescriptions") {
                        for (const hash of itemHashes) {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                            cache[`/:${hash}`] ??= null;
                        }
                    }
                });
            }
            Object.assign(window, Manifest);
            return Manifest;
        },
        reset: async (componentNames) => {
            for (const componentName of componentNames ?? []) {
                await Model_7.default.cacheDB.clear(IManifest_3.IManifest.CacheComponentKey.get(componentName));
                await Model_7.default.cacheDB.delete("models", IManifest_3.IManifest.CacheComponentKey.getBundle(componentName));
            }
        },
        cacheInvalidated: async (componentNames) => {
            for (const componentName of componentNames ?? []) {
                await Model_7.default.cacheDB.delete("models", IManifest_3.IManifest.CacheComponentKey.getBundle(componentName));
            }
        },
    });
    exports.ClarityManifest = ClarityManifest;
});
define("model/models/Manifest", ["require", "exports", "model/Model", "model/models/manifest/ClarityManifest", "model/models/manifest/DeepsightManifest", "model/models/manifest/DestinyManifest"], function (require, exports, Model_8, ClarityManifest_1, DeepsightManifest_2, DestinyManifest_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Manifest = Model_8.default.createTemporary(async (api) => {
        const destinyManifest = await api.subscribeProgressAndWait(DestinyManifest_2.default, 1 / 3);
        const deepsightManifest = await api.subscribeProgressAndWait(DeepsightManifest_2.DeepsightManifest, 1 / 3, 1 / 3);
        const clarityManifest = await api.subscribeProgressAndWait(ClarityManifest_1.ClarityManifest, 1 / 3, 2 / 3);
        api.setCacheTime(() => Math.max(DestinyManifest_2.default.getCacheTime(), DeepsightManifest_2.DeepsightManifest.getCacheTime(), ClarityManifest_1.ClarityManifest.getCacheTime()));
        return {
            ...destinyManifest,
            ...deepsightManifest,
            ...clarityManifest,
        };
    });
    exports.default = Manifest;
});
define("model/models/Activities", ["require", "exports", "model/models/Manifest", "model/models/ProfileBatch", "utility/Objects"], function (require, exports, Manifest_1, ProfileBatch_2, Objects_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Activities;
    (function (Activities_1) {
        async function await(profile) {
            profile ??= await ProfileBatch_2.default.await();
            const { DestinyActivityDefinition } = await Manifest_1.default.await();
            const characterActivities = (await Promise.all(Object.values(profile.characterActivities?.data ?? Objects_3.default.EMPTY)
                .flatMap(activities => activities.availableActivities)
                .map(async (activity) => DestinyActivityDefinition.get(activity.activityHash))))
                .filter((activity) => !!activity);
            const Activities = [];
            const activityHashes = new Set();
            for (const activity of characterActivities) {
                if (activityHashes.has(activity.hash))
                    continue;
                Activities.push(activity);
                activityHashes.add(activity.hash);
            }
            Object.assign(window, { Activities });
            return Activities;
        }
        Activities_1.await = await;
    })(Activities || (Activities = {}));
    exports.default = Activities;
});
define("ui/Classes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InventoryClasses = exports.Classes = void 0;
    var Classes;
    (function (Classes) {
        Classes["Logo"] = "logo";
        Classes["Active"] = "active";
        Classes["Hidden"] = "hidden";
        Classes["Disabled"] = "disabled";
        Classes["WarningText"] = "warning-text";
        Classes["SmallText"] = "small-text";
        Classes["ShowIfAPIDown"] = "show-if-api-down";
        Classes["ShowIfExtraInfo"] = "show-if-extra-info";
        Classes["ShowIfNotExtraInfo"] = "show-if-not-extra-info";
    })(Classes || (exports.Classes = Classes = {}));
    var InventoryClasses;
    (function (InventoryClasses) {
        InventoryClasses["Item"] = "item";
    })(InventoryClasses || (exports.InventoryClasses = InventoryClasses = {}));
});
define("utility/Async", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Async;
    (function (Async) {
        async function sleep(ms, signal) {
            // let stack = new Error().stack;
            // stack = stack?.slice(stack.indexOf("\n") + 1);
            // stack = stack?.slice(stack.indexOf("\n") + 1);
            // stack = stack?.slice(0, stack.indexOf("\n"));
            // console.log("sleep", stack);
            if (!signal) {
                return new Promise(resolve => {
                    window.setTimeout(() => resolve(undefined), ms);
                });
            }
            if (signal.aborted) {
                return true;
            }
            return new Promise(resolve => {
                // eslint-disable-next-line prefer-const
                let timeoutId;
                const onAbort = () => {
                    window.clearTimeout(timeoutId);
                    resolve(true);
                };
                timeoutId = window.setTimeout(() => {
                    signal.removeEventListener("abort", onAbort);
                    resolve(false);
                }, ms);
                signal.addEventListener("abort", onAbort, { once: true });
            });
        }
        Async.sleep = sleep;
        function debounce(...args) {
            let ms;
            let callback;
            if (typeof args[0] === "function") {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [callback, ...args] = args;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return debounceByPromise(callback, ...args);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [ms, callback, ...args] = args;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                return debounceByTime(ms, callback, ...args);
            }
        }
        Async.debounce = debounce;
        const debouncedByTime = new WeakMap();
        function debounceByTime(ms, callback, ...args) {
            let info = debouncedByTime.get(callback);
            if (info && Date.now() - info.last < ms) {
                const newAbortController = new AbortController();
                info.queued = sleep(Date.now() - info.last + ms, newAbortController.signal).then(aborted => {
                    if (aborted) {
                        return info?.queued;
                    }
                    delete info.queued;
                    delete info.abortController;
                    info.last = Date.now();
                    return callback(...args);
                });
                info.abortController?.abort();
                info.abortController = newAbortController;
                return info.queued;
            }
            if (!info) {
                debouncedByTime.set(callback, info = { last: 0 });
            }
            info.last = Date.now();
            return callback(...args);
        }
        const debouncedByPromise = new WeakMap();
        function debounceByPromise(callback, ...args) {
            const debounceInfo = debouncedByPromise.get(callback);
            if (debounceInfo?.nextQueued) {
                return debounceInfo.promise;
            }
            const realCallback = () => {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    const result = callback(...args);
                    const promise = Promise.resolve(result);
                    debouncedByPromise.set(callback, {
                        promise,
                        nextQueued: false,
                    });
                    promise.catch(reason => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        window.dispatchEvent(new PromiseRejectionEvent("unhandledrejection", { promise, reason }));
                    });
                    return promise;
                }
                catch (error) {
                    window.dispatchEvent(new ErrorEvent("error", { error }));
                    return;
                }
            };
            if (debounceInfo) {
                debounceInfo.nextQueued = true;
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                return debounceInfo.promise.catch(realCallback).then(realCallback);
            }
            else {
                return realCallback();
            }
        }
        function schedule(...args) {
            let ms = 0;
            let callback;
            let debounceMs = false;
            let signal;
            if (typeof args[0] === "function") {
                // (cb, ...args)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [callback, ...args] = args;
            }
            else if (typeof args[1] === "function") {
                // (ms, cb, ...args)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [ms, callback, ...args] = args;
            }
            else if (typeof args[2] === "function") {
                // (ms, debounce | signal, cb, ...args)
                if (typeof args[1] === "object") {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    [ms, signal, callback, ...args] = args;
                }
                else {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    [ms, debounceMs, callback, ...args] = args;
                }
            }
            else {
                // (ms, debounce, signal, cb, ...args)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                [ms, debounceMs, signal, callback, ...args] = args;
            }
            if (debounceMs === true) {
                debounceMs = ms;
            }
            const cancelCallbacks = [];
            // eslint-disable-next-line prefer-const
            let timeoutId;
            const result = {
                cancelled: false,
                completed: false,
                cancel: () => {
                    if (result.cancelled || result.completed) {
                        return;
                    }
                    signal?.removeEventListener("abort", result.cancel);
                    result.cancelled = true;
                    window.clearTimeout(timeoutId);
                    for (const callback of cancelCallbacks) {
                        try {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                            const result = callback(...args);
                            const promise = Promise.resolve(result);
                            promise.catch(reason => {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                window.dispatchEvent(new PromiseRejectionEvent("unhandledrejection", { promise, reason }));
                            });
                        }
                        catch (error) {
                            window.dispatchEvent(new ErrorEvent("error", { error }));
                        }
                    }
                    cancelCallbacks.length = 0;
                    args.length = 0;
                },
                onCancel: callback => {
                    if (result.completed) {
                        return result;
                    }
                    if (result.cancelled) {
                        try {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                            const result = callback(...args);
                            const promise = Promise.resolve(result);
                            promise.catch(reason => {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                window.dispatchEvent(new PromiseRejectionEvent("unhandledrejection", { promise, reason }));
                            });
                        }
                        catch (error) {
                            window.dispatchEvent(new ErrorEvent("error", { error }));
                        }
                    }
                    else {
                        cancelCallbacks.push(callback);
                    }
                    return result;
                },
            };
            signal?.addEventListener("abort", result.cancel, { once: true });
            timeoutId = window.setTimeout(() => {
                if (result.cancelled) {
                    return;
                }
                signal?.removeEventListener("abort", result.cancel);
                result.completed = true;
                cancelCallbacks.length = 0;
                try {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                    const result = debounceMs ? debounce(debounceMs, callback, ...args) : callback(...args);
                    const promise = Promise.resolve(result);
                    promise.catch(reason => {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        window.dispatchEvent(new PromiseRejectionEvent("unhandledrejection", { promise, reason }));
                    });
                }
                catch (error) {
                    window.dispatchEvent(new ErrorEvent("error", { error }));
                }
            }, ms);
            return result;
        }
        Async.schedule = schedule;
        /**
         * Create an AbortSignal that will be emitted after `ms`.
         * @param ms The time until the signal will be emitted.
         * @param controller An optional existing `AbortController`.
         * @param message An optional custom timeout message.
         */
        function timeout(ms, controller = new AbortController(), message = `Timed out after ${ms} ms`) {
            schedule(ms, () => controller.abort(message));
            return controller.signal;
        }
        Async.timeout = timeout;
    })(Async || (Async = {}));
    exports.default = Async;
});
define("ui/TooltipManager", ["require", "exports", "ui/Classes", "ui/Component", "utility/Async"], function (require, exports, Classes_1, Component_1, Async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Tooltip = exports.TooltipWrapper = exports.TooltipClasses = void 0;
    var TooltipClasses;
    (function (TooltipClasses) {
        TooltipClasses["Storage"] = "tooltip-storage";
        TooltipClasses["Surface"] = "tooltip-surface";
        TooltipClasses["Reversed"] = "tooltip-reversed";
        TooltipClasses["Main"] = "tooltip";
        TooltipClasses["Wrapper"] = "tooltip-wrapper";
        TooltipClasses["Extra"] = "tooltip-extra";
        TooltipClasses["Header"] = "tooltip-header";
        TooltipClasses["Title"] = "tooltip-title";
        TooltipClasses["Subtitle"] = "tooltip-subtitle";
        TooltipClasses["Tier"] = "tooltip-tier";
        TooltipClasses["Content"] = "tooltip-content";
        TooltipClasses["Footer"] = "tooltip-footer";
        TooltipClasses["Hints"] = "tooltip-hints";
        TooltipClasses["Forced1pxBigger"] = "tooltip-forced-1px-bigger";
    })(TooltipClasses || (exports.TooltipClasses = TooltipClasses = {}));
    class TooltipWrapper extends Component_1.default {
        onMake(tooltip) {
            this.classes.add(TooltipClasses.Wrapper);
            this.tooltip = tooltip.appendTo(this);
        }
    }
    exports.TooltipWrapper = TooltipWrapper;
    class Tooltip extends Component_1.default {
        get extra() {
            return this._extra ??= Tooltip.create()
                .classes.add(TooltipClasses.Extra)
                .appendTo(this.wrapper);
        }
        get hints() {
            return this._hints ??= Component_1.default.create()
                .classes.add(TooltipClasses.Hints)
                .appendTo(this.footer);
        }
        onMake() {
            this.classes.add(TooltipClasses.Main);
            this.wrapper = TooltipWrapper.create([this]);
            this.header = Component_1.default.create("header")
                .classes.add(TooltipClasses.Header)
                .appendTo(this);
            this.title = Component_1.default.create("h2")
                .classes.add(TooltipClasses.Title)
                .appendTo(this.header);
            this.subtitle = Component_1.default.create()
                .classes.add(TooltipClasses.Subtitle)
                .appendTo(this.header);
            this.tier = Component_1.default.create()
                .classes.add(TooltipClasses.Tier)
                .appendTo(this.header);
            this.content = Component_1.default.create()
                .classes.add(TooltipClasses.Content)
                .appendTo(this);
            this.footer = Component_1.default.create("footer")
                .classes.add(TooltipClasses.Footer)
                .appendTo(this);
        }
        setPadding(padding) {
            this.style.set("--mouse-offset", `${padding}px`);
            return this;
        }
    }
    exports.Tooltip = Tooltip;
    var TooltipManager;
    (function (TooltipManager) {
        const tooltipStorage = Component_1.default.create()
            .classes.add(TooltipClasses.Storage)
            .appendTo(document.body);
        const tooltipSurface = Component_1.default.create()
            .classes.add(TooltipClasses.Surface)
            .appendTo(document.body);
        let tooltipsEnabled = window.innerWidth > 800;
        function create(initialiser) {
            let tooltip;
            return {
                get() {
                    if (tooltip)
                        return tooltip;
                    tooltip = initialiser(Tooltip.create());
                    tooltip.wrapper.appendTo(tooltipStorage);
                    return tooltip;
                },
                createRaw: () => initialiser(Tooltip.create()),
            };
        }
        TooltipManager.create = create;
        function show(tooltipClass, initialiser, hidePreviousIfSame = true) {
            const tooltip = tooltipClass.get();
            hideTooltips(hidePreviousIfSame ? undefined : tooltip);
            if (!tooltipsEnabled)
                return;
            tooltip.classes.remove(TooltipClasses.Forced1pxBigger);
            void Promise.resolve(initialiser(tooltip))
                .then(async () => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (window.chrome) {
                    await Async_1.default.sleep(1);
                    if (tooltip.element.clientHeight % 2 !== window.innerHeight % 2)
                        tooltip.classes.add(TooltipClasses.Forced1pxBigger);
                }
            });
            tooltip.wrapper
                .classes.remove(Classes_1.Classes.Hidden)
                .appendTo(tooltipSurface);
        }
        TooltipManager.show = show;
        function hideTooltips(current) {
            for (const child of tooltipSurface.element.children) {
                const childComponent = child.component?.deref();
                if (!childComponent) {
                    console.warn("Not a valid tooltip", child);
                    child.remove();
                    continue;
                }
                if (childComponent !== current)
                    hide(childComponent.tooltip);
            }
        }
        function hide(tooltip) {
            if (tooltip.wrapper.classes.has(Classes_1.Classes.Hidden))
                // already hiding
                return;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const hideLock = tooltip.TOOLTIP_HIDE_LOCK = Math.random();
            const persistTooltips = document.documentElement.classList.contains("persist-tooltips");
            if (!persistTooltips)
                tooltip.wrapper.classes.add(Classes_1.Classes.Hidden);
            void Async_1.default.sleep(500).then(() => {
                if (!tooltip.wrapper.classes.has(Classes_1.Classes.Hidden))
                    // tooltip has been shown again, don't touch
                    return;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if (tooltip.TOOLTIP_HIDE_LOCK !== hideLock)
                    // a different call of this method is responsible for hiding the tooltip now
                    return;
                if (!persistTooltips)
                    tooltip.wrapper.appendTo(tooltipStorage);
            });
        }
        TooltipManager.hide = hide;
        Component_1.default.event.subscribe("setTooltip", ({ component, tooltip: tooltipClass, handler }) => {
            const tooltip = tooltipClass.get();
            component.event.until("clearTooltip", event => event
                .subscribe("mouseover", () => {
                if (tooltip.owner?.deref() === component)
                    return; // this tooltip is already shown
                tooltip.owner = new WeakRef(component);
                TooltipManager.show(tooltipClass, handler.initialise, handler.differs?.(tooltip));
            })
                .subscribe("mouseout", event => {
                if (component.element.contains(document.elementFromPoint(event.clientX, event.clientY)))
                    return;
                hideTooltip();
            }));
            void component.event.waitFor("clearTooltip")
                .then(hideTooltip);
            function hideTooltip() {
                if (tooltip.owner?.deref() === component) {
                    delete tooltip.owner;
                    TooltipManager.hide(tooltip);
                }
            }
        });
        let reversed;
        document.body.addEventListener("mousemove", event => {
            const switchTooltipAt = (800 / 1920) * window.innerWidth;
            const switchTooltipDirection = reversed && event.clientX < switchTooltipAt
                || !reversed && event.clientX > window.innerWidth - switchTooltipAt;
            if (switchTooltipDirection && [...tooltipSurface.element.children].some(tooltip => !tooltip.classList.contains(Classes_1.Classes.Hidden))) {
                tooltipSurface.classes.toggle(TooltipClasses.Reversed);
                reversed = !reversed;
            }
            tooltipSurface.element.scrollLeft = tooltipSurface.element.scrollWidth - window.innerWidth - event.clientX;
            tooltipSurface.element.scrollTop = tooltipSurface.element.scrollHeight - window.innerHeight - window.innerHeight / 2 - event.clientY;
        });
        window.addEventListener("resize", () => {
            tooltipsEnabled = window.innerWidth > 800;
            hideTooltips();
        });
    })(TooltipManager || (TooltipManager = {}));
    exports.default = TooltipManager;
});
define("utility/maths/Vector2", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IVector2 = void 0;
    var IVector2;
    (function (IVector2) {
        function ZERO() {
            return { x: 0, y: 0 };
        }
        IVector2.ZERO = ZERO;
        function distance(v1, v2) {
            return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
        }
        IVector2.distance = distance;
        function distanceWithin(v1, v2, within) {
            return (v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2 < within ** 2;
        }
        IVector2.distanceWithin = distanceWithin;
    })(IVector2 || (exports.IVector2 = IVector2 = {}));
});
define("ui/Component", ["require", "exports", "utility/EventManager"], function (require, exports, EventManager_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ComponentDeclaration = exports.TextManager = exports.StyleManager = exports.AttributeManager = exports.ClassManager = void 0;
    const SVG_ELEMENTS = new Set([
        "svg",
        "g",
        "path",
        "circle",
        "line",
    ]);
    class Component {
        static create(type, args) {
            if (typeof type === "object") {
                args = type;
                type = undefined;
            }
            type ??= this.defaultType;
            const element = SVG_ELEMENTS.has(type) ? document.createElementNS("http://www.w3.org/2000/svg", type)
                : document.createElement(type);
            const component = new Component(element);
            if (this !== Component)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                component.make(this, ...args ?? []);
            return component;
        }
        static get(element) {
            if (!element)
                return undefined;
            let component = element.component?.deref();
            if (component)
                return component;
            component = new Component(element);
            if (this !== Component)
                component.make(this);
            return component;
        }
        static byClassName(className) {
            return [...document.getElementsByClassName(className)]
                .map(element => element.component?.deref())
                .filter((component) => !!component);
        }
        static makeable() {
            return {
                of(cls) {
                    var _a;
                    const result = (_a = class extends cls {
                        },
                        __setFunctionName(_a, "result"),
                        _a.addSuper = true,
                        _a);
                    return result;
                },
            };
        }
        get classes() {
            const classes = new ClassManager(this);
            Object.defineProperty(this, "classes", {
                value: classes,
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return classes;
        }
        get attributes() {
            const attributes = new AttributeManager(this);
            Object.defineProperty(this, "attributes", {
                value: attributes,
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return attributes;
        }
        get data() {
            const data = new AttributeManager(this, "data");
            Object.defineProperty(this, "data", {
                value: data,
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return data;
        }
        get style() {
            const style = new StyleManager(this);
            Object.defineProperty(this, "style", {
                value: style,
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return style;
        }
        get text() {
            const text = new TextManager(this);
            Object.defineProperty(this, "text", {
                value: text,
            });
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return text;
        }
        constructor(element) {
            this.element = element;
            if (this.constructor !== Component)
                throw new Error("Custom components may not provide a constructor. Use onMake");
            element.component = new WeakRef(this);
            Object.defineProperty(this, "event", {
                configurable: true,
                get: () => {
                    const event = new EventManager_7.EventManager(this, new WeakRef(this.element));
                    Object.defineProperty(this, "event", {
                        value: event,
                    });
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    return event;
                },
            });
        }
        as(cls) {
            return this instanceof cls ? this : undefined;
        }
        asType() {
            return this;
        }
        make(cls, ...args) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            Object.setPrototypeOf(this, cls.prototype);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (cls.addSuper)
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this.super = this;
            this.onMake(...args);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return this;
        }
        tweak(tweaker, ...args) {
            tweaker?.(this, ...args);
            return this;
        }
        onMake(...args) { }
        parent(selector) {
            if (selector && !this.element.parentElement?.matches(selector))
                return undefined;
            return Component.get(this.element.parentElement ?? undefined);
        }
        hasContents() {
            return this.element.childNodes.length > 0;
        }
        *children() {
            for (const child of this.element.children)
                yield Component.get(child);
        }
        append(...elements) {
            this.element.append(...elements.map(element => element instanceof Component ? element.element : element)
                .filter((element) => element !== undefined));
            return this;
        }
        prepend(...elements) {
            this.element.prepend(...elements.map(element => element instanceof Component ? element.element : element)
                .filter((element) => element !== undefined));
            return this;
        }
        appendTo(componentOrParentNode) {
            if (componentOrParentNode instanceof Component)
                componentOrParentNode = componentOrParentNode.element;
            if (componentOrParentNode)
                componentOrParentNode.appendChild(this.element);
            else
                this.element.remove();
            return this;
        }
        prependTo(componentOrParentNode) {
            if (componentOrParentNode instanceof Component)
                componentOrParentNode = componentOrParentNode.element;
            if (componentOrParentNode)
                componentOrParentNode.insertBefore(this.element, componentOrParentNode.firstChild);
            else
                this.element.remove();
            return this;
        }
        insertToBefore(componentOrParentNode, pivot) {
            if (componentOrParentNode instanceof Component)
                componentOrParentNode = componentOrParentNode.element;
            if (pivot instanceof Component)
                pivot = pivot.element;
            if (componentOrParentNode && (!pivot || pivot.parentElement === componentOrParentNode))
                componentOrParentNode.insertBefore(this.element, pivot);
            else
                this.element.remove();
            return this;
        }
        insertToAfter(componentOrParentNode, pivot) {
            if (componentOrParentNode instanceof Component)
                componentOrParentNode = componentOrParentNode.element;
            if (pivot instanceof Component)
                pivot = pivot.element;
            if (componentOrParentNode && (!pivot || pivot.parentElement === componentOrParentNode))
                componentOrParentNode.insertBefore(this.element, pivot?.nextSibling);
            else
                this.element.remove();
            return this;
        }
        indexInto(componentOrParentNode, index) {
            this.data.set("index", `${index}`);
            if (componentOrParentNode instanceof Component)
                componentOrParentNode = componentOrParentNode.element;
            const children = componentOrParentNode.children;
            let low = 0;
            let high = children.length - 1;
            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                const indexString = children[mid].dataset.index;
                if (!indexString)
                    console.error("Unindexed element", children[mid], "in parent node", componentOrParentNode);
                const childIndex = +(indexString ?? 0);
                if (childIndex === index) {
                    low = mid;
                    break;
                }
                if (childIndex < index)
                    low = mid + 1;
                else
                    high = mid - 1;
            }
            if (low < children.length)
                componentOrParentNode.insertBefore(this.element, children[low]);
            else
                componentOrParentNode.appendChild(this.element);
            return this;
        }
        remove() {
            this.element.remove();
        }
        removeContents() {
            while (this.element.lastChild)
                this.element.lastChild.remove();
            return this;
        }
        setTooltip(tooltip, handler) {
            Component.event.emit("setTooltip", { component: this, tooltip, handler });
            return this;
        }
        clearTooltip() {
            this.event.emit("clearTooltip");
            return this;
        }
        exists() {
            return document.contains(this.element);
        }
        index() {
            const siblings = this.parent()?.element.children ?? [];
            for (let i = 0; i < siblings.length; i++)
                if (siblings[i] === this.element)
                    return i;
            return -1;
        }
        contains(...nodes) {
            for (let node of nodes) {
                if (!node)
                    return false;
                if (node instanceof Component)
                    node = node.element;
                if (!this.element.contains(node))
                    return false;
            }
            return true;
        }
        getRect(uncache = false) {
            if (uncache)
                delete this.rect;
            return this.rect ??= this.element.getBoundingClientRect();
        }
        uncacheRect() {
            delete this.rect;
        }
        intersects(position, uncache = false) {
            const rect = this.getRect(uncache);
            if (position.x < rect.left || position.x >= rect.left + rect.width)
                return false;
            if (position.y < rect.top || position.y >= rect.top + rect.height)
                return false;
            return true;
        }
        isFocused() {
            return document.activeElement === this.element;
        }
        focus() {
            this.element.focus();
        }
        blur() {
            this.element.blur();
        }
    }
    exports.ComponentDeclaration = Component;
    Component.event = EventManager_7.EventManager.make();
    Component.defaultType = "div";
    exports.default = Component;
    class ClassManager {
        constructor(host) {
            this.host = new WeakRef(host);
        }
        all() {
            const host = this.host.deref();
            return [...host?.element.classList ?? []];
        }
        add(...classes) {
            const host = this.host.deref();
            host?.element.classList.add(...classes.filter(Boolean));
            return host;
        }
        remove(...classes) {
            const host = this.host.deref();
            host?.element.classList.remove(...classes.filter(Boolean));
            return host;
        }
        removeWhere(filter) {
            const host = this.host.deref();
            host?.element.classList.remove(...[...host.element.classList].filter(filter));
            return host;
        }
        toggle(present, ...classes) {
            const host = this.host.deref();
            const element = host?.element;
            if (element) {
                if (typeof present === "string") {
                    classes.unshift(present);
                    for (const cls of classes)
                        if (cls)
                            element.classList.toggle(cls);
                }
                else if (present)
                    element.classList.add(...classes.filter(Boolean));
                else
                    element.classList.remove(...classes.filter(Boolean));
            }
            return host;
        }
        has(...classes) {
            const host = this.host.deref();
            return classes.every(cls => host?.element.classList.contains(cls));
        }
        some(...classes) {
            const host = this.host.deref();
            return classes.some(cls => host?.element.classList.contains(cls));
        }
        until(promise, consumer) {
            const addedClasses = new Set();
            const removedClasses = new Set();
            void promise.then(() => {
                const element = this.host.deref()?.element;
                element?.classList.add(...removedClasses);
                element?.classList.remove(...addedClasses);
            });
            const manipulator = {
                add: (...classes) => {
                    const host = this.host.deref();
                    host?.element?.classList.add(...classes);
                    for (const cls of classes)
                        addedClasses.add(cls);
                    return host;
                },
                remove: (...classes) => {
                    const host = this.host.deref();
                    host?.element?.classList.remove(...classes);
                    for (const cls of classes)
                        removedClasses.add(cls);
                    return host;
                },
            };
            consumer?.(manipulator);
            return consumer ? this.host.deref() : manipulator;
        }
    }
    exports.ClassManager = ClassManager;
    class AttributeManager {
        constructor(host, prefix) {
            this.prefix = prefix ? `${prefix}-` : "";
            this.host = new WeakRef(host);
        }
        get(name) {
            return this.host.deref()?.element.getAttribute(`${this.prefix}${name}`);
        }
        add(name) {
            const host = this.host.deref();
            host?.element.setAttribute(`${this.prefix}${name}`, "");
            return host;
        }
        toggle(present, name, value = "") {
            const host = this.host.deref();
            if (present)
                host?.element.setAttribute(`${this.prefix}${name}`, value);
            else
                host?.element.removeAttribute(`${this.prefix}${name}`);
            return host;
        }
        set(name, value) {
            const host = this.host.deref();
            if (value === undefined)
                host?.element.removeAttribute(`${this.prefix}${name}`);
            else
                host?.element.setAttribute(`${this.prefix}${name}`, value);
            return host;
        }
        remove(name) {
            const host = this.host.deref();
            host?.element.removeAttribute(`${this.prefix}${name}`);
            return host;
        }
    }
    exports.AttributeManager = AttributeManager;
    class StyleManager {
        constructor(host) {
            this.host = new WeakRef(host);
        }
        // public get (name: string) {
        // 	return this.host.deref()?.element.style.getPropertyValue(name);
        // }
        set(name, value) {
            const host = this.host.deref();
            if (value === undefined)
                return this.remove(name);
            else
                host?.element.style.setProperty(name, value);
            return host;
        }
        remove(name) {
            const host = this.host.deref();
            host?.element.style.removeProperty(name);
            return host;
        }
    }
    exports.StyleManager = StyleManager;
    class TextManager {
        constructor(host) {
            this.host = new WeakRef(host);
        }
        get() {
            return this.host.deref()?.element.textContent;
        }
        set(text) {
            const host = this.host.deref();
            if (host) {
                this.remove();
                if (text !== undefined)
                    host.element.append(...this.createTextElements(text));
            }
            return host;
        }
        add(text) {
            const host = this.host.deref();
            if (host)
                host.element.append(...this.createTextElements(text));
            return host;
        }
        remove() {
            const host = this.host.deref();
            if (host)
                for (const child of [...host.element.childNodes])
                    if (child.nodeType === Node.TEXT_NODE || (child.nodeType === Node.ELEMENT_NODE && child.classList?.contains("text")))
                        child.remove();
            return host;
        }
        createTextElements(text) {
            const formatting = {
                italic: false,
                bold: false,
                underline: false,
                strikethrough: false,
            };
            const result = [];
            let segment = "";
            for (let i = 0; i < text.length; i++) {
                if (text[i] !== "[" || (text[i + 2] !== "]" && (text[i + 1] !== "/" || text[i + 3] !== "]"))) {
                    segment += text[i];
                    continue;
                }
                // changing formatting
                if (segment.length) {
                    result.push(this.wrapText(segment, formatting));
                }
                switch (text[i + 1]) {
                    case "b":
                        formatting.bold = true;
                        break;
                    case "i":
                        formatting.italic = true;
                        break;
                    case "u":
                        formatting.underline = true;
                        break;
                    case "s":
                        formatting.strikethrough = true;
                        break;
                    case "/":
                        switch (text[i + 2]) {
                            case "b":
                                formatting.bold = false;
                                break;
                            case "i":
                                formatting.italic = false;
                                break;
                            case "u":
                                formatting.underline = false;
                                break;
                            case "s":
                                formatting.strikethrough = false;
                                break;
                        }
                        i += 1;
                        break;
                    default:
                        segment += text[i];
                        continue;
                }
                i += 2;
                segment = "";
            }
            const finalSegment = this.wrapText(segment, formatting);
            if (!result.length && finalSegment.tagName === "SPAN")
                return [document.createTextNode(segment)];
            result.push(finalSegment);
            return result;
        }
        wrapText(text, { bold, italic, underline, strikethrough }) {
            let textWrapper;
            if (!bold && !italic && !underline && !strikethrough) {
                textWrapper = document.createElement("span");
                textWrapper.classList.add("text");
            }
            else {
                const formatting = [];
                if (bold)
                    formatting.push(document.createElement("b"));
                if (italic)
                    formatting.push(document.createElement("i"));
                if (underline)
                    formatting.push(document.createElement("u"));
                if (strikethrough)
                    formatting.push(document.createElement("s"));
                for (const textElement of formatting)
                    textElement.classList.add("text");
                for (let i = 1; i < formatting.length; i++)
                    formatting[i - 1].appendChild(formatting[i]);
                textWrapper = formatting[0];
            }
            textWrapper.textContent = text;
            return textWrapper;
        }
    }
    exports.TextManager = TextManager;
});
define("ui/form/Button", ["require", "exports", "ui/Component"], function (require, exports, Component_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ButtonClasses = void 0;
    var ButtonClasses;
    (function (ButtonClasses) {
        ButtonClasses["Main"] = "button";
        ButtonClasses["Icon"] = "button-icon";
        ButtonClasses["InnerIcon"] = "button-icon-inner";
        ButtonClasses["Attention"] = "button-attention";
        ButtonClasses["LaserFocus"] = "button-laser-focus";
        ButtonClasses["Selected"] = "button-selected";
        ButtonClasses["Primary"] = "button-primary";
        ButtonClasses["HasWipeAnimation"] = "button-has-wipe-animation";
        ButtonClasses["HasWipeAnimationOut"] = "button-has-wipe-animation-out";
        ButtonClasses["WipeAnimation"] = "button-wipe-animation";
        ButtonClasses["WipeAnimationOut"] = "button-wipe-animation-out";
    })(ButtonClasses || (exports.ButtonClasses = ButtonClasses = {}));
    class Button extends Component_2.default {
        static async animateWipeMultiple(buttons, initialiser) {
            let readyCount = 0;
            let setInitialised;
            const initialised = new Promise(resolve => setInitialised = resolve);
            const ready = () => {
                readyCount++;
                if (readyCount === buttons.length)
                    void Promise.resolve(initialiser()).then(setInitialised);
                return initialised;
            };
            return Promise.all(buttons.map(button => button.animateWipe(ready)));
        }
        static basic() {
            return Button.create([]);
        }
        onMake(...args) {
            this.classes.add(ButtonClasses.Main);
        }
        addIcon(tweaker) {
            this.innerIcon?.remove();
            return this.prepend(this.innerIcon = Component_2.default.create()
                .classes.add(ButtonClasses.InnerIcon)
                .append(Component_2.default.create())
                .append(Component_2.default.create())
                .tweak(tweaker));
        }
        setPrimary() {
            return this.classes.add(ButtonClasses.Primary);
        }
        setLaserFocus() {
            this.laserFocus ??= Component_2.default.create()
                .classes.add(ButtonClasses.LaserFocus)
                .appendTo(this);
            return this;
        }
        setAttention() {
            this.attention ??= Component_2.default.create()
                .classes.add(ButtonClasses.Attention)
                .appendTo(this);
            return this;
        }
        async animateWipe(initialiser) {
            while (this.wipeAnimation)
                await this.wipeAnimation;
            this.wipeAnimation = (async () => {
                const wipe = Component_2.default.create()
                    .classes.add(ButtonClasses.WipeAnimation)
                    .appendTo(this);
                this.classes.add(ButtonClasses.HasWipeAnimation);
                await new Promise(resolve => wipe.event.subscribe("animationend", resolve));
                await initialiser();
                this.classes.add(ButtonClasses.HasWipeAnimationOut);
                wipe.classes.add(ButtonClasses.WipeAnimationOut);
                await new Promise(resolve => wipe.event.subscribe("animationend", resolve));
                wipe.remove();
                this.classes.remove(ButtonClasses.HasWipeAnimation, ButtonClasses.HasWipeAnimationOut);
            })();
            await this.wipeAnimation;
            delete this.wipeAnimation;
        }
        click() {
            this.element.click();
            return this;
        }
        setDisabled(disabled = true) {
            this.attributes.toggle(disabled, "disabled");
            return this;
        }
    }
    Button.defaultType = "button";
    exports.default = Button;
});
define("ui/Loadable", ["require", "exports", "model/Model", "ui/Classes", "ui/Component", "utility/Async", "utility/decorator/Bound"], function (require, exports, Model_9, Classes_2, Component_3, Async_2, Bound_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Loadable;
    (function (Loadable) {
        let Classes;
        (function (Classes) {
            Classes["Main"] = "loadable";
            Classes["Loading"] = "loadable-loading";
            Classes["LoadingSpinny"] = "loadable-loading-spinny";
            Classes["LoadingInfo"] = "loadable-loading-info";
            Classes["LoadingBar"] = "loadable-loading-bar";
            Classes["LoadingMessage"] = "loadable-loading-message";
            Classes["LoadingHidden"] = "loadable-loading-hidden";
            Classes["Content"] = "loadable-content";
        })(Classes = Loadable.Classes || (Loadable.Classes = {}));
        class Component extends Component_3.default {
            constructor() {
                super(...arguments);
                this.persistent = false;
            }
            onMake(models, initialiser) {
                this.models = models;
                this.initialiser = initialiser;
                this.classes.add(Classes.Main);
                this.loading = Component_3.default.create()
                    .classes.add(Classes.Loading)
                    .append(Component_3.default.create()
                    .classes.add(Classes.LoadingSpinny)
                    .append(Component_3.default.create())
                    .append(Component_3.default.create()))
                    .append(Component_3.default.create()
                    .classes.add(Classes.LoadingInfo)
                    .append(this.loadingBar = Component_3.default.create()
                    .classes.add(Classes.LoadingBar))
                    .append(this.loadingMessage = Component_3.default.create()
                    .classes.add(Classes.LoadingMessage)))
                    .appendTo(this);
                for (const model of models) {
                    model.event.subscribe("loading", this.onLoading);
                    model.get();
                }
                if (models.every(model => !model.loading))
                    this.onLoaded();
            }
            setSimple() {
                this.loadingBar.classes.add(Classes_2.Classes.Hidden);
                this.loadingMessage.classes.add(Classes_2.Classes.Hidden);
                return this;
            }
            onLoading() {
                for (const model of this.models) {
                    model.event.subscribe("loaded", this.onLoaded);
                    model.event.subscribe("loadUpdate", this.updateLoadingInfo);
                }
                if (this.loading.classes.some(Classes_2.Classes.Hidden, Classes.LoadingHidden)) {
                    // start loading
                    this.updateLoadingInfo();
                    this.loading.classes.remove(Classes_2.Classes.Hidden, Classes.LoadingHidden);
                    while (this.element.children.length > 1)
                        this.element.lastElementChild.remove();
                }
            }
            setPersistent() {
                this.persistent = true;
                return this;
            }
            onLoaded() {
                this.updateLoadingInfo();
                for (const model of this.models)
                    if (model.loading)
                        return; // not loaded yet
                for (const model of this.models) {
                    if (!this.persistent)
                        model.event.unsubscribe("loading", this.onLoading);
                    model.event.unsubscribe("loaded", this.onLoaded);
                    model.event.unsubscribe("loadUpdate", this.updateLoadingInfo);
                }
                if (this.loading.classes.has(Classes.LoadingHidden))
                    return; // already loaded
                this.loading.classes.add(Classes.LoadingHidden);
                void Async_2.default.sleep(400).then(() => {
                    for (const model of this.models)
                        if (model.loading)
                            return; // not loaded yet
                    this.loading.classes.add(Classes_2.Classes.Hidden);
                });
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return
                this.initialiser(...this.models.map(model => model["value"] ?? undefined))
                    .appendTo(this);
            }
            updateLoadingInfo() {
                let progress = 0;
                let message;
                for (const model of this.models) {
                    if (!model.loading) {
                        progress++;
                        continue;
                    }
                    progress += model.loadingInfo?.progress ?? 0;
                    message ??= model.loadingInfo?.messages[0];
                }
                progress /= this.models.length;
                this.loadingBar.style.set("--progress", `${Math.min(1, progress)}`);
                if (message)
                    this.loadingMessage.text.set(`${message}...`);
                else
                    this.loadingMessage.text.remove();
            }
        }
        __decorate([
            Bound_2.default
        ], Component.prototype, "onLoading", null);
        __decorate([
            Bound_2.default
        ], Component.prototype, "onLoaded", null);
        __decorate([
            Bound_2.default
        ], Component.prototype, "updateLoadingInfo", null);
        Loadable.Component = Component;
        function create(...models) {
            return {
                onReady(initialiser) {
                    return Component.create([
                        models.map(model => model instanceof Promise ? Model_9.default.createTemporary(() => model) : model),
                        initialiser,
                    ]);
                },
            };
        }
        Loadable.create = create;
    })(Loadable || (Loadable = {}));
    exports.default = Loadable;
});
define("model/models/items/Collectibles", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Collectibles;
    (function (Collectibles) {
        async function apply(manifest, profile, item) {
            const collectible = profile.profileCollectibles?.data?.collectibles[item.definition.collectibleHash]
                ?? Object.values(profile.characterCollectibles?.data ?? {})[0]?.collectibles[item.definition.collectibleHash];
            item.collectibleState = collectible?.state;
            item.collectible = await manifest.DestinyCollectibleDefinition.get(item.definition.collectibleHash);
        }
        Collectibles.apply = apply;
    })(Collectibles || (Collectibles = {}));
    exports.default = Collectibles;
});
define("model/models/items/Plugs", ["require", "exports", "model/models/Manifest", "model/models/items/Objectives"], function (require, exports, Manifest_2, Objectives_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Perk = exports.Plug = exports.Socket = exports.PlugType = void 0;
    var PlugType;
    (function (PlugType) {
        PlugType.None = "None";
        function check(type, ...fragments) {
            if (!type)
                return false;
            let found = false;
            let hadNot = false;
            let hadNotNot = false;
            for (let query of fragments) {
                let not = false;
                if (query[0] === "!") {
                    not = true;
                    query = query.slice(1);
                }
                else if (found)
                    // already found one and this isn't an inverted check, so skip it
                    continue;
                const startsWith = query[0] === "=" ? type === query.slice(1) : type.startsWith(query);
                if (startsWith && not)
                    return false; // if any "not"s match, early exit
                hadNot ||= not;
                found ||= startsWith;
                hadNotNot ||= !not;
            }
            return hadNotNot ? found : hadNot;
        }
        PlugType.check = check;
    })(PlugType || (exports.PlugType = PlugType = {}));
    class Socket {
        static filterByPlugs(sockets, ...anyOfTypes) {
            return sockets.filter((socket) => socket?.socketedPlug?.is(...anyOfTypes) ?? false);
        }
        static filterExcludePlugs(sockets, ...anyOfTypes) {
            return sockets.filter((socket) => socket?.socketedPlug?.isNot(...anyOfTypes) ?? false);
        }
        static filterType(sockets, ...anyOfTypes) {
            if (!anyOfTypes.length)
                return [];
            return sockets.filter((socket) => socket?.is(...anyOfTypes) ?? false);
        }
        static filterExcludeType(sockets, ...anyOfTypes) {
            return sockets.filter((socket) => socket?.isNot(...anyOfTypes) ?? false);
        }
        static async resolve(manifest, init, item, index) {
            const socket = new Socket();
            Object.assign(socket, init);
            delete socket.objectives;
            const { DestinyPlugSetDefinition, DestinyInventoryItemDefinition } = manifest;
            let plugSetHash = socket.definition.randomizedPlugSetHash ?? socket.definition.reusablePlugSetHash;
            if (item?.deepsight?.pattern && index !== undefined) {
                const recipeItem = await DestinyInventoryItemDefinition.get(item.definition.inventory?.recipeItemHash);
                const recipeSocket = recipeItem?.sockets?.socketEntries[index];
                if (recipeSocket) {
                    plugSetHash = recipeSocket.randomizedPlugSetHash ?? recipeSocket.reusablePlugSetHash;
                }
            }
            const plugs = socket.state ? init.plugs : await Promise.resolve(DestinyPlugSetDefinition.get(plugSetHash))
                .then(plugSet => plugSet?.reusablePlugItems ?? []);
            if (!socket.state)
                plugs.concat(socket.definition.reusablePlugItems);
            const currentPlugHash = init.state?.plugHash ?? socket.definition.singleInitialItemHash;
            // plugs[0] = await Plug.resolve(manifest, plugs[0] as PlugRaw);
            // if (plugs[0].type & PlugType.Shader) {
            // 	socket.socketedPlug = plugs[0];
            // } else {
            socket.plugs = [];
            // let lastPause = Date.now();
            for (const plug of plugs) {
                socket.plugs.push(/*plug instanceof Plug ? plug :*/ await Plug.resolve(manifest, plug, item));
                // if (Date.now() - lastPause > 30) {
                // 	await Async.sleep(1);
                // 	lastPause = Date.now();
                // }
            }
            let socketedPlug = socket.plugs.find(plug => plug.plugItemHash === currentPlugHash);
            if (!socketedPlug && currentPlugHash) {
                socketedPlug = await Plug.resolveFromHash(manifest, currentPlugHash, init.state?.isEnabled ?? true, item);
                if (socketedPlug && socket.state)
                    socket.plugs.push(socketedPlug);
            }
            socket.socketedPlug = socketedPlug;
            // }
            if (socket.socketedPlug)
                socket.socketedPlug.socketed = true;
            for (const plug of [...socket.plugs, socket.socketedPlug]) {
                if (!plug)
                    continue;
                plug.objectives = await Objectives_1.default.resolve(manifest, init.objectives[plug.plugItemHash] ?? [], plug, item);
                socket.types.add(plug.type);
            }
            if (socket.types.size <= 1) {
                const [type] = socket.types;
                socket.type = type ?? PlugType.None;
            }
            else {
                const smallestFirst = Array.from(socket.types)
                    .sort((a, b) => a.length - b.length);
                const smallest = smallestFirst[0];
                if (smallestFirst.every(type => type.startsWith(smallest)))
                    socket.type = smallest;
                if (socket.type === PlugType.None) {
                    // we still don't have a type, so now we grab the smallest type and see how much we can shorten it to make all match
                    let type = smallestFirst[0];
                    while (type.length) {
                        type = type.slice(0, -1);
                        if (!type.includes("/"))
                            break;
                        if (smallestFirst.every(t => t.startsWith(type))) {
                            socket.type = type;
                            break;
                        }
                    }
                }
            }
            return socket;
        }
        constructor() {
            this.type = PlugType.None;
            this.types = new Set();
        }
        getPool(...anyOfTypes) {
            if (this.plugPool && !(this.plugPool instanceof Promise))
                return anyOfTypes.length === 0 ? this.plugPool : this.plugPool.filter(plug => plug.is(...anyOfTypes));
            return (async () => {
                const plugPool = this.plugPool = await (this.plugPool ??= Manifest_2.default.await()
                    .then((manifest) => Promise.resolve(manifest.DestinyPlugSetDefinition.get(this.definition.randomizedPlugSetHash ?? this.definition.reusablePlugSetHash))
                    .then(plugSet => plugSet?.reusablePlugItems ?? [])
                    .then((plugs) => plugs.concat(this.definition.reusablePlugItems))
                    .then(plugs => Promise.all(plugs.map(plug => Plug.resolve(manifest, plug))))));
                return anyOfTypes.length === 0 ? plugPool : plugPool.filter(plug => plug.is(...anyOfTypes));
            })();
        }
        is(...anyOfTypes) {
            return PlugType.check(this.type, ...anyOfTypes);
        }
        isNot(...anyOfTypes) {
            return !PlugType.check(this.type, ...anyOfTypes);
        }
        getPlugs(...anyOfTypes) {
            return anyOfTypes.length === 0 ? this.plugs : this.plugs.filter(plug => plug.is(...anyOfTypes));
        }
        getPlug(...anyOfTypes) {
            return this.getPlugs(...anyOfTypes)[0];
        }
    }
    exports.Socket = Socket;
    class Plug {
        static async resolveFromHash(manifest, hash, enabled, item) {
            return Plug.resolve(manifest, {
                plugItemHash: hash,
                canInsert: true,
                enabled,
            }, item);
        }
        getCategorisationAs(category) {
            return this.categorisation?.category === category ? this.categorisation : undefined;
        }
        static async resolve(manifest, plugBase, item) {
            const manifestCacheTime = Manifest_2.default.getCacheTime();
            // generic caching doesn't work bcuz we store socketed & objectives data on instances
            // const genericHash = Plug.getGenericPlugHash(plugBase);
            // if (genericHash) {
            // 	if (Plug.plugGenericCacheTime < manifestCacheTime) {
            // 		Plug.plugGenericCacheTime = manifestCacheTime;
            // 		Plug.plugGenericCache = {};
            // 	}
            // 	const genericCached = this.plugGenericCache[genericHash];
            // 	if (genericCached)
            // 		return genericCached;
            // }
            const plug = new Plug();
            Object.assign(plug, plugBase);
            plug.socketed = false;
            if (Plug.plugDefCacheTime < manifestCacheTime) {
                Plug.plugDefCacheTime = manifestCacheTime;
                Plug.plugDefCache = {};
            }
            const plugDef = Plug.plugDefCache[plug.plugItemHash] ??= await Plug.resolvePlugDef(manifest, plug.plugItemHash, item);
            Object.assign(plug, plugDef);
            // if (genericHash)
            // 	this.plugGenericCache[genericHash] = plug;
            return plug;
        }
        // private static getGenericPlugHash (plugBase: DestinyItemPlugBase | DestinyItemSocketEntryPlugItemRandomizedDefinition) {
        // 	if ("enabled" in plugBase)
        // 		return plugBase.enableFailIndexes?.length || plugBase.insertFailIndexes?.length ? undefined
        // 			: `${plugBase.plugItemHash}:${plugBase.enabled ? "enabled" : "disabled"}:${plugBase.canInsert ? "canInsert" : "noInsert"}`;
        // 	return plugBase.craftingRequirements?.materialRequirementHashes?.length || !plugBase.craftingRequirements?.unlockRequirements?.length ? undefined
        // 		: `${plugBase.plugItemHash}:${plugBase.currentlyCanRoll ? "currentlyCanRoll" : "currentlyCannotRoll"}:${plugBase.craftingRequirements?.requiredLevel ?? 0}`;
        // }
        static async resolvePlugDef(manifest, hash, item) {
            const { DestinyInventoryItemDefinition, DeepsightPlugCategorisation, ClarityDescriptions } = manifest;
            // let start = Date.now();
            const definition = await DestinyInventoryItemDefinition.get(hash);
            // console.log("invtime", Date.now() - start);
            // start = Date.now();
            const clarity = definition && await ClarityDescriptions.get(hash);
            // console.log("claritytime", Date.now() - start);
            // start = Date.now();
            const categorisation = await DeepsightPlugCategorisation.get(hash);
            // console.log("cattime", Date.now() - start);
            // start = Date.now();
            return {
                definition,
                clarity,
                categorisation,
                type: categorisation?.fullName ?? "Unknown",
                perks: await Promise.all((definition?.perks ?? []).map(perk => Perk.resolve(manifest, perk))),
            };
        }
        constructor() { }
        is(...anyOfTypes) {
            return PlugType.check(this.type, ...anyOfTypes);
        }
        isNot(...anyOfTypes) {
            return !PlugType.check(this.type, ...anyOfTypes);
        }
    }
    exports.Plug = Plug;
    (() => {
        Object.assign(window, { Plug });
    })();
    // private static plugGenericCacheTime = 0;
    // private static plugGenericCache: Record<string, Plug> = {};
    Plug.plugDefCacheTime = 0;
    Plug.plugDefCache = {};
    Plug.initialisedPlugTypes = {};
    class Perk {
        static async resolve({ DestinySandboxPerkDefinition }, perkEntry) {
            const perk = new Perk();
            Object.assign(perk, perkEntry);
            perk.definition = await DestinySandboxPerkDefinition.get(perk.perkHash);
            return perk;
        }
    }
    exports.Perk = Perk;
    var Plugs;
    (function (Plugs) {
        function resetInitialisedPlugTypes() {
            Plug.initialisedPlugTypes = {};
        }
        Plugs.resetInitialisedPlugTypes = resetInitialisedPlugTypes;
        function logInitialisedPlugTypes() {
            console.debug("Initialised plugs:", Plug.initialisedPlugTypes);
        }
        Plugs.logInitialisedPlugTypes = logInitialisedPlugTypes;
        async function apply(manifest, profile, item) {
            return item.sockets = (async () => {
                const { socketCategories, /*intrinsicSockets,*/ socketEntries } = item.definition.sockets ?? {};
                const states = profile.itemComponents?.sockets.data?.[item.reference.itemInstanceId]?.sockets ?? [];
                const plugs = profile.itemComponents?.reusablePlugs.data?.[item.reference.itemInstanceId]?.plugs ?? {};
                const objectivesByPlug = profile.itemComponents?.plugObjectives?.data?.[item.reference.itemInstanceId]?.objectivesPerPlug ?? {};
                const sockets = await Promise.all((socketEntries ?? [])
                    .map(async (definition, i) => Socket.resolve(manifest, {
                    definition,
                    state: states[i],
                    category: socketCategories?.find(category => category.socketIndexes.includes(i)),
                    plugs: plugs[i] ?? [],
                    objectives: objectivesByPlug,
                }, item, i)));
                item.sockets = sockets;
                return item.sockets;
            })();
        }
        Plugs.apply = apply;
    })(Plugs || (Plugs = {}));
    exports.default = Plugs;
});
define("model/models/items/Objectives", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Objectives;
    (function (Objectives) {
        async function resolve(manifest, objectives, plug, item) {
            return Promise.all(objectives.map(async (objective) => ({
                hash: objective.objectiveHash,
                progress: objective,
                plug,
                definition: await manifest.DestinyObjectiveDefinition.get(objective.objectiveHash),
            })));
        }
        Objectives.resolve = resolve;
    })(Objectives || (Objectives = {}));
    exports.default = Objectives;
});
define("model/models/items/Deepsight", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Deepsight;
    (function (Deepsight) {
        async function apply(manifest, profile, item) {
            item.shaped = await resolveShaped(item);
            item.deepsight = await resolve(manifest, profile, item);
        }
        Deepsight.apply = apply;
        async function resolve(manifest, profile, item) {
            const pattern = await resolvePattern(manifest, profile, item);
            return {
                resonance: await resolveResonance(item),
                pattern,
                activation: !item.shaped && !pattern?.progress?.complete && await resolveActivation(item),
            };
        }
        async function resolveShaped(item) {
            if (!(item.reference.state & 8 /* ItemState.Crafted */))
                return undefined;
            return {
                level: await findObjective(item, objective => objective.definition.uiStyle === 2 /* DestinyObjectiveUiStyle.CraftingWeaponLevel */),
                progress: await findObjective(item, objective => objective.definition.uiStyle === 3 /* DestinyObjectiveUiStyle.CraftingWeaponLevelProgress */),
            };
        }
        async function resolveResonance(item) {
            const sockets = await item.sockets;
            return sockets?.some(socket => socket?.state?.isVisible && socket.socketedPlug?.is("Extractable/DeepsightResonance"));
        }
        async function resolveActivation(item) {
            const sockets = await item.sockets;
            return sockets?.some(socket => socket?.socketedPlug?.is("Extractable/DeepsightActivation"));
        }
        async function resolvePattern(manifest, profile, item) {
            const { DestinyCollectibleDefinition, DestinyRecordDefinition } = manifest;
            if (item.definition.displayProperties.icon === "/img/misc/missing_icon_d2.png")
                return undefined;
            const collectible = await DestinyCollectibleDefinition.get(item.definition.collectibleHash);
            const record = collectible ? await DestinyRecordDefinition.get("icon", collectible?.displayProperties.icon ?? null)
                : await DestinyRecordDefinition.get("name", item.definition.displayProperties.name);
            if (record?.recordTypeName !== "Weapon Pattern")
                return undefined;
            return {
                record: record,
                progress: resolvePatternProgress(record, profile, item),
            };
        }
        function resolvePatternProgress(record, profile, item) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            const progress = profile.profileRecords?.data?.records[record?.hash];
            if (!progress?.objectives)
                return undefined;
            if (progress.objectives.length !== 1) {
                console.warn(`Incomprehensible pattern record for '${item.definition.displayProperties.name}'`, progress);
                return undefined;
            }
            if (!progress.objectives[0].completionValue)
                return undefined;
            return progress.objectives[0];
        }
        async function findObjective(item, predicate) {
            const sockets = await item.sockets ?? [];
            for (const objective of sockets.flatMap(socket => socket?.plugs.flatMap(plug => plug.objectives) ?? [])) {
                if (predicate(objective))
                    return objective;
            }
            return undefined;
        }
    })(Deepsight || (Deepsight = {}));
    exports.default = Deepsight;
});
define("model/models/items/Moment", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Moment;
    (function (Moment) {
        async function apply(manifest, item) {
            item.moment = await resolve(manifest, item);
        }
        Moment.apply = apply;
        async function resolve({ DeepsightMomentDefinition }, item) {
            if (!item.definition.iconWatermark)
                return undefined;
            // skip engrams
            if (item.definition.itemType === 8 /* DestinyItemType.Engram */ || item.definition.traitHashes?.includes(1465704995))
                return undefined;
            const moment = await DeepsightMomentDefinition.get("iconWatermark", item.definition.iconWatermark);
            if (moment)
                return moment;
            console.warn(`Unable to determine moment of '${item.definition.displayProperties.name}' (${item.definition.hash})`, item);
            return undefined;
        }
    })(Moment || (Moment = {}));
    exports.default = Moment;
});
define("model/models/items/Perks", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Perks;
    (function (Perks) {
        async function apply(manifest, profile, item) {
            item.perks = (await resolve(manifest, profile, item))
                ?.filter((perk) => !!perk);
        }
        Perks.apply = apply;
        async function resolve({ DestinySandboxPerkDefinition }, profile, item) {
            if (!item.definition.perks?.length)
                return undefined;
            const perkRefs = undefined
                // only applies to instanced items
                ?? profile.itemComponents?.perks.data?.[item.reference.itemInstanceId]?.perks
                // `perks.data` is always {}
                ?? (profile.characterUninstancedItemComponents && Object.values(profile.characterUninstancedItemComponents))
                    ?.find(uninstancedItemComponents => uninstancedItemComponents?.perks?.data?.[item.definition.hash]?.perks)
                    ?.perks?.data?.[item.definition.hash]?.perks
                // `uninstancedItemPerks` is always {}
                ?? (profile.characterProgressions?.data && Object.values(profile.characterProgressions.data))
                    ?.find(progression => progression.uninstancedItemPerks[item.definition.hash])
                    ?.uninstancedItemPerks[item.definition.hash].perks;
            return Promise.all(item.definition.perks.map(async (perk) => {
                const result = perk;
                const definition = await DestinySandboxPerkDefinition.get(perk.perkHash);
                if (!definition)
                    return undefined;
                result.definition = definition;
                result.reference = perkRefs?.find(ref => ref.perkHash === perk.perkHash);
                return result;
            }));
        }
    })(Perks || (Perks = {}));
    exports.default = Perks;
});
define("model/models/items/Source", ["require", "exports", "utility/endpoint/bungie/Bungie"], function (require, exports, Bungie_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SourceType = void 0;
    var SourceType;
    (function (SourceType) {
        SourceType[SourceType["Playlist"] = 0] = "Playlist";
        SourceType[SourceType["Rotator"] = 1] = "Rotator";
        SourceType[SourceType["Repeatable"] = 2] = "Repeatable";
    })(SourceType || (exports.SourceType = SourceType = {}));
    var Source;
    (function (Source) {
        async function apply(manifest, profile, item) {
            if (!item.bucket.isCollections())
                return;
            item.sources = await resolve(manifest, profile, item);
        }
        Source.apply = apply;
        async function resolve(manifest, profile, item) {
            const dropTableSources = await resolveDropTables(manifest, profile, item);
            if (!dropTableSources?.length)
                return undefined;
            return dropTableSources ?? [];
        }
        async function resolveDropTables(manifest, profile, item) {
            const { DeepsightDropTableDefinition } = manifest;
            const hash = item.definition.hash;
            let dropTables = await DeepsightDropTableDefinition.all();
            dropTables = dropTables.filter(table => false
                || table.dropTable?.[hash]
                || table.encounters?.some(encounter => encounter.dropTable?.[hash])
                || table.master?.dropTable?.[hash]
                || table.rotations?.drops?.some(drop => drop === hash || typeof drop === "object" && hash in drop)
                || table.rotations?.masterDrops?.some(drop => drop === hash || typeof drop === "object" && hash in drop));
            if (!dropTables.length)
                return undefined;
            return Promise.all(dropTables.map(table => resolveDropTable(manifest, profile, table, item)));
        }
        async function resolveDropTable(manifest, profile, table, item) {
            const { DestinyActivityDefinition, DestinyActivityModifierDefinition, DestinyInventoryItemDefinition } = manifest;
            const intervals = table.rotations?.current ?? 0;
            const activityDefinition = await DestinyActivityDefinition.get(table.hash);
            const masterActivityDefinition = await DestinyActivityDefinition.get(table.master?.activityHash);
            const type = undefined
                ?? (table.availability === "rotator" ? SourceType.Rotator : undefined)
                ?? (table.availability === "repeatable" ? SourceType.Repeatable : undefined)
                ?? SourceType.Playlist;
            const hash = item.definition.hash;
            const dropDef = table.dropTable?.[hash]
                ?? table.encounters?.find(encounter => encounter.dropTable?.[hash])?.dropTable?.[hash]
                ?? table.master?.dropTable?.[hash];
            const rotatedDrop = resolveRotation(table.rotations?.drops, intervals);
            const isRotationDrop = rotatedDrop === hash || typeof rotatedDrop === "object" && hash in rotatedDrop;
            const rotatedMasterDrop = resolveRotation(table.rotations?.masterDrops, intervals);
            const isMasterRotationDrop = rotatedMasterDrop === hash || typeof rotatedMasterDrop === "object" && hash in rotatedMasterDrop;
            const isMaster = !!table.master?.dropTable?.[hash] || isMasterRotationDrop;
            const isRotatingChallengeRelevant = table.availability === "rotator" ? false
                : isMaster
                    ? isMasterRotationDrop || !table.rotations?.masterDrops
                    : isRotationDrop || !table.rotations?.drops;
            return {
                dropTable: table,
                activityDefinition: activityDefinition,
                masterActivityDefinition,
                activeChallenge: !isRotatingChallengeRelevant ? undefined
                    : await DestinyActivityModifierDefinition.get(resolveRotation(table.rotations?.challenges, intervals)),
                isActiveDrop: (!!table.rotations?.drops && isRotationDrop)
                    || (!!table.availability && !!activityDefinition?.activityModeHashes?.includes(2394616003 /* ActivityModeHashes.Strikes */)),
                isActiveMasterDrop: !!table.master?.availability && isMaster,
                type,
                endTime: table.endTime ? new Date(table.endTime).getTime() : type === SourceType.Rotator ? Bungie_4.default.nextWeeklyReset : undefined,
                requiresQuest: !dropDef?.requiresQuest ? undefined : (await DestinyInventoryItemDefinition.get(dropDef.requiresQuest) ?? null),
                requiresItems: !dropDef?.requiresItems?.length ? undefined : await Promise.all(dropDef.requiresItems.map(async (hash) => (await DestinyInventoryItemDefinition.get(hash)) ?? null)),
                purchaseOnly: dropDef?.purchaseOnly,
            };
        }
        function resolveRotation(rotation, intervals) {
            return !rotation?.length ? undefined : rotation?.[intervals % rotation.length];
        }
        function isWeeklyChallenge(objective) {
            return objective?.displayProperties?.name === "Weekly Dungeon Challenge"
                || objective?.displayProperties?.name === "Weekly Raid Challenge";
        }
        Source.isWeeklyChallenge = isWeeklyChallenge;
    })(Source || (Source = {}));
    exports.default = Source;
});
define("ui/inventory/Stat", ["require", "exports", "utility/Store"], function (require, exports, Store_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IStatDistribution = exports.ARMOUR_GROUP_STATS_MAX = exports.ARMOUR_STAT_MAX_VISUAL = exports.ARMOUR_STAT_MAX = exports.ARMOUR_STAT_MIN = exports.ARMOUR_STAT_GROUPS = exports.STAT_DISPLAY_ORDER = exports.Stat = void 0;
    // for reference:
    1591432999 /* StatHashes.Accuracy */;
    // Don't use bungie-api/ts/destiny2.StatHashes because it's a const enum and we use the names for css classes
    var Stat;
    (function (Stat) {
        // Unrendered
        Stat[Stat["Attack"] = 1480404414] = "Attack";
        Stat[Stat["Defense"] = 3897883278] = "Defense";
        Stat[Stat["Power"] = 1935470627] = "Power";
        Stat[Stat["InventorySize"] = 1931675084] = "InventorySize";
        Stat[Stat["Mystery1"] = 1885944937] = "Mystery1";
        Stat[Stat["Mystery2"] = 3291498656] = "Mystery2";
        // weapons
        Stat[Stat["Stability"] = 155624089] = "Stability";
        Stat[Stat["Range"] = 1240592695] = "Range";
        Stat[Stat["Magazine"] = 3871231066] = "Magazine";
        Stat[Stat["AmmoCapacity"] = 925767036] = "AmmoCapacity";
        Stat[Stat["RPM"] = 4284893193] = "RPM";
        Stat[Stat["DrawTime"] = 447667954] = "DrawTime";
        Stat[Stat["AirborneEffectiveness"] = 2714457168] = "AirborneEffectiveness";
        Stat[Stat["AimAssistance"] = 1345609583] = "AimAssistance";
        Stat[Stat["RecoilDirection"] = 2715839340] = "RecoilDirection";
        Stat[Stat["Zoom"] = 3555269338] = "Zoom";
        Stat[Stat["ChargeTime"] = 2961396640] = "ChargeTime";
        // armour
        Stat[Stat["Mobility"] = 2996146975] = "Mobility";
        Stat[Stat["Resilience"] = 392767087] = "Resilience";
        Stat[Stat["Recovery"] = 1943323491] = "Recovery";
        Stat[Stat["Discipline"] = 1735777505] = "Discipline";
        Stat[Stat["Intellect"] = 144602215] = "Intellect";
        Stat[Stat["Strength"] = 4244567218] = "Strength";
        // ghosts
        Stat[Stat["GhostEnergyCapacity"] = 237763788] = "GhostEnergyCapacity";
        Stat[Stat["ModCost"] = 514071887] = "ModCost";
    })(Stat || (exports.Stat = Stat = {}));
    exports.STAT_DISPLAY_ORDER = {
        [Stat.RPM]: -1,
        [Stat.AirborneEffectiveness]: { after: Stat.Stability },
        [Stat.AimAssistance]: { after: Stat.AirborneEffectiveness },
        [Stat.Zoom]: { after: Stat.AimAssistance },
        [Stat.RecoilDirection]: { after: Stat.Zoom },
        [Stat.Magazine]: 1001,
        [Stat.AmmoCapacity]: 1002,
    };
    exports.ARMOUR_STAT_GROUPS = [
        [Stat.Mobility, Stat.Resilience, Stat.Recovery],
        [Stat.Discipline, Stat.Intellect, Stat.Strength],
    ];
    exports.ARMOUR_STAT_MIN = 2;
    exports.ARMOUR_STAT_MAX = 30;
    exports.ARMOUR_STAT_MAX_VISUAL = 44;
    exports.ARMOUR_GROUP_STATS_MAX = 34;
    exports.IStatDistribution = new class StatDistributionManager {
        constructor() {
            this.enabled = {};
            this.preferred = {};
        }
        isEnabled(stat, classType) {
            let enabled = this.enabled[classType]?.[stat];
            if (enabled === undefined) {
                this.enabled[classType] ??= {};
                this.enabled[classType][stat] = enabled = Store_7.default.get(`preferredStatDistribution.${classType}.${Stat[stat]}.enabled`) ?? false;
            }
            return enabled;
        }
        getPreferredValue(stat, classType) {
            let preferred = this.preferred[classType]?.[stat];
            if (preferred === undefined) {
                this.preferred[classType] ??= {};
                this.preferred[classType][stat] = preferred = Store_7.default.get(`preferredStatDistribution.${classType}.${Stat[stat]}`) ?? Math.floor(exports.ARMOUR_GROUP_STATS_MAX / 3);
            }
            return preferred;
        }
        setIsEnabled(stat, classType, enabled) {
            if (this.isEnabled(stat, classType) === enabled)
                return;
            this.enabled[classType][stat] = enabled;
            Store_7.default.set(`preferredStatDistribution.${classType}.${Stat[stat]}.enabled`, enabled);
        }
        setPreferredValue(stat, classType, value) {
            if (this.getPreferredValue(stat, classType) === value)
                return;
            this.preferred[classType][stat] = value;
            Store_7.default.set(`preferredStatDistribution.${classType}.${Stat[stat]}`, value);
        }
        get(item) {
            if (!item.stats || !exports.ARMOUR_STAT_GROUPS.flat().some(stat => item.stats?.values[stat]?.roll))
                return { overall: 0, groups: exports.ARMOUR_STAT_GROUPS.map(_ => 0) };
            const result = { overall: 0, groups: [] };
            let total = 0;
            let groups = 0;
            for (const group of exports.ARMOUR_STAT_GROUPS) {
                let groupEnabledNearnessTotal = 0;
                let groupDisabledTotal = 0;
                let stats = 0;
                for (const stat of group) {
                    const statValue = item.stats.values[stat]?.roll ?? 0;
                    if (!this.isEnabled(stat, item.definition.classType)) {
                        groupDisabledTotal += statValue;
                        continue;
                    }
                    groupDisabledTotal += statValue;
                    const nearness = 1 - Math.abs(this.getPreferredValue(stat, item.definition.classType) - statValue) / exports.ARMOUR_STAT_MAX;
                    groupEnabledNearnessTotal += nearness;
                    stats++;
                }
                if (groupDisabledTotal) {
                    const qualityOfDisabledStats = groupDisabledTotal / exports.ARMOUR_GROUP_STATS_MAX;
                    groupEnabledNearnessTotal += qualityOfDisabledStats;
                    stats++;
                }
                const groupDistribution = groupEnabledNearnessTotal / stats;
                result.groups.push(groupDistribution);
                total += groupDistribution;
                groups++;
            }
            result.overall = total / groups;
            return result;
        }
    };
});
define("model/models/items/Stats", ["require", "exports", "model/models/items/Plugs", "ui/inventory/Stat", "utility/maths/Maths"], function (require, exports, Plugs_1, Stat_1, Maths_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Stats;
    (function (Stats) {
        async function apply(manifest, profile, item) {
            item.stats = await resolve(manifest, profile, item);
        }
        Stats.apply = apply;
        async function resolve(manifest, profile, item) {
            if (!item.definition.stats)
                return undefined;
            const { DestinyStatGroupDefinition, DestinyStatDefinition } = manifest;
            const statGroupDefinition = await DestinyStatGroupDefinition.get(item.definition.stats?.statGroupHash);
            if (!statGroupDefinition)
                return undefined;
            const intrinsicStats = item.definition.investmentStats;
            const sockets = (await item.sockets) ?? [];
            const statRolls = Plugs_1.Socket.filterByPlugs(sockets, "Intrinsic")
                .flatMap(socket => socket.socketedPlug.definition?.investmentStats ?? []);
            const stats = profile.itemComponents?.stats.data?.[item.reference.itemInstanceId]?.stats ?? item.definition.stats.stats;
            if (stats)
                for (const random of statRolls)
                    if (random && !random.isConditionallyActive)
                        stats[random.statTypeHash] ??= { statHash: random.statTypeHash, value: random.value };
            const masterworkStats = item.bucket.isCollections() ? [] : Plugs_1.Socket.filterByPlugs(sockets, "Masterwork")
                .flatMap(socket => socket.socketedPlug.definition?.investmentStats ?? []);
            const modStats = item.bucket.isCollections() ? [] : Plugs_1.Socket.filterExcludePlugs(sockets, "Intrinsic", "Masterwork")
                .flatMap(socket => socket.socketedPlug.definition?.investmentStats ?? []);
            const chargeStats = item.bucket.isCollections() ? [] : Plugs_1.Socket.filterByPlugs(sockets, "Mod/Armor")
                .flatMap(socket => socket.socketedPlug.getCategorisationAs(3 /* DeepsightPlugCategory.Mod */)?.armourChargeStats ?? []);
            const result = {};
            for (const [hashString, { value }] of Object.entries(stats ?? {})) {
                const hash = +hashString;
                const statDefinition = await DestinyStatDefinition.get(hash);
                if (!statDefinition) {
                    console.warn("Unknown stat", hash, "value", value);
                    continue;
                }
                const displayIndex = statGroupDefinition.scaledStats.findIndex(stat => stat.statHash === hash);
                const display = statGroupDefinition.scaledStats[displayIndex];
                const stat = result[hash] = {
                    hash,
                    value,
                    definition: statDefinition,
                    max: hash === Stat_1.Stat.ChargeTime && item.definition.itemSubType === 11 /* DestinyItemSubType.FusionRifle */ ? 1000 : display?.maximumValue ?? 100,
                    bar: !(display?.displayAsNumeric ?? false),
                    order: Stat_1.STAT_DISPLAY_ORDER[hash] ?? (displayIndex === -1 ? 10000 : displayIndex),
                    intrinsic: 0,
                    roll: 0,
                    mod: 0,
                    masterwork: 0,
                    subclass: !item.definition.itemCategoryHashes?.includes(50 /* ItemCategoryHashes.Subclasses */) ? 0 : value,
                    charge: 0,
                };
                const statDisplay = statGroupDefinition.scaledStats.find(statDisplay => statDisplay.statHash === hash);
                function interpolate(value) {
                    if (!statDisplay?.displayInterpolation.length)
                        return value;
                    const start = statDisplay.displayInterpolation.findLast(stat => stat.value <= value) ?? statDisplay.displayInterpolation[0];
                    const end = statDisplay.displayInterpolation.find(stat => stat.value > value) ?? statDisplay.displayInterpolation[statDisplay.displayInterpolation.length - 1];
                    if (start === end)
                        return start.weight;
                    const t = (value - start.value) / (end.value - start.value);
                    return Maths_2.default.bankersRound(start.weight + t * (end.weight - start.weight));
                }
                for (const intrinsic of intrinsicStats)
                    if (hash === intrinsic?.statTypeHash && !intrinsic.isConditionallyActive)
                        stat.intrinsic += intrinsic.value;
                for (const random of statRolls)
                    if (hash === random?.statTypeHash && !random.isConditionallyActive)
                        stat.roll += random.value;
                for (const masterwork of masterworkStats)
                    if (hash === masterwork.statTypeHash && !masterwork.isConditionallyActive)
                        stat.masterwork += masterwork.value;
                for (const mod of modStats)
                    if (hash === mod?.statTypeHash && !mod.isConditionallyActive)
                        stat.mod += mod.value;
                let chargeCount = 0;
                for (const mod of chargeStats)
                    if (hash === mod?.statTypeHash)
                        stat.charge = typeof mod.value === "number" ? mod.value : mod.value[chargeCount++];
                const { intrinsic, roll, masterwork, mod } = stat;
                stat.intrinsic = interpolate(intrinsic + roll);
                stat.roll = interpolate(roll);
                stat.mod = interpolate(intrinsic + roll + mod) - stat.intrinsic;
                stat.masterwork = interpolate(intrinsic + roll + masterwork) - stat.intrinsic;
            }
            return {
                values: result,
                definition: statGroupDefinition,
                block: item.definition.stats,
            };
        }
    })(Stats || (Stats = {}));
    exports.default = Stats;
});
define("model/models/items/Tier", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tier;
    (function (Tier) {
        async function apply({ DeepsightTierTypeDefinition }, item) {
            item.tier = await DeepsightTierTypeDefinition.get(item.definition.inventory?.tierTypeHash);
        }
        Tier.apply = apply;
    })(Tier || (Tier = {}));
    exports.default = Tier;
});
define("model/models/enum/EnumModel", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class EnumModel {
        static create(id, definition) {
            const model = new EnumModel(id);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            const promise = definition.generate().then(all => model.all = all);
            Object.assign(model, definition);
            EnumModel.promises?.push(promise);
            return model;
        }
        static async awaitAll() {
            if (EnumModel.promises)
                await Promise.all(EnumModel.promises);
            delete EnumModel.promises;
        }
        constructor(id) {
            this.id = id;
        }
        get(id) {
            if (!Array.isArray(id)) {
                const byHash = this.all.array.find(def => def.enumValue === +id || def.hash === +id);
                if (byHash)
                    return byHash;
                const nameLowerCase = `${id}`.toLowerCase();
                if (!nameLowerCase)
                    // match none on zero length
                    return undefined;
                const matching = this.all.array.filter(type => type.displayProperties.nameLowerCase?.startsWith(nameLowerCase));
                if (matching.length > 1)
                    // return undefined on more than one match too
                    return undefined;
                return matching[0];
            }
            id = id.map(hash => +hash);
            return this.all.array.find(def => !Array.isArray(def.enumValue) ? id.includes(def.enumValue)
                : def.enumValue.every(enumValue => id.includes(enumValue)));
        }
        nameOf(id) {
            const def = this.get(id);
            return Object.entries(this.all)
                .find(([, d]) => d === def)?.[0];
        }
    }
    EnumModel.promises = [];
    exports.default = EnumModel;
});
define("model/models/enum/AmmoTypes", ["require", "exports", "model/models/enum/EnumModel"], function (require, exports, EnumModel_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const AmmoTypes = EnumModel_1.default.create("AmmoTypes", {
        // eslint-disable-next-line @typescript-eslint/require-await
        async generate() {
            const emptyDisplayProperties = {
                name: "",
                description: "",
                icon: "",
                iconSequences: [],
                highResIcon: "",
                hasIcon: false,
            };
            const types = [
                {
                    enumValue: 0 /* DestinyAmmunitionType.None */,
                    displayProperties: { ...emptyDisplayProperties },
                },
                {
                    enumValue: 4 /* DestinyAmmunitionType.Unknown */,
                    displayProperties: { ...emptyDisplayProperties, name: "Unknown" },
                },
                {
                    enumValue: 1 /* DestinyAmmunitionType.Primary */,
                    displayProperties: { ...emptyDisplayProperties, name: "Primary", icon: "/img/destiny_content/ammo_types/primary.png" },
                },
                {
                    enumValue: 2 /* DestinyAmmunitionType.Special */,
                    displayProperties: { ...emptyDisplayProperties, name: "Special", icon: "/img/destiny_content/ammo_types/special.png" },
                },
                {
                    enumValue: 3 /* DestinyAmmunitionType.Heavy */,
                    displayProperties: { ...emptyDisplayProperties, name: "Heavy", icon: "/img/destiny_content/ammo_types/heavy.png" },
                },
            ];
            return {
                array: types,
                primary: types.find(type => type.enumValue === 1 /* DestinyAmmunitionType.Primary */),
                special: types.find(type => type.enumValue === 2 /* DestinyAmmunitionType.Special */),
                heavy: types.find(type => type.enumValue === 3 /* DestinyAmmunitionType.Heavy */),
            };
        },
    });
    exports.default = AmmoTypes;
});
define("model/models/enum/BreakerTypes", ["require", "exports", "model/models/enum/EnumModel", "model/models/Manifest"], function (require, exports, EnumModel_2, Manifest_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const BreakerTypes = EnumModel_2.default.create("BreakerTypes", {
        async generate() {
            const { DestinyBreakerTypeDefinition } = await Manifest_3.default.await();
            const types = await DestinyBreakerTypeDefinition.all();
            return {
                array: types,
                barrier: types.find(type => type.enumValue === 1 /* DestinyBreakerType.ShieldPiercing */),
                overload: types.find(type => type.enumValue === 2 /* DestinyBreakerType.Disruption */),
                unstoppable: types.find(type => type.enumValue === 3 /* DestinyBreakerType.Stagger */),
            };
        },
    });
    exports.default = BreakerTypes;
});
define("model/models/enum/ClassTypes", ["require", "exports", "model/models/enum/EnumModel", "model/models/Manifest"], function (require, exports, EnumModel_3, Manifest_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const ClassTypes = EnumModel_3.default.create("ClassTypes", {
        async generate() {
            const { DestinyClassDefinition } = await Manifest_4.default.await();
            const types = (await DestinyClassDefinition.all())
                .map(type => ({ ...type, enumValue: type.classType }));
            const result = {
                array: types,
                titan: types.find(type => type.classType === 0 /* DestinyClass.Titan */),
                hunter: types.find(type => type.classType === 1 /* DestinyClass.Hunter */),
                warlock: types.find(type => type.classType === 2 /* DestinyClass.Warlock */),
            };
            result.titan.displayProperties.icon = "https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_titan.svg";
            result.hunter.displayProperties.icon = "https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_hunter.svg";
            result.warlock.displayProperties.icon = "https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_warlock.svg";
            return result;
        },
    });
    exports.default = ClassTypes;
});
define("model/models/enum/DamageTypes", ["require", "exports", "model/models/enum/EnumModel", "model/models/Manifest"], function (require, exports, EnumModel_4, Manifest_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DamageTypes = EnumModel_4.default.create("DamageTypes", {
        async generate() {
            const { DestinyDamageTypeDefinition } = await Manifest_5.default.await();
            const types = await DestinyDamageTypeDefinition.all();
            return {
                array: types,
                none: types.find(type => type.enumValue === 0 /* DamageType.None */),
                kinetic: types.find(type => type.enumValue === 1 /* DamageType.Kinetic */),
                void: types.find(type => type.enumValue === 4 /* DamageType.Void */),
                solar: types.find(type => type.enumValue === 3 /* DamageType.Thermal */),
                arc: types.find(type => type.enumValue === 2 /* DamageType.Arc */),
                stasis: types.find(type => type.enumValue === 6 /* DamageType.Stasis */),
                strand: types.find(type => type.enumValue === 7 /* DamageType.Strand */),
                raid: types.find(type => type.enumValue === 5 /* DamageType.Raid */),
            };
        },
    });
    exports.default = DamageTypes;
});
define("model/models/enum/EnumModelMap", ["require", "exports", "model/models/enum/AmmoTypes", "model/models/enum/BreakerTypes", "model/models/enum/ClassTypes", "model/models/enum/DamageTypes"], function (require, exports, AmmoTypes_1, BreakerTypes_1, ClassTypes_1, DamageTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const EnumModelMap = {
        kinetic: [DamageTypes_1.default, 1 /* DamageType.Kinetic */],
        arc: [DamageTypes_1.default, 2 /* DamageType.Arc */],
        void: [DamageTypes_1.default, 4 /* DamageType.Void */],
        solar: [DamageTypes_1.default, 3 /* DamageType.Thermal */],
        stasis: [DamageTypes_1.default, 6 /* DamageType.Stasis */],
        strand: [DamageTypes_1.default, 7 /* DamageType.Strand */],
        primary: [AmmoTypes_1.default, 1 /* DestinyAmmunitionType.Primary */],
        special: [AmmoTypes_1.default, 2 /* DestinyAmmunitionType.Special */],
        heavy: [AmmoTypes_1.default, 3 /* DestinyAmmunitionType.Heavy */],
        titan: [ClassTypes_1.default, 0 /* DestinyClass.Titan */],
        hunter: [ClassTypes_1.default, 1 /* DestinyClass.Hunter */],
        warlock: [ClassTypes_1.default, 2 /* DestinyClass.Warlock */],
        barrier: [BreakerTypes_1.default, 1 /* DestinyBreakerType.ShieldPiercing */],
        "shield-piercing": [BreakerTypes_1.default, 1 /* DestinyBreakerType.ShieldPiercing */],
        overload: [BreakerTypes_1.default, 2 /* DestinyBreakerType.Disruption */],
        disruption: [BreakerTypes_1.default, 2 /* DestinyBreakerType.Disruption */],
        unstoppable: [BreakerTypes_1.default, 3 /* DestinyBreakerType.Stagger */],
        stagger: [BreakerTypes_1.default, 3 /* DestinyBreakerType.Stagger */],
    };
    exports.default = EnumModelMap;
});
define("ui/bungie/EnumIcon", ["require", "exports", "ui/Component"], function (require, exports, Component_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.EnumIconClasses = void 0;
    var EnumIconClasses;
    (function (EnumIconClasses) {
        EnumIconClasses["Main"] = "enum-icon";
        EnumIconClasses["Mask"] = "enum-icon-mask";
    })(EnumIconClasses || (exports.EnumIconClasses = EnumIconClasses = {}));
    class EnumIcon extends Component_4.default {
        static async applyIconVar(component, model, id, varName = "--icon", onApply) {
            const applied = await EnumIcon.applyIcon(model, id, iconPath => component.style.set(varName, `url(${iconPath})`));
            onApply?.(applied);
            return applied;
        }
        static async applyIcon(model, id, applicator) {
            const iconPath = await this.getIconPath(model, id);
            if (!iconPath)
                return false;
            applicator(iconPath);
            return true;
        }
        static async getIconPath(model, id) {
            const definition = await model.get(id);
            let iconPath = definition?.displayProperties.icon;
            if (!iconPath)
                return undefined;
            if (iconPath.startsWith("/"))
                iconPath = `https://www.bungie.net${iconPath}`;
            return iconPath;
        }
        async onMake(model, id) {
            this.classes.add(EnumIconClasses.Main, `${EnumIconClasses.Main}-${model.id}`);
            const iconPath = await EnumIcon.getIconPath(model, id);
            if (iconPath)
                this.attributes.set("src", iconPath);
        }
    }
    EnumIcon.defaultType = "img";
    exports.default = EnumIcon;
});
define("ui/bungie/DisplayProperties", ["require", "exports", "model/models/Manifest", "model/models/ProfileBatch", "model/models/enum/EnumModelMap", "ui/Component", "ui/bungie/EnumIcon", "utility/Strings"], function (require, exports, Manifest_6, ProfileBatch_3, EnumModelMap_1, Component_5, EnumIcon_1, Strings_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Display;
    (function (Display) {
        Display.DESTINY_MANIFEST_MISSING_ICON_PATH = "/img/misc/missing_icon_d2.png";
        function make(name, description = "", others) {
            return {
                name,
                description,
                icon: "",
                iconSequences: [],
                hasIcon: false,
                highResIcon: "",
                ...others,
            };
        }
        Display.make = make;
        function icon(displayProperties, wrapped = true) {
            let url = displayProperties === undefined ? undefined : typeof displayProperties === "string" ? displayProperties
                : getIconURL("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties);
            if (!url)
                return undefined;
            if (url === Display.DESTINY_MANIFEST_MISSING_ICON_PATH)
                return undefined;
            if (!url.startsWith("https://") && !url.startsWith("./"))
                url = `https://www.bungie.net${url}`;
            return wrapped ? `url("${url}")` : url;
        }
        Display.icon = icon;
        function name(displayProperties, orElse) {
            return displayProperties === undefined ? orElse
                : ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties).name
                    ?? orElse;
        }
        Display.name = name;
        function subtitle(displayProperties, orElse) {
            return displayProperties === undefined ? orElse
                : ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties).subtitle
                    ?? orElse;
        }
        Display.subtitle = subtitle;
        const interpolationRegex = /(\{var:\d+\})|(\[[\w-]+\])/g;
        async function applyDescription(component, description, options) {
            component.removeContents();
            if (!description)
                return [];
            const character = typeof options === "string" ? options : options?.character;
            options = typeof options === "string" ? {} : options;
            options ??= {};
            options.character = character;
            let resolveKeywords;
            options.keywords = new Promise(resolve => resolveKeywords = resolve);
            if (options?.singleLine)
                description = description.replace(/(\s*\n\s*)+/g, " \xa0 / \xa0 ");
            const { DestinyTraitDefinition } = await Manifest_6.default.await();
            let traits = await DestinyTraitDefinition.all();
            traits = traits.filter(trait => trait.displayProperties.name && trait.displayProperties.description && trait.displayHint === "keyword");
            for (const trait of traits) {
                const name = trait.displayProperties.nameLowerCase ??= trait.displayProperties.name.toLowerCase();
                trait.displayProperties.nameLowercaseVariations ??= Strings_2.default.getVariations(name);
            }
            const split = description.split(interpolationRegex);
            if (split.length < 2) {
                const addedTraits = applyDescriptionHighlightKeywords(component, description, traits);
                options.keywords = addedTraits;
                resolveKeywords(addedTraits);
                return addedTraits;
            }
            const addedKeywords = [];
            const { profileStringVariables, characterStringVariables } = ProfileBatch_3.default.latest ?? {};
            for (const section of split) {
                if (!section)
                    continue;
                switch (section[0]) {
                    case "[": {
                        const iconName = section
                            .slice(1, -1)
                            .toLowerCase()
                            .replace(/\W+/g, "-");
                        const enumIconPath = EnumModelMap_1.default[iconName];
                        if (!enumIconPath) {
                            console.warn("No entry in EnumModelMap for", iconName);
                            component.text.add(section);
                            break;
                        }
                        component.append(EnumIcon_1.default.create([...enumIconPath]));
                        break;
                    }
                    case "{": {
                        const hash = section.slice(5, -1);
                        const value = characterStringVariables?.data?.[character]?.integerValuesByHash[+hash]
                            ?? profileStringVariables?.data?.integerValuesByHash[+hash]
                            ?? 0;
                        component.append(Component_5.default.create("span")
                            .classes.add("var")
                            .text.set(`${value}`));
                        break;
                    }
                    default:
                        addedKeywords.push(...applyDescriptionHighlightKeywords(component, section, traits));
                }
            }
            options.keywords = addedKeywords;
            resolveKeywords(addedKeywords);
            return options.keywords;
        }
        Display.applyDescription = applyDescription;
        function applyDescriptionHighlightKeywords(component, description, traits) {
            const addedKeywords = [];
            let matching = traits;
            let keyword = "";
            let holding = "";
            let holdingSpaceIndex;
            let rawSection = "";
            for (let i = 0; i < description.length; i++) {
                const char = description[i];
                if (keyword !== undefined) {
                    if ((char === " " || char === "\n" || char === "(") && !keyword) {
                        rawSection += char;
                        continue;
                    }
                    holding += char;
                    keyword += char.toLowerCase();
                    const nextChar = description[i + 1];
                    const nextCharIsWordBreak = nextChar === " " || nextChar === "\n" || nextChar === "," || nextChar === "." || nextChar === ";" || nextChar === ":" || nextChar === ")";
                    const variations = Strings_2.default.getVariations(keyword);
                    matching = matching.filter(trait => variations.some(keyword => trait.displayProperties.nameLowercaseVariations.some(name => name.startsWith(keyword))));
                    if (!matching.length) {
                        keyword = char === " " || char === "\n" || char === "(" ? "" : undefined;
                        matching = traits;
                        if (holdingSpaceIndex) {
                            holding = holding.slice(0, -(i - holdingSpaceIndex));
                            i = holdingSpaceIndex;
                            keyword = "";
                        }
                        rawSection += holding;
                        holding = "";
                        holdingSpaceIndex = undefined;
                    }
                    else if (matching.length === 1 && nextCharIsWordBreak && matching[0].displayProperties.nameLowercaseVariations.some(name => variations.includes(name))) {
                        addedKeywords.push(matching[0]);
                        component.text.add(rawSection);
                        component.append(Component_5.default.create("span")
                            .classes.add("description-keyword")
                            .text.set(Strings_2.default.toTitleCase(holding)));
                        keyword = undefined;
                        holding = "";
                        rawSection = "";
                        matching = traits;
                        holdingSpaceIndex = undefined;
                    }
                    else if (char === " ") {
                        holdingSpaceIndex ??= i;
                    }
                }
                else {
                    if (char === " " || char === "\n" || char === "(") {
                        keyword = "";
                    }
                    rawSection += char;
                }
            }
            if (rawSection)
                component.text.add(rawSection);
            return addedKeywords;
        }
        function description(displayProperties) {
            return displayProperties === undefined ? undefined
                : ("displayProperties" in displayProperties ? displayProperties.displayProperties : displayProperties)
                    .description;
        }
        Display.description = description;
        function descriptionIfShortOrName(detailedDisplayProperties, simpleDisplayProperties) {
            if (detailedDisplayProperties === undefined) {
                if (simpleDisplayProperties === undefined)
                    return undefined;
                else
                    detailedDisplayProperties = simpleDisplayProperties;
            }
            detailedDisplayProperties = "displayProperties" in detailedDisplayProperties ? detailedDisplayProperties.displayProperties : detailedDisplayProperties;
            if (detailedDisplayProperties.description?.length && (detailedDisplayProperties.description?.length ?? 0) < 32)
                return detailedDisplayProperties.description;
            if (detailedDisplayProperties.name?.length && (detailedDisplayProperties.name?.length ?? 0) < 32 || !simpleDisplayProperties)
                return detailedDisplayProperties.name;
            simpleDisplayProperties = "displayProperties" in simpleDisplayProperties ? simpleDisplayProperties.displayProperties : simpleDisplayProperties;
            return simpleDisplayProperties?.name;
        }
        Display.descriptionIfShortOrName = descriptionIfShortOrName;
        function nameIfShortOrName(detailedDisplayProperties, simpleDisplayProperties) {
            if (detailedDisplayProperties === undefined) {
                if (simpleDisplayProperties === undefined)
                    return undefined;
                else
                    detailedDisplayProperties = simpleDisplayProperties;
            }
            detailedDisplayProperties = "displayProperties" in detailedDisplayProperties ? detailedDisplayProperties.displayProperties : detailedDisplayProperties;
            if (detailedDisplayProperties.name?.length && (detailedDisplayProperties.name?.length ?? 0) < 32 || !simpleDisplayProperties)
                return detailedDisplayProperties.name;
            simpleDisplayProperties = "displayProperties" in simpleDisplayProperties ? simpleDisplayProperties.displayProperties : simpleDisplayProperties;
            return simpleDisplayProperties?.name;
        }
        Display.nameIfShortOrName = nameIfShortOrName;
        function getIconURL(displayProperties) {
            const icon = displayProperties?.icon;
            // if (icon?.endsWith(".png"))
            // 	return icon;
            return icon
                ?? displayProperties?.iconSequences
                    ?.flatMap(icon => icon.frames.filter(frame => frame.endsWith(".png")))?.[0]
                ?? icon;
        }
    })(Display || (Display = {}));
    exports.default = Display;
});
define("utility/endpoint/bungie/endpoint/destiny2/actions/items/EquipItem", ["require", "exports", "model/models/Memberships", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, Memberships_2, BungieEndpoint_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_6.default
        .at("/Destiny2/Actions/Items/EquipItem/")
        .request(async (item, character) => {
        const membership = await (0, Memberships_2.getCurrentDestinyMembership)();
        return {
            method: "POST",
            body: {
                itemId: item.reference.itemInstanceId,
                characterId: character,
                membershipType: membership.membershipType,
            },
        };
    })
        .returning();
});
define("utility/endpoint/bungie/endpoint/destiny2/actions/items/PullFromPostmaster", ["require", "exports", "model/models/Memberships", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, Memberships_3, BungieEndpoint_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_7.default
        .at("/Destiny2/Actions/Items/PullFromPostmaster/")
        .request(async (item, character) => {
        if (!item.reference.itemInstanceId)
            throw new Error("Item has no instance ID");
        const membership = await (0, Memberships_3.getCurrentDestinyMembership)();
        return {
            method: "POST",
            body: {
                itemReferenceHash: item.definition.hash,
                stackSize: item.reference.quantity,
                itemId: item.reference.itemInstanceId,
                characterId: character,
                membershipType: membership.membershipType,
            },
        };
    })
        .returning();
});
define("utility/endpoint/bungie/endpoint/destiny2/actions/items/SetLockState", ["require", "exports", "model/models/Memberships", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, Memberships_4, BungieEndpoint_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_8.default
        .at("/Destiny2/Actions/Items/SetLockState/")
        .request(async (item, locked) => {
        if (!item.reference.itemInstanceId)
            throw new Error("Item has no instance ID");
        const membership = await (0, Memberships_4.getCurrentDestinyMembership)();
        return {
            method: "POST",
            body: {
                state: locked,
                itemId: item.reference.itemInstanceId,
                characterId: item.owner,
                membershipType: membership.membershipType,
            },
        };
    })
        .returning();
});
define("utility/endpoint/bungie/endpoint/destiny2/actions/items/TransferItem", ["require", "exports", "model/models/Memberships", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, Memberships_5, BungieEndpoint_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_9.default
        .at("/Destiny2/Actions/Items/TransferItem/")
        .request(async (item, character, destination = character) => {
        if (!item.reference.itemInstanceId)
            throw new Error("Item has no instance ID");
        const membership = await (0, Memberships_5.getCurrentDestinyMembership)();
        return {
            method: "POST",
            body: {
                itemReferenceHash: item.definition.hash,
                stackSize: item.reference.quantity,
                transferToVault: destination === "vault",
                itemId: item.reference.itemInstanceId,
                characterId: destination === "vault" ? character : destination,
                membershipType: membership.membershipType,
            },
        };
    })
        .returning();
});
define("model/models/items/Item", ["require", "exports", "model/models/items/Bucket", "model/models/items/Collectibles", "model/models/items/Deepsight", "model/models/items/Moment", "model/models/items/Perks", "model/models/items/Plugs", "model/models/items/Source", "model/models/items/Stats", "model/models/items/Tier", "ui/bungie/DisplayProperties", "utility/Arrays", "utility/EventManager", "utility/Store", "utility/endpoint/bungie/endpoint/destiny2/actions/items/EquipItem", "utility/endpoint/bungie/endpoint/destiny2/actions/items/PullFromPostmaster", "utility/endpoint/bungie/endpoint/destiny2/actions/items/SetLockState", "utility/endpoint/bungie/endpoint/destiny2/actions/items/TransferItem"], function (require, exports, Bucket_1, Collectibles_1, Deepsight_1, Moment_1, Perks_1, Plugs_2, Source_1, Stats_1, Tier_1, DisplayProperties_1, Arrays_3, EventManager_8, Store_8, EquipItem_1, PullFromPostmaster_1, SetLockState_1, TransferItem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemFomoState = void 0;
    var ItemFomoState;
    (function (ItemFomoState) {
        ItemFomoState[ItemFomoState["NoMo"] = 0] = "NoMo";
        ItemFomoState[ItemFomoState["TemporaryAvailability"] = 1] = "TemporaryAvailability";
        ItemFomoState[ItemFomoState["TemporaryRepeatability"] = 2] = "TemporaryRepeatability";
    })(ItemFomoState || (exports.ItemFomoState = ItemFomoState = {}));
    const WEAPON_BUCKET_HASHES = new Set([1498876634 /* InventoryBucketHashes.KineticWeapons */, 2465295065 /* InventoryBucketHashes.EnergyWeapons */, 953998645 /* InventoryBucketHashes.PowerWeapons */]);
    const ARMOUR_BUCKET_HASHES = new Set([3448274439 /* InventoryBucketHashes.Helmet */, 3551918588 /* InventoryBucketHashes.Gauntlets */, 14239492 /* InventoryBucketHashes.ChestArmor */, 20886954 /* InventoryBucketHashes.LegArmor */, 1585787867 /* InventoryBucketHashes.ClassArmor */]);
    var TransferType;
    (function (TransferType) {
        TransferType[TransferType["PullFromPostmaster"] = 0] = "PullFromPostmaster";
        TransferType[TransferType["TransferToVault"] = 1] = "TransferToVault";
        TransferType[TransferType["TransferToCharacterFromVault"] = 2] = "TransferToCharacterFromVault";
        TransferType[TransferType["Equip"] = 3] = "Equip";
        TransferType[TransferType["Unequip"] = 4] = "Unequip";
    })(TransferType || (TransferType = {}));
    const TRANSFERS = {
        [TransferType.PullFromPostmaster]: {
            applicable: item => item.bucket.is(215593132 /* InventoryBucketHashes.LostItems */)
                && !!item.bucket.characterId
                && !!item.definition.inventory?.bucketTypeHash,
            async transfer(item) {
                if (!this.applicable(item))
                    throw new Error("Not in postmaster bucket");
                const characterId = item.bucket.characterId;
                await PullFromPostmaster_1.default.query(item, characterId);
                return { bucket: Bucket_1.Bucket.id(item.definition.inventory.bucketTypeHash, characterId) };
            },
        },
        [TransferType.TransferToVault]: {
            applicable: (item, ifNotCharacter) => !!item.character && item.bucket.characterId !== ifNotCharacter && !!item.inventory.getBucket(138197802 /* InventoryBucketHashes.General */),
            async transfer(item, ifNotCharacter) {
                if (!this.applicable(item, ifNotCharacter))
                    throw new Error("Not in character bucket");
                const characterId = item.character;
                await TransferItem_1.default.query(item, characterId, "vault");
                return {
                    bucket: Bucket_1.Bucket.id(138197802 /* InventoryBucketHashes.General */),
                    undo: [TransferType.TransferToCharacterFromVault, characterId],
                };
            },
        },
        [TransferType.TransferToCharacterFromVault]: {
            applicable: (item, characterId, swapBucket) => item.bucket.isVault()
                && item.inventory.hasBucket(item.definition.inventory?.bucketTypeHash, characterId),
            async transfer(item, characterId, swapBucket) {
                if (!this.applicable(item, characterId))
                    throw new Error("Not in vault bucket");
                const bucket = item.inventory.getBucket(item.definition.inventory.bucketTypeHash, characterId);
                if (bucket.items.length >= (bucket.capacity ?? Infinity) && !await bucket.makeSpace(swapBucket))
                    throw new Error("Unable to make space");
                await TransferItem_1.default.query(item, characterId);
                return {
                    bucket: Bucket_1.Bucket.id(item.definition.inventory.bucketTypeHash, characterId),
                    undo: [TransferType.TransferToVault],
                };
            },
        },
        [TransferType.Equip]: {
            applicable: item => item.bucket.isCharacter() && !item.equipped,
            async transfer(item, characterId, equipItemId) {
                if (equipItemId) {
                    const equipItem = item.inventory.items?.[equipItemId];
                    if (!equipItem)
                        throw new Error(`Could not find item ${equipItemId}`);
                    if (item === equipItem)
                        equipItemId = undefined;
                    item = equipItem;
                }
                if (!this.applicable(item, characterId))
                    throw new Error("Not in character bucket");
                if (item.isExotic()) {
                    const buckets = new Set(item.isWeapon() ? WEAPON_BUCKET_HASHES : item.isArmour() ? ARMOUR_BUCKET_HASHES : []);
                    buckets.delete(item.bucket.hash);
                    for (const bucketHash of buckets) {
                        const bucket = item.inventory.getBucket(bucketHash, characterId);
                        if (!bucket)
                            continue;
                        if (bucket.equippedItem?.isExotic())
                            await bucket.equippedItem.unequip();
                    }
                }
                const currentlyEquippedItem = item.bucket.equippedItem;
                await EquipItem_1.default.query(item, characterId);
                return {
                    bucket: item.bucket.id,
                    equipped: equipItemId ? undefined : true,
                    undo: 
                    // there's another item that was equipped, re-equip it
                    currentlyEquippedItem ? [TransferType.Equip, characterId, currentlyEquippedItem.id]
                        // idk, unequip this item then i guess
                        : [TransferType.Unequip, equipItemId],
                    sideEffects: [
                        !currentlyEquippedItem ? undefined : {
                            item: currentlyEquippedItem,
                            result: {
                                bucket: item.bucket.id,
                            },
                        },
                        !equipItemId ? undefined : {
                            item,
                            result: {
                                bucket: item.bucket.id,
                                equipped: true,
                            },
                        },
                    ].filter(Arrays_3.default.filterNullish),
                };
            },
        },
        [TransferType.Unequip]: {
            applicable: item => item.bucket.isCharacter() && !!item.equipped,
            async transfer(item, unequipItemId) {
                if (unequipItemId) {
                    const unequipItem = item.inventory.items?.[unequipItemId];
                    if (!unequipItem)
                        throw new Error(`Could not find item ${unequipItemId}`);
                    if (item === unequipItem)
                        unequipItemId = undefined;
                    item = unequipItem;
                }
                if (!this.applicable(item))
                    throw new Error("Not equipped in character bucket");
                const fallbackItem = item.fallbackItem;
                await item.unequip();
                return {
                    bucket: item.bucket.id,
                    undo: [TransferType.Equip, item.character, unequipItemId],
                    sideEffects: [
                        !fallbackItem ? undefined : {
                            item: fallbackItem,
                            result: {
                                bucket: item.bucket.id,
                                equipped: true,
                            },
                        },
                        !unequipItemId ? undefined : {
                            item,
                            result: {
                                bucket: item.bucket.id,
                            },
                        },
                    ].filter(Arrays_3.default.filterNullish),
                };
            },
        },
    };
    class Item {
        static id(reference, occurrence) {
            return reference.itemInstanceId ?? `hash:${reference.itemHash}:${reference.bucketHash}:${occurrence}`;
        }
        static async resolve(manifest, profile, reference, bucket, occurrence) {
            const { DestinyInventoryItemDefinition } = manifest;
            const definition = await DestinyInventoryItemDefinition.get(reference.itemHash);
            if (!definition || !Object.keys(definition).length) {
                console.warn("No item definition for ", reference.itemHash);
                return undefined;
            }
            // if (definition.nonTransferrable && reference.bucketHash !== BucketHashes.LostItems && reference.bucketHash !== BucketHashes.Engrams) {
            // 	console.debug(`Skipping "${definition.displayProperties.name}", non-transferrable`);
            // 	return undefined;
            // }
            const init = {
                id: Item.id(reference, occurrence),
                reference,
                definition,
                bucket,
                instance: profile.itemComponents?.instances.data?.[reference.itemInstanceId],
                lastModified: profile.lastModified.getTime(),
            };
            await Promise.all([
                Tier_1.default.apply(manifest, init),
                Plugs_2.default.apply(manifest, profile, init),
                Stats_1.default.apply(manifest, profile, init),
                Deepsight_1.default.apply(manifest, profile, init),
                Moment_1.default.apply(manifest, init),
                Collectibles_1.default.apply(manifest, profile, init),
                this.addCollections(manifest, profile, init),
                Perks_1.default.apply(manifest, profile, init),
            ]);
            const item = new Item(init);
            if (item.isExotic())
                await item.getSocket("Masterwork/ExoticCatalyst")?.getPool();
            return item;
        }
        static async addCollections(manifest, profile, item) {
            item.collections = await Item.createFake(manifest, profile, item.definition);
        }
        static async createFake(manifest, profile, definition, source = true, instanceId) {
            const init = {
                id: `hash:${definition.hash}:collections`,
                reference: { itemHash: definition.hash, itemInstanceId: instanceId, quantity: 0, bindStatus: 0 /* ItemBindStatus.NotBound */, location: 0 /* ItemLocation.Unknown */, bucketHash: 138197802 /* InventoryBucketHashes.General */, transferStatus: 2 /* TransferStatuses.NotTransferrable */, lockable: false, state: 0 /* ItemState.None */, isWrapper: false, tooltipNotificationIndexes: [], metricObjective: { objectiveHash: -1, complete: false, visible: false, completionValue: 0 }, itemValueVisibility: [] },
                definition,
                bucket: Bucket_1.Bucket.COLLECTIONS,
                sockets: [],
                lastModified: Date.now(),
            };
            // deepsight has to finish first because pattern presence is used by plugs
            await Deepsight_1.default.apply(manifest, profile, init);
            await Promise.all([
                Tier_1.default.apply(manifest, init),
                Plugs_2.default.apply(manifest, profile, init),
                Stats_1.default.apply(manifest, profile, init),
                Moment_1.default.apply(manifest, init),
                Collectibles_1.default.apply(manifest, profile, init),
                source && Source_1.default.apply(manifest, profile, init),
            ]);
            const item = new Item(init);
            if (item.isExotic())
                await item.getSocket("Masterwork/ExoticCatalyst")?.getPool();
            return item;
        }
        get character() {
            return this.bucket.characterId;
        }
        /**
         * The character this item is in the inventory of, or the current character if the item is somewhere else
         */
        get owner() {
            return this.character ?? this._owner;
        }
        get objectives() {
            return this.sockets.flatMap(socket => socket?.plugs.flatMap(plug => plug.objectives) ?? []);
        }
        constructor(item) {
            this.event = new EventManager_8.EventManager(this);
            this.name = item.definition.displayProperties?.name;
            Object.assign(this, item);
            this.undoTransfers = [];
            this.trustTransferUntil = 0;
            this.collectibleState ??= 0 /* DestinyCollectibleState.None */;
        }
        isWeapon() {
            return this.definition.equippable
                && (this.definition.itemCategoryHashes?.includes(1 /* ItemCategoryHashes.Weapon */)
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    || WEAPON_BUCKET_HASHES.has(this.definition.inventory?.bucketTypeHash));
        }
        isArmour() {
            return this.definition.equippable
                && (this.definition.itemCategoryHashes?.includes(20 /* ItemCategoryHashes.Armor */)
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    || ARMOUR_BUCKET_HASHES.has(this.definition.inventory?.bucketTypeHash));
        }
        isExotic() {
            return this.tier?.hash === 2759499571 /* ItemTierTypeHashes.Exotic */;
        }
        isDummy() {
            return this.definition.itemCategoryHashes?.includes(3109687656 /* ItemCategoryHashes.Dummies */);
        }
        getDamageType() {
            return this.getSocketedPlug("=Subclass/Super")?.getCategorisationAs(4 /* DeepsightPlugCategory.Subclass */)?.damageType
                || (this.instance?.damageTypeHash ?? this.definition.defaultDamageTypeHash)
                || undefined;
        }
        hasRandomRolls() {
            return this.getSockets("Perk").some(socket => socket.plugs.length > 1);
        }
        isNotAcquired() {
            return this.bucket === Bucket_1.Bucket.COLLECTIONS && !!(this.collectibleState & 1 /* DestinyCollectibleState.NotAcquired */);
        }
        isMasterwork() {
            if (this.reference.state & 4 /* ItemState.Masterwork */)
                return true;
            if (this.instance && this.getSocketedPlug("Intrinsic/FrameEnhanced") && this.getSocketedPlugs("Perk/TraitEnhanced").length >= 2)
                return true;
            if (this.isExotic()) {
                const catalyst = this.getSocket("Masterwork/ExoticCatalyst");
                if (catalyst?.state && (!catalyst?.state?.isVisible || !catalyst?.getPool("!Masterwork/ExoticCatalystEmpty")?.length))
                    return true;
            }
            if (this.definition.itemCategoryHashes?.includes(1378222069 /* ItemCategoryHashes.SeasonalArtifacts */))
                return true;
            return false;
        }
        isAdept() {
            return this.canEnhance() || (!this.bucket.isCollections() && !!this.getSocket("Mod/Weapon")?.getPlug("Mod/WeaponAdept"));
        }
        canEnhance() {
            return !!this.getSocket("Masterwork/Enhancement");
        }
        hasDeepsight() {
            const hasIncompletePattern = this.deepsight?.pattern && !(this.deepsight.pattern.progress?.complete ?? false);
            return !this.deepsight?.resonance ? false : hasIncompletePattern;
        }
        hasPattern() {
            return !!(this.deepsight?.resonance && this.deepsight?.pattern && !this.deepsight.pattern.progress?.complete);
        }
        canTransfer() {
            return (!this.bucket.is(215593132 /* InventoryBucketHashes.LostItems */) || !this.definition.doesPostmasterPullHaveSideEffects)
                && this.reference.bucketHash !== 375726501 /* InventoryBucketHashes.Engrams */;
        }
        isTierLessThan(tier, max) {
            return (this.tier?.tierType ?? 0) <= Math.min(tier ?? 0, max ?? 0);
        }
        getPower(onlyPower = false) {
            const isValidStat = this.instance?.primaryStat?.statHash === 1935470627 /* StatHashes.Power */
                || (!onlyPower
                    && (false
                        || this.instance?.primaryStat?.statHash === 1480404414 /* StatHashes.Attack */
                        || this.instance?.primaryStat?.statHash === 3897883278 /* StatHashes.Defense */
                        || this.instance?.primaryStat?.statHash === 1501155019 /* StatHashes.Speed */));
            if (onlyPower && !isValidStat)
                return undefined;
            const primaryStatPower = isValidStat ? this.instance.primaryStat.value : 0;
            const itemLevelQualityPower = (this.instance?.itemLevel ?? 0) * 10 + (this.instance?.quality ?? 0);
            return Math.max(primaryStatPower, itemLevelQualityPower);
        }
        isSame(item) {
            return this.id === item.id;
        }
        getSockets(...anyOfTypes) {
            return Plugs_2.Socket.filterType(this.sockets, ...anyOfTypes);
        }
        getSocket(...anyOfTypes) {
            return this.getSockets(...anyOfTypes)[0];
        }
        getSocketedPlugs(...anyOfTypes) {
            return Plugs_2.Socket.filterByPlugs(this.sockets, ...anyOfTypes)
                .filter(socket => socket.socketedPlug.is(...anyOfTypes))
                .map(socket => socket.socketedPlug);
        }
        getSocketedPlug(...anyOfTypes) {
            return this.getSocketedPlugs(...anyOfTypes)[0];
        }
        getOrnament() {
            return this.getSocketedPlug("Cosmetic/OrnamentArmor", "Cosmetic/OrnamentWeapon", "Cosmetic/OrnamentMask");
        }
        /**
         * Some items are only very rarely available, such as adept raid weapons. Do you have the fomo? You should!
         */
        isFomo() {
            const hash = this.definition.hash;
            for (const source of this.sources ?? []) {
                if (source.dropTable.dropTable?.[hash] || source.dropTable.encounters?.some(encounter => encounter.dropTable?.[hash])) {
                    if (source.dropTable.availability)
                        return ItemFomoState.TemporaryRepeatability;
                    // always available in specific encounters
                    continue;
                }
                if (source.isActiveMasterDrop || source.isActiveDrop)
                    return ItemFomoState.TemporaryAvailability;
            }
            return ItemFomoState.NoMo;
        }
        shouldTrustBungie() {
            return this.trustTransferUntil < this.lastModified;
        }
        isLocked() {
            return !!(this.reference.state & 1 /* ItemState.Locked */);
        }
        isChangingLockState() {
            return !!this.settingLocked;
        }
        async setLocked(locked = true) {
            if (this.bucket === Bucket_1.Bucket.COLLECTIONS)
                return false;
            await this.settingLocked;
            if (this.isLocked() !== locked) {
                this.settingLocked = (async () => {
                    let err;
                    await SetLockState_1.default.query(this, locked).catch((e) => err = e);
                    locked = !err ? locked : !locked;
                    const mutableRef = this.reference;
                    if (locked)
                        mutableRef.state |= 1 /* ItemState.Locked */;
                    else
                        mutableRef.state &= ~1 /* ItemState.Locked */;
                })();
                this.update(this);
                await this.settingLocked;
                delete this.settingLocked;
                this.update(this);
            }
            return locked;
        }
        update(item) {
            if (item !== this) {
                this.lastModified = item.lastModified;
                this.id = item.id;
                this.reference = item.reference;
                this.instance = item.instance;
                this.sockets = item.sockets;
                this.moment = item.moment;
                this.deepsight = item.deepsight;
                this.shaped = item.shaped;
                this.stats = item.stats;
                let newBucketId = this.bucket.id;
                if (this.shouldTrustBungie() || !this.bucketHistory?.includes(`${item.bucket.id}:${item.equipped ? "equipped" : "unequipped"}`)) {
                    delete this.bucketHistory;
                    newBucketId = item.bucket.id;
                    this.equipped = item.equipped;
                }
                const correctBucket = this.inventory.buckets?.[newBucketId];
                if (!correctBucket)
                    console.warn(`Could not find correct bucket ${newBucketId} for ${DisplayProperties_1.default.name(this.definition)}`);
                else {
                    for (const bucket of Object.values(this.inventory.buckets ?? {})) {
                        if (bucket?.deepsight)
                            continue;
                        if (bucket !== correctBucket)
                            Arrays_3.default.remove(bucket?.items, item, this);
                        if (bucket === correctBucket)
                            Arrays_3.default.remove(bucket?.items, item);
                    }
                    this.bucket = correctBucket;
                    Arrays_3.default.add(correctBucket.items, this);
                }
            }
            this.event.emit("update", { item: this });
            return this;
        }
        get transferring() {
            return !!this._transferPromise;
        }
        async transferrable() {
            while (this._transferPromise)
                await this._transferPromise;
        }
        async transferToBucket(bucket) {
            // if (bucket.is(InventoryBucketHashes.Consumables) || bucket.is(InventoryBucketHashes.Modifications))
            // 	throw new Error("Inventory transfer not implemented yet");
            if (bucket.is(138197802 /* InventoryBucketHashes.General */))
                return this.transferToVault();
            if (!bucket.characterId) {
                console.warn("Transfer type not implemented", bucket);
                return;
            }
            return this.transferToCharacter(bucket.characterId);
        }
        async transferToCharacter(character) {
            if (this.bucket.isCharacter(character))
                return;
            return this.transfer(TransferType.PullFromPostmaster, [TransferType.Unequip], ...this.bucket.isCharacter() ? [Arrays_3.default.tuple(TransferType.TransferToVault)] : [], [TransferType.TransferToCharacterFromVault, character, this.bucket]);
        }
        transferToVault() {
            return this.transfer(TransferType.PullFromPostmaster, [TransferType.Unequip], [TransferType.TransferToVault]);
        }
        transferToggleVaulted(character) {
            if (this.bucket.is(138197802 /* InventoryBucketHashes.General */))
                return this.transferToCharacter(character);
            else
                return this.transferToVault();
        }
        async equip(character) {
            if (this.bucket.isCharacter(character) && this.equipped)
                return;
            return this.transfer(TransferType.PullFromPostmaster, [TransferType.Unequip], [TransferType.TransferToVault, character], [TransferType.TransferToCharacterFromVault, character, this.bucket], [TransferType.Equip, character]);
        }
        async unequip() {
            await this.transferrable();
            if (!this.character || !this.fallbackItem) {
                // TODO notify
            }
            else {
                this.event.emit("loadStart");
                this._transferPromise = this.fallbackItem.equip(this.character);
                await this._transferPromise;
                delete this._transferPromise;
                this.event.emit("loadEnd");
            }
        }
        pullFromPostmaster() {
            return this.transfer(TransferType.PullFromPostmaster);
        }
        async transfer(...transfers) {
            await this.transferrable();
            this.event.emit("loadStart");
            this._transferPromise = this.performTransfer(...transfers);
            await this._transferPromise;
            delete this._transferPromise;
            this.event.emit("loadEnd");
        }
        async performTransfer(...transfers) {
            this.undoTransfers.splice(0, Infinity);
            for (let transfer of transfers) {
                transfer = Array.isArray(transfer) ? transfer : [transfer];
                const [type, ...args] = transfer;
                const definition = TRANSFERS[type];
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                if (!definition.applicable(this, ...args))
                    continue;
                try {
                    const result = await definition.transfer(this, ...args);
                    const sideEffects = [{ item: this, result }, ...result.sideEffects ?? []];
                    const pendingEmits = [];
                    for (const { item, result } of sideEffects) {
                        const oldBucket = item.bucket;
                        item.bucketHistory ??= [];
                        item.bucketHistory.push(`${oldBucket.id}:${item.equipped ? "equipped" : "unequipped"}`);
                        const newBucket = item.inventory.buckets?.[result.bucket];
                        if (!newBucket)
                            console.warn("Missing bucket", result.bucket, "for item after transfer", item);
                        else
                            item.bucket = newBucket;
                        item.equipped = result.equipped;
                        item.trustTransferUntil = Date.now();
                        pendingEmits.push({ item, oldBucket, equipped: item.equipped });
                    }
                    for (const { item, oldBucket, equipped } of pendingEmits)
                        item.event.emit("bucketChange", { item, oldBucket, equipped });
                    if (result.undo)
                        this.undoTransfers.push(result.undo);
                    else
                        this.undoTransfers.splice(0, Infinity);
                }
                catch (error) {
                    console.error(error);
                    if (!Store_8.default.items.settingsDisableReturnOnFailure)
                        await this.performTransfer(...this.undoTransfers.reverse());
                }
            }
        }
        /**
         * @returns undefined if there are no wishlists for this item, true if a wishlist matches, false otherwise
         */
        async isWishlisted() {
            const wishlists = Store_8.default.items[`item${this.definition.hash}PerkWishlists`];
            if (wishlists?.length === 0)
                // the user doesn't want any roll of this item
                return false;
            if (!wishlists)
                // the user hasn't configured wishlists for this item
                return undefined;
            for (const wishlist of Store_8.default.items[`item${this.definition.hash}PerkWishlists`] ?? [])
                if (await this.checkMatchesWishlist(wishlist))
                    // all sockets match this wishlist!
                    return true;
            // none of the wishlists matched
            return false;
        }
        /**
         * @returns `undefined` if there are no wishlists for this item, `false` if the user doesn't want this item at all,
         * and an array with matching wishlists otherwise
         */
        async getMatchingWishlists() {
            const wishlists = Store_8.default.items[`item${this.definition.hash}PerkWishlists`];
            if (!wishlists)
                return undefined;
            if (!wishlists.length)
                return false;
            const matchingWishlists = [];
            for (const wishlist of wishlists)
                if (await this.checkMatchesWishlist(wishlist))
                    matchingWishlists.push(wishlist);
            return matchingWishlists;
        }
        async checkMatchesWishlist(wishlist) {
            for (const socket of this.sockets) {
                const pool = await socket?.getPool();
                if (pool?.some(plug => wishlist.plugs.includes(plug.plugItemHash))) {
                    // the full pool for this socket contains a wishlisted plug
                    if (!socket?.plugs.some(plug => wishlist.plugs.includes(plug.plugItemHash))) {
                        // but the available plugs on this socket don't
                        return false;
                    }
                }
            }
            return true;
        }
        getStatTracker() {
            for (const socket of this.sockets) {
                if (!socket?.socketedPlug?.is("Cosmetic/Tracker"))
                    continue;
                for (const objective of socket.socketedPlug.objectives) {
                    if (!objective.progress.visible)
                        continue;
                    return objective;
                }
            }
        }
    }
    exports.default = Item;
    Object.assign(window, { Item });
});
define("model/models/items/Bucket", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Bucket = void 0;
    class Bucket {
        static id(bucketHash, characterId, inventoryBucketHash) {
            return `${bucketHash}/${characterId || ""}/${inventoryBucketHash || ""}`;
        }
        static parseId(id) {
            const [bucketHashString, characterString, inventoryBucketHashString] = id.split(/\//g);
            return [
                +bucketHashString,
                characterString || undefined,
                +inventoryBucketHashString || undefined,
            ];
        }
        constructor({ definition, subBucketDefinition, character, items }) {
            this.name = definition.displayProperties?.name ?? "?";
            this.id = Bucket.id(definition.hash, character?.characterId, subBucketDefinition?.hash);
            this.capacity = definition.itemCount;
            if (typeof items === "function")
                Object.defineProperty(this, "items", { get: () => Object.freeze(items()) });
            else
                this.items = items ?? [];
            this.hash = definition.hash;
            this.inventoryHash = subBucketDefinition?.hash;
            this.characterId = character?.characterId;
            this.definition = definition;
            this.subBucketDefinition = subBucketDefinition;
            this.deepsight = !!items;
            if (character)
                this.name += ` / ${character.class.displayProperties.name}`;
            if (this.inventoryHash)
                this.name += ` / ${subBucketDefinition?.displayProperties?.name ?? "?"}`;
        }
        get equippedItem() {
            return this.items.find(item => item.equipped);
        }
        is(hash) {
            return this.hash === hash;
        }
        isCollections() {
            return this === Bucket.COLLECTIONS;
        }
        isVault() {
            return this.is(138197802 /* InventoryBucketHashes.General */);
        }
        isCharacter(character) {
            return character === undefined ? !!this.characterId : this.characterId === character;
        }
        isPostmaster() {
            return this.is(215593132 /* InventoryBucketHashes.LostItems */);
        }
        isEngrams() {
            return this.is(375726501 /* InventoryBucketHashes.Engrams */);
        }
        async makeSpace(swapBucket) {
            if (!this.fallbackRemovalItem)
                return false;
            if (swapBucket)
                return this.fallbackRemovalItem.transferToBucket(swapBucket).then(() => true).catch(() => false);
            return this.fallbackRemovalItem.transferToVault().then(() => true).catch(() => false);
        }
        matches(item) {
            if (item.bucket === this)
                return true;
            if (this.inventoryHash)
                return item.bucket.hash === this.definition.hash && item.definition.inventory?.bucketTypeHash === this.inventoryHash;
            return false
                || item.bucket.hash === this.definition.hash
                || item.definition.inventory?.bucketTypeHash === this.definition.hash;
        }
    }
    exports.Bucket = Bucket;
    Bucket.COLLECTIONS = new Bucket({
        definition: {
            hash: "collections",
            displayProperties: {
                name: "Collections",
            },
        },
    });
});
define("model/models/Items", ["require", "exports", "model/Model", "model/models/Characters", "model/models/items/Bucket", "model/models/items/Item", "model/models/items/Plugs", "model/models/Manifest", "model/models/manifest/IManifest", "model/models/ProfileBatch", "utility/Async", "utility/Time"], function (require, exports, Model_10, Characters_1, Bucket_2, Item_1, Plugs_3, Manifest_7, IManifest_4, ProfileBatch_4, Async_3, Time_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Model_10.default.createDynamic(Time_4.default.seconds(30), async (api) => {
        api.subscribeProgress(Manifest_7.default, 1 / 4);
        const manifest = await Manifest_7.default.await();
        api.emitProgress(1 / 4, "Loading manifest cache");
        // precache some defs for item initialisation
        const { DeepsightDropTableDefinition, DestinyActivityDefinition } = manifest;
        await DeepsightDropTableDefinition.all();
        await DestinyActivityDefinition.all();
        api.subscribeProgress(ProfileBatch_4.default, 1 / 4, 2 / 4);
        const profile = await ProfileBatch_4.default.await();
        api.emitProgress(3 / 4, "Loading manifest cache");
        const initialisedItems = new Set();
        const itemsToInit = new Set((profile.profileInventory?.data?.items ?? [])
            .concat(Object.values(profile.characterInventories?.data ?? {}).flatMap(character => character.items))
            .map(item => item.itemInstanceId ?? ""));
        itemsToInit.delete("");
        const totalItemsToInit = itemsToInit.size;
        const occurrences = {};
        let lastForcedTimeoutForStyle = Date.now();
        async function resolveItemComponent(reference, bucket) {
            if (Date.now() - lastForcedTimeoutForStyle > 10) {
                await Async_3.default.sleep(1);
                lastForcedTimeoutForStyle = Date.now();
            }
            if (itemsToInit.size !== totalItemsToInit)
                api.emitProgress(3 / 4 + 1 / 4 * (1 - itemsToInit.size / totalItemsToInit), `Loading items ${totalItemsToInit - itemsToInit.size} / ${totalItemsToInit}`);
            if (reference.itemInstanceId !== undefined && initialisedItems.has(reference.itemInstanceId))
                return undefined; // already initialised in another bucket
            occurrences[`${reference.itemHash}:${reference.bucketHash}`] ??= 0;
            const occurrence = occurrences[`${reference.itemHash}:${reference.bucketHash}`]++;
            if (reference.itemInstanceId !== undefined) {
                initialisedItems.add(reference.itemInstanceId);
                itemsToInit.delete(reference.itemInstanceId);
            }
            const result = await Item_1.default.resolve(manifest, profile, reference, bucket, occurrence);
            if (!result && reference.itemInstanceId !== undefined)
                initialisedItems.delete(reference.itemInstanceId);
            return result;
        }
        const bucketInits = {};
        function bucketItem(item, characterId) {
            const bucketHash = item.bucketHash;
            if (bucketHash === undefined) {
                console.warn("No bucket hash", item);
                return;
            }
            const bucketId = Bucket_2.Bucket.id(bucketHash, characterId);
            const bucket = bucketInits[bucketId] ??= {
                bucketHash,
                characterId: characterId,
                items: [],
            };
            bucket.items.push(item);
        }
        for (const item of profile.profileInventory?.data?.items ?? [])
            bucketItem(item);
        const characterItems = Object.entries(profile.characterInventories?.data ?? {}).concat(Object.entries(profile.characterEquipment?.data ?? {}));
        for (const [characterId, characterData] of characterItems)
            for (const item of characterData.items)
                bucketItem(item, characterId);
        const buckets = {};
        for (const [id, bucketInit] of Object.entries(bucketInits)) {
            let bucketDef = await manifest.DestinyInventoryBucketDefinition.get(bucketInit.bucketHash);
            if (!bucketDef) {
                console.warn("No definition for bucket", bucketInit.bucketHash);
                bucketDef = {
                    displayProperties: {
                        name: "Unknown Bucket",
                    },
                };
            }
            const bucket = new Bucket_2.Bucket({
                definition: bucketDef,
                character: Characters_1.default.all()[bucketInit.characterId],
            });
            const equippedItems = profile.characterEquipment?.data?.[bucket.characterId]?.items ?? [];
            for (const itemComponent of bucketInit.items) {
                const item = await resolveItemComponent(itemComponent, bucket);
                if (!item)
                    continue;
                bucket.items.push(item);
                if (equippedItems.some(equippedItem => equippedItem.itemInstanceId === item.reference.itemInstanceId))
                    item.equipped = true;
            }
            buckets[id] = bucket;
        }
        for (const bucket of Object.values(buckets)) {
            if (!bucket || bucket.characterId)
                continue;
            // create character-scoped versions of this account bucket
            for (const characterId of Object.keys(profile.characterInventories?.data ?? {})) {
                const classType = profile.characters?.data?.[characterId].classType;
                let characterBucket;
                for (const item of bucket.items) {
                    if (item.definition.classType === classType) {
                        const character = Characters_1.default.get(characterId);
                        if (!character) {
                            console.warn("Unable to get character", characterId);
                            continue;
                        }
                        characterBucket ??= new Bucket_2.Bucket({
                            definition: bucket.definition,
                            character,
                            items: () => bucket.items.filter(item => true
                                && (item.definition.classType === 3 /* DestinyClass.Unknown */ || item.definition.classType === character.classType)
                                && item.definition.inventory?.bucketTypeHash
                                && item.definition.inventory.bucketTypeHash !== bucket.definition.hash),
                        });
                        buckets[characterBucket.id] ??= characterBucket;
                    }
                }
            }
        }
        for (const bucket of Object.values(buckets)) {
            if (!bucket)
                continue;
            // create sub buckets for items with differing 
            const subBuckets = {};
            for (const item of bucket.items) {
                const subInventoryHash = item.definition.inventory?.bucketTypeHash;
                if (subInventoryHash && subInventoryHash !== bucket.definition.hash) {
                    const subBucket = subBuckets[subInventoryHash] ??= new Bucket_2.Bucket({
                        definition: bucket.definition,
                        subBucketDefinition: await manifest.DestinyInventoryBucketDefinition.get(subInventoryHash),
                        character: Characters_1.default.get(bucket.characterId),
                        items: () => bucket.items.filter(item => true
                            && item.definition.inventory?.bucketTypeHash
                            && item.definition.inventory.bucketTypeHash !== bucket.definition.hash
                            && item.definition.inventory.bucketTypeHash === subInventoryHash),
                    });
                    buckets[subBucket.id] ??= subBucket;
                }
            }
        }
        Plugs_3.default.resetInitialisedPlugTypes();
        Plugs_3.default.logInitialisedPlugTypes();
        IManifest_4.ManifestItem.logQueryCounts();
        api.emitProgress(4 / 4);
        return buckets;
    });
});
define("model/models/DebugInfo", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class DebugInfo {
        static updateBuckets(buckets) {
            const encountered = new Map();
            for (const bucket of Object.values(buckets)) {
                if (bucket?.deepsight)
                    continue;
                for (const item of bucket?.items ?? []) {
                    let buckets = encountered.get(item);
                    if (!buckets) {
                        buckets = new Set();
                        encountered.set(item, buckets);
                    }
                    buckets.add(bucket);
                }
            }
            const encounteredMultiple = Array.from(encountered.entries())
                .filter(([, buckets]) => buckets.size > 1);
            if (encounteredMultiple.length)
                console.warn("Items are in multiple buckets!", encounteredMultiple);
            function getRarities(items) {
                return {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    basics: items.filter(item => [3772930460 /* ItemTierTypeHashes.BasicCurrency */, 1801258597 /* ItemTierTypeHashes.BasicQuest */].includes(item.definition.inventory?.tierTypeHash)),
                    commons: items.filter(item => item.definition.inventory?.tierTypeHash === 3340296461 /* ItemTierTypeHashes.Common */),
                    uncommons: items.filter(item => item.definition.inventory?.tierTypeHash === 2395677314 /* ItemTierTypeHashes.Uncommon */),
                    rares: items.filter(item => item.definition.inventory?.tierTypeHash === 2127292149 /* ItemTierTypeHashes.Rare */),
                    legendaries: items.filter(item => item.definition.inventory?.tierTypeHash === 4008398120 /* ItemTierTypeHashes.Legendary */),
                    exotics: items.filter(item => item.definition.inventory?.tierTypeHash === 2759499571 /* ItemTierTypeHashes.Exotic */),
                };
            }
            function applyRarities(items) {
                const result = items;
                Object.assign(result, getRarities(items));
                return result;
            }
            function filterByCategory(items, category) {
                return applyRarities(items.filter(item => item.definition.itemCategoryHashes?.includes(category)));
            }
            function filterByBucket(items, ...buckets) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                return applyRarities(items.filter(item => buckets.includes(item.definition.inventory?.bucketTypeHash)));
            }
            function getDeveloperData(items) {
                return {
                    weapons: filterByCategory(items, 1 /* ItemCategoryHashes.Weapon */),
                    armour: filterByCategory(items, 20 /* ItemCategoryHashes.Armor */),
                    emotes: filterByBucket(items, 1107761855 /* InventoryBucketHashes.Emotes_Category0 */, 3054419239 /* InventoryBucketHashes.Emotes_Category3 */),
                    finishers: filterByBucket(items, 3683254069 /* InventoryBucketHashes.Finishers */),
                    quests: filterByBucket(items, 1345459588 /* InventoryBucketHashes.Quests */),
                    ships: filterByCategory(items, 42 /* ItemCategoryHashes.Ships */),
                    sparrows: filterByCategory(items, 43 /* ItemCategoryHashes.Sparrows */),
                    ghosts: filterByCategory(items, 39 /* ItemCategoryHashes.Ghost */),
                    consumables: filterByBucket(items, 1469714392 /* InventoryBucketHashes.Consumables */),
                    artifacts: filterByCategory(items, 1378222069 /* ItemCategoryHashes.SeasonalArtifacts */),
                    subclasses: filterByCategory(items, 50 /* ItemCategoryHashes.Subclasses */),
                };
            }
            const items = Object.values(buckets).flatMap(bucket => bucket?.items ?? []);
            const collections = items.map(item => item.collections).filter((item) => !!item);
            const filtered = getDeveloperData(items);
            const inventory = {
                buckets,
                all: applyRarities(items),
                uncategorised: items.filter(item => !Object.values(filtered).some(arr => arr.includes(item))),
                ...filtered,
                collections: {
                    all: applyRarities(collections),
                    ...getDeveloperData(collections),
                },
            };
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            Object.assign(window, {
                ...inventory,
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                items: inventory,
            });
        }
    }
    exports.default = DebugInfo;
});
define("ui/FocusManager", ["require", "exports", "utility/EventManager", "utility/decorator/Bound"], function (require, exports, EventManager_9, Bound_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FocusManagerImpl {
        get focused() {
            return this._focused;
        }
        constructor() {
            this.event = EventManager_9.EventManager.make();
            this._focused = true;
            window.addEventListener("focus", this.onPageFocus);
            window.addEventListener("blur", this.onPageBlur);
        }
        onPageFocus() {
            this._focused = true;
            document.documentElement.classList.add("focused");
            this.event.emit("focus");
            this.event.emit("changeFocusState", { focused: this.focused });
        }
        onPageBlur() {
            this._focused = false;
            document.documentElement.classList.remove("focused");
            this.event.emit("changeFocusState", { focused: this.focused });
        }
    }
    __decorate([
        Bound_3.default
    ], FocusManagerImpl.prototype, "onPageFocus", null);
    __decorate([
        Bound_3.default
    ], FocusManagerImpl.prototype, "onPageBlur", null);
    const FocusManager = new FocusManagerImpl();
    exports.default = FocusManager;
});
define("ui/bungie/LoadedIcon", ["require", "exports", "ui/Component"], function (require, exports, Component_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LoadedIconClasses = void 0;
    var LoadedIconClasses;
    (function (LoadedIconClasses) {
        LoadedIconClasses["Main"] = "loaded-icon";
        LoadedIconClasses["Loading"] = "loaded-icon-loading";
    })(LoadedIconClasses || (exports.LoadedIconClasses = LoadedIconClasses = {}));
    class LoadedIcon extends Component_6.default {
        onMake(path) {
            this.classes.add(LoadedIconClasses.Main);
            this.setPath(path);
            this.event.subscribe("load", () => this.classes.remove(LoadedIconClasses.Loading));
        }
        setPath(path) {
            this.classes.add(LoadedIconClasses.Loading);
            this.attributes.set("src", path);
            return this;
        }
    }
    LoadedIcon.defaultType = "img";
    exports.default = LoadedIcon;
});
define("ui/Hints", ["require", "exports", "ui/Component"], function (require, exports, Component_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Hint = exports.IInput = void 0;
    var InputMouse;
    (function (InputMouse) {
        InputMouse[InputMouse["MouseLeft"] = 0] = "MouseLeft";
        InputMouse[InputMouse["MouseRight"] = 1] = "MouseRight";
        InputMouse[InputMouse["MouseMiddle"] = 2] = "MouseMiddle";
    })(InputMouse || (InputMouse = {}));
    var InputModifier;
    (function (InputModifier) {
        InputModifier[InputModifier["Ctrl"] = 0] = "Ctrl";
        InputModifier[InputModifier["Shift"] = 1] = "Shift";
        InputModifier[InputModifier["Alt"] = 2] = "Alt";
    })(InputModifier || (InputModifier = {}));
    var IInput;
    (function (IInput) {
        function get(catalyst, ...modifiers) {
            return {
                catalyst,
                modifiers: new Set(modifiers),
            };
        }
        IInput.get = get;
    })(IInput || (exports.IInput = IInput = {}));
    var HintClasses;
    (function (HintClasses) {
        HintClasses["Hint"] = "hint";
        HintClasses["HintLabel"] = "hint-label";
        HintClasses["HintInput"] = "hint-input";
        HintClasses["HintInputMouse"] = "hint-input-mouse";
        HintClasses["HintInputMouseElements"] = "hint-input-mouse-elements";
        HintClasses["HintInputModifier"] = "hint-input-modifier";
        HintClasses["HintInputKey"] = "hint-input-key";
        HintClasses["HintInputKeyName"] = "hint-input-key-name";
    })(HintClasses || (HintClasses = {}));
    class Hint extends Component_7.default {
        onMake(input) {
            this.classes.add(HintClasses.Hint);
            HintInput.create([input])
                .appendTo(this);
            this.label = Component_7.default.create("span")
                .classes.add(HintClasses.HintLabel)
                .appendTo(this);
        }
    }
    exports.Hint = Hint;
    class HintInput extends Component_7.default {
        onMake(input) {
            this.classes.add(HintClasses.HintInput);
            this.set(input);
        }
        set(input) {
            this.removeContents();
            if (!input)
                return;
            for (const modifier of ["Ctrl", "Shift", "Alt"]) {
                if (input.modifiers.has(modifier)) {
                    Component_7.default.create("i")
                        .classes.add(HintClasses.HintInputModifier, `${HintClasses.HintInputModifier}-${modifier.toLowerCase()}`)
                        .appendTo(this);
                }
            }
            if (input.catalyst.startsWith("Mouse")) {
                this.classes.add(HintClasses.HintInputMouse, `${HintClasses.HintInput}-${input.catalyst.toLowerCase()}`);
                Component_7.default.create("i")
                    .classes.add(HintClasses.HintInputMouseElements)
                    .appendTo(this);
            }
            else if (input.catalyst.startsWith("Key")) {
                Component_7.default.create("kbd")
                    .classes.add(HintClasses.HintInputKey)
                    .append(Component_7.default.create("span")
                    .classes.add(HintClasses.HintInputKeyName)
                    .text.set(input.catalyst.slice(3)))
                    .appendTo(this);
            }
        }
    }
});
define("ui/UiEventBus", ["require", "exports", "utility/EventManager"], function (require, exports, EventManager_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const UiEventBus = EventManager_10.EventManager.make();
    let lastUsed = 0;
    const state = {};
    const mouseKeyMap = {
        [0]: "MouseLeft",
        [1]: "MouseMiddle",
        [2]: "MouseRight",
        [3]: "Mouse3",
        [4]: "Mouse4",
        [5]: "Mouse5",
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        [`${undefined}`]: "Mouse?",
    };
    function emitKeyEvent(e) {
        const input = e.target.closest("input[type=text], textarea, [contenteditable]");
        let usedByInput = !!input;
        const eventKey = e.key ?? mouseKeyMap[e.button];
        const eventType = e.type === "mousedown" ? "keydown" : e.type === "mouseup" ? "keyup" : e.type;
        if (eventType === "keydown")
            state[eventKey] = Date.now();
        let cancelInput = false;
        const event = {
            key: eventKey,
            ctrl: e.ctrlKey,
            shift: e.shiftKey,
            alt: e.altKey,
            used: usedByInput,
            input,
            use: (key, ...modifiers) => {
                if (event.used)
                    return false;
                const matches = event.matches(key, ...modifiers);
                if (matches)
                    event.used = true;
                return matches;
            },
            useOverInput: (key, ...modifiers) => {
                if (event.used && !usedByInput)
                    return false;
                const matches = event.matches(key, ...modifiers);
                if (matches) {
                    event.used = true;
                    usedByInput = false;
                }
                return matches;
            },
            matches: (key, ...modifiers) => {
                if (eventKey !== key)
                    return false;
                if (!modifiers.every(modifier => event[modifier]))
                    return false;
                return true;
            },
            cancelInput: () => cancelInput = true,
            hovering: (selector) => {
                const hovered = [...document.querySelectorAll(":hover")];
                return selector ? hovered[hovered.length - 1]?.closest(selector) ?? undefined : hovered[hovered.length - 1];
            },
        };
        if (eventType === "keyup") {
            event.usedAnotherKeyDuring = lastUsed > (state[eventKey] ?? 0);
            delete state[eventKey];
        }
        UiEventBus.emit(eventType, event);
        if ((event.used && !usedByInput) || (usedByInput && cancelInput)) {
            e.preventDefault();
            lastUsed = Date.now();
        }
    }
    document.addEventListener("keydown", emitKeyEvent);
    document.addEventListener("keyup", emitKeyEvent);
    document.addEventListener("mousedown", emitKeyEvent);
    document.addEventListener("mouseup", emitKeyEvent);
    document.addEventListener("click", emitKeyEvent);
    Object.defineProperty(MouseEvent.prototype, "used", {
        get() {
            return this._used ?? false;
        },
    });
    Object.defineProperty(MouseEvent.prototype, "use", {
        value: function (key, ...modifiers) {
            if (this._used)
                return false;
            const matches = this.matches(key, ...modifiers);
            if (matches) {
                this._used = true;
                // allow click & contextmenu handlers to be considered "used" for IKeyUpEvents
                lastUsed = Date.now();
            }
            return matches;
        },
    });
    Object.defineProperty(MouseEvent.prototype, "matches", {
        value: function (key, ...modifiers) {
            if (mouseKeyMap[this.button] !== key)
                return false;
            if (!modifiers.every(modifier => this[`${modifier}Key`]))
                return false;
            return true;
        },
    });
    exports.default = UiEventBus;
});
define("ui/inventory/ElementTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ElementTypes;
    (function (ElementTypes) {
        ElementTypes.COLOURS = {
            arc: 0x7aecf3,
            solar: 0xf0631e,
            void: 0xb185df,
            stasis: 0x4d88ff,
            strand: 0x35e366,
        };
        function getColour(element) {
            return ElementTypes.COLOURS[element]
                ?.toString(16)
                .padStart(6, "0")
                .padStart(7, "#");
        }
        ElementTypes.getColour = getColour;
    })(ElementTypes || (ElementTypes = {}));
    exports.default = ElementTypes;
});
define("ui/inventory/tooltip/ItemAmmo", ["require", "exports", "ui/Classes", "ui/Component"], function (require, exports, Classes_3, Component_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemAmmoClasses = void 0;
    var ItemAmmoClasses;
    (function (ItemAmmoClasses) {
        ItemAmmoClasses["Main"] = "item-ammo-type";
        ItemAmmoClasses["Primary"] = "item-ammo-type-primary";
        ItemAmmoClasses["Special"] = "item-ammo-type-special";
        ItemAmmoClasses["Heavy"] = "item-ammo-type-heavy";
    })(ItemAmmoClasses || (exports.ItemAmmoClasses = ItemAmmoClasses = {}));
    class ItemAmmo extends Component_8.default {
        onMake() {
            this.classes.add(ItemAmmoClasses.Main);
        }
        setItem(item) {
            const ammoType = item.definition.equippingBlock?.ammoType;
            this.classes.toggle(!ammoType, Classes_3.Classes.Hidden);
            if (ammoType)
                this.classes.remove(ItemAmmoClasses.Primary, ItemAmmoClasses.Special, ItemAmmoClasses.Heavy)
                    .classes.add(ammoType === 1 /* DestinyAmmunitionType.Primary */ ? ItemAmmoClasses.Primary
                    : ammoType === 2 /* DestinyAmmunitionType.Special */ ? ItemAmmoClasses.Special
                        : ammoType === 3 /* DestinyAmmunitionType.Heavy */ ? ItemAmmoClasses.Heavy
                            : ItemAmmoClasses.Main)
                    .text.set(ammoType === 1 /* DestinyAmmunitionType.Primary */ ? "Primary"
                    : ammoType === 2 /* DestinyAmmunitionType.Special */ ? "Special"
                        : ammoType === 3 /* DestinyAmmunitionType.Heavy */ ? "Heavy"
                            : "");
            return this;
        }
    }
    exports.default = ItemAmmo;
});
define("ui/inventory/tooltip/stats/RecoilDirection", ["require", "exports", "ui/Component"], function (require, exports, Component_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.recoilValue = void 0;
    /**
     * **NOTE:** The maths in this file is pulled from the DIM source code (https://github.com/DestinyItemManager/DIM/blob/59c3b0c81c5f86d73e3ffb986143f73f5f3c6ee4/src/app/item-popup/RecoilStat.tsx),
     * and therefore falls under the MIT license in that project (https://github.com/DestinyItemManager/DIM/blob/43709b9128832fd26ec5832cb4d43d628a0c4aaf/LICENSE.md):
     *
     * MIT License
     *
     * Copyright (c) 2018 Destiny Item Manager
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     */
    /**
     * A value from 100 to -100 where positive is right and negative is left and zero is straight up
     * See https://imgur.com/LKwWUNV
     */
    function recoilDirection(value) {
        return Math.sin((value + 5) * (Math.PI / 10)) * (100 - value);
    }
    /**
     * A value from 0 to 100 describing how straight up and down the recoil is, for sorting
     */
    function recoilValue(value) {
        const deviation = Math.abs(recoilDirection(value));
        return 100 - deviation + value / 100000;
    }
    exports.recoilValue = recoilValue;
    // How much to bias the direction towards the center - at 1.0 this would mean recoil would swing ±90°
    const verticalScale = 0.8;
    // The maximum angle of the pie, where zero recoil is the widest and 100 recoil is the narrowest
    const maxSpread = 180; // degrees
    function default_1(value) {
        const direction = recoilDirection(value) * verticalScale * (Math.PI / 180); // Convert to radians
        const x = Math.sin(direction);
        const y = Math.cos(direction);
        const spread = 
        // Higher value means less spread
        ((100 - value) / 100) *
            // scaled by the spread factor (halved since we expand to either side)
            (maxSpread / 2) *
            // in radians
            (Math.PI / 180) *
            // flipped for negative
            Math.sign(direction);
        const xSpreadMore = Math.sin(direction + spread);
        const ySpreadMore = Math.cos(direction + spread);
        const xSpreadLess = Math.sin(direction - spread);
        const ySpreadLess = Math.cos(direction - spread);
        /**
         * DIM-licensed code ends here. But credit where credit is due, the following SVG generation is still based on
         * the SVG generation in the same RecoilStat.tsx file.
         */
        const svg = Component_9.default.create("svg")
            .attributes.set("viewBox", "0 0 2 1")
            .append(Component_9.default.create("circle")
            .attributes.set("r", "1")
            .attributes.set("cx", "1")
            .attributes.set("cy", "1"));
        if (value >= 95)
            Component_9.default.create("line")
                .attributes.set("x1", `${1 - x}`)
                .attributes.set("y1", `${1 + y}`)
                .attributes.set("x2", `${1 + x}`)
                .attributes.set("y2", `${1 - y}`)
                .appendTo(svg);
        else
            Component_9.default.create("path")
                .attributes.set("d", `
				M 1,1${ /* move to bottom middle */""}
				L ${1 + xSpreadMore},${1 - ySpreadMore}${ /* draw a line to the "more" side of the spread */""}
				A${ /* begin drawing an arc */""}
					1,1${ /* with the origin in the bottom middle */""}
					0${ /* angled at 0deg (relative to x axis) */""}
					0,${direction < 0 ? "1" : "0"}${ /* 1 = clockwise, 0 = anticlockwise */""}
					${1 + xSpreadLess},${1 - ySpreadLess}${ /* end the arc at the "less" side of the spread */""}
				Z${ /* close line to starting point (bottom middle) */""}
			`)
                .appendTo(svg);
        return svg;
    }
    exports.default = default_1;
});
define("ui/inventory/tooltip/ItemStat", ["require", "exports", "ui/Classes", "ui/Component", "ui/inventory/Stat", "ui/inventory/tooltip/stats/RecoilDirection", "utility/maths/Maths"], function (require, exports, Classes_4, Component_10, Stat_2, RecoilDirection_1, Maths_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemStatClasses = exports.CustomStat = void 0;
    var CustomStat;
    (function (CustomStat) {
        CustomStat[CustomStat["Total"] = -1] = "Total";
        CustomStat[CustomStat["Distribution"] = -2] = "Distribution";
        CustomStat[CustomStat["Tiers"] = -3] = "Tiers";
    })(CustomStat || (exports.CustomStat = CustomStat = {}));
    var ItemStatClasses;
    (function (ItemStatClasses) {
        ItemStatClasses["Wrapper"] = "item-stat-wrapper";
        ItemStatClasses["Main"] = "item-stat";
        ItemStatClasses["Label"] = "item-stat-label";
        ItemStatClasses["LabelMasterwork"] = "item-stat-label-masterwork";
        ItemStatClasses["GroupLabel"] = "item-stat-group-label";
        ItemStatClasses["Bar"] = "item-stat-bar";
        ItemStatClasses["BarChunked"] = "item-stat-bar-chunked";
        ItemStatClasses["BarBlock"] = "item-stat-bar-block";
        ItemStatClasses["BarBlockNegative"] = "item-stat-bar-block-negative";
        ItemStatClasses["Value"] = "item-stat-value";
        ItemStatClasses["ValueComponent"] = "item-stat-value-component";
        ItemStatClasses["ValueComponentNegative"] = "item-stat-value-component-negative";
        ItemStatClasses["Combined"] = "item-stat-combined";
        ItemStatClasses["Intrinsic"] = "item-stat-intrinsic";
        ItemStatClasses["Random"] = "item-stat-random";
        ItemStatClasses["Masterwork"] = "item-stat-masterwork";
        ItemStatClasses["Mod"] = "item-stat-mod";
        ItemStatClasses["Subclass"] = "item-stat-subclass";
        ItemStatClasses["Charge"] = "item-stat-charge";
        ItemStatClasses["Formula"] = "item-stat-formula";
        ItemStatClasses["Distribution"] = "item-stat-distribution-component";
        ItemStatClasses["DistributionGroupLabel"] = "item-stat-distribution-component-group-label";
    })(ItemStatClasses || (exports.ItemStatClasses = ItemStatClasses = {}));
    const customStats = {
        [CustomStat.Total]: {
            hash: CustomStat.Total,
            order: 1000,
            name: "Total",
            calculate: (stat, stats, item) => {
                const armourStats = Stat_2.ARMOUR_STAT_GROUPS.flat();
                stats = stats.filter(stat => armourStats.includes(stat.hash));
                const totalIntrinsic = stats.map(stat => stat?.intrinsic ?? 0)
                    .reduce((a, b) => a + b, 0);
                const totalRandom = stats.map(stat => stat?.roll ?? 0)
                    .reduce((a, b) => a + b, 0);
                const totalMasterwork = stats.map(stat => stat?.masterwork ?? 0)
                    .reduce((a, b) => a + b, 0);
                const totalMod = stats.map(stat => stat?.mod ?? 0)
                    .reduce((a, b) => a + b, 0);
                const totalSubclass = stats.map(stat => stat?.subclass ?? 0)
                    .reduce((a, b) => a + b, 0);
                const totalCharge = stats.map(stat => stat?.charge ?? 0)
                    .reduce((a, b) => a + b, 0);
                if (totalIntrinsic + totalMasterwork + totalMod + totalCharge === 0)
                    return undefined; // this item doesn't have armour stats
                return {
                    value: totalIntrinsic + totalRandom + totalMasterwork + totalMod + totalSubclass + totalCharge,
                    intrinsic: totalIntrinsic,
                    roll: totalRandom,
                    masterwork: totalMasterwork,
                    mod: totalMod,
                    subclass: totalSubclass,
                    charge: totalCharge,
                };
            },
        },
        [CustomStat.Distribution]: {
            hash: CustomStat.Distribution,
            order: 1001,
            name: "Distribution",
            calculate: (stat, stats, item) => {
                const distribution = item && Stat_2.IStatDistribution.get(item);
                if (!distribution?.overall)
                    return undefined; // this item doesn't have armour stats
                return {
                    value: distribution.overall,
                    combinedValue: distribution.overall,
                    combinedText: `${Math.floor(distribution.overall * 100)}%`,
                    renderFormula: () => distribution.groups.map((groupValue, i) => Component_10.default.create()
                        .classes.add(ItemStatClasses.Distribution)
                        .text.set(`${Math.floor(groupValue * 100)}%`)
                        .append(Component_10.default.create("sup")
                        .classes.add(ItemStatClasses.DistributionGroupLabel)
                        .text.set(`${i + 1}`))
                        .style.set("--value", `${groupValue}`)),
                };
            },
        },
    };
    const renderArmourStat = (_, allStats, item) => Stat_2.ARMOUR_STAT_GROUPS.flat()
        .map(stat => allStats.find(display => display.hash === stat))
        .some(display => {
        const cdisplay = display?.calculate?.(display, allStats, item) ?? display;
        return cdisplay?.combinedValue ?? (cdisplay?.intrinsic ?? 0) + (cdisplay?.masterwork ?? 0) + (cdisplay?.mod ?? 0) + (cdisplay?.subclass ?? 0) + (cdisplay?.charge ?? 0);
    });
    const customStatDisplays = {
        // undrendered
        [Stat_2.Stat.Attack]: false,
        [Stat_2.Stat.Defense]: false,
        [Stat_2.Stat.Power]: false,
        [Stat_2.Stat.InventorySize]: false,
        [Stat_2.Stat.Mystery1]: false,
        [Stat_2.Stat.Mystery2]: false,
        [Stat_2.Stat.GhostEnergyCapacity]: false,
        [Stat_2.Stat.ModCost]: false,
        // weapons
        [Stat_2.Stat.AirborneEffectiveness]: {
            name: "Airborne Aim",
            render: (s, ss, item) => item?.definition.itemSubType !== 18 /* DestinyItemSubType.Sword */,
        },
        [Stat_2.Stat.RPM]: { name: "RPM", max: undefined },
        [Stat_2.Stat.DrawTime]: { max: undefined },
        [Stat_2.Stat.ChargeTime]: {
            bar: true,
            render: (s, ss, item) => item?.definition.itemSubType !== 31 /* DestinyItemSubType.Bow */
                && item?.definition.itemSubType !== 18 /* DestinyItemSubType.Sword */,
        },
        [Stat_2.Stat.RecoilDirection]: {
            bar: true,
            renderBar: (bar, stat) => bar.removeContents()
                .append((0, RecoilDirection_1.default)(stat.value ?? 0)),
        },
        [Stat_2.Stat.Magazine]: { render: (s, ss, item) => item?.definition.itemSubType !== 18 /* DestinyItemSubType.Sword */ },
        [Stat_2.Stat.Zoom]: { render: (s, ss, item) => item?.definition.itemSubType !== 18 /* DestinyItemSubType.Sword */ },
        [Stat_2.Stat.Stability]: { render: (s, ss, item) => item?.definition.itemSubType !== 18 /* DestinyItemSubType.Sword */ },
        [Stat_2.Stat.Range]: { render: (s, ss, item) => item?.definition.itemSubType !== 18 /* DestinyItemSubType.Sword */ },
        // armour
        [Stat_2.Stat.Mobility]: { uncapped: true, plus: true, max: Stat_2.ARMOUR_STAT_MAX_VISUAL, render: renderArmourStat },
        [Stat_2.Stat.Resilience]: { uncapped: true, plus: true, max: Stat_2.ARMOUR_STAT_MAX_VISUAL, render: renderArmourStat },
        [Stat_2.Stat.Recovery]: { uncapped: true, plus: true, max: Stat_2.ARMOUR_STAT_MAX_VISUAL, render: renderArmourStat },
        [Stat_2.Stat.Discipline]: { uncapped: true, plus: true, max: Stat_2.ARMOUR_STAT_MAX_VISUAL, render: renderArmourStat },
        [Stat_2.Stat.Intellect]: { uncapped: true, plus: true, max: Stat_2.ARMOUR_STAT_MAX_VISUAL, render: renderArmourStat },
        [Stat_2.Stat.Strength]: { uncapped: true, plus: true, max: Stat_2.ARMOUR_STAT_MAX_VISUAL, render: renderArmourStat },
        ...customStats,
    };
    for (const [stat, display] of Object.entries(customStatDisplays)) {
        if (!display)
            continue;
        const armourGroup = Stat_2.ARMOUR_STAT_GROUPS.findIndex(group => group.includes(+stat));
        if (armourGroup !== -1)
            display.group = armourGroup;
    }
    class ItemStat extends Component_10.default {
        onMake(stat) {
            this.stat = stat;
            const statName = Stat_2.Stat[this.stat.hash]
                ?? CustomStat[this.stat.hash]
                ?? this.stat.name
                ?? this.stat.definition?.displayProperties.name.replace(/\s+/g, "")
                ?? `${this.stat.hash}`;
            this.groupLabel = stat.group === undefined ? undefined : Component_10.default.create()
                .text.set(`${stat.group + 1}`)
                .classes.add(ItemStatClasses.GroupLabel)
                .appendTo(this);
            this.label = Component_10.default.create()
                .classes.add(ItemStatClasses.Label)
                .appendTo(this);
            if (this.stat?.bar)
                this.bar = Component_10.default.create()
                    .classes.add(ItemStatClasses.Bar, `${ItemStatClasses.Bar}-${(statName).toLowerCase()}`)
                    .append(this.subclassBar = Component_10.default.create()
                    .classes.add(ItemStatClasses.BarBlock, ItemStatClasses.Subclass))
                    .append(this.intrinsicBar = Component_10.default.create()
                    .classes.add(ItemStatClasses.BarBlock, ItemStatClasses.Intrinsic))
                    .append(this.masterworkBar = Component_10.default.create()
                    .classes.add(ItemStatClasses.BarBlock, ItemStatClasses.Masterwork))
                    .append(this.modBar = Component_10.default.create()
                    .classes.add(ItemStatClasses.BarBlock, ItemStatClasses.Mod))
                    .append(this.chargeBar = Component_10.default.create()
                    .classes.add(ItemStatClasses.BarBlock, ItemStatClasses.Charge))
                    .appendTo(this);
            Component_10.default.create()
                .classes.add(ItemStatClasses.Value)
                .append(this.combinedText = Component_10.default.create()
                .classes.add(ItemStatClasses.Combined))
                .append(this.intrinsicText = Component_10.default.create()
                .classes.add(ItemStatClasses.ValueComponent, ItemStatClasses.Intrinsic))
                .append(this.masterworkText = Component_10.default.create()
                .classes.add(ItemStatClasses.ValueComponent, ItemStatClasses.Masterwork))
                .append(this.modText = Component_10.default.create()
                .classes.add(ItemStatClasses.ValueComponent, ItemStatClasses.Mod))
                .append(this.chargeText = Component_10.default.create()
                .classes.add(ItemStatClasses.ValueComponent, ItemStatClasses.Charge))
                .append(this.formulaText = Component_10.default.create()
                .classes.add(ItemStatClasses.ValueComponent, ItemStatClasses.Formula))
                .appendTo(this);
            this.classes.add(ItemStatClasses.Main, `${ItemStatClasses.Main}-${(statName).toLowerCase()}`);
            this.label.text.set(this.stat?.name ?? this.stat.definition?.displayProperties.name ?? "Unknown Stat");
            const icon = this.stat.definition?.displayProperties.icon;
            if (icon)
                this.label.style.set("--icon", `url("${icon}")`);
        }
        set(display, allStats, item) {
            this.stat = display;
            if (display?.calculate) {
                const calculatedDisplay = display.calculate(display, allStats, item);
                if (!calculatedDisplay) {
                    this.classes.add(Classes_4.Classes.Hidden);
                    return false;
                }
                display = { ...display, ...calculatedDisplay };
            }
            this.classes.remove(Classes_4.Classes.Hidden);
            if (display.group !== undefined && this.groupLabel && item) {
                const distribution = Stat_2.IStatDistribution.get(item);
                if (distribution.overall) {
                    this.groupLabel.style.set("--value", `${distribution.groups[display.group]}`);
                }
            }
            this.label.classes.toggle(!!display.masterwork && (item?.isWeapon() ?? false), ItemStatClasses.LabelMasterwork);
            if (display.intrinsic === undefined && display.masterwork === undefined && display.mod === undefined && display.renderFormula === undefined) {
                const render = this.render(display, display.value, true);
                this.combinedText.text.set(display.combinedText ?? render?.text);
                this.intrinsicText.text.set(render?.text);
                if (display.bar && display.max) {
                    const value = (render?.value ?? 0) / display.max;
                    this.intrinsicBar.style.set("--value", `${value}`)
                        .classes.toggle((render?.value ?? 0) < 0, ItemStatClasses.BarBlockNegative);
                    this.bar.style.set("--value", `${value}`);
                }
                return true;
            }
            let combinedValue = undefined;
            if (combinedValue === undefined) {
                combinedValue = display.combinedValue ?? (display.intrinsic ?? 0) + (display.masterwork ?? 0) + (display.mod ?? 0) + (display.subclass ?? 0) + (display.charge ?? 0);
                if (combinedValue < (display.min ?? -Infinity))
                    combinedValue = display.min;
                if (!display.uncapped && combinedValue > (display.max ?? Infinity))
                    combinedValue = display.max;
            }
            const combinedWithoutNegatives = combinedValue
                - [display.intrinsic ?? 0, display.masterwork ?? 0, display.mod ?? 0, display.subclass ?? 0, display.charge ?? 0]
                    .filter(v => v < 0).splat(Maths_3.default.sum);
            let render = this.render(display, combinedValue, true);
            this.combinedText.style.set("--value", `${render?.value ?? 0}`)
                .text.set(display.combinedText ?? render?.text);
            if (display.bar && display.max) {
                const renderWithoutNegatives = this.render(display, combinedWithoutNegatives, true);
                this.bar
                    .style.set("--value", `${(render?.value ?? 0) / display.max}`)
                    .style.set("--value-total", `${(renderWithoutNegatives?.value ?? 0) / display.max}`)
                    .classes.toggle(display.chunked ?? false, ItemStatClasses.BarChunked)
                    .tweak(display.renderBar, { ...display, ...render }, allStats, item);
            }
            let hadRender = render = this.render(display, display.intrinsic, true);
            this.intrinsicText.text.set(render?.text);
            if (display.bar && display.max)
                this.intrinsicBar.style.set("--value", `${(render?.value ?? 0) / display.max}`);
            render = this.render(display, display.masterwork, !hadRender);
            hadRender ||= render;
            this.masterworkText.text.set(render?.text)
                .classes.toggle(!render?.value && !display.displayEntireFormula, Classes_4.Classes.Hidden);
            if (display.bar && display.max)
                this.masterworkBar.style.set("--value", `${(render?.value ?? 0) / display.max}`);
            render = this.render(display, display.mod, !hadRender);
            hadRender ||= render;
            this.modText.text.set(render?.text)
                .classes.toggle((render?.value ?? 0) < 0, ItemStatClasses.ValueComponentNegative)
                .classes.toggle(!render?.value && !display.displayEntireFormula, Classes_4.Classes.Hidden);
            if (display.bar && display.max)
                this.modBar.style.set("--value", `${(render?.value ?? 0) / display.max}`)
                    .classes.toggle((render?.value ?? 0) < 0, ItemStatClasses.BarBlockNegative);
            render = this.render(display, display.subclass, !hadRender);
            hadRender ||= render;
            if (display.bar && display.max)
                this.subclassBar.style.set("--value", `${(render?.value ?? 0) / display.max}`)
                    .classes.toggle((render?.value ?? 0) < 0, ItemStatClasses.BarBlockNegative);
            render = this.render(display, display.charge, !hadRender);
            hadRender ||= render;
            this.chargeText.text.set(render?.text)
                .data.set("charge-value", render?.text)
                .classes.toggle(!render?.value && !display.displayEntireFormula, Classes_4.Classes.Hidden);
            if (display.bar && display.max)
                this.chargeBar.style.set("--value", `${(render?.value ?? 0) / display.max}`);
            this.formulaText.classes.toggle(!display.renderFormula, Classes_4.Classes.Hidden)
                .removeContents()
                .append(...display.renderFormula?.(display, allStats, item) ?? []);
            return true;
        }
        render(display, value, first) {
            if (value === undefined)
                return undefined;
            return {
                value,
                text: (!first || display.plus) && value >= 0 ? `+${value}` : `${value}`,
            };
        }
    }
    (function (ItemStat) {
        class Wrapper extends Component_10.default {
            onMake() {
                this.map = {};
                this.classes.add(ItemStatClasses.Wrapper);
            }
            setItem(item) {
                const stats = Object.values(item.stats?.values ?? {});
                return this.setStats(stats, item);
            }
            setStats(stats, item) {
                stats = stats.concat(Object.values(customStats));
                let hasAnyVisible = false;
                while (true) {
                    let sorted = false;
                    NextStat: for (const stat of stats) {
                        if (typeof stat.order !== "number") {
                            const searchHash = stat.order.after ?? stat.order.before;
                            for (const pivotStat of stats) {
                                if (pivotStat.hash === searchHash) {
                                    if (typeof pivotStat.order !== "number")
                                        // can't pivot on this stat yet, it doesn't have its own order fixed
                                        continue NextStat;
                                    stat.order = pivotStat.order + 0.01;
                                    sorted = true;
                                }
                            }
                        }
                    }
                    if (!sorted)
                        break;
                }
                stats.sort((a, b) => a.order - b.order);
                const renderedGroups = new Set();
                const statDisplays = {};
                for (const stat of stats) {
                    const custom = customStatDisplays[stat.hash];
                    if (custom === false || custom?.render?.(stat, stats, item) === false)
                        continue;
                    const display = {
                        ...stat,
                        ...custom,
                        ...stat.override,
                    };
                    const component = (this.map[stat.hash] ??= ItemStat.create([display])).appendTo(this);
                    const isVisible = component.set(display, stats, item);
                    hasAnyVisible ||= isVisible;
                    if (isVisible)
                        statDisplays[stat.hash] = display;
                    component.groupLabel?.classes.toggle(renderedGroups.has(custom?.group), Classes_4.Classes.Hidden);
                    renderedGroups.add(custom?.group);
                }
                for (const stat of Object.keys(this.map))
                    this.map[+stat].classes.toggle(!statDisplays[+stat], Classes_4.Classes.Hidden);
                this.classes.toggle(!hasAnyVisible, Classes_4.Classes.Hidden);
                return hasAnyVisible;
            }
        }
        ItemStat.Wrapper = Wrapper;
    })(ItemStat || (ItemStat = {}));
    exports.default = ItemStat;
});
define("ui/inventory/tooltip/ItemStatTracker", ["require", "exports", "ui/bungie/DisplayProperties", "ui/Classes", "ui/Component"], function (require, exports, DisplayProperties_2, Classes_5, Component_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemStatTrackerClasses = void 0;
    var ItemStatTrackerClasses;
    (function (ItemStatTrackerClasses) {
        ItemStatTrackerClasses["Main"] = "item-stat-tracker";
        ItemStatTrackerClasses["Icon"] = "item-stat-tracker-icon";
        ItemStatTrackerClasses["Label"] = "item-stat-tracker-label";
        ItemStatTrackerClasses["Value"] = "item-stat-tracker-value";
    })(ItemStatTrackerClasses || (exports.ItemStatTrackerClasses = ItemStatTrackerClasses = {}));
    class ItemStatTracker extends Component_11.default {
        onMake() {
            this.classes.add(ItemStatTrackerClasses.Main)
                .append(this.icon = Component_11.default.create()
                .classes.add(ItemStatTrackerClasses.Icon))
                .append(this.label = Component_11.default.create()
                .classes.add(ItemStatTrackerClasses.Label))
                .append(this.value = Component_11.default.create()
                .classes.add(ItemStatTrackerClasses.Value));
        }
        setItem(item) {
            const statTracker = item.getStatTracker();
            this.classes.toggle(!statTracker, Classes_5.Classes.Hidden);
            this.icon.style.set("--icon", DisplayProperties_2.default.icon(statTracker?.definition));
            this.label.text.set(statTracker?.definition.progressDescription ?? DisplayProperties_2.default.name(statTracker?.definition));
            this.value.text.set(`${(statTracker?.progress.progress ?? 0).toLocaleString()}`);
            return this;
        }
    }
    exports.default = ItemStatTracker;
});
define("ui/inventory/tooltip/ItemTooltipMods", ["require", "exports", "ui/Component", "ui/bungie/DisplayProperties", "ui/bungie/LoadedIcon"], function (require, exports, Component_12, DisplayProperties_3, LoadedIcon_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemTooltipModsClasses = void 0;
    var ItemTooltipModsClasses;
    (function (ItemTooltipModsClasses) {
        ItemTooltipModsClasses["Main"] = "item-tooltip-mods";
        ItemTooltipModsClasses["Detailed"] = "item-tooltip-mods-detailed";
        ItemTooltipModsClasses["Shaped"] = "item-tooltip-mods-shaped";
        ItemTooltipModsClasses["Mod"] = "item-tooltip-mod";
        ItemTooltipModsClasses["ModEnhanced"] = "item-tooltip-mod-enhanced";
        ItemTooltipModsClasses["ModEnhancedArrow"] = "item-tooltip-mod-enhanced-arrow";
        ItemTooltipModsClasses["ModSocket"] = "item-tooltip-mod-socket";
        ItemTooltipModsClasses["ModIntrinsic"] = "item-tooltip-mod-intrinsic";
        ItemTooltipModsClasses["ModSocketEnhanced"] = "item-tooltip-mod-socket-enhanced";
        ItemTooltipModsClasses["ModSocketDefinition"] = "item-tooltip-mod-socket-definition";
        ItemTooltipModsClasses["ModSocketed"] = "item-tooltip-mod-socketed";
        ItemTooltipModsClasses["ModHasName"] = "item-tooltip-mod-has-name";
        ItemTooltipModsClasses["ModName"] = "item-tooltip-mod-name";
        ItemTooltipModsClasses["ModRequiredLevel"] = "item-tooltip-mod-required-level";
        ItemTooltipModsClasses["ModRequiredLevelAdept"] = "item-tooltip-mod-required-level-adept";
        ItemTooltipModsClasses["ModDescription"] = "item-tooltip-mod-description";
        ItemTooltipModsClasses["ModHasDescription"] = "item-tooltip-mod-has-description";
        ItemTooltipModsClasses["ModIcon"] = "item-tooltip-mod-icon";
    })(ItemTooltipModsClasses || (exports.ItemTooltipModsClasses = ItemTooltipModsClasses = {}));
    class ItemTooltipMods extends Component_12.default {
        onMake() {
            this.classes.add(ItemTooltipModsClasses.Main);
        }
        setDetailed(detailed = true) {
            this.classes.toggle(detailed, ItemTooltipModsClasses.Detailed);
            return this;
        }
        setShaped(shaped = true) {
            this.classes.toggle(shaped, ItemTooltipModsClasses.Shaped);
            return this;
        }
        isDetailed() {
            return this.classes.has(ItemTooltipModsClasses.Detailed);
        }
        isShaped() {
            return this.classes.has(ItemTooltipModsClasses.Shaped);
        }
        setItem(item, ...filters) {
            this.removeContents();
            this.addSockets(item, ItemTooltipModsClasses.ModIntrinsic, "Intrinsic", "!Intrinsic/Origin", ...filters);
            this.addPerks(item, ItemTooltipModsClasses.ModIntrinsic, "=Masterwork/ExoticCatalyst", ...filters);
            this.addSockets(item, ItemTooltipModsClasses.ModIntrinsic, "Intrinsic/Origin", ...filters);
            this.addSockets(item, undefined, "Perk", ...filters);
            this.addPerks(item, undefined, "Mod", ...filters);
            return this;
        }
        addPerks(item, socketClass, ...anyOfTypes) {
            const detailed = this.isDetailed();
            let i = 0;
            for (const socket of item.getSockets(...anyOfTypes)) {
                if (!socket.state || socket.state.isVisible === false)
                    continue;
                const plug = socket.socketedPlug;
                const displayablePerks = socket.socketedPlug?.perks
                    .filter(perk => perk.perkVisibility !== 2 /* ItemPerkVisibility.Hidden */
                    && perk.definition.isDisplayable
                    && (socket.is("Masterwork/ExoticCatalyst") ? item.isMasterwork() : true))
                    ?? [];
                for (const perk of displayablePerks) {
                    const socketComponent = Component_12.default.create()
                        .classes.add(ItemTooltipModsClasses.ModSocket, ...socketClass ? [socketClass] : [])
                        .classes.toggle(socket.state !== undefined && socket.plugs.some(plug => plug.is("=Masterwork/ExoticCatalyst")), ItemTooltipModsClasses.ModSocketEnhanced)
                        .style.set("--socket-index", `${i++}`)
                        .appendTo(this);
                    const name = detailed ? DisplayProperties_3.default.nameIfShortOrName(perk.definition, plug?.definition)
                        : DisplayProperties_3.default.descriptionIfShortOrName(perk.definition, plug?.definition) ?? "Unknown";
                    const description = DisplayProperties_3.default.description(perk.definition);
                    const isEnhanced = plug?.is("=Masterwork/ExoticCatalyst") ?? false;
                    Component_12.default.create()
                        .classes.add(ItemTooltipModsClasses.Mod, ItemTooltipModsClasses.ModSocketed, ItemTooltipModsClasses.ModHasName)
                        .classes.toggle(isEnhanced, ItemTooltipModsClasses.ModEnhanced)
                        .append(LoadedIcon_1.default.create([DisplayProperties_3.default.icon(perk.definition, false)])
                        .classes.add(ItemTooltipModsClasses.ModIcon))
                        .append(!isEnhanced ? undefined : Component_12.default.create()
                        .classes.add(ItemTooltipModsClasses.ModEnhancedArrow))
                        .append(Component_12.default.create()
                        .classes.add(ItemTooltipModsClasses.ModName)
                        .text.set(name))
                        .append(!detailed || !description || description === name ? undefined : Component_12.default.create()
                        .classes.add(ItemTooltipModsClasses.ModDescription)
                        .text.set(description))
                        .appendTo(socketComponent);
                }
            }
        }
        addSockets(item, socketClass, ...anyOfTypes) {
            const isCollections = item.bucket.isCollections();
            let i = 0;
            let traitIndex = 0;
            for (const socket of item.getSockets(...anyOfTypes)) {
                if (!socket || socket.state?.isVisible === false)
                    continue;
                const willDisplayMoreThanOnePlug = isCollections && socket.plugs.length > 1;
                if (willDisplayMoreThanOnePlug && (this.isDetailed() || !socket.plugs.some(plug => DisplayProperties_3.default.icon(plug.definition))))
                    continue;
                const socketComponent = Component_12.default.create()
                    .classes.add(ItemTooltipModsClasses.ModSocket, ...socketClass ? [socketClass] : [])
                    .classes.toggle(socket.state !== undefined && socket.plugs.some(plug => plug.is("Perk/TraitEnhanced", "Intrinsic/FrameEnhanced")), ItemTooltipModsClasses.ModSocketEnhanced)
                    .classes.toggle(socket.state === undefined, ItemTooltipModsClasses.ModSocketDefinition)
                    .style.set("--socket-index", `${i++}`)
                    .appendTo(this);
                let j = 0;
                for (const plug of socket.plugs.slice().sort((a, b) => Number(b.socketed && !isCollections) - Number(a.socketed && !isCollections))) {
                    if (!socket.state && plug.is("Intrinsic/FrameEnhanced"))
                        // skip enhanced intrinsics (duplicates) if this is an item definition (ie no actual socket state)
                        continue;
                    if (plug.is("Perk/TraitLocked"))
                        continue;
                    const isEnhanced = plug.is("Perk/TraitEnhanced", "Intrinsic/FrameEnhanced");
                    if (!item.shaped && isEnhanced && (!plug.craftingRequirements?.unlockRequirements.length || !this.isShaped()))
                        continue;
                    if (j++ && plug.is("Intrinsic/Exotic"))
                        continue;
                    const plugComponent = Component_12.default.create()
                        .classes.add(ItemTooltipModsClasses.Mod)
                        .classes.toggle(!!plug?.socketed, ItemTooltipModsClasses.ModSocketed)
                        .classes.toggle(isEnhanced, ItemTooltipModsClasses.ModEnhanced)
                        .append(LoadedIcon_1.default.create([DisplayProperties_3.default.icon(plug.definition, false)])
                        .classes.add(ItemTooltipModsClasses.ModIcon))
                        .appendTo(socketComponent);
                    if (isEnhanced)
                        Component_12.default.create()
                            .classes.add(ItemTooltipModsClasses.ModEnhancedArrow)
                            .appendTo(plugComponent);
                    if (item.shaped && item.isAdept() && socket.is("Perk/Trait")) {
                        const requiredLevel = traitIndex ? 17 : 11;
                        const currentLevel = item.shaped.level?.progress.progress ?? 0;
                        if (currentLevel < requiredLevel)
                            Component_12.default.create()
                                .classes.add(ItemTooltipModsClasses.ModRequiredLevel, ItemTooltipModsClasses.ModRequiredLevelAdept)
                                .text.set(`${requiredLevel}`)
                                .appendTo(plugComponent);
                        traitIndex++;
                    }
                    if (plug?.socketed && (socket.state || (socket.plugs.length === 1 || socket.is("Intrinsic")))) {
                        plugComponent.classes.add(ItemTooltipModsClasses.ModHasName);
                        Component_12.default.create()
                            .classes.add(ItemTooltipModsClasses.ModName)
                            .text.set(DisplayProperties_3.default.name(plug.definition) ?? "Unknown")
                            .appendTo(plugComponent);
                        const description = this.isDetailed() && DisplayProperties_3.default.description(plug.definition);
                        if (description)
                            Component_12.default.create()
                                .classes.add(ItemTooltipModsClasses.ModDescription)
                                .text.set(description)
                                .appendTo(plugComponent.classes.add(ItemTooltipModsClasses.ModHasDescription));
                    }
                    else if (item.deepsight?.pattern && isCollections && this.isShaped()) {
                        Component_12.default.create()
                            .classes.add(ItemTooltipModsClasses.ModRequiredLevel)
                            .text.set(`${plug.craftingRequirements?.requiredLevel ?? 1}`)
                            .appendTo(plugComponent);
                    }
                    if (this.isDetailed())
                        break;
                }
            }
        }
    }
    exports.default = ItemTooltipMods;
});
define("ui/inventory/tooltip/ItemTooltipNotifications", ["require", "exports", "ui/Component", "ui/bungie/DisplayProperties", "utility/Strings"], function (require, exports, Component_13, DisplayProperties_4, Strings_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemTooltipNotificationsClasses = void 0;
    const EXCLUDED_NOTIFICATIONS_SUBSTRINGS = [
        "Deepsight activation is available for this weapon.",
        "Deepsight activation is not available for this weapon instance.",
        "This weapon's Pattern can be extracted.",
        "This weapon can be enhanced.",
        "This weapon can be modified at the Relic.",
    ];
    var ItemTooltipNotificationsClasses;
    (function (ItemTooltipNotificationsClasses) {
        ItemTooltipNotificationsClasses["Main"] = "item-tooltip-notifications";
        ItemTooltipNotificationsClasses["Notification"] = "item-tooltip-notification";
        ItemTooltipNotificationsClasses["NotificationStyle"] = "item-tooltip-notification-style";
        ItemTooltipNotificationsClasses["NotificationIcon"] = "item-tooltip-notification-icon";
        ItemTooltipNotificationsClasses["NotificationDescription"] = "item-tooltip-notification-description";
    })(ItemTooltipNotificationsClasses || (exports.ItemTooltipNotificationsClasses = ItemTooltipNotificationsClasses = {}));
    class ItemTooltipPerks extends Component_13.default {
        onMake() {
            this.classes.add(ItemTooltipNotificationsClasses.Main);
        }
        setItem(item) {
            this.removeContents();
            for (const index of item.reference.tooltipNotificationIndexes) {
                const notification = item.definition.tooltipNotifications[index];
                if (!notification)
                    continue;
                if (EXCLUDED_NOTIFICATIONS_SUBSTRINGS.some(substring => notification.displayString.includes(substring)))
                    continue;
                Component_13.default.create()
                    .classes.add(ItemTooltipNotificationsClasses.Notification)
                    .classes.add(`${ItemTooltipNotificationsClasses.NotificationStyle}-${Strings_3.default.trimTextMatchingFromStart(notification.displayStyle, "ui_display_style_")}`)
                    .append(Component_13.default.create()
                    .classes.add(ItemTooltipNotificationsClasses.NotificationIcon))
                    .append(Component_13.default.create()
                    .classes.add(ItemTooltipNotificationsClasses.NotificationDescription)
                    .tweak(DisplayProperties_4.default.applyDescription, notification.displayString, item.character))
                    .appendTo(this);
            }
        }
    }
    exports.default = ItemTooltipPerks;
});
define("ui/inventory/tooltip/ItemTooltipPerks", ["require", "exports", "ui/Component", "ui/bungie/DisplayProperties"], function (require, exports, Component_14, DisplayProperties_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemTooltipPerksClasses = void 0;
    var ItemTooltipPerksClasses;
    (function (ItemTooltipPerksClasses) {
        ItemTooltipPerksClasses["Main"] = "item-tooltip-perks";
        ItemTooltipPerksClasses["Perk"] = "item-tooltip-perk";
        ItemTooltipPerksClasses["PerkIcon"] = "item-tooltip-perk-icon";
        ItemTooltipPerksClasses["PerkDisabled"] = "item-tooltip-perk-disabled";
        ItemTooltipPerksClasses["PerkDescription"] = "item-tooltip-perk-description";
    })(ItemTooltipPerksClasses || (exports.ItemTooltipPerksClasses = ItemTooltipPerksClasses = {}));
    class ItemTooltipPerks extends Component_14.default {
        onMake() {
            this.classes.add(ItemTooltipPerksClasses.Main);
        }
        setItem(item) {
            this.removeContents();
            for (const perk of item.perks ?? []) {
                if (!perk.definition.isDisplayable)
                    continue;
                if (perk.reference ? !perk.reference.visible : perk.perkVisibility === 2 /* ItemPerkVisibility.Hidden */)
                    continue;
                Component_14.default.create()
                    .classes.add(ItemTooltipPerksClasses.Perk)
                    .classes.toggle(perk.perkVisibility === 1 /* ItemPerkVisibility.Disabled */, ItemTooltipPerksClasses.PerkDisabled)
                    .append(Component_14.default.create()
                    .classes.add(ItemTooltipPerksClasses.PerkIcon)
                    .style.set("--icon", DisplayProperties_5.default.icon(perk.definition)))
                    .append(Component_14.default.create()
                    .classes.add(ItemTooltipPerksClasses.PerkDescription)
                    .tweak(DisplayProperties_5.default.applyDescription, DisplayProperties_5.default.description(perk.definition), item.character))
                    .appendTo(this);
            }
        }
    }
    exports.default = ItemTooltipPerks;
});
define("ui/inventory/tooltip/ItemTooltipSource", ["require", "exports", "ui/Component", "ui/bungie/DisplayProperties"], function (require, exports, Component_15, DisplayProperties_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemTooltipSourceClasses = void 0;
    var ItemTooltipSourceClasses;
    (function (ItemTooltipSourceClasses) {
        ItemTooltipSourceClasses["Main"] = "item-tooltip-source";
        ItemTooltipSourceClasses["Heading"] = "item-tooltip-source-heading";
        ItemTooltipSourceClasses["ActivityWrapper"] = "item-tooltip-source-activity-wrapper";
        ItemTooltipSourceClasses["Activity"] = "item-tooltip-source-activity";
        ItemTooltipSourceClasses["ActivityName"] = "item-tooltip-source-activity-name";
        ItemTooltipSourceClasses["ActivityDescription"] = "item-tooltip-source-activity-description";
        ItemTooltipSourceClasses["ActivityPhaseWrapper"] = "item-tooltip-source-activity-phase-wrapper";
        ItemTooltipSourceClasses["ActivityPhase"] = "item-tooltip-source-activity-phase";
        ItemTooltipSourceClasses["ActivityPhaseIndex"] = "item-tooltip-source-activity-phase-index";
        ItemTooltipSourceClasses["ActivityPhaseName"] = "item-tooltip-source-activity-phase-name";
        ItemTooltipSourceClasses["ActivityPhaseDescription"] = "item-tooltip-source-activity-phase-description";
        ItemTooltipSourceClasses["ActivityChallenge"] = "item-tooltip-source-activity-challenge";
        ItemTooltipSourceClasses["ActivityChallengePhaseIndex"] = "item-tooltip-source-activity-challenge-phase-index";
        ItemTooltipSourceClasses["ActivityRequiredItem"] = "item-tooltip-source-activity-required-item";
        ItemTooltipSourceClasses["ActivityRequiredItemLabel"] = "item-tooltip-source-activity-required-item-label";
        ItemTooltipSourceClasses["ActivityRequiredItemDescription"] = "item-tooltip-source-activity-required-item-description";
        ItemTooltipSourceClasses["Note"] = "item-tooltip-note";
        ItemTooltipSourceClasses["NoteHeading"] = "item-tooltip-note-heading";
    })(ItemTooltipSourceClasses || (exports.ItemTooltipSourceClasses = ItemTooltipSourceClasses = {}));
    class ItemTooltipSource extends Component_15.default {
        onMake() {
            this.classes.add(ItemTooltipSourceClasses.Main);
            this.heading = Component_15.default.create()
                .classes.add(ItemTooltipSourceClasses.Heading, ItemTooltipSourceClasses.Note, ItemTooltipSourceClasses.NoteHeading)
                .text.set("This item can drop from the following activities:")
                .appendTo(this);
            this.activityWrapper = Component_15.default.create()
                .classes.add(ItemTooltipSourceClasses.ActivityWrapper)
                .appendTo(this);
        }
        setItem(item) {
            this.activityWrapper.removeContents();
            if (!item.bucket.isCollections())
                return false;
            if (!item.sources?.length)
                return false;
            const hashes = new Set();
            for (const source of item.sources) {
                if (hashes.has(source.activityDefinition.hash))
                    continue;
                hashes.add(source.activityDefinition.hash);
                let activity = source.activityDefinition;
                if (source.isActiveMasterDrop) {
                    if (!source.masterActivityDefinition)
                        // missing master activity, can't display source
                        continue;
                    activity = source.masterActivityDefinition;
                }
                const activityComponent = Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.Activity)
                    .style.set("--icon", undefined
                    ?? DisplayProperties_6.default.icon(source.dropTable.displayProperties)
                    ?? DisplayProperties_6.default.icon(activity))
                    .appendTo(this.activityWrapper);
                const lostSectorDisplay = !source.activityDefinition.activityModeHashes?.includes(103143560 /* ActivityModeHashes.LostSector */) ? undefined
                    : source.isActiveDrop ? undefined
                        : { name: "Lost Sector", description: "This item is not currently available." };
                Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.ActivityName)
                    .text.set(undefined
                    ?? DisplayProperties_6.default.name(lostSectorDisplay)
                    ?? DisplayProperties_6.default.name(source.dropTable.displayProperties)
                    ?? DisplayProperties_6.default.name(activity))
                    .appendTo(activityComponent);
                Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.ActivityDescription)
                    .tweak(DisplayProperties_6.default.applyDescription, (DisplayProperties_6.default.description(lostSectorDisplay)
                    ?? DisplayProperties_6.default.description(source.dropTable.displayProperties)
                    ?? DisplayProperties_6.default.description(activity)), {
                    character: item.owner,
                    singleLine: true,
                })
                    .appendTo(activityComponent);
                const phasesWrapper = Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.ActivityPhaseWrapper)
                    .appendTo(activityComponent);
                if (source.requiresQuest !== undefined)
                    this.renderRequiredItems(phasesWrapper, item, source, [source.requiresQuest], "quest");
                if (source.requiresItems?.length)
                    this.renderRequiredItems(phasesWrapper, item, source, source.requiresItems);
                if (!source.isActiveMasterDrop)
                    this.renderPhases(phasesWrapper, item, source);
                else if (source.activeChallenge && item.isFomo())
                    this.renderChallenge(phasesWrapper, item, source);
                else if (source.purchaseOnly)
                    Component_15.default.create()
                        .classes.add(ItemTooltipSourceClasses.ActivityChallenge)
                        .style.set("--icon", DisplayProperties_6.default.icon("./image/png/activity/cache.png"))
                        .append(Component_15.default.create()
                        .classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
                        .text.set("Purchase Only"))
                        .append(Component_15.default.create()
                        .classes.add(ItemTooltipSourceClasses.ActivityPhaseDescription)
                        .text.set("This item is available in the end-of-activity cache."))
                        .appendTo(phasesWrapper);
            }
            return true;
        }
        renderRequiredItems(wrapper, forItem, source, items, type = "item") {
            for (const item of items) {
                const challengeComponent = Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.ActivityChallenge)
                    .style.set("--icon", item ? DisplayProperties_6.default.icon(item) : undefined)
                    .appendTo(wrapper);
                const typeText = type === "item" ? "Item" : "Quest";
                Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
                    .text.set(item ? DisplayProperties_6.default.name(item) : "Unknown Item")
                    .append(Component_15.default.create("span")
                    .classes.add(ItemTooltipSourceClasses.ActivityRequiredItemLabel)
                    .text.set(` \xa0//\xa0 Required ${typeText}`))
                    .appendTo(challengeComponent);
                Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.ActivityRequiredItemDescription)
                    .text.set(item ? DisplayProperties_6.default.description(item) : `This ${type} is required to obtain ${DisplayProperties_6.default.name(forItem.definition)}`)
                    .appendTo(challengeComponent);
            }
        }
        renderChallenge(wrapper, item, source) {
            const challenge = source.activeChallenge;
            const challengeHashes = source.dropTable.rotations?.challenges;
            const challengeIndex = challengeHashes?.indexOf(challenge.hash) ?? -1;
            const encounters = source.dropTable.encounters?.filter(encounter => !encounter.traversal);
            const phase = challengeHashes?.length === encounters?.length ? encounters?.[challengeIndex] : undefined;
            const challengeComponent = Component_15.default.create()
                .classes.add(ItemTooltipSourceClasses.ActivityChallenge)
                .style.set("--icon", DisplayProperties_6.default.icon(challenge))
                .appendTo(wrapper);
            Component_15.default.create()
                .classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
                .text.set(DisplayProperties_6.default.name(challenge))
                .appendTo(challengeComponent);
            Component_15.default.create()
                .classes.add(ItemTooltipSourceClasses.ActivityPhaseDescription)
                .append(challengeIndex < 0 ? undefined : Component_15.default.create()
                .classes.add(ItemTooltipSourceClasses.ActivityChallengePhaseIndex)
                .text.set(`${challengeIndex + 1}`))
                .text.set(DisplayProperties_6.default.name(phase))
                .appendTo(challengeComponent);
        }
        renderPhases(wrapper, item, source) {
            if (!source.dropTable.encounters?.length)
                return;
            let realEncounterIndex = 0;
            for (let i = 0; i < source.dropTable.encounters.length; i++) {
                const encounter = source.dropTable.encounters[i];
                if (encounter.traversal)
                    continue;
                realEncounterIndex++;
                const dropTable = encounter.dropTableMergeStrategy === "replace" ? encounter.dropTable
                    : { ...source.dropTable.dropTable, ...encounter.dropTable };
                if (!dropTable?.[item.definition.hash])
                    continue;
                const phaseComponent = Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.ActivityPhase)
                    .appendTo(wrapper);
                Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.ActivityPhaseIndex)
                    .text.set(`${realEncounterIndex}`)
                    .appendTo(phaseComponent);
                Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.ActivityPhaseName)
                    .text.set(DisplayProperties_6.default.name(encounter))
                    .appendTo(phaseComponent);
                Component_15.default.create()
                    .classes.add(ItemTooltipSourceClasses.ActivityPhaseDescription)
                    .text.set(DisplayProperties_6.default.description(encounter) || `Clear ${DisplayProperties_6.default.name(encounter)}`)
                    .appendTo(phaseComponent);
            }
        }
    }
    exports.default = ItemTooltipSource;
});
define("ui/inventory/ItemTooltip", ["require", "exports", "model/models/Manifest", "model/models/items/Item", "ui/Classes", "ui/Component", "ui/Hints", "ui/TooltipManager", "ui/UiEventBus", "ui/bungie/DisplayProperties", "ui/inventory/ElementTypes", "ui/inventory/tooltip/ItemAmmo", "ui/inventory/tooltip/ItemStat", "ui/inventory/tooltip/ItemStatTracker", "ui/inventory/tooltip/ItemTooltipMods", "ui/inventory/tooltip/ItemTooltipNotifications", "ui/inventory/tooltip/ItemTooltipPerks", "ui/inventory/tooltip/ItemTooltipSource", "utility/decorator/Bound"], function (require, exports, Manifest_8, Item_2, Classes_6, Component_16, Hints_1, TooltipManager_1, UiEventBus_1, DisplayProperties_7, ElementTypes_1, ItemAmmo_1, ItemStat_1, ItemStatTracker_1, ItemTooltipMods_1, ItemTooltipNotifications_1, ItemTooltipPerks_1, ItemTooltipSource_1, Bound_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemTooltipClasses = void 0;
    var ItemTooltipClasses;
    (function (ItemTooltipClasses) {
        ItemTooltipClasses["Main"] = "item-tooltip";
        ItemTooltipClasses["Tier_"] = "item-tooltip-tier-";
        ItemTooltipClasses["Extra"] = "item-tooltip-extra";
        ItemTooltipClasses["Content"] = "item-tooltip-content";
        ItemTooltipClasses["ProgressBar"] = "item-tooltip-progress-bar";
        ItemTooltipClasses["MomentWatermark"] = "item-tooltip-moment-watermark";
        ItemTooltipClasses["Locked"] = "item-tooltip-locked";
        ItemTooltipClasses["Unlocked"] = "item-tooltip-unlocked";
        ItemTooltipClasses["Masterwork"] = "item-tooltip-masterwork";
        ItemTooltipClasses["Artifact"] = "item-tooltip-artifact";
        ItemTooltipClasses["PrimaryInfo"] = "item-tooltip-primary-info";
        ItemTooltipClasses["PrimaryStat"] = "item-tooltip-primary-stat";
        ItemTooltipClasses["PrimaryStatValue"] = "item-tooltip-primary-stat-value";
        ItemTooltipClasses["PrimaryStatLabel"] = "item-tooltip-primary-stat-label";
        ItemTooltipClasses["PrimaryStatDamage"] = "item-tooltip-primary-stat-damage";
        ItemTooltipClasses["PrimaryStatDamageIcon"] = "item-tooltip-primary-stat-damage-icon";
        ItemTooltipClasses["PrimaryStatHasElementRight"] = "item-tooltip-primary-stat-has-element-right";
        ItemTooltipClasses["Energy"] = "item-tooltip-energy";
        ItemTooltipClasses["EnergyValue"] = "item-tooltip-energy-value";
        ItemTooltipClasses["WeaponLevel"] = "item-tooltip-weapon-level";
        ItemTooltipClasses["WeaponLevelLabel"] = "item-tooltip-weapon-level-label";
        ItemTooltipClasses["WeaponLevelProgress"] = "item-tooltip-weapon-level-progress";
        ItemTooltipClasses["WeaponLevelEnhanced"] = "item-tooltip-weapon-level-enhanced";
        ItemTooltipClasses["Description"] = "item-tooltip-description";
        ItemTooltipClasses["Stats"] = "item-tooltip-stats";
        ItemTooltipClasses["Deepsight"] = "item-tooltip-deepsight";
        ItemTooltipClasses["DeepsightPatternLabel"] = "item-tooltip-deepsight-pattern-label";
        ItemTooltipClasses["DeepsightPatternNumber"] = "item-tooltip-deepsight-pattern-number";
        ItemTooltipClasses["DeepsightPatternOutOf"] = "item-tooltip-deepsight-pattern-out-of";
        ItemTooltipClasses["DeepsightPatternRequired"] = "item-tooltip-deepsight-pattern-required";
        ItemTooltipClasses["DeepsightPatternRequiredUnit"] = "item-tooltip-deepsight-pattern-required-unit";
        ItemTooltipClasses["DeepsightProgressBar"] = "item-tooltip-deepsight-progress-bar";
        ItemTooltipClasses["DeepsightProgressValue"] = "item-tooltip-deepsight-progress-value";
        ItemTooltipClasses["Enhance"] = "item-tooltip-enhance";
        ItemTooltipClasses["Wishlist"] = "item-tooltip-wishlist";
        ItemTooltipClasses["Wishlisted"] = "item-tooltip-wishlisted";
        ItemTooltipClasses["Fomo"] = "item-tooltip-fomo";
        ItemTooltipClasses["Note"] = "item-tooltip-note";
        ItemTooltipClasses["NoteHeading"] = "item-tooltip-note-heading";
        ItemTooltipClasses["Flavour"] = "item-tooltip-flavour";
        ItemTooltipClasses["RandomRollHeading"] = "item-tooltip-random-roll-heading";
    })(ItemTooltipClasses || (exports.ItemTooltipClasses = ItemTooltipClasses = {}));
    class ItemTooltip extends TooltipManager_1.Tooltip {
        constructor() {
            super(...arguments);
            this.awaitingShiftForLock = false;
        }
        onMake() {
            this.classes.add(ItemTooltipClasses.Main);
            this.content.classes.add(ItemTooltipClasses.Content);
            this.moment = Component_16.default.create()
                .classes.add(ItemTooltipClasses.MomentWatermark, Classes_6.Classes.Hidden)
                .appendTo(this.header);
            this.locked = Component_16.default.create()
                .classes.add(ItemTooltipClasses.Locked, Classes_6.Classes.Hidden)
                .appendTo(this.tier);
            this.primaryInfo = Component_16.default.create()
                .classes.add(ItemTooltipClasses.PrimaryInfo)
                .appendTo(this.content);
            this.primaryStat = Component_16.default.create()
                .classes.add(ItemTooltipClasses.PrimaryStat)
                .appendTo(this.primaryInfo);
            this.primaryStatValue = Component_16.default.create()
                .classes.add(ItemTooltipClasses.PrimaryStatValue)
                .appendTo(this.primaryStat);
            this.primaryStatDamageIcon = Component_16.default.create("img")
                .classes.add(ItemTooltipClasses.PrimaryStatDamageIcon)
                .appendTo(this.primaryStatValue);
            this.primaryStatLabel = Component_16.default.create()
                .classes.add(ItemTooltipClasses.PrimaryStatLabel)
                .appendTo(this.primaryStat);
            this.ammoType = ItemAmmo_1.default.create()
                .appendTo(this.primaryInfo);
            this.energy = Component_16.default.create()
                .classes.add(ItemTooltipClasses.Energy)
                .appendTo(this.primaryInfo);
            this.energyValue = Component_16.default.create()
                .classes.add(ItemTooltipClasses.EnergyValue)
                .appendTo(this.energy);
            this.energy.text.add("Energy");
            this.weaponLevel = Component_16.default.create()
                .classes.add(ItemTooltipClasses.WeaponLevel, ItemTooltipClasses.ProgressBar)
                .append(this.weaponLevelLabel = Component_16.default.create()
                .classes.add(ItemTooltipClasses.WeaponLevelLabel))
                .append(this.weaponLevelProgress = Component_16.default.create()
                .classes.add(ItemTooltipClasses.WeaponLevelProgress))
                .appendTo(this.primaryInfo);
            this.statTracker = ItemStatTracker_1.default.create()
                .appendTo(this.primaryInfo);
            this.description = Component_16.default.create()
                .classes.add(ItemTooltipClasses.Description)
                .appendTo(this.primaryInfo);
            this.perks = ItemTooltipPerks_1.default.create()
                .appendTo(this.primaryInfo);
            this.stats = ItemStat_1.default.Wrapper.create()
                .classes.add(ItemTooltipClasses.Stats)
                .appendTo(this.content);
            this.mods = ItemTooltipMods_1.default.create()
                .appendTo(this.content);
            this.notifications = ItemTooltipNotifications_1.default.create()
                .appendTo(this.content);
            this.deepsight = Component_16.default.create()
                .classes.add(ItemTooltipClasses.Note, ItemTooltipClasses.Deepsight)
                .append(this.deepsightPatternLabel = Component_16.default.create()
                .classes.add(ItemTooltipClasses.DeepsightPatternLabel))
                .append(this.deepsightPatternNumber = Component_16.default.create()
                .classes.add(ItemTooltipClasses.DeepsightPatternNumber))
                .append(this.deepsightPatternOutOf = Component_16.default.create()
                .classes.add(ItemTooltipClasses.DeepsightPatternOutOf)
                .text.add(" / ")
                .append(this.deepsightPatternRequired = Component_16.default.create()
                .classes.add(ItemTooltipClasses.DeepsightPatternRequired))
                .append(this.deepsightPatternRequiredUnit = Component_16.default.create()
                .classes.add(ItemTooltipClasses.DeepsightPatternRequiredUnit)))
                .appendTo(this.content);
            this.enhance = Component_16.default.create()
                .classes.add(ItemTooltipClasses.Note, ItemTooltipClasses.Enhance)
                .append(this.enhanceText = Component_16.default.create())
                .appendTo(this.content);
            this.wishlist = Component_16.default.create()
                .classes.add(ItemTooltipClasses.Note, ItemTooltipClasses.Wishlist)
                .appendTo(this.content);
            this.note = Component_16.default.create()
                .classes.add(ItemTooltipClasses.Note)
                .appendTo(this.content);
            this.fomo = Component_16.default.create()
                .classes.add(ItemTooltipClasses.Note, ItemTooltipClasses.Fomo)
                .appendTo(this.content);
            this.hintEquipToCharacter = Hints_1.Hint.create([Hints_1.IInput.get("MouseLeft")])
                .appendTo(this.hints);
            this.hintUnequipFromCharacter = Hints_1.Hint.create([Hints_1.IInput.get("MouseLeft")])
                .tweak(hint => hint.label.text.set("Unequip"))
                .appendTo(this.hints);
            this.hintPullToCharacter = Hints_1.Hint.create([Hints_1.IInput.get("MouseLeft")])
                .appendTo(this.hints);
            this.hintVault = Hints_1.Hint.create([Hints_1.IInput.get("MouseLeft", "Shift")])
                .tweak(hint => hint.label.text.set("Vault"))
                .appendTo(this.hints);
            this.hintInspect = Hints_1.Hint.create([Hints_1.IInput.get("MouseRight")])
                .tweak(hint => hint.label.text.set("Details"))
                .appendTo(this.hints);
            this.extra.classes.add(ItemTooltipClasses.Extra);
            this.extra.content.classes.add(ItemTooltipClasses.Content);
            this.flavour = this.extra.title
                .classes.add(ItemTooltipClasses.Flavour);
            this.detailedMods = ItemTooltipMods_1.default.create()
                .setDetailed()
                .appendTo(this.extra.content);
            this.randomRollHeading = Component_16.default.create()
                .classes.add(ItemTooltipClasses.Note, ItemTooltipClasses.NoteHeading)
                .appendTo(this.extra.content);
            this.randomMods = ItemTooltipMods_1.default.create()
                .appendTo(this.extra.content);
            this.source = ItemTooltipSource_1.default.create()
                .appendTo(this.extra.content);
            this.hintCollections = Hints_1.Hint.create([Hints_1.IInput.get("MouseRight", "Shift")])
                .tweak(hint => hint.label.text.set("Collections"))
                .appendTo(this.extra.hints);
            UiEventBus_1.default.subscribe("keydown", this.onGlobalKeydown);
            UiEventBus_1.default.subscribe("keyup", this.onGlobalKeyup);
        }
        onGlobalKeydown(event) {
            if (event.matches("Shift")) {
                this.hintInspect.label.text.set("Collections");
                this.awaitingShiftForLock = true;
            }
        }
        onGlobalKeyup(event) {
            if (event.matches("Shift")) {
                this.hintInspect.label.text.set("Details");
                if (!event.usedAnotherKeyDuring && this.awaitingShiftForLock) {
                    this.locked.classes.add(ItemTooltipClasses.Unlocked)
                        .classes.remove(Classes_6.Classes.Hidden);
                    void this.item?.setLocked(!this.item.isLocked())
                        .then(locked => this.locked.classes.remove(ItemTooltipClasses.Unlocked)
                        .classes.toggle(!locked, Classes_6.Classes.Hidden));
                }
                this.awaitingShiftForLock = false;
            }
        }
        async setItem(item, inventory) {
            this.item = item;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            window.$i = window.item = item;
            console.log(DisplayProperties_7.default.name(item.definition), item);
            const character = inventory?.getCharacter(item.character);
            const { DestinyItemTierTypeDefinition, DestinyDamageTypeDefinition, DestinyClassDefinition } = await Manifest_8.default.await();
            let tierHash = item.definition.inventory?.tierTypeHash;
            if (item.definition.itemCategoryHashes?.includes(3109687656 /* ItemCategoryHashes.Dummies */) || item.definition.itemType === 0 /* DestinyItemType.None */)
                tierHash = undefined;
            const tier = await DestinyItemTierTypeDefinition.get(tierHash);
            const tierName = (tierHash === undefined ? "none" : item.definition.inventory?.tierTypeName ?? tier?.displayProperties.name ?? "none")?.toLowerCase();
            this.classes.removeWhere(cls => cls.startsWith(ItemTooltipClasses.Tier_))
                .classes.add(`${ItemTooltipClasses.Tier_}${tierName}`)
                .classes.toggle(item.isMasterwork(), ItemTooltipClasses.Masterwork)
                .classes.toggle(!!item.definition.itemCategoryHashes?.includes(1378222069 /* ItemCategoryHashes.SeasonalArtifacts */), ItemTooltipClasses.Artifact);
            this.title.text.set(DisplayProperties_7.default.name(item.definition));
            this.subtitle.removeContents();
            this.subtitle.text.set(item.definition.itemTypeDisplayName ?? "Unknown");
            this.tier.text.set(tier && item.definition.inventory?.tierTypeName);
            this.locked.classes.toggle(!item.isLocked(), Classes_6.Classes.Hidden);
            this.moment.classes.toggle(!item.moment?.displayProperties.icon, Classes_6.Classes.Hidden);
            const momentIcon = item.moment?.displayProperties.icon;
            if (momentIcon)
                this.moment.style.set("--icon", `url("${momentIcon.startsWith("/") ? `https://www.bungie.net${momentIcon}` : momentIcon}")`);
            const primaryStat = item.getPower();
            const damageType = await DestinyDamageTypeDefinition.get(item.getDamageType());
            const energy = item.instance?.energy;
            const ammoType = item.definition.equippingBlock?.ammoType;
            this.primaryStat
                .classes.toggle(!primaryStat && damageType === undefined, Classes_6.Classes.Hidden)
                .classes.toggle(!!ammoType || !!energy, ItemTooltipClasses.PrimaryStatHasElementRight)
                .classes.removeWhere(cls => cls.startsWith("item-tooltip-energy-type-"));
            this.primaryStatValue
                .text.set(`${primaryStat || character?.power || "0"}`)
                .classes.toggle(damageType !== undefined, ItemTooltipClasses.PrimaryStatDamage);
            this.primaryStatDamageIcon.classes.toggle(damageType === undefined, Classes_6.Classes.Hidden);
            if (damageType !== undefined) {
                const damageTypeName = (damageType?.displayProperties.name ?? "Unknown").toLowerCase();
                this.primaryStatValue
                    .classes.add(`item-tooltip-energy-type-${damageTypeName}`)
                    .style.set("--colour", ElementTypes_1.default.getColour(damageTypeName));
                this.primaryStatDamageIcon.attributes.set("src", DisplayProperties_7.default.icon(damageType, false));
            }
            this.primaryStatLabel
                .text.set(this.item.instance?.primaryStat?.statHash === 1501155019 /* StatHashes.Speed */ ? "Speed" : "Power")
                .classes.toggle(!!item.definition.equippingBlock?.ammoType || energy !== undefined, Classes_6.Classes.Hidden);
            this.ammoType.setItem(item);
            this.energy.classes.toggle(energy === undefined, Classes_6.Classes.Hidden);
            if (energy !== undefined)
                this.energyValue.text.set(`${energy.energyCapacity}`);
            this.weaponLevel.classes.toggle(!item.shaped, Classes_6.Classes.Hidden);
            if (item.shaped) {
                const progressObjective = item.shaped.progress?.progress;
                const progress = (progressObjective?.progress ?? 0) / (progressObjective?.completionValue ?? 1);
                this.weaponLevel.style.set("--progress", `${progress}`);
                this.weaponLevelLabel.text.set(`Weapon Lv. ${item.shaped.level?.progress.progress ?? 0}`);
                this.weaponLevelProgress.text.set(`${Math.floor(progress * 100)}%`);
            }
            const description = DisplayProperties_7.default.description(item.definition);
            this.description.classes.toggle(!description, Classes_6.Classes.Hidden)
                .removeContents()
                .append(Component_16.default.create()
                .tweak(DisplayProperties_7.default.applyDescription, description));
            this.statTracker.setItem(item);
            this.perks.setItem(item);
            this.stats.setItem(item);
            this.mods
                .setShaped(item.bucket.isCollections())
                .setItem(item);
            this.notifications.setItem(item);
            const showPattern = item.deepsight?.pattern && !item.shaped;
            this.deepsight.classes.toggle(!showPattern, Classes_6.Classes.Hidden);
            if (showPattern) {
                const complete = !!item.deepsight?.pattern?.progress?.complete;
                this.deepsightPatternLabel
                    .text.set(inventory?.craftedItems.has(item.definition.hash) ? "You have already shaped this weapon."
                    : complete ? "This weapon's pattern is unlocked."
                        : item.bucket.isCollections() ? "This weapon can be shaped."
                            : item.deepsight?.resonance ? "This [b]Pattern[/b] can be extracted."
                                : item.deepsight?.activation ? "This [b]Pattern[/b] can be [b]Activated[/b]."
                                    : "You have extracted this pattern.");
                const progress = !!item.deepsight?.pattern?.progress;
                this.deepsightPatternNumber.classes.toggle(!progress || complete, Classes_6.Classes.Hidden);
                this.deepsightPatternOutOf.classes.toggle(!progress || complete, Classes_6.Classes.Hidden);
                this.deepsightPatternNumber.text.set(`${item.deepsight.pattern.progress?.progress ?? 0}`);
                this.deepsightPatternRequired.text.set(`${item.deepsight.pattern.progress?.completionValue}`);
                this.deepsightPatternRequiredUnit.classes.toggle(!progress || complete, Classes_6.Classes.Hidden);
                this.deepsightPatternRequiredUnit.text.set("extractions");
            }
            const wishlists = !item.instance || item.shaped ? undefined : await item.getMatchingWishlists();
            this.wishlist.classes.toggle(wishlists === undefined, Classes_6.Classes.Hidden);
            if (wishlists !== undefined)
                this.wishlist.classes.toggle(wishlists && wishlists.length > 0, ItemTooltipClasses.Wishlisted)
                    .text.set(!wishlists ? "All rolls of this item are marked as junk."
                    : wishlists.length === 0 ? "This item does not match a wishlisted roll."
                        : wishlists.length === 1 && wishlists[0].name === "Wishlist" ? "This item matches your wishlist."
                            : `This item matches wishlist${wishlists.length > 1 ? "s" : ""}: ${wishlists.map(list => list.name).join(", ")}`);
            const fomoState = item.isFomo();
            this.fomo.classes.toggle(!fomoState, Classes_6.Classes.Hidden)
                .text.set(fomoState === Item_2.ItemFomoState.TemporaryAvailability ? "This item is currently available."
                : "This item's activity is currently repeatable.");
            const enhancementSocket = item.getSocket("Masterwork/Enhancement");
            this.enhance.classes.toggle(!enhancementSocket, Classes_6.Classes.Hidden);
            this.enhanceText.text.set(item.shaped ? "This weapon can be modified at the [b]Relic[/b]."
                : "This weapon can be [b]Enhanced[/b].");
            this.weaponLevel.classes.toggle(!!enhancementSocket, ItemTooltipClasses.WeaponLevelEnhanced);
            this.note.classes.add(Classes_6.Classes.Hidden);
            const shaped = item.bucket.isCollections() && item.deepsight?.pattern?.progress?.complete && !inventory?.craftedItems.has(item.definition.hash);
            if (item.isNotAcquired() && !shaped && !item.deepsight?.pattern?.progress?.progress) {
                this.note.classes.remove(Classes_6.Classes.Hidden);
                this.note.text.set("This item has has not been acquired.");
            }
            const cls = !character ? undefined : await DestinyClassDefinition.get(character.classHash);
            const className = cls?.displayProperties.name ?? "Unknown";
            this.hintPullToCharacter.label.text.set(`Pull to ${className}`);
            this.hintEquipToCharacter.label.text.set(`Equip to ${className}`);
            const isEngram = item.reference.bucketHash === 375726501 /* InventoryBucketHashes.Engrams */;
            this.hintVault.classes.toggle(item.bucket.isVault() || isEngram || item.bucket.isCollections() || item.bucket.is(1469714392 /* InventoryBucketHashes.Consumables */) || item.bucket.is(3313201758 /* InventoryBucketHashes.Modifications */), Classes_6.Classes.Hidden);
            this.hintPullToCharacter.classes.toggle(item.bucket.isCharacter() || !!item.equipped || isEngram || item.bucket.isCollections() || item.bucket.is(1469714392 /* InventoryBucketHashes.Consumables */) || item.bucket.is(3313201758 /* InventoryBucketHashes.Modifications */), Classes_6.Classes.Hidden);
            this.hintEquipToCharacter.classes.toggle(!item.bucket.isCharacter() || !!item.equipped, Classes_6.Classes.Hidden);
            this.hintUnequipFromCharacter.classes.toggle(!item.bucket.isCharacter() || !item.equipped, Classes_6.Classes.Hidden);
            const flavour = !!item.definition.flavorText;
            this.flavour.classes.toggle(!flavour, Classes_6.Classes.Hidden);
            this.flavour.text.set(item.definition.flavorText);
            this.randomRollHeading.classes.add(Classes_6.Classes.Hidden);
            this.randomMods.classes.add(Classes_6.Classes.Hidden);
            if (item.bucket.isCollections()) {
                this.detailedMods.setItem(item);
            }
            else {
                this.detailedMods.setItem(item);
                if (item.isWeapon() && item.collections?.hasRandomRolls()) {
                    this.randomRollHeading.classes.remove(Classes_6.Classes.Hidden)
                        .text.set(item.shaped ? "This item can be shaped with the following perks:"
                        : "This item can roll the following perks:");
                    this.randomMods.classes.remove(Classes_6.Classes.Hidden)
                        .setShaped(!!item.shaped)
                        .setItem(item.collections, "!Intrinsic");
                }
            }
            const source = this.source.setItem(item);
            this.source.classes.toggle(!source, Classes_6.Classes.Hidden);
            this.extra.classes.toggle(!flavour && !this.detailedMods.hasContents() && !source, Classes_6.Classes.Hidden);
        }
    }
    __decorate([
        Bound_4.default
    ], ItemTooltip.prototype, "onGlobalKeydown", null);
    __decorate([
        Bound_4.default
    ], ItemTooltip.prototype, "onGlobalKeyup", null);
    exports.default = TooltipManager_1.default.create(tooltip => tooltip
        .make(ItemTooltip));
});
define("ui/inventory/Slot", ["require", "exports", "ui/Component"], function (require, exports, Component_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SlotClasses = void 0;
    var SlotClasses;
    (function (SlotClasses) {
        SlotClasses["Main"] = "slot";
        SlotClasses["Empty"] = "slot-empty";
        SlotClasses["EmptyBorders2"] = "slot-empty-borders2";
        SlotClasses["Simple"] = "slot-empty-simple";
        SlotClasses["Wide"] = "slot--wide";
    })(SlotClasses || (exports.SlotClasses = SlotClasses = {}));
    class Slot extends Component_17.default {
        onMake() {
            this.classes.add(SlotClasses.Main);
            Component_17.default.create()
                .classes.add(SlotClasses.EmptyBorders2)
                .appendTo(this);
        }
        /**
         * @returns Whether this slot is set as empty. **Warning:** Does not actually check if there's content inside it.
         */
        isEmpty() {
            return this.classes.has(SlotClasses.Empty);
        }
        setEmpty(empty = true) {
            this.classes.toggle(empty, SlotClasses.Empty);
            return this;
        }
        setSimple(simple = true) {
            this.classes.toggle(simple, SlotClasses.Simple);
            return this;
        }
        setWide(wide = true) {
            this.classes.toggle(wide, SlotClasses.Wide);
            return this;
        }
    }
    exports.default = Slot;
});
define("ui/form/Drawer", ["require", "exports", "ui/Classes", "ui/Component", "ui/form/Button"], function (require, exports, Classes_7, Component_18, Button_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DrawerClasses = void 0;
    var DrawerClasses;
    (function (DrawerClasses) {
        DrawerClasses["Main"] = "drawer";
        DrawerClasses["Panel"] = "drawer-panel";
        DrawerClasses["PanelHasBack"] = "drawer-panel-has-back";
        DrawerClasses["Close"] = "drawer-close";
        DrawerClasses["Back"] = "drawer-back";
        DrawerClasses["Disabled"] = "drawer-disabled";
    })(DrawerClasses || (exports.DrawerClasses = DrawerClasses = {}));
    class Drawer extends Component_18.default {
        onMake() {
            this.focusOnClick = true;
            this.panels = new Set();
            this.openReasons = new Set();
            this.classes.add(DrawerClasses.Main, Classes_7.Classes.Hidden)
                .attributes.add("inert")
                .attributes.set("tabindex", "0")
                .event.subscribe("mousedown", event => {
                if (!event.target.closest("button, input") && this.focusOnClick) {
                    window.getSelection()?.removeAllRanges();
                    // focus the drawer 
                    this.element.focus();
                    this.open("click");
                    this.event.emit("focus", new FocusEvent("focus"));
                }
            });
            this.closeButton = Button_1.default.create()
                .classes.add(DrawerClasses.Close)
                .event.subscribe(["mousedown", "click"], () => this.close(true))
                .appendTo(this);
            this.backButton = Button_1.default.create()
                .classes.add(DrawerClasses.Back, Classes_7.Classes.Hidden)
                .appendTo(this);
        }
        isOpen(visually) {
            return !this.classes.has(Classes_7.Classes.Hidden)
                && (visually || !this.classes.has(Classes_7.Classes.Disabled));
        }
        isDisabled() {
            return this.classes.has(Classes_7.Classes.Disabled);
        }
        disable() {
            this.classes.add(Classes_7.Classes.Disabled, DrawerClasses.Disabled);
            if (this.isOpen()) {
                this.classes.add(Classes_7.Classes.Hidden);
                this.attributes.add("inert");
            }
            return this;
        }
        enable() {
            this.classes.remove(Classes_7.Classes.Disabled, DrawerClasses.Disabled);
            if (this.openReasons.size) {
                this.classes.remove(Classes_7.Classes.Hidden);
                this.attributes.remove("inert");
            }
            return this;
        }
        createPanel() {
            const panel = Component_18.default.create()
                .classes.add(DrawerClasses.Panel)
                .appendTo(this);
            this.panels.add(panel);
            if (this.panels.size > 1)
                panel.classes.add(Classes_7.Classes.Hidden)
                    .attributes.add("inert");
            return panel;
        }
        showPanel(panel, showBackButton = false) {
            let lastPanel;
            for (const panel of this.panels) {
                if (!panel.classes.has(Classes_7.Classes.Hidden)) {
                    lastPanel = panel;
                    lastPanel.attributes.add("inert")
                        .classes.add(Classes_7.Classes.Hidden);
                }
            }
            panel.attributes.remove("inert")
                .classes.remove(Classes_7.Classes.Hidden);
            this.event.emit("showPanel", { panel });
            if (showBackButton && lastPanel) {
                if (!this.backButton.classes.has(Classes_7.Classes.Hidden))
                    throw new Error("Drawer panels don't support multi-level back arrows yet");
                panel.classes.add(DrawerClasses.PanelHasBack);
                this.backButton.classes.remove(Classes_7.Classes.Hidden)
                    .event.until(this.event.waitFor(["closeDrawer", "showPanel"]), event => event
                    .subscribeOnce(["click", "mousedown"], () => {
                    this.showPanel(lastPanel);
                    this.backButton.classes.add(Classes_7.Classes.Hidden);
                }));
            }
            return this;
        }
        toggle(reason = "generic") {
            const added = !this.openReasons.has(reason);
            if (added)
                this.openReasons.add(reason);
            else
                this.openReasons.delete(reason);
            if (this.openReasons.size === 0)
                this.close(reason);
            else if (this.openReasons.size === 1 && added)
                this.open(reason);
            return this.isOpen();
        }
        open(reason = "generic") {
            this.openReasons.add(reason);
            if (this.isDisabled())
                return;
            if (!this.classes.has(Classes_7.Classes.Hidden))
                return;
            this.classes.remove(Classes_7.Classes.Hidden);
            this.attributes.remove("inert");
            this.event.emit("openDrawer", { reason });
        }
        close(reason = "generic") {
            if (reason === true)
                this.openReasons.clear();
            else
                this.openReasons.delete(reason);
            if (!this.openReasons.size) {
                this.classes.add(Classes_7.Classes.Hidden);
                this.attributes.add("inert");
                this.event.emit("closeDrawer");
                this.backButton.classes.add(Classes_7.Classes.Hidden);
            }
        }
        removeContents() {
            while (this.element.lastChild && this.element.lastChild !== this.closeButton.element)
                this.element.lastChild?.remove();
            this.panels.clear();
            return this;
        }
        removePanels() {
            for (const panel of this.panels)
                panel.remove();
            this.panels.clear();
            return this;
        }
        removePanel(panel) {
            if (panel) {
                this.panels.delete(panel);
                panel.remove();
            }
            return this;
        }
    }
    exports.default = Drawer;
});
define("ui/form/Draggable", ["require", "exports", "utility/EventManager", "utility/decorator/Bound", "utility/maths/Vector2"], function (require, exports, EventManager_11, Bound_5, Vector2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DragStage;
    (function (DragStage) {
        DragStage[DragStage["None"] = 0] = "None";
        DragStage[DragStage["Starting"] = 1] = "Starting";
        DragStage[DragStage["Dragging"] = 2] = "Dragging";
    })(DragStage || (DragStage = {}));
    class Draggable {
        constructor(host) {
            this.host = host;
            this.dragStage = DragStage.None;
            this.stickyDistance = 20;
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            host.addEventListener("mousedown", this.dragStart);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            host.addEventListener("touchstart", this.dragStart);
        }
        setStickyDistance(stickyDistance) {
            this.stickyDistance = stickyDistance;
            return this;
        }
        setInputFilter(filter) {
            this.filter = filter;
            return this;
        }
        dragStart(event) {
            const position = this.getMousePosition(event);
            if (!position)
                return;
            this.mouseStartPosition = { x: position.clientX, y: position.clientY };
            this.dragStage = DragStage.Starting;
            if (event.type === "mousedown") {
                window.addEventListener("mousemove", this.drag, { passive: true });
                window.addEventListener("mouseup", this.dragEnd);
            }
            else {
                window.addEventListener("touchmove", this.drag, { passive: true });
                window.addEventListener("touchend", this.dragEnd);
            }
        }
        drag(event) {
            const position = this.getMousePosition(event);
            if (!position)
                return undefined;
            const offset = {
                x: position.clientX - this.mouseStartPosition.x,
                y: position.clientY - this.mouseStartPosition.y,
            };
            if (this.dragStage === DragStage.Starting && !Vector2_1.IVector2.distanceWithin(Vector2_1.IVector2.ZERO(), offset, this.stickyDistance)) {
                const event = EventManager_11.EventManager.emit(this.host, "moveStart", { offset: this.mouseStartPosition });
                if (event.defaultPrevented) {
                    // cancelled
                    this.dragEnd(event);
                    return undefined;
                }
                this.dragStage = DragStage.Dragging;
            }
            if (this.dragStage !== DragStage.Dragging)
                return undefined;
            const eventResult = { offset, mouse: { x: position.clientX, y: position.clientY } };
            EventManager_11.EventManager.emit(this.host, "move", eventResult);
            return eventResult;
        }
        dragEnd(event) {
            window.removeEventListener("mousemove", this.drag);
            window.removeEventListener("mouseup", this.dragEnd);
            window.removeEventListener("touchmove", this.drag);
            window.removeEventListener("touchend", this.dragEnd);
            if (this.dragStage === DragStage.Dragging) {
                const position = this.getMousePosition(event);
                let eventResult;
                if (position)
                    eventResult = this.drag(event);
                EventManager_11.EventManager.emit(this.host, "moveEnd", eventResult ?? { offset: { x: 0, y: 0 }, mouse: { x: event.clientX, y: event.clientY } });
            }
            this.dragStage = DragStage.None;
            this.mouseStartPosition = undefined;
        }
        getMousePosition(event) {
            const touch = event.touches?.[0];
            if (event.button !== 0 && !touch)
                return undefined;
            if (this.filter && !this.filter(event))
                return undefined;
            return touch ?? event;
        }
    }
    exports.default = Draggable;
    __decorate([
        Bound_5.default
    ], Draggable.prototype, "dragStart", null);
    __decorate([
        Bound_5.default
    ], Draggable.prototype, "drag", null);
    __decorate([
        Bound_5.default
    ], Draggable.prototype, "dragEnd", null);
});
define("ui/form/Sortable", ["require", "exports", "ui/form/Draggable", "ui/UiEventBus", "utility/decorator/Bound", "utility/EventManager", "utility/maths/Vector2"], function (require, exports, Draggable_1, UiEventBus_2, Bound_6, EventManager_12, Vector2_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SortableClasses = void 0;
    var SortableClasses;
    (function (SortableClasses) {
        SortableClasses["Item"] = "sortable-item";
        SortableClasses["Slot"] = "sortable-slot";
        SortableClasses["Moving"] = "sortable-moving";
    })(SortableClasses || (exports.SortableClasses = SortableClasses = {}));
    class Sortable {
        constructor(host) {
            this.host = host;
            this.event = EventManager_12.EventManager.make();
            this.draggables = new WeakMap();
            this.sortStickyDistance = 0;
            for (const child of host.children) {
                child.classList.add(SortableClasses.Item);
                child.setAttribute("tabindex", "0");
                this.draggables.set(child, new Draggable_1.default(child)
                    .setStickyDistance(this.sortStickyDistance)
                    .setInputFilter(this.sortInputFilter));
                child.addEventListener("moveStart", this.onItemMoveStart);
                child.addEventListener("move", this.onItemMove);
                child.addEventListener("moveEnd", this.onItemMoveEnd);
            }
            UiEventBus_2.default.subscribe("keydown", this.onKeydown);
        }
        dispose() {
            for (const child of this.host.children) {
                child.removeEventListener("moveStart", this.onItemMoveStart);
                child.removeEventListener("move", this.onItemMove);
                child.removeEventListener("moveEnd", this.onItemMoveEnd);
            }
            UiEventBus_2.default.unsubscribe("keydown", this.onKeydown);
        }
        setSortStickyDistance(stickyDistance) {
            this.sortStickyDistance = stickyDistance;
            for (const item of this.host.children)
                this.draggables.get(item)?.setStickyDistance(stickyDistance);
            return this;
        }
        setInputFilter(filter) {
            this.sortInputFilter = filter;
            for (const item of this.host.children)
                this.draggables.get(item)?.setInputFilter(filter);
            return this;
        }
        sortUp(item) {
            if (item === this.host.children[0])
                return false;
            this.host.insertBefore(item, item.previousElementSibling);
            this.commit();
            return true;
        }
        sortDown(item) {
            if (item === this.host.children[this.host.children.length - 1])
                return false;
            this.host.insertBefore(item, item.nextElementSibling?.nextElementSibling ?? null);
            this.commit();
            return true;
        }
        commit() {
            this.event.emit("commit");
        }
        onItemMoveStart(e) {
            const event = e;
            const item = event.target;
            const itemBox = item.getBoundingClientRect();
            const hostBox = this.host.getBoundingClientRect();
            this.savedPosition = { x: itemBox.left - hostBox.left, y: itemBox.top - hostBox.top };
            item.classList.add(SortableClasses.Moving);
            this.slot ??= document.createElement("div");
            this.slot.classList.add(SortableClasses.Slot);
            this.host.insertBefore(this.slot, item);
            this.onItemMove({ target: item, mouse: event.mouse, offset: Vector2_2.IVector2.ZERO() });
        }
        onItemMove(e) {
            const event = e;
            const item = event.target;
            const change = event.offset;
            const position = { x: (this.savedPosition?.x ?? 0) + change.x, y: (this.savedPosition?.y ?? 0) + change.y };
            item.style.left = `${position.x}px`;
            item.style.top = `${position.y}px`;
            const before = this.findItemBefore(item, position, [...this.host.children]);
            this.host.insertBefore(this.slot, !before ? this.host.firstElementChild : before.nextElementSibling);
        }
        findItemBefore(item, position, children) {
            const box = this.host.getBoundingClientRect();
            const thisTop = box.top;
            const thisLeft = box.left;
            let lastTop;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child === item) {
                    continue;
                }
                let { left, top, width, height } = child.getBoundingClientRect();
                // adjust child position by the position of the host in the document
                left -= thisLeft;
                top -= thisTop;
                // if this is the first item
                if (i === (children[0] === item ? 1 : 0)) {
                    if (position.y < top) {
                        // if we're higher than the first item, sort to the start
                        return undefined;
                    }
                    if (position.x < left && position.y < top + height) {
                        // if we're left of the first item, and we're not below the first item, sort to the start
                        return undefined;
                    }
                }
                // if we're on a different row
                if (lastTop !== undefined && lastTop !== top) {
                    // if the new row's top is past the hovered position's y, sort to the end of the previous row
                    if (position.y < top) {
                        return children[i - 1];
                    }
                    // if the position is within this row vertically, but before any item, sort at the start of this row
                    if (position.y >= top && position.y < top + height && position.x < left) {
                        return children[i - 1];
                    }
                }
                lastTop = top;
                // if we're hovering inside an item's box
                if (position.x >= left && position.x < left + width && position.y >= top && position.y < top + height) {
                    return child;
                }
            }
            // we weren't inside anything, and we didn't get put at the start, so we must be after everything instead
            return children[children.length - 1];
        }
        onItemMoveEnd(e) {
            const event = e;
            event.target.classList.remove(SortableClasses.Moving);
            event.target.style.removeProperty("left");
            event.target.style.removeProperty("top");
            this.host.insertBefore(event.target, this.slot?.nextElementSibling ?? null);
            this.slot?.remove();
            this.commit();
        }
        onKeydown(event) {
            if (!document.contains(this.host)) {
                this.dispose();
                return;
            }
            const item = document.activeElement;
            if (item.parentElement !== this.host)
                return;
            switch (event.key) {
                case "ArrowUp":
                case "ArrowLeft":
                    if (!this.sortUp(item))
                        return;
                    break;
                case "ArrowDown":
                case "ArrowRight":
                    if (!this.sortDown(item))
                        return;
                    break;
                default:
                    return;
            }
            event.use(event.key);
            item.focus();
        }
    }
    exports.default = Sortable;
    __decorate([
        Bound_6.default
    ], Sortable.prototype, "onItemMoveStart", null);
    __decorate([
        Bound_6.default
    ], Sortable.prototype, "onItemMove", null);
    __decorate([
        Bound_6.default
    ], Sortable.prototype, "onItemMoveEnd", null);
    __decorate([
        Bound_6.default
    ], Sortable.prototype, "onKeydown", null);
});
define("ui/inventory/sort/sorts/SortAmmoType", ["require", "exports", "model/models/enum/AmmoTypes", "ui/bungie/EnumIcon", "ui/inventory/sort/Sort"], function (require, exports, AmmoTypes_2, EnumIcon_2, Sort_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_1.ISort.create({
        id: Sort_1.default.AmmoType,
        name: "Ammo Type",
        shortName: "Ammo",
        sort: (a, b) => (a.definition.equippingBlock?.ammoType ?? 0 /* DestinyAmmunitionType.None */) - (b.definition.equippingBlock?.ammoType ?? 0 /* DestinyAmmunitionType.None */),
        renderSortable: sortable => sortable.icon,
        render: item => !item.definition.equippingBlock?.ammoType ? undefined
            : EnumIcon_2.default.create([AmmoTypes_2.default, item.definition.equippingBlock?.ammoType])
                .classes.add("item-sort-ammo-type"),
    });
});
define("ui/inventory/sort/sorts/SortDamageType", ["require", "exports", "model/models/enum/DamageTypes", "ui/bungie/EnumIcon", "ui/inventory/sort/Sort"], function (require, exports, DamageTypes_2, EnumIcon_3, Sort_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_2.ISort.create({
        id: Sort_2.default.DamageType,
        name: "Damage Type",
        shortName: "Damage",
        sort: (a, b) => (b.instance?.damageType ?? 0 /* DamageType.None */) - (a.instance?.damageType ?? 0 /* DamageType.None */),
        renderSortable: sortable => sortable.icon
            .tweak(EnumIcon_3.default.applyIconVar, DamageTypes_2.default, 1 /* DamageType.Kinetic */),
        render: item => !item.instance?.damageType ? undefined
            : EnumIcon_3.default.create([DamageTypes_2.default, item.instance?.damageTypeHash])
                .classes.add("item-sort-damage-type"),
    });
});
define("ui/inventory/sort/sorts/SortEnergy", ["require", "exports", "ui/Component", "ui/inventory/sort/Sort"], function (require, exports, Component_19, Sort_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_3.ISort.create({
        id: Sort_3.default.Energy,
        name: "Energy",
        sort: (a, b) => (b.instance?.energy?.energyCapacity ?? 0) - (a.instance?.energy?.energyCapacity ?? 0),
        renderSortable: sortable => sortable.icon,
        render: item => {
            if (!item.instance?.energy?.energyCapacity)
                return undefined;
            return Component_19.default.create()
                .classes.add("item-energy")
                .append(Component_19.default.create("span")
                .classes.add("item-energy-icon"))
                .text.set(`${item.instance?.energy?.energyCapacity ?? 0}`);
        },
    });
});
define("ui/inventory/sort/sorts/SortExotic", ["require", "exports", "ui/bungie/DisplayProperties", "ui/inventory/sort/Sort"], function (require, exports, DisplayProperties_8, Sort_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_4.ISort.create({
        id: Sort_4.default.Exotic,
        name: "Exotic",
        renderSortable: sortable => sortable.icon,
        sort: (a, b) => a.isExotic() && b.isExotic() ? DisplayProperties_8.default.name(a.definition, "").localeCompare(DisplayProperties_8.default.name(b.definition, ""))
            : Math.max(b.definition.inventory?.tierType ?? 0 /* TierType.Unknown */, 5 /* TierType.Superior */) - Math.max(a.definition.inventory?.tierType ?? 0 /* TierType.Unknown */, 5 /* TierType.Superior */),
    });
});
define("ui/inventory/sort/sorts/SortHarmonizable", ["require", "exports", "ui/Component", "ui/inventory/sort/Sort"], function (require, exports, Component_20, Sort_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_5.ISort.create({
        id: Sort_5.default.Harmonizable,
        name: "Deepsight Harmonizer",
        shortName: "Harmonizer",
        renderSortable: sortable => sortable.icon,
        render: item => {
            if (!item.deepsight?.activation)
                return undefined;
            return Component_20.default.create()
                .classes.add("item-sort-harmonizable")
                .append(Component_20.default.create("span")
                .classes.add("item-sort-harmonizable-icon"))
                .append(Component_20.default.create("span")
                .classes.add("item-sort-harmonizable-numerator")
                .text.set(`${item.deepsight?.pattern?.progress?.progress ?? 0}`))
                .append(Component_20.default.create("span")
                .classes.add("item-sort-harmonizable-separator")
                .text.set("/"))
                .append(Component_20.default.create("span")
                .classes.add("item-sort-harmonizable-denominator")
                .text.set(`${item.deepsight?.pattern?.progress?.completionValue}`));
        },
        sort: (a, b) => getSortIndex(b) - getSortIndex(a),
    });
    function getSortIndex(item) {
        return Number(!!item.deepsight?.activation && (item.deepsight?.pattern?.progress?.progress ?? 0) + 1);
    }
});
define("ui/inventory/sort/sorts/SortLocked", ["require", "exports", "ui/inventory/sort/Sort"], function (require, exports, Sort_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_6.ISort.create({
        id: Sort_6.default.Locked,
        name: "Locked",
        sort: (a, b) => Number(!!b.isLocked()) - Number(!!a.isLocked()),
        renderSortable: sortable => sortable.icon,
    });
});
define("ui/inventory/sort/sorts/SortMasterwork", ["require", "exports", "ui/inventory/sort/Sort"], function (require, exports, Sort_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_7.ISort.create({
        id: Sort_7.default.Masterwork,
        name: "Masterwork",
        renderSortable: sortable => sortable.icon,
        sort: (a, b) => Number(!!b.isMasterwork()) - Number(!!a.isMasterwork()),
    });
});
define("ui/inventory/sort/sorts/SortMoment", ["require", "exports", "ui/inventory/sort/Sort"], function (require, exports, Sort_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_8.ISort.create({
        id: Sort_8.default.Moment,
        name: "Moment",
        renderSortable: sortable => sortable.icon,
        sort: (a, b) => (b.moment?.hash ?? -1) - (a.moment?.hash ?? -1),
    });
});
define("ui/inventory/sort/sorts/SortName", ["require", "exports", "ui/Component", "ui/inventory/sort/Sort"], function (require, exports, Component_21, Sort_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_9.ISort.create({
        id: Sort_9.default.Name,
        name: "Name",
        sort: (a, b) => a.definition.displayProperties.name.localeCompare(b.definition.displayProperties.name),
        renderSortable: sortable => sortable.icon,
        render: item => item.bucket.isPostmaster() ? undefined : Component_21.default.create()
            .classes.add("item-name")
            .append(Component_21.default.create("span")
            .classes.add("item-name-text")
            .text.set(`${item.definition.displayProperties.name}`)),
    });
});
define("ui/inventory/sort/sorts/SortPattern", ["require", "exports", "ui/inventory/sort/Sort"], function (require, exports, Sort_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_10.ISort.create({
        id: Sort_10.default.Pattern,
        name: "Gives Pattern Progress",
        shortName: "Pattern",
        sort: (a, b) => Number(b.hasPattern()) - Number(a.hasPattern()),
        renderSortable: sortable => sortable.icon,
    });
});
define("ui/inventory/ItemPowerLevel", ["require", "exports", "ui/Component"], function (require, exports, Component_22) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemPowerLevelClasses = void 0;
    var ItemPowerLevelClasses;
    (function (ItemPowerLevelClasses) {
        ItemPowerLevelClasses["Main"] = "item-power-level";
        ItemPowerLevelClasses["Icon"] = "item-power-level-icon";
        ItemPowerLevelClasses["Eighths"] = "item-power-level-eighths";
        ItemPowerLevelClasses["Difference"] = "item-power-level-difference";
        ItemPowerLevelClasses["DifferenceBetter"] = "item-power-level-difference-better";
        ItemPowerLevelClasses["DifferenceWorse"] = "item-power-level-difference-worse";
    })(ItemPowerLevelClasses || (exports.ItemPowerLevelClasses = ItemPowerLevelClasses = {}));
    class ItemPowerLevel extends Component_22.default {
        onMake(power, difference) {
            this.classes.add(ItemPowerLevelClasses.Main);
            if (power !== undefined)
                this.setPower(power, difference);
        }
        setPower(power, difference) {
            this.removeContents();
            this.append(Component_22.default.create().classes.add(ItemPowerLevelClasses.Icon))
                .text.add(`${Math.floor(power)}`);
            if (!Number.isInteger(power))
                Component_22.default.create()
                    .classes.add(ItemPowerLevelClasses.Eighths)
                    .text.set(`${Math.round(power % 1 * 8)}`)
                    .appendTo(this);
            if (difference)
                Component_22.default.create()
                    .classes.add(ItemPowerLevelClasses.Difference, difference > 0 ? ItemPowerLevelClasses.DifferenceBetter : ItemPowerLevelClasses.DifferenceWorse)
                    .text.set(difference > 0 ? `+${difference}` : `${difference}`)
                    .appendTo(this);
        }
    }
    exports.default = ItemPowerLevel;
});
define("ui/inventory/sort/sorts/SortPower", ["require", "exports", "ui/inventory/ItemPowerLevel", "ui/inventory/sort/Sort"], function (require, exports, ItemPowerLevel_1, Sort_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_11.ISort.create({
        id: Sort_11.default.Power,
        name: "Power",
        sort: (a, b) => b.getPower() - a.getPower(),
        renderSortable: sortable => sortable.icon.classes.add(ItemPowerLevel_1.ItemPowerLevelClasses.Icon),
        render: item => {
            const power = item.getPower();
            if (!power)
                return undefined;
            return ItemPowerLevel_1.default.create([power]);
        },
    });
});
define("ui/inventory/sort/sorts/SortQuantity", ["require", "exports", "ui/Component", "ui/inventory/sort/Sort"], function (require, exports, Component_23, Sort_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_12.ISort.create({
        id: Sort_12.default.Quantity,
        name: "Quantity",
        sort: (a, b) => b.reference.quantity - a.reference.quantity,
        renderSortable: sortable => sortable.icon,
        render: item => !(item.reference.quantity > 1) ? undefined : Component_23.default.create("span")
            .classes.add("item-quantity")
            .classes.toggle(item.reference.quantity >= (item.definition.inventory?.maxStackSize ?? Infinity), "item-quantity-max")
            .text.set(`x${item.reference.quantity.toLocaleString()}`),
    });
});
define("ui/inventory/sort/sorts/SortRarity", ["require", "exports", "ui/inventory/sort/Sort"], function (require, exports, Sort_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_13.ISort.create({
        id: Sort_13.default.Rarity,
        name: "Rarity",
        renderSortable: sortable => sortable.icon,
        sort: (a, b) => (b.definition.inventory?.tierType ?? 0 /* TierType.Unknown */) - (a.definition.inventory?.tierType ?? 0 /* TierType.Unknown */),
    });
});
define("ui/inventory/sort/sorts/SortShaped", ["require", "exports", "ui/inventory/sort/Sort"], function (require, exports, Sort_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_14.ISort.create({
        id: Sort_14.default.Shaped,
        name: "Shaped",
        renderSortable: sortable => sortable.icon,
        sort: (a, b) => getSortIndex(b) - getSortIndex(a),
    });
    function getSortIndex(item) {
        return Number(!!item.shaped) * 10000000
            + (item.shaped?.level?.progress.progress ?? 0) * 10000
            + (item.shaped?.progress?.progress.progress ?? 0);
    }
});
define("ui/Details", ["require", "exports", "ui/Component", "ui/form/Button"], function (require, exports, Component_24, Button_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DetailsClasses = void 0;
    var DetailsClasses;
    (function (DetailsClasses) {
        DetailsClasses["Main"] = "details";
        DetailsClasses["Summary"] = "details-summary";
        DetailsClasses["Open"] = "details-open";
        DetailsClasses["Closed"] = "details-closed";
    })(DetailsClasses || (exports.DetailsClasses = DetailsClasses = {}));
    class Details extends Component_24.default {
        onMake(...args) {
            super.onMake(...args);
            this.classes.add(DetailsClasses.Main, DetailsClasses.Closed);
            this.summary = Button_2.default.create("summary")
                .classes.add(DetailsClasses.Summary)
                .event.subscribe("click", () => this.toggle())
                .appendTo(this);
        }
        isOpen() {
            return !this.classes.has(DetailsClasses.Closed);
        }
        open() {
            this.classes.remove(DetailsClasses.Closed);
            for (const child of this.element.children)
                child.removeAttribute("inert");
            this.event.emit("toggle");
            return this;
        }
        close() {
            this.classes.add(DetailsClasses.Closed);
            for (const child of this.element.children)
                if (child !== this.summary.element)
                    child.setAttribute("inert", "");
            this.event.emit("toggle");
            return this;
        }
        toggle(open) {
            const isOpen = !this.classes.has(DetailsClasses.Closed);
            if (open !== undefined && isOpen === open)
                return this;
            open = open === undefined ? !isOpen : open;
            return open ? this.open() : this.close();
        }
        removeContents() {
            while (this.element.lastChild && this.element.lastChild !== this.summary.element)
                this.element.lastChild?.remove();
            return this;
        }
    }
    exports.default = Details;
});
define("ui/form/Checkbox", ["require", "exports", "ui/Component"], function (require, exports, Component_25) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CheckboxClasses = void 0;
    var CheckboxClasses;
    (function (CheckboxClasses) {
        CheckboxClasses["Main"] = "checkbox";
        CheckboxClasses["Checkbox"] = "checkbox-checkbox";
        CheckboxClasses["Label"] = "checkbox-label";
        CheckboxClasses["Description"] = "checkbox-description";
    })(CheckboxClasses || (exports.CheckboxClasses = CheckboxClasses = {}));
    class Checkbox extends Component_25.default {
        get checked() {
            return this.checkbox.element.checked;
        }
        set checked(checked) {
            this.checkbox.element.checked = checked;
            this.event.emit("update", { checked });
        }
        get description() {
            const description = Component_25.default.create("p")
                .classes.add(CheckboxClasses.Description)
                .appendTo(this);
            Object.defineProperty(this, "description", { value: description });
            return description;
        }
        onMake(checked) {
            this.classes.add(CheckboxClasses.Main);
            this.label = Component_25.default.create("span")
                .classes.add(CheckboxClasses.Label)
                .appendTo(this);
            this.checkbox = Component_25.default.create("input")
                .classes.add(CheckboxClasses.Checkbox)
                .attributes.set("type", "checkbox")
                .event.subscribe("change", () => this.event.emit("update", { checked: this.checkbox.element.checked }))
                .appendTo(this);
            this.checkbox.element.checked = !!checked;
        }
    }
    Checkbox.defaultType = "label";
    exports.default = Checkbox;
});
define("ui/form/RangeInput", ["require", "exports", "ui/Component", "utility/decorator/Bound"], function (require, exports, Component_26, Bound_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RangeInputClasses = void 0;
    var RangeInputClasses;
    (function (RangeInputClasses) {
        RangeInputClasses["Main"] = "range-input";
    })(RangeInputClasses || (exports.RangeInputClasses = RangeInputClasses = {}));
    class RangeInput extends Component_26.default {
        get value() {
            return this.element.valueAsNumber;
        }
        set value(value) {
            this.element.valueAsNumber = value;
            this.update();
        }
        onMake(config) {
            this.classes.add(RangeInputClasses.Main)
                .attributes.set("type", "range");
            config ??= { min: 0, max: 1, step: 0.01, default: 0 };
            this.attributes.set("min", `${config.min ?? 0}`)
                .attributes.set("max", `${config.max}`)
                .attributes.set("step", `${config.step ?? 1}`)
                .attributes.set("value", `${config.default ?? 0}`);
            this.event.subscribe("input", this.update);
        }
        update() {
            this.style.set("--value", `${(this.element.valueAsNumber - +this.element.min) / (+this.element.max - +this.element.min)}`);
        }
    }
    RangeInput.defaultType = "input";
    exports.default = RangeInput;
    __decorate([
        Bound_7.default
    ], RangeInput.prototype, "update", null);
});
define("ui/inventory/sort/sorts/SortStatDistribution", ["require", "exports", "model/models/Characters", "model/models/Inventory", "model/models/Manifest", "ui/Component", "ui/Details", "ui/form/Checkbox", "ui/form/RangeInput", "ui/inventory/sort/Sort", "ui/inventory/Stat", "ui/Loadable", "utility/decorator/Bound", "utility/EventManager"], function (require, exports, Characters_2, Inventory_1, Manifest_9, Component_27, Details_1, Checkbox_1, RangeInput_1, Sort_15, Stat_3, Loadable_1, Bound_8, EventManager_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatDistributionClasses = void 0;
    var StatDistributionClasses;
    (function (StatDistributionClasses) {
        StatDistributionClasses["ClassConfiguration"] = "stat-distribution-class-configuration";
        StatDistributionClasses["ClassButton"] = "stat-distribution-class-configuration-button";
        StatDistributionClasses["StatRows"] = "stat-distribution-stat-rows";
        StatDistributionClasses["Group"] = "stat-distribution-stat-group";
        StatDistributionClasses["Row"] = "stat-distribution-stat";
        StatDistributionClasses["Label"] = "stat-distribution-stat-label";
        StatDistributionClasses["Range"] = "stat-distribution-stat-range";
        StatDistributionClasses["Value"] = "stat-distribution-stat-value";
        StatDistributionClasses["Enabled"] = "stat-distribution-stat-enabled";
    })(StatDistributionClasses || (exports.StatDistributionClasses = StatDistributionClasses = {}));
    const displayEvents = EventManager_13.EventManager.make();
    var StatDistributionDisplayClasses;
    (function (StatDistributionDisplayClasses) {
        StatDistributionDisplayClasses["Main"] = "item-stat-distribution";
        StatDistributionDisplayClasses["Value"] = "item-stat-distribution-value";
    })(StatDistributionDisplayClasses || (StatDistributionDisplayClasses = {}));
    class StatDistributionDisplay extends Component_27.default {
        constructor() {
            super(...arguments);
            this.contained = false;
        }
        onMake(item) {
            this.item = item;
            this.classes.add(StatDistributionDisplayClasses.Main);
            this.value = Component_27.default.create()
                .classes.add(StatDistributionDisplayClasses.Value)
                .appendTo(this);
            displayEvents.subscribe("update", this.update);
            this.update();
        }
        update() {
            if (!document.contains(this.element) && this.contained) {
                displayEvents.unsubscribe("update", this.update);
                return;
            }
            this.contained = true;
            const distribution = Stat_3.IStatDistribution.get(this.item);
            this.style.set("--value", `${distribution.overall}`);
            this.value.text.set(`${Math.floor(distribution.overall * 100)}%`);
        }
    }
    __decorate([
        Bound_8.default
    ], StatDistributionDisplay.prototype, "update", null);
    exports.default = Sort_15.ISort.create({
        id: Sort_15.default.StatDistribution,
        name: "Stat Distribution",
        shortName: "Stats",
        sort: (a, b) => Stat_3.IStatDistribution.get(b).overall - Stat_3.IStatDistribution.get(a).overall,
        render: item => Stat_3.IStatDistribution.get(item).overall <= 0 ? undefined : StatDistributionDisplay.create([item]),
        renderSortable: sortable => sortable.icon.text.set("%"),
        renderSortableOptions: (wrapper, update) => Loadable_1.default.create(Inventory_1.default.await())
            .onReady(inventory => {
            const container = Component_27.default.create();
            const classes = Characters_2.default.getSortedClasses();
            for (let i = 0; i < classes.length; i++) {
                const classType = classes[i];
                const characterDetails = Details_1.default.create()
                    .classes.add(StatDistributionClasses.ClassConfiguration)
                    .tweak(details => details.summary
                    .text.set(classType === 0 /* DestinyClass.Titan */ ? "Titan" : classType === 1 /* DestinyClass.Hunter */ ? "Hunter" : "Warlock")
                    .classes.add(StatDistributionClasses.ClassButton)
                    .event.subscribe("click", () => {
                    for (const details of container.children())
                        if (details !== characterDetails)
                            details.close();
                }))
                    .toggle(i === 0)
                    .appendTo(container);
                const configuration = Component_27.default.create()
                    .classes.add(StatDistributionClasses.StatRows)
                    .appendTo(characterDetails);
                for (const group of Stat_3.ARMOUR_STAT_GROUPS)
                    StatGroupDisplay.create([group, classType])
                        .event.subscribe("update", update)
                        .appendTo(configuration);
            }
            return container;
        })
            .appendTo(wrapper),
    });
    class StatRow extends Component_27.default {
        get value() {
            return this.input.value;
        }
        set value(value) {
            this.input.value = value;
            this.update();
        }
        async onMake(stat, classType) {
            this.stat = stat;
            this.classType = classType;
            this.classes.add(StatDistributionClasses.Row);
            const enabled = Stat_3.IStatDistribution.isEnabled(stat, classType);
            this.classes.toggle(enabled, StatDistributionClasses.Enabled);
            this.checkbox = Checkbox_1.default.create([enabled])
                .classes.add(StatDistributionClasses.Label)
                .event.subscribe("update", ({ checked }) => {
                Stat_3.IStatDistribution.setIsEnabled(stat, classType, checked);
                this.update(false, true);
                this.event.emit("done");
                this.input.attributes.set("tabindex", checked ? undefined : "-1");
                this.classes.toggle(checked, StatDistributionClasses.Enabled);
            })
                .appendTo(this);
            this.input = RangeInput_1.default.create([{ min: Stat_3.ARMOUR_STAT_MIN, max: Stat_3.ARMOUR_STAT_MAX }])
                .classes.add(StatDistributionClasses.Range)
                .style.set("--visual-min", `${Stat_3.ARMOUR_STAT_MIN / Stat_3.ARMOUR_STAT_MAX}`)
                .attributes.set("tabindex", enabled ? undefined : "-1")
                .event.subscribe("input", this.update)
                .event.subscribe("change", () => this.event.emit("done"))
                .appendTo(this);
            this.valueText = Component_27.default.create()
                .classes.add(StatDistributionClasses.Value)
                .appendTo(this);
            this.value = Stat_3.IStatDistribution.getPreferredValue(stat, classType);
            this.update();
            const { DestinyStatDefinition } = await Manifest_9.default.await();
            const definition = await DestinyStatDefinition.get(stat);
            this.checkbox.label.text.set(definition?.displayProperties.name ?? "Unknown");
        }
        update(event, force = false) {
            if (this.oldValue === this.input.value && !force)
                return this;
            this.valueText.text.set(`${this.input.value}`);
            const oldValue = this.oldValue;
            this.oldValue = this.input.value;
            Stat_3.IStatDistribution.setPreferredValue(this.stat, this.classType, this.input.value);
            // if (event)
            // 	this.checkbox.checked = true;
            if (event)
                this.event.emit("update", { value: this.input.value, oldValue });
            return this;
        }
    }
    __decorate([
        Bound_8.default
    ], StatRow.prototype, "update", null);
    class StatGroupDisplay extends Component_27.default {
        onMake(group, classType) {
            this.classes.add(StatDistributionClasses.Group);
            const statRows = {};
            for (const stat of group) {
                statRows[stat] = StatRow.create([stat, classType])
                    .event.subscribe("update", event => {
                    let difference = event.value - event.oldValue;
                    const modificationOrder = group.map(stat => statRows[stat]).sort((a, b) => b.value - a.value);
                    let i = 0;
                    for (const otherRow of modificationOrder) {
                        if (otherRow.stat === stat)
                            continue;
                        const oldValue = otherRow.value;
                        otherRow.value -= i++ === 0 ? Math.ceil(difference / 2) : difference;
                        difference += otherRow.value - oldValue;
                    }
                    // ensure stats are the right amount
                    const total = modificationOrder.reduce((previous, current) => previous + current.value, 0);
                    if (total !== Stat_3.ARMOUR_GROUP_STATS_MAX) {
                        let difference = Stat_3.ARMOUR_GROUP_STATS_MAX - total;
                        for (const otherRow of modificationOrder) {
                            if (otherRow.stat === stat)
                                continue;
                            const oldValue = otherRow.value;
                            otherRow.value += i++ === 0 ? Math.ceil(difference / 2) : difference;
                            difference -= otherRow.value - oldValue;
                        }
                    }
                    displayEvents.emit("update");
                })
                    .event.subscribe("done", () => this.event.emit("update"))
                    .appendTo(this);
            }
            for (const stat of group)
                statRows[stat].update(false, true);
        }
    }
});
define("ui/inventory/sort/sorts/SortStatTotal", ["require", "exports", "ui/Component", "ui/inventory/sort/Sort", "ui/inventory/Stat"], function (require, exports, Component_28, Sort_16, Stat_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_16.ISort.create({
        id: Sort_16.default.StatTotal,
        name: "Stat Total",
        sort: (a, b) => getStatTotal(b) - getStatTotal(a),
        renderSortable: sortable => sortable.icon,
        render: item => {
            const total = getStatTotal(item);
            if (!total)
                return undefined;
            return Component_28.default.create()
                .classes.add("item-sort-stat-total")
                .append(Component_28.default.create("span")
                .classes.add("item-sort-stat-total-icon"))
                .text.set(`${getStatTotal(item)}`);
        },
    });
    function getStatTotal(item) {
        return Stat_4.ARMOUR_STAT_GROUPS.flat().map(stat => item.stats?.values[stat]?.intrinsic ?? 0)
            .reduce((a, b) => a + b, 0);
    }
});
define("model/models/enum/StatTypes", ["require", "exports", "model/models/enum/EnumModel", "model/models/Manifest"], function (require, exports, EnumModel_5, Manifest_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * For display properties of stats that have iconography
     */
    const StatTypes = EnumModel_5.default.create("StatTypes", {
        async generate() {
            const { DestinyStatDefinition } = await Manifest_10.default.await();
            const types = await DestinyStatDefinition.all();
            const mobility = types.find(type => type.hash === 2996146975 /* StatHashes.Mobility */);
            const resilience = types.find(type => type.hash === 392767087 /* StatHashes.Resilience */);
            const recovery = types.find(type => type.hash === 1943323491 /* StatHashes.Recovery */);
            const discipline = types.find(type => type.hash === 1735777505 /* StatHashes.Discipline */);
            const intellect = types.find(type => type.hash === 144602215 /* StatHashes.Intellect */);
            const strength = types.find(type => type.hash === 4244567218 /* StatHashes.Strength */);
            const array = [mobility, resilience, recovery, discipline, intellect, strength];
            for (const def of array) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                def.displayProperties.icon = `https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/${def.displayProperties.name.toLowerCase()}.svg`;
            }
            return {
                array,
                mobility,
                resilience,
                recovery,
                discipline,
                intellect,
                strength,
            };
        },
    });
    exports.default = StatTypes;
});
define("ui/inventory/sort/sorts/SortStats", ["require", "exports", "model/models/enum/StatTypes", "ui/Component", "ui/bungie/EnumIcon", "ui/inventory/Stat", "ui/inventory/sort/Sort"], function (require, exports, StatTypes_1, Component_29, EnumIcon_4, Stat_5, Sort_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function GenerateStatsSorts() {
        const stats = await StatTypes_1.default.all;
        return stats.array.map(stat => Sort_17.ISort.create({
            id: `stat-${stat.displayProperties.name.replace(/\W+/g, "")}`,
            name: stat.displayProperties.name,
            renderSortable: sortable => sortable.maskIcon
                .classes.add("item-sort-drawer-sort-stat-icon")
                .tweak(EnumIcon_4.default.applyIconVar, StatTypes_1.default, stat.hash),
            sort: (a, b) => (b.stats?.values[stat.hash]?.roll ?? 0) - (a.stats?.values[stat.hash]?.roll ?? 0),
            render: (item, value = item.stats?.values[stat.hash]) => !value?.roll ? undefined : Component_29.default.create()
                .classes.add("item-extra-stat-wrapper")
                .tweak(EnumIcon_4.default.applyIconVar, StatTypes_1.default, stat.hash)
                .text.add(`${value.roll}`)
                .style.set("--value", `${value.roll / (Stat_5.ARMOUR_STAT_GROUPS.some(group => group.includes(stat.hash)) ? Stat_5.ARMOUR_STAT_MAX : value.max ?? 100)}`),
        }));
    }
    exports.default = GenerateStatsSorts;
});
define("model/models/enum/WeaponTypes", ["require", "exports", "model/models/enum/EnumModel"], function (require, exports, EnumModel_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const WeaponTypes = EnumModel_6.default.create("WeaponTypes", {
        // eslint-disable-next-line @typescript-eslint/require-await
        async generate() {
            const emptyDisplayProperties = {
                name: "",
                description: "",
                icon: "",
                iconSequences: [],
                highResIcon: "",
                hasIcon: false,
            };
            const types = [
                {
                    enumValue: 5 /* ItemCategoryHashes.AutoRifle */,
                    displayProperties: { ...emptyDisplayProperties, name: "Auto Rifle", icon: "image/svg/weapon/auto_rifle.svg" },
                },
                {
                    enumValue: 11 /* ItemCategoryHashes.Shotgun */,
                    displayProperties: { ...emptyDisplayProperties, name: "Shotgun", icon: "image/svg/weapon/shotgun.svg" },
                },
                {
                    enumValue: 12 /* ItemCategoryHashes.MachineGun */,
                    displayProperties: { ...emptyDisplayProperties, name: "Machine Gun", icon: "image/svg/weapon/machine_gun.svg" },
                },
                {
                    enumValue: 6 /* ItemCategoryHashes.HandCannon */,
                    displayProperties: { ...emptyDisplayProperties, name: "Hand Cannon", icon: "image/svg/weapon/hand_cannon.svg" },
                },
                {
                    enumValue: 13 /* ItemCategoryHashes.RocketLauncher */,
                    displayProperties: { ...emptyDisplayProperties, name: "Rocket Launcher", icon: "image/svg/weapon/rocket_launcher.svg" },
                },
                {
                    enumValue: 9 /* ItemCategoryHashes.FusionRifle */,
                    displayProperties: { ...emptyDisplayProperties, name: "Fusion Rifle", icon: "image/svg/weapon/fusion_rifle.svg" },
                },
                {
                    enumValue: 10 /* ItemCategoryHashes.SniperRifle */,
                    displayProperties: { ...emptyDisplayProperties, name: "Sniper Rifle", icon: "image/svg/weapon/sniper_rifle.svg" },
                },
                {
                    enumValue: 7 /* ItemCategoryHashes.PulseRifle */,
                    displayProperties: { ...emptyDisplayProperties, name: "Pulse Rifle", icon: "image/svg/weapon/pulse_rifle.svg" },
                },
                {
                    enumValue: 8 /* ItemCategoryHashes.ScoutRifle */,
                    displayProperties: { ...emptyDisplayProperties, name: "Scout Rifle", icon: "image/svg/weapon/scout_rifle.svg" },
                },
                {
                    enumValue: 14 /* ItemCategoryHashes.Sidearm */,
                    displayProperties: { ...emptyDisplayProperties, name: "Sidearm", icon: "image/svg/weapon/sidearm.svg" },
                },
                {
                    enumValue: 54 /* ItemCategoryHashes.Sword */,
                    displayProperties: { ...emptyDisplayProperties, name: "Sword", icon: "image/svg/weapon/sword.svg" },
                },
                {
                    enumValue: 1504945536 /* ItemCategoryHashes.LinearFusionRifles */,
                    displayProperties: { ...emptyDisplayProperties, name: "Linear Fusion Rifle", icon: "image/svg/weapon/linear_fusion_rifle.svg" },
                },
                {
                    enumValue: [153950757 /* ItemCategoryHashes.GrenadeLaunchers */, 4 /* ItemCategoryHashes.PowerWeapon */],
                    displayProperties: { ...emptyDisplayProperties, name: "Heavy Grenade Launcher", icon: "image/svg/weapon/grenade_launcher_heavy.svg" },
                },
                {
                    enumValue: 153950757 /* ItemCategoryHashes.GrenadeLaunchers */,
                    displayProperties: { ...emptyDisplayProperties, name: "Grenade Launcher", icon: "image/svg/weapon/grenade_launcher.svg" },
                },
                {
                    enumValue: 3954685534 /* ItemCategoryHashes.SubmachineGuns */,
                    displayProperties: { ...emptyDisplayProperties, name: "Submachine Gun", icon: "image/svg/weapon/submachine_gun.svg" },
                },
                {
                    enumValue: 2489664120 /* ItemCategoryHashes.TraceRifles */,
                    displayProperties: { ...emptyDisplayProperties, name: "Trace Rifle", icon: "image/svg/weapon/trace_rifle.svg" },
                },
                {
                    enumValue: 3317538576 /* ItemCategoryHashes.Bows */,
                    displayProperties: { ...emptyDisplayProperties, name: "Combat Bow", icon: "image/svg/weapon/combat_bow.svg" },
                },
                {
                    enumValue: 3871742104 /* ItemCategoryHashes.Glaives */,
                    displayProperties: { ...emptyDisplayProperties, name: "Glaive", icon: "image/svg/weapon/glaive.svg" },
                },
            ];
            for (const type of types)
                type.displayProperties.nameLowerCase = type.displayProperties.name.toLowerCase();
            return {
                array: types,
                autoRifle: types.find(type => type.enumValue === 5 /* ItemCategoryHashes.AutoRifle */),
                shotgun: types.find(type => type.enumValue === 11 /* ItemCategoryHashes.Shotgun */),
                machineGun: types.find(type => type.enumValue === 12 /* ItemCategoryHashes.MachineGun */),
                handCannon: types.find(type => type.enumValue === 6 /* ItemCategoryHashes.HandCannon */),
                rocketLauncher: types.find(type => type.enumValue === 13 /* ItemCategoryHashes.RocketLauncher */),
                fusionRifle: types.find(type => type.enumValue === 9 /* ItemCategoryHashes.FusionRifle */),
                sniperRifle: types.find(type => type.enumValue === 10 /* ItemCategoryHashes.SniperRifle */),
                pulseRifle: types.find(type => type.enumValue === 7 /* ItemCategoryHashes.PulseRifle */),
                scoutRifle: types.find(type => type.enumValue === 8 /* ItemCategoryHashes.ScoutRifle */),
                sidearm: types.find(type => type.enumValue === 14 /* ItemCategoryHashes.Sidearm */),
                sword: types.find(type => type.enumValue === 54 /* ItemCategoryHashes.Sword */),
                linearFusionRifle: types.find(type => type.enumValue === 1504945536 /* ItemCategoryHashes.LinearFusionRifles */),
                grenadeLauncher: types.find(type => type.enumValue === 153950757 /* ItemCategoryHashes.GrenadeLaunchers */),
                heavyGrenadeLauncher: types.find(type => Array.isArray(type.enumValue) && type.enumValue.includes(153950757 /* ItemCategoryHashes.GrenadeLaunchers */) && type.enumValue.includes(4 /* ItemCategoryHashes.PowerWeapon */)),
                submachineGun: types.find(type => type.enumValue === 3954685534 /* ItemCategoryHashes.SubmachineGuns */),
                traceRifle: types.find(type => type.enumValue === 2489664120 /* ItemCategoryHashes.TraceRifles */),
                bow: types.find(type => type.enumValue === 3317538576 /* ItemCategoryHashes.Bows */),
                glaive: types.find(type => type.enumValue === 3871742104 /* ItemCategoryHashes.Glaives */),
            };
        },
    });
    exports.default = WeaponTypes;
});
define("ui/inventory/sort/sorts/SortWeaponType", ["require", "exports", "model/models/enum/WeaponTypes", "ui/Component", "ui/bungie/EnumIcon", "ui/inventory/sort/Sort"], function (require, exports, WeaponTypes_1, Component_30, EnumIcon_5, Sort_18) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Sort_18.ISort.create({
        id: Sort_18.default.WeaponType,
        name: "Weapon Type",
        shortName: "Type",
        sort: (a, b) => (a.definition.itemTypeDisplayName ?? "").localeCompare(b.definition.itemTypeDisplayName ?? ""),
        renderSortable: sortable => sortable.maskIcon
            .tweak(EnumIcon_5.default.applyIconVar, WeaponTypes_1.default, 6 /* ItemCategoryHashes.HandCannon */),
        render: item => !item.isWeapon() ? undefined
            : Component_30.default.create()
                .classes.add("item-weapon-type-icon")
                .tweak(component => EnumIcon_5.default.applyIcon(WeaponTypes_1.default, item.definition.itemCategoryHashes, iconPath => component.style.set("--icon", `url("${iconPath}")`))),
    });
});
define("ui/inventory/sort/SortManager", ["require", "exports", "ui/inventory/sort/Sort", "ui/inventory/sort/sorts/SortAmmoType", "ui/inventory/sort/sorts/SortDamageType", "ui/inventory/sort/sorts/SortEnergy", "ui/inventory/sort/sorts/SortExotic", "ui/inventory/sort/sorts/SortHarmonizable", "ui/inventory/sort/sorts/SortLocked", "ui/inventory/sort/sorts/SortMasterwork", "ui/inventory/sort/sorts/SortMoment", "ui/inventory/sort/sorts/SortName", "ui/inventory/sort/sorts/SortPattern", "ui/inventory/sort/sorts/SortPower", "ui/inventory/sort/sorts/SortQuantity", "ui/inventory/sort/sorts/SortRarity", "ui/inventory/sort/sorts/SortShaped", "ui/inventory/sort/sorts/SortStatDistribution", "ui/inventory/sort/sorts/SortStatTotal", "ui/inventory/sort/sorts/SortStats", "ui/inventory/sort/sorts/SortWeaponType", "utility/EventManager", "utility/Store", "utility/decorator/Bound"], function (require, exports, Sort_19, SortAmmoType_1, SortDamageType_1, SortEnergy_1, SortExotic_1, SortHarmonizable_1, SortLocked_1, SortMasterwork_1, SortMoment_1, SortName_1, SortPattern_1, SortPower_1, SortQuantity_1, SortRarity_1, SortShaped_1, SortStatDistribution_1, SortStatTotal_1, SortStats_1, SortWeaponType_1, EventManager_14, Store_9, Bound_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const BASE_SORT_MAP = {
        [Sort_19.default.Name]: SortName_1.default,
        [Sort_19.default.Power]: SortPower_1.default,
        [Sort_19.default.Energy]: SortEnergy_1.default,
        [Sort_19.default.Pattern]: SortPattern_1.default,
        [Sort_19.default.Masterwork]: SortMasterwork_1.default,
        [Sort_19.default.Rarity]: SortRarity_1.default,
        [Sort_19.default.StatTotal]: SortStatTotal_1.default,
        [Sort_19.default.StatDistribution]: SortStatDistribution_1.default,
        [Sort_19.default.Moment]: SortMoment_1.default,
        [Sort_19.default.Shaped]: SortShaped_1.default,
        [Sort_19.default.AmmoType]: SortAmmoType_1.default,
        [Sort_19.default.DamageType]: SortDamageType_1.default,
        [Sort_19.default.WeaponType]: SortWeaponType_1.default,
        [Sort_19.default.Quantity]: SortQuantity_1.default,
        [Sort_19.default.Locked]: SortLocked_1.default,
        [Sort_19.default.Harmonizable]: SortHarmonizable_1.default,
        [Sort_19.default.Exotic]: SortExotic_1.default,
    };
    const DYNAMIC_SORTS = [
        SortStats_1.default,
    ];
    for (const [type, sort] of Object.entries(BASE_SORT_MAP))
        if (+type !== sort.id)
            throw new Error(`Sort ${Sort_19.default[+type]} implementation miscategorised`);
    class SortManager {
        static registerSort(id, sort) {
            if (this.sortMap[id])
                throw new Error(`Attempted to dynamically re-register sort ${id}`);
            this.sortMap[id] = sort;
        }
        static onInit(fn) {
            if (SortManager.initialised)
                fn();
            else
                SortManager.onInitFunctions.push(fn);
        }
        static async init() {
            if (SortManager.initialised)
                return;
            return SortManager.initialised = (async () => {
                for (const gen of DYNAMIC_SORTS) {
                    for (const sort of await gen()) {
                        if (typeof sort.id === "number")
                            throw new Error(`Cannot dynamically register sorts with numeric IDs, registered ${sort.id}`);
                        this.registerSort(sort.id, sort);
                    }
                }
                for (const onInit of SortManager.onInitFunctions)
                    onInit();
                return SortManager.initialised = true;
            })();
        }
        constructor(configuration) {
            this.inapplicableIds = [];
            this.inapplicableRegExp = [];
            this.event = new EventManager_14.EventManager(this);
            this.setConfiguration(configuration);
        }
        setConfiguration(configuration) {
            Object.assign(this, configuration);
            this.inapplicableIds = configuration.inapplicable.filter((sort) => typeof sort === "number");
            this.inapplicableRegExp = configuration.inapplicable.filter((sort) => typeof sort === "string")
                .map(regexString => new RegExp(`^${regexString}$`));
            this.default = this.default.filter(sort => !this.isInapplicable(SortManager.sortMap[sort]));
            SortManager.onInit(() => {
                let sort = (Store_9.default.get(`sort-${this.id}`) ?? [])
                    .map((sortName) => Sort_19.default[sortName] ?? sortName)
                    .filter(sort => SortManager.sortMap[sort]);
                if (!sort.length)
                    sort = this.default;
                this.current = sort.map(sortType => SortManager.sortMap[sortType]);
            });
        }
        get() {
            return this.current;
        }
        getDisabled() {
            return Object.values(SortManager.sortMap)
                .filter(sort => !this.current.includes(sort) && !this.isInapplicable(sort))
                .sort((a, b) => 0
                || (typeof a.id === "number" ? a.id : 99999999999) - (typeof b.id === "number" ? b.id : 99999999999)
                || `${a.id}`.localeCompare(`${b.id}`));
        }
        isInapplicable(sort) {
            return this.inapplicableIds.includes(sort.id)
                || this.inapplicableRegExp.some(regex => regex.test(`${sort.id}`));
        }
        set(sort) {
            this.current.splice(0, Infinity, ...sort);
            Store_9.default.set(`sort-${this.id}`, this.current.map(sort => typeof sort.id === "number" ? Sort_19.default[sort.id] : sort.id));
            this.event.emit("update");
        }
        sort(itemA, itemB) {
            for (const sort of this.current) {
                const result = sort.sort(itemA, itemB);
                if (result !== 0)
                    return result;
            }
            const hasInstanceDifference = Number(!!itemB.reference.itemInstanceId) - Number(!!itemA.reference.itemInstanceId);
            if (hasInstanceDifference)
                // sort things with an instance id before things without an instance id
                return hasInstanceDifference;
            return (itemA.reference.itemInstanceId ?? `${itemA.reference.itemHash}`)?.localeCompare(itemB.reference.itemInstanceId ?? `${itemB.reference.itemHash}`);
        }
    }
    SortManager.sortMap = BASE_SORT_MAP;
    SortManager.initialised = false;
    SortManager.onInitFunctions = [];
    __decorate([
        Bound_9.default
    ], SortManager.prototype, "isInapplicable", null);
    __decorate([
        Bound_9.default
    ], SortManager.prototype, "sort", null);
    exports.default = SortManager;
});
define("ui/inventory/sort/ItemSort", ["require", "exports", "ui/Component", "ui/form/Button", "ui/form/Drawer", "ui/form/Sortable", "ui/inventory/ItemComponent", "ui/inventory/sort/Sort", "ui/UiEventBus", "utility/decorator/Bound"], function (require, exports, Component_31, Button_3, Drawer_1, Sortable_1, ItemComponent_1, Sort_20, UiEventBus_3, Bound_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SortableSort = exports.ItemSortClasses = void 0;
    var ItemSortClasses;
    (function (ItemSortClasses) {
        ItemSortClasses["Main"] = "item-sort";
        ItemSortClasses["Button"] = "item-sort-button";
        ItemSortClasses["ButtonIcon"] = "item-sort-button-icon";
        ItemSortClasses["ButtonLabel"] = "item-sort-button-label";
        ItemSortClasses["ButtonSortText"] = "item-sort-button-sort-text";
        ItemSortClasses["Drawer"] = "item-sort-drawer";
        ItemSortClasses["DrawerPanel"] = "item-sort-drawer-panel";
        ItemSortClasses["Sorts"] = "item-sort-drawer-sorts";
        ItemSortClasses["Sort"] = "item-sort-drawer-sort";
        ItemSortClasses["SortTitle"] = "item-sort-drawer-sort-title";
        ItemSortClasses["SortIcon"] = "item-sort-drawer-sort-icon";
        ItemSortClasses["SortIconMask"] = "item-sort-drawer-sort-icon-mask";
        ItemSortClasses["SortOptions"] = "item-sort-drawer-sort-options";
        ItemSortClasses["SortsHeading"] = "item-sort-drawer-sorts-heading";
    })(ItemSortClasses || (exports.ItemSortClasses = ItemSortClasses = {}));
    class SortableSort extends Component_31.default {
        get icon() {
            return Component_31.default.create("span")
                .classes.add(ItemSortClasses.SortIcon, `item-sort-drawer-sort-${this.sort.className ?? (typeof this.sort.id === "number" ? Sort_20.default[this.sort.id] : this.sort.id).toLowerCase()}-icon`)
                .prependTo(this.title);
        }
        get maskIcon() {
            return Component_31.default.create("span")
                .classes.add(ItemSortClasses.SortIconMask, `item-sort-drawer-sort-${this.sort.className ?? (typeof this.sort.id === "number" ? Sort_20.default[this.sort.id] : this.sort.id).toLowerCase()}-icon`)
                .prependTo(this.title);
        }
        onMake(sort) {
            this.sort = sort;
            this.classes.add(ItemSortClasses.Sort, `item-sort-drawer-sort-${sort.className ?? (typeof sort.id === "number" ? Sort_20.default[sort.id] : sort.id).toLowerCase()}`);
            this.title = Component_31.default.create("span")
                .classes.add(ItemSortClasses.SortTitle)
                .text.set(sort.name)
                .appendTo(this);
            sort.renderSortable?.(this);
            if (sort.renderSortableOptions)
                Button_3.default.create()
                    .classes.add(Button_3.ButtonClasses.Icon, ItemSortClasses.SortOptions)
                    .event.subscribe("click", this.onClick)
                    .appendTo(this);
        }
        onClick() {
            this.event.emit("configure", { sort: this.sort });
        }
    }
    exports.SortableSort = SortableSort;
    __decorate([
        Bound_10.default
    ], SortableSort.prototype, "onClick", null);
    class ItemSort extends Component_31.default {
        onMake(sorter) {
            this.sorter = sorter;
            this.classes.add(ItemSortClasses.Main);
            ////////////////////////////////////
            // Button
            this.button = Button_3.default.create()
                .classes.add(ItemSortClasses.Button)
                .event.subscribe("click", this.toggleDrawer)
                .addIcon(icon => icon.classes.add(ItemSortClasses.ButtonIcon))
                .appendTo(this);
            this.label = Component_31.default.create()
                .classes.add(ItemSortClasses.ButtonLabel)
                .text.set(`Sort ${sorter.name}`)
                .appendTo(this.button);
            this.sortText = Component_31.default.create()
                .classes.add(ItemSortClasses.ButtonSortText)
                .appendTo(this.button);
            ////////////////////////////////////
            // Drawer
            this.drawer = Drawer_1.default.create()
                .classes.add(ItemSortClasses.Drawer)
                .event.subscribe("focus", this.focusDrawer)
                .appendTo(this);
            this.mainPanel = this.drawer.createPanel();
            Component_31.default.create()
                .classes.add(ItemSortClasses.SortsHeading)
                .text.set("Sort By")
                .appendTo(this.mainPanel);
            this.sortsList = Component_31.default.create()
                .classes.add(ItemSortClasses.Sorts)
                .appendTo(this.mainPanel);
            this.configurePanel = this.drawer.createPanel();
            this.configureTitle = Component_31.default.create()
                .classes.add(ItemSortClasses.SortsHeading)
                .text.set("Configure Sort")
                .appendTo(this.configurePanel);
            this.configureWrapper = Component_31.default.create()
                .appendTo(this.configurePanel);
            this.sorts = [];
            for (const sort of sorter.get())
                this.createSortableSort(sort);
            this.sortsDisabledHeading = Component_31.default.create()
                .classes.add(ItemSortClasses.SortsHeading)
                .text.set("Don't Sort By")
                .appendTo(this.sortsList);
            for (const sort of sorter.getDisabled())
                this.createSortableSort(sort);
            new Sortable_1.default(this.sortsList.element)
                .setInputFilter(event => !event.target.closest("button"))
                .event.subscribe("commit", this.onCommitSort);
            this.sortsDisabledHeading.attributes.remove("tabindex");
            ////////////////////////////////////
            // Setup
            this.updateSortDisplay();
            document.body.addEventListener("click", this.onClick);
            UiEventBus_3.default.subscribe("keydown", this.onKeydown);
            UiEventBus_3.default.subscribe("keyup", this.onKeyup);
        }
        createSortableSort(sort) {
            this.sorts.push(SortableSort.create([sort])
                .event.subscribe("configure", this.configureSort)
                .appendTo(this.sortsList));
        }
        configureSort({ sort }) {
            this.configureTitle.text.set(`Configure ${sort.name}`);
            this.configureWrapper.removeContents().tweak(sort.renderSortableOptions, this.onCommitSort);
            this.drawer.showPanel(this.configurePanel, true);
        }
        onClick(event) {
            if (!this.exists())
                return document.body.removeEventListener("click", this.onClick);
            if (event.target.closest(`.${ItemSortClasses.Main}`))
                return;
            this.closeDrawer();
        }
        onCommitSort() {
            this.sorter.set([...this.sortsList.children()]
                .map(child => child.sort)
                .slice(0, this.sortsDisabledHeading.index()));
            this.updateSortDisplay();
            this.event.emit("sort");
        }
        updateSortDisplay() {
            this.sortText.text.set(this.sorter.get()
                .map(sort => sort.shortName ?? sort.name)
                .join(", "));
        }
        onKeydown(event) {
            if (!document.contains(this.element)) {
                UiEventBus_3.default.unsubscribe("keydown", this.onKeydown);
                return;
            }
            if (event.useOverInput("s", "ctrl"))
                this.openDrawer();
            if (this.drawer.isOpen() && event.useOverInput("Escape"))
                this.closeDrawer();
        }
        onKeyup() {
            if (!document.contains(this.element)) {
                UiEventBus_3.default.unsubscribe("keyup", this.onKeyup);
                return;
            }
            if (!this.element.contains(document.activeElement))
                this.closeDrawer();
        }
        toggleDrawer() {
            if (!this.drawer.isOpen())
                this.openDrawer();
            else
                this.closeDrawer();
        }
        openDrawer() {
            if (this.drawer.isOpen())
                return;
            this.drawer.open();
            this.drawer.showPanel(this.mainPanel);
            ItemComponent_1.default.showExtra(ItemSortClasses.Main);
            this.focusDrawer();
        }
        closeDrawer() {
            this.drawer.close(true);
            ItemComponent_1.default.hideExtra(ItemSortClasses.Main);
        }
        focusDrawer() {
            const [firstSort] = this.sortsList.children();
            firstSort.element.focus();
        }
    }
    exports.default = ItemSort;
    __decorate([
        Bound_10.default
    ], ItemSort.prototype, "configureSort", null);
    __decorate([
        Bound_10.default
    ], ItemSort.prototype, "onClick", null);
    __decorate([
        Bound_10.default
    ], ItemSort.prototype, "onCommitSort", null);
    __decorate([
        Bound_10.default
    ], ItemSort.prototype, "onKeydown", null);
    __decorate([
        Bound_10.default
    ], ItemSort.prototype, "onKeyup", null);
    __decorate([
        Bound_10.default
    ], ItemSort.prototype, "toggleDrawer", null);
    __decorate([
        Bound_10.default
    ], ItemSort.prototype, "focusDrawer", null);
});
define("ui/inventory/sort/Sort", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ISort = void 0;
    var Sort;
    (function (Sort) {
        Sort[Sort["Power"] = 0] = "Power";
        Sort[Sort["Name"] = 1] = "Name";
        Sort[Sort["Energy"] = 2] = "Energy";
        Sort[Sort["Pattern"] = 3] = "Pattern";
        Sort[Sort["Shaped"] = 4] = "Shaped";
        Sort[Sort["Masterwork"] = 5] = "Masterwork";
        Sort[Sort["Rarity"] = 6] = "Rarity";
        Sort[Sort["StatTotal"] = 7] = "StatTotal";
        Sort[Sort["StatDistribution"] = 8] = "StatDistribution";
        Sort[Sort["Moment"] = 9] = "Moment";
        Sort[Sort["AmmoType"] = 10] = "AmmoType";
        Sort[Sort["DamageType"] = 11] = "DamageType";
        Sort[Sort["WeaponType"] = 12] = "WeaponType";
        Sort[Sort["Quantity"] = 13] = "Quantity";
        Sort[Sort["Locked"] = 14] = "Locked";
        Sort[Sort["Harmonizable"] = 15] = "Harmonizable";
        Sort[Sort["Exotic"] = 16] = "Exotic";
    })(Sort || (Sort = {}));
    exports.default = Sort;
    var ISort;
    (function (ISort) {
        function create(sort) {
            return sort;
        }
        ISort.create = create;
    })(ISort || (exports.ISort = ISort = {}));
});
define("ui/inventory/ItemComponent", ["require", "exports", "model/models/Manifest", "ui/bungie/DisplayProperties", "ui/bungie/LoadedIcon", "ui/Classes", "ui/Component", "ui/form/Button", "ui/inventory/ItemTooltip", "ui/inventory/Slot", "ui/inventory/sort/Sort", "ui/inventory/sort/sorts/SortQuantity", "ui/Loadable", "utility/Async", "utility/decorator/Bound", "utility/Store"], function (require, exports, Manifest_11, DisplayProperties_9, LoadedIcon_2, Classes_8, Component_32, Button_4, ItemTooltip_1, Slot_1, Sort_21, SortQuantity_2, Loadable_2, Async_4, Bound_11, Store_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemClasses = void 0;
    var ItemClasses;
    (function (ItemClasses) {
        ItemClasses["Main"] = "item";
        ItemClasses["Icon"] = "item-icon";
        ItemClasses["Classified"] = "item-classified";
        ItemClasses["Borderless"] = "item-borderless";
        ItemClasses["UniversalArmourOrnament"] = "item-universal-armour-ornament";
        ItemClasses["MomentWatermark"] = "item-moment-watermark";
        ItemClasses["MomentWatermarkCustom"] = "item-moment-watermark-custom";
        ItemClasses["IsMasterwork"] = "item-is-masterwork";
        ItemClasses["Masterwork"] = "item-masterwork";
        ItemClasses["MasterworkSpinny"] = "item-masterwork-spinny";
        ItemClasses["MasterworkShiftedDueToJunkBorder"] = "item-masterwork-shifted-due-to-junk-border";
        ItemClasses["Artifact"] = "item-artifact";
        ItemClasses["Shaped"] = "item-shaped";
        ItemClasses["CanEnhance"] = "item-can-enhance";
        ItemClasses["Enhanced"] = "item-enhanced";
        ItemClasses["Deepsight"] = "item-deepsight";
        ItemClasses["DeepsightHasPattern"] = "item-deepsight-has-pattern";
        ItemClasses["DeepsightPattern"] = "item-deepsight-pattern";
        ItemClasses["DeepsightPatternUnlocked"] = "item-deepsight-pattern-unlocked";
        ItemClasses["Wishlist"] = "item-wishlist";
        ItemClasses["WishlistNoMatch"] = "item-wishlist-no-match";
        ItemClasses["WishlistIcon"] = "item-wishlist-icon";
        ItemClasses["WishlistNoMatchIcon"] = "item-wishlist-no-match-icon";
        ItemClasses["Extra"] = "item-extra";
        ItemClasses["ExtraInfo"] = "item-extra-info";
        ItemClasses["ExtraEmpty"] = "item-extra-empty";
        ItemClasses["ExtraNoneAfterQuantityOrPower"] = "item-extra-none-after-quantity-or-power";
        ItemClasses["Loading"] = "item-loading";
        ItemClasses["NotAcquired"] = "item-not-acquired";
        ItemClasses["Locked"] = "item-locked";
        ItemClasses["Unlocked"] = "item-unlocked";
        ItemClasses["Fomo"] = "item-fomo";
        ItemClasses["FomoIcon"] = "item-fomo-icon";
        ItemClasses["IsContainer"] = "item--container";
    })(ItemClasses || (exports.ItemClasses = ItemClasses = {}));
    class ItemComponent extends Button_4.default {
        static showExtra(id) {
            ItemComponent.showers.add(id);
            document.documentElement.classList.add("show-item-extra-info");
        }
        static hideExtra(id) {
            ItemComponent.showers.delete(id);
            if (!ItemComponent.showers.size)
                document.documentElement.classList.remove("show-item-extra-info");
        }
        static toggleExtra(id, newState = !ItemComponent.showers.has(id)) {
            if (newState)
                ItemComponent.showExtra(id);
            else
                ItemComponent.hideExtra(id);
        }
        async onMake(...args) {
            super.onMake(...args);
            const [item, inventory] = args;
            this.tooltipPadding = 0;
            this.classes.add(ItemClasses.Main);
            this.inventory = inventory;
            this.event.subscribe("click", this.onClick);
            this.event.subscribe("contextmenu", this.onContextMenu);
            if (item) {
                const done = this.setItem(item);
                await done;
            }
        }
        update(event) {
            if (!document.contains(this.element)) {
                this.item?.event.unsubscribe("update", this.update);
                this.item?.event.unsubscribe("loadStart", this.loadStart);
                this.item?.event.unsubscribe("loadEnd", this.loadEnd);
                return;
            }
            void (async () => {
                while (this.lastUpdatePromise)
                    await this.lastUpdatePromise;
                const updatePromise = this.lastUpdatePromise = this.setItem(event.item);
                await this.lastUpdatePromise;
                if (this.lastUpdatePromise === updatePromise)
                    delete this.lastUpdatePromise;
            })();
        }
        loadStart() {
            this.loadingSpinny?.classes.remove(Classes_8.Classes.Hidden);
        }
        loadEnd() {
            this.loadingSpinny?.classes.add(Classes_8.Classes.Hidden);
        }
        async setItem(item, inventory) {
            this.inventory = inventory ?? this.inventory;
            if (item !== this.item) {
                this.item?.event.unsubscribe("update", this.update);
                this.item?.event.unsubscribe("loadStart", this.loadStart);
                this.item?.event.unsubscribe("loadEnd", this.loadEnd);
                item?.event.subscribe("update", this.update);
                item?.event.subscribe("loadStart", this.loadStart);
                item?.event.subscribe("loadEnd", this.loadEnd);
                this.item = item;
            }
            while (this.settingItem)
                await this.settingItem;
            this.settingItem = this.renderItem(item);
            await this.settingItem;
            delete this.settingItem;
        }
        async renderItem(item) {
            this.setTooltip(ItemTooltip_1.default, {
                initialise: tooltip => item && tooltip.setPadding(this.tooltipPadding)
                    .setItem(item, this.inventory),
                differs: tooltip => tooltip.item?.reference.itemInstanceId !== item?.reference.itemInstanceId,
            });
            this.classes.toggle(!!item?.isMasterwork(), ItemClasses.IsMasterwork);
            this.extra ??= Component_32.default.create()
                .classes.add(ItemClasses.Extra);
            const borderless = item?.definition.itemType === 8 /* DestinyItemType.Engram */
                || item?.definition.itemType === 25 /* DestinyItemType.Package */
                || item?.definition.itemTypeDisplayName == "Umbral Engram";
            this.classes.toggle(borderless, ItemClasses.Borderless);
            const isContainer = item?.definition.uiItemDisplayStyle === "ui_display_style_set_container";
            this.classes.toggle(isContainer, ItemClasses.IsContainer);
            this.parent(`.${Slot_1.SlotClasses.Main}`)?.setWide(isContainer);
            const { DestinyItemTierTypeDefinition, DestinyPowerCapDefinition } = await Manifest_11.default.await();
            const tier = await DestinyItemTierTypeDefinition.get(item?.definition.inventory?.tierTypeHash);
            this.classes.removeWhere(cls => cls.startsWith("item-tier-"))
                .classes.add(`item-tier-${(item?.definition.inventory?.tierTypeName ?? tier?.displayProperties?.name ?? "Common")?.toLowerCase()}`);
            const ornament = item?.getOrnament();
            const hasUniversalOrnament = !!ornament
                && tier?.displayProperties.name === "Legendary"
                && !!item?.definition.traitIds?.some(id => id === "item_type.armor" || id.startsWith("item.armor."));
            let index = 0;
            (this.icon ??= LoadedIcon_2.default.create([DisplayProperties_9.default.icon(ornament?.definition, false) ?? DisplayProperties_9.default.icon(item?.definition, false)])
                .classes.add(ItemClasses.Icon)
                .tweak(icon => this.initialiseIcon(icon))
                .indexInto(this, index++))
                .classes.toggle(hasUniversalOrnament, ItemClasses.UniversalArmourOrnament)
                .classes.toggle(item?.definition.displayProperties.icon === "/img/misc/missing_icon_d2.png", ItemClasses.Classified);
            const shaped = item?.shaped || (item?.bucket.isCollections() && item.deepsight?.pattern?.progress?.complete && !this.inventory?.craftedItems.has(item.definition.hash));
            this.classes.toggle(!!item?.isNotAcquired() && !shaped && !item.deepsight?.pattern?.progress?.progress, ItemClasses.NotAcquired);
            if (shaped ? !item?.isMasterwork() : item?.canEnhance())
                (this.iconShaped ??= Component_32.default.create()
                    .classes.toggle(!!shaped, ItemClasses.Shaped)
                    .classes.toggle(!!item?.canEnhance(), ItemClasses.CanEnhance)
                    .append(Component_32.default.create())
                    .indexInto(this, index))
                    .classes.remove(Classes_8.Classes.Hidden);
            else
                this.iconShaped?.classes.add(Classes_8.Classes.Hidden);
            index++;
            let watermark;
            const powerpower = item?.getPower(true);
            const powerCap = powerpower === undefined ? undefined : await DestinyPowerCapDefinition.get(item?.definition.quality?.versions[item.definition.quality.currentVersion]?.powerCapHash);
            if (powerpower !== undefined && (powerCap?.powerCap ?? 0) < 900000)
                watermark = item?.definition.iconWatermarkShelved ?? item?.definition.iconWatermark;
            else
                watermark = item?.definition.iconWatermark ?? item?.definition.iconWatermarkShelved;
            if (watermark || item?.moment?.displayProperties.icon)
                (this.momentWatermark ??= Component_32.default.create()
                    .classes.add(ItemClasses.MomentWatermark)
                    .indexInto(this, index))
                    .classes.remove(Classes_8.Classes.Hidden)
                    .classes.toggle(!watermark && !!item?.moment?.displayProperties.icon, ItemClasses.MomentWatermarkCustom)
                    .style.set("--watermark", watermark && `url("https://www.bungie.net${watermark}")`)
                    .style.set("--icon", item?.moment?.displayProperties.icon && `url("${item.moment.displayProperties.icon}")`);
            else
                this.momentWatermark?.classes.add(Classes_8.Classes.Hidden);
            index++;
            if ((item?.isLocked() || item?.isChangingLockState()))
                (this.iconLock ??= Component_32.default.create()
                    .indexInto(this, index))
                    .classes.remove(Classes_8.Classes.Hidden)
                    .classes.toggle(item.isChangingLockState(), ItemClasses.Unlocked)
                    .classes.toggle(!item.isChangingLockState(), ItemClasses.Locked)
                    .classes.toggle(!Store_10.default.items.settingsDisplayLocksOnItems, Classes_8.Classes.ShowIfExtraInfo);
            else
                this.iconLock?.classes.add(Classes_8.Classes.Hidden);
            index++;
            const wishlisted = !item?.instance || item.shaped ? undefined : await item.isWishlisted();
            const displayWishlistedBorder = wishlisted && Store_10.default.items.settingsDisplayWishlistedHighlights;
            const displayJunkBorder = wishlisted === false && !Store_10.default.items.settingsDisableDisplayNonWishlistedHighlights;
            this.deepsight?.classes.add(Classes_8.Classes.Hidden);
            this.deepsightHasPattern?.classes.add(Classes_8.Classes.Hidden);
            this.deepsightPattern?.classes.add(Classes_8.Classes.Hidden);
            if (!shaped) {
                if (item?.hasDeepsight())
                    (this.deepsight ??= Component_32.default.create()
                        .classes.add(ItemClasses.Deepsight)
                        .indexInto(this, index))
                        .classes.remove(Classes_8.Classes.Hidden);
                if (item?.deepsight?.pattern) {
                    (this.deepsightHasPattern ??= Component_32.default.create()
                        .classes.add(ItemClasses.DeepsightHasPattern)
                        .indexInto(this, index + 1))
                        .classes.remove(Classes_8.Classes.Hidden);
                    if (!displayJunkBorder)
                        (this.deepsightPattern ??= Component_32.default.create()
                            .classes.add(ItemClasses.DeepsightPattern)
                            .indexInto(this, index + 2))
                            .classes.remove(Classes_8.Classes.Hidden)
                            .classes.toggle(!!item.deepsight.pattern.progress?.complete, ItemClasses.DeepsightPatternUnlocked);
                }
            }
            index += 3;
            this.masterwork?.classes.add(Classes_8.Classes.Hidden);
            this.wishlist?.classes.add(Classes_8.Classes.Hidden);
            const isArtifact = !!item?.definition.itemCategoryHashes?.includes(1378222069 /* ItemCategoryHashes.SeasonalArtifacts */);
            if (item?.isMasterwork())
                (this.masterwork ??= Component_32.default.create()
                    .classes.add(ItemClasses.Masterwork)
                    .append(Component_32.default.create()
                    .classes.add(ItemClasses.MasterworkSpinny))
                    .indexInto(this, index))
                    .classes.remove(Classes_8.Classes.Hidden)
                    .classes.toggle(isArtifact, ItemClasses.Artifact)
                    .classes.toggle(displayJunkBorder, ItemClasses.MasterworkShiftedDueToJunkBorder);
            else if (displayWishlistedBorder)
                (this.wishlist ??= Component_32.default.create()
                    .classes.add(ItemClasses.Wishlist)
                    .append(Component_32.default.create()
                    .classes.add(ItemClasses.WishlistIcon))
                    .indexInto(this, index))
                    .classes.remove(Classes_8.Classes.Hidden);
            index++;
            if (displayJunkBorder)
                (this.junk ??= Component_32.default.create()
                    .classes.add(ItemClasses.WishlistNoMatch)
                    .append(Component_32.default.create()
                    .classes.add(ItemClasses.WishlistNoMatchIcon))
                    .indexInto(this, index))
                    .classes.remove(Classes_8.Classes.Hidden);
            else
                this.junk?.classes.add(Classes_8.Classes.Hidden);
            index++;
            if (item?.isFomo())
                (this.fomo ??= Component_32.default.create()
                    .classes.add(ItemClasses.Fomo)
                    .append(Component_32.default.create()
                    .classes.add(ItemClasses.FomoIcon))
                    .indexInto(this, index))
                    .classes.remove(Classes_8.Classes.Hidden);
            else
                this.fomo?.classes.add(Classes_8.Classes.Hidden);
            index++;
            void Async_4.default.debounce(this.rerenderExtra);
            this.extra.indexInto(this, index);
            index++;
            (this.loadingSpinny ??= Component_32.default.create()
                .classes.add(Loadable_2.default.Classes.LoadingSpinny, ItemClasses.Loading)
                .append(Component_32.default.create())
                .append(Component_32.default.create())
                .indexInto(this, index))
                .classes.toggle(!item?.transferring, Classes_8.Classes.Hidden);
        }
        initialiseIcon(icon) { }
        setSortedBy(sorter) {
            this.sorter = sorter && new WeakRef(sorter);
            this.event.emit("setSorter");
            sorter?.event.until(this.event.waitFor("setSorter"), event => event
                .subscribe("update", () => Async_4.default.debounce(this.rerenderExtra)));
            void Async_4.default.debounce(this.rerenderExtra);
            return this;
        }
        setTooltipPadding(padding) {
            this.tooltipPadding = padding;
            return this;
        }
        setDisableInteractions() {
            this.disableInteractions = true;
            return this;
        }
        async rerenderExtra() {
            this.extra.removeContents();
            if (!this.item)
                return;
            const sorts = this.sorter?.deref()?.get()?.slice() ?? [];
            if (this.item.reference.quantity > 1 && !sorts.includes(SortQuantity_2.default))
                sorts.push(SortQuantity_2.default);
            let extra = 0;
            let encounteredQuantityOrPowerState = 0;
            for (const sort of sorts) {
                if (!sort.render)
                    continue;
                const rendered = await sort.render(this.item);
                if (!rendered)
                    continue;
                if (encounteredQuantityOrPowerState || sort.id === Sort_21.default.Quantity || sort.id === Sort_21.default.Power)
                    encounteredQuantityOrPowerState++;
                rendered.classes.add(ItemClasses.ExtraInfo)
                    .appendTo(this.extra);
                if (++extra === 3)
                    return;
            }
            this.extra.classes.toggle(extra === 0 || (this.item.definition.inventory?.bucketTypeHash === 375726501 /* InventoryBucketHashes.Engrams */ && extra === 1), ItemClasses.ExtraEmpty);
            this.extra.classes.toggle(encounteredQuantityOrPowerState === 1 && extra < 3, ItemClasses.ExtraNoneAfterQuantityOrPower);
        }
        async onClick(event) {
            if (!this.item)
                return;
            if (window.innerWidth <= 800)
                return viewManager.showItemTooltip(this.item);
            if (this.disableInteractions)
                return;
            if (!event.use("MouseLeft"))
                return;
            if (event.shiftKey)
                // update this item component's bucket so future clicks transfer to the right place
                await this.item.transferToggleVaulted(this.inventory?.currentCharacter.characterId);
            else {
                const character = this.item.character ?? this.inventory?.currentCharacter.characterId;
                if (!this.item.bucket.isCharacter())
                    await this.item.transferToCharacter(character);
                else if (this.item.equipped)
                    await this.item.unequip();
                else
                    await this.item.equip(character);
            }
        }
        onContextMenu(event) {
            if (!this.item)
                return;
            if (window.innerWidth <= 800)
                return;
            if (this.disableInteractions)
                return;
            if (!event.use("MouseRight"))
                return;
            event.preventDefault();
            event.stopPropagation();
            if (event.shiftKey)
                viewManager.showCollections(this.item);
            else
                viewManager.showItem(this.item);
        }
    }
    ItemComponent.showers = new Set();
    exports.default = ItemComponent;
    __decorate([
        Bound_11.default
    ], ItemComponent.prototype, "update", null);
    __decorate([
        Bound_11.default
    ], ItemComponent.prototype, "loadStart", null);
    __decorate([
        Bound_11.default
    ], ItemComponent.prototype, "loadEnd", null);
    __decorate([
        Bound_11.default
    ], ItemComponent.prototype, "rerenderExtra", null);
    __decorate([
        Bound_11.default
    ], ItemComponent.prototype, "onClick", null);
    __decorate([
        Bound_11.default
    ], ItemComponent.prototype, "onContextMenu", null);
});
define("ui/LoadingManager", ["require", "exports", "model/Model", "utility/EventManager", "utility/endpoint/bungie/Bungie"], function (require, exports, Model_11, EventManager_15, Bungie_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LoadingManager {
        constructor() {
            this.event = new EventManager_15.EventManager(this);
            this.model = Model_11.default.createTemporary(async () => !Bungie_5.default.authenticated ? undefined : this.event.waitFor("end"));
            this.loaders = new Set();
            Object.assign(window, { Loading: this });
        }
        get loading() {
            return this.loaders.size > 0;
        }
        start(id) {
            const newlyLoading = this.loaders.size === 0;
            this.loaders.add(id);
            if (newlyLoading) {
                this.event.emit("start");
                this.model.get();
            }
        }
        end(id) {
            this.loaders.delete(id);
            if (!this.loaders.size)
                this.event.emit("end");
        }
        toggle(id, newState = !this.loaders.has(id)) {
            if (newState)
                this.start(id);
            else
                this.end(id);
        }
    }
    exports.default = new LoadingManager;
});
define("model/models/Inventory", ["require", "exports", "model/Model", "model/models/Characters", "model/models/DebugInfo", "model/models/Items", "model/models/items/Bucket", "model/models/Manifest", "model/models/ProfileBatch", "ui/FocusManager", "ui/LoadingManager", "utility/Arrays", "utility/decorator/Bound", "utility/EventManager", "utility/Objects", "utility/Time"], function (require, exports, Model_12, Characters_3, DebugInfo_1, Items_1, Bucket_3, Manifest_12, ProfileBatch_5, FocusManager_1, LoadingManager_1, Arrays_4, Bound_12, EventManager_16, Objects_4, Time_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Model_12.default.event.subscribe("clearCache", () => {
        Inventory["INSTANCE"]?.event.emit("dispose");
        clearInterval(Inventory["INSTANCE"]?.["interval"]);
        delete Inventory["INSTANCE"];
    });
    class Inventory {
        static createModel() {
            return Model_12.default.createTemporary(api => Inventory.await(api));
        }
        static get() {
            return Inventory.INSTANCE ??= new Inventory();
        }
        static async await(api) {
            const inventory = Inventory.get();
            if (!inventory.loaded)
                await inventory.await(api);
            return inventory;
        }
        constructor() {
            this.event = new EventManager_16.EventManager(this);
            this.craftedItems = new Set();
            this.loaded = false;
            Object.assign(window, { inventory: this });
            const disposed = this.event.waitFor("dispose");
            Items_1.default.event.until(disposed, event => event
                .subscribe("loading", () => LoadingManager_1.default.start("inventory"))
                .subscribe("loaded", async ({ value }) => {
                this.profile = await ProfileBatch_5.default.await();
                this.updateItems(value);
            }));
            Characters_3.default.event.until(disposed, event => event
                // don't emit update separately for profile characters, that can be delayed to whenever the next item update is
                .subscribe("loaded", ({ characters, sorted }) => {
                for (const item of Object.values(this.items ?? {}))
                    item["_owner"] = sorted[0].characterId;
                for (const character of sorted)
                    for (const loadout of character.loadouts)
                        loadout.setInventory(this);
            }));
            if (FocusManager_1.default.focused)
                this.onPageFocusChange(FocusManager_1.default);
            FocusManager_1.default.event.until(disposed, event => event
                .subscribe("changeFocusState", this.onPageFocusChange));
        }
        get currentCharacter() {
            return Characters_3.default.getCurrent();
        }
        hasBucket(bucketHash, characterId) {
            return !!this.buckets?.[Bucket_3.Bucket.id(bucketHash, characterId)];
        }
        getBucket(bucketHash, characterId) {
            return this.buckets?.[Bucket_3.Bucket.id(bucketHash, characterId)];
        }
        getBucketsOfType(bucketHash) {
            return Object.values(this.buckets ?? Objects_4.default.EMPTY)
                .filter(bucket => bucket?.hash === bucketHash);
        }
        getCharacterBuckets(characterId) {
            return Object.values(this.buckets ?? Objects_4.default.EMPTY)
                .filter(bucket => bucket?.characterId === characterId);
        }
        getCharacter(id) {
            return Characters_3.default.getOrCurrent(id);
        }
        setShouldSkipCharacters(shouldSkip) {
            this.shouldSkipCharacters = shouldSkip;
            return this;
        }
        async await(progress) {
            if (this.shouldSkipCharacters?.() ?? false)
                return this;
            progress?.subscribeProgress(Manifest_12.default, 1 / 3);
            await Manifest_12.default.await();
            progress?.emitProgress(2 / 3, "Loading items");
            progress?.subscribeProgress(Items_1.default, 1 / 3, 2 / 3);
            const itemsLoadedPromise = Items_1.default.await();
            if (!this.buckets)
                await itemsLoadedPromise;
            progress?.emitProgress(3 / 3);
            this.loaded = true;
            return this;
        }
        updateItems(buckets) {
            this.craftedItems.clear(); // crafted items will be re-initialised through updateItem
            this.items ??= {};
            this.buckets = buckets;
            const iterableBuckets = Object.values(this.buckets);
            for (const bucket of iterableBuckets)
                if (!bucket.deepsight)
                    for (const item of [...bucket.items])
                        this.updateItem(bucket, item);
            DebugInfo_1.default.updateBuckets(buckets);
            for (const bucket of iterableBuckets) {
                if (!bucket.characterId || bucket.deepsight)
                    continue;
                const equipped = {};
                for (const item of bucket.items) {
                    if (!item.equipped)
                        continue;
                    const bucketHash = item.definition.inventory?.bucketTypeHash;
                    if (!equipped[bucketHash]) {
                        equipped[bucketHash] = item;
                        continue;
                    }
                    console.warn(`Multiple items equipped in ${bucket.name}:`, item, equipped[bucketHash]);
                }
            }
            this.event.emit("update");
            LoadingManager_1.default.end("inventory");
        }
        updateItem(newBucket, item) {
            const items = this.items;
            const oldItem = items[item.id];
            // use old item if it exists
            item = items[item.id] = oldItem?.update(item) ?? item;
            item.inventory = this;
            item["_owner"] = this.currentCharacter.characterId;
            if (item.shaped)
                this.craftedItems.add(item.definition.hash);
            item.event.subscribe("bucketChange", this.onItemBucketChange);
        }
        onItemBucketChange({ item, oldBucket, equipped }) {
            const bucket = item.bucket;
            // and on its bucket changing, remove it from its old bucket and put it in its new one
            Arrays_4.default.remove(oldBucket.items, item);
            bucket.items.push(item);
            // if this item is equipped now, make the previously equipped item not equipped
            if (equipped)
                for (const potentiallyEquippedItem of bucket.items)
                    if (potentiallyEquippedItem.equipped && potentiallyEquippedItem !== item)
                        // only visually unequip items if they're in the same slot
                        if (potentiallyEquippedItem.definition.equippingBlock?.equipmentSlotTypeHash === item.definition.equippingBlock?.equipmentSlotTypeHash)
                            delete potentiallyEquippedItem.equipped;
            // inform listeners of inventory changes that an item has updated
            this.event.emit("itemUpdate");
        }
        onPageFocusChange({ focused }) {
            if (focused)
                void this.await();
            clearInterval(this.interval);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            this.interval = window.setInterval(this.await, focused ? Time_5.default.seconds(5) : Time_5.default.minutes(2));
        }
    }
    exports.default = Inventory;
    __decorate([
        Bound_12.default
    ], Inventory.prototype, "await", null);
    __decorate([
        Bound_12.default
    ], Inventory.prototype, "onItemBucketChange", null);
    __decorate([
        Bound_12.default
    ], Inventory.prototype, "onPageFocusChange", null);
});
define("model/models/Loadouts", ["require", "exports", "utility/decorator/Bound"], function (require, exports, Bound_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Loadout = void 0;
    class Loadout {
        get inventory() {
            return this.inventoryRef?.deref();
        }
        constructor(loadout) {
            this.items = [];
            Object.assign(this, loadout);
        }
        setInventory(inventory) {
            this.inventoryRef?.deref()?.event.unsubscribe("update", this.onInventoryUpdate);
            this.inventoryRef = new WeakRef(inventory);
            inventory.event.subscribe("update", this.onInventoryUpdate);
            this.onInventoryUpdate();
        }
        onInventoryUpdate() {
            for (const component of this.items) {
                component.item = this.inventory?.items?.[component.itemInstanceId];
            }
            // console.log("Updated loadout", this);
        }
    }
    exports.Loadout = Loadout;
    __decorate([
        Bound_13.default
    ], Loadout.prototype, "onInventoryUpdate", null);
    var Loadouts;
    (function (Loadouts) {
        function apply(character, profile) {
            character.loadouts = (profile.characterLoadouts?.data?.[character.characterId]?.loadouts ?? [])
                .map(loadout => new Loadout(loadout));
        }
        Loadouts.apply = apply;
    })(Loadouts || (Loadouts = {}));
    exports.default = Loadouts;
});
define("model/models/Characters", ["require", "exports", "model/models/Loadouts", "model/models/Manifest", "model/models/Memberships", "model/models/ProfileBatch", "utility/EventManager", "utility/Objects"], function (require, exports, Loadouts_1, Manifest_13, Memberships_6, ProfileBatch_6, EventManager_17, Objects_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCurrentMembershipAndCharacter = exports.Character = exports.CLASSES = void 0;
    exports.CLASSES = {
        [3 /* DestinyClass.Unknown */]: undefined,
        [1 /* DestinyClass.Hunter */]: 2996146975 /* StatHashes.Mobility */,
        [0 /* DestinyClass.Titan */]: 392767087 /* StatHashes.Resilience */,
        [2 /* DestinyClass.Warlock */]: 1943323491 /* StatHashes.Recovery */,
    };
    class Character {
        static async get(characterComponent, manifest, profile) {
            const character = new Character();
            Object.assign(character, characterComponent);
            const { DestinyClassDefinition, DestinyInventoryItemDefinition, DestinyStatDefinition } = manifest;
            character.class = await DestinyClassDefinition.get(character.classHash);
            character.emblem = await DestinyInventoryItemDefinition.get(character.emblemHash);
            character.power = (character.light ?? 0) - (profile.profileProgression?.data?.seasonalArtifact.powerBonus ?? 0);
            Loadouts_1.default.apply(character, profile);
            character.stat = await DestinyStatDefinition.get(exports.CLASSES[character.classType]);
            return character;
        }
    }
    exports.Character = Character;
    let characters = {};
    let charactersSorted = [];
    ProfileBatch_6.default.event.subscribe("loaded", async ({ value: profile }) => {
        const manifest = await Manifest_13.default.await();
        characters = await Objects_5.default.mapAsync(profile.characters?.data ?? {}, async ([key, character]) => [key, await Character.get(character, manifest, profile)]);
        charactersSorted = Object.values(characters)
            .sort(({ dateLastPlayed: dateLastPlayedA }, { dateLastPlayed: dateLastPlayedB }) => new Date(dateLastPlayedB).getTime() - new Date(dateLastPlayedA).getTime());
        Characters.event.emit("loaded", { characters, sorted: charactersSorted });
    });
    var Characters;
    (function (Characters) {
        Characters.event = new EventManager_17.EventManager({});
        /**
         * @returns Whether deepsight.gg has any characters available
         */
        function hasAny() {
            return !!charactersSorted.length;
        }
        Characters.hasAny = hasAny;
        /**
         * @returns A record of character IDs to Character class
         */
        function all() {
            return characters;
        }
        Characters.all = all;
        /**
         * @returns The Character class of a given character ID, if available
         */
        function get(id) {
            return characters[id];
        }
        Characters.get = get;
        /**
         * @returns Character classes sorted most recently active first
         */
        function getSorted() {
            return charactersSorted;
        }
        Characters.getSorted = getSorted;
        /**
         * @returns Distinct character class types sorted most recently active first
         */
        function getSortedClasses() {
            return getSorted()
                .map(character => character.classType)
                .distinct();
        }
        Characters.getSortedClasses = getSortedClasses;
        /**
         * @returns The most recently active character
         */
        function getCurrent() {
            return charactersSorted[0];
        }
        Characters.getCurrent = getCurrent;
        /**
         * @returns The Character class of a given character ID, if available. Otherwise, the most recently active character
         */
        function getOrCurrent(id) {
            return characters?.[id] ?? charactersSorted[0];
        }
        Characters.getOrCurrent = getOrCurrent;
    })(Characters || (Characters = {}));
    exports.default = Characters;
    async function getCurrentMembershipAndCharacter(api, amount, from) {
        const progress = (amount ?? 1) * (1 / 2);
        const membership = await (0, Memberships_6.getCurrentDestinyMembership)(api, progress, from);
        if (!membership)
            return undefined;
        const profile = await (api?.subscribeProgressAndWait(ProfileBatch_6.default, progress, (from ?? 0) + progress) ?? ProfileBatch_6.default.await());
        return {
            ...membership,
            characterId: !profile.characters?.data ? undefined : Object.keys(profile.characters?.data ?? Objects_5.default.EMPTY)[0],
        };
    }
    exports.getCurrentMembershipAndCharacter = getCurrentMembershipAndCharacter;
});
define("ui/form/ClassPicker", ["require", "exports", "ui/Component", "ui/form/Button"], function (require, exports, Component_33, Button_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClassPickerButton = exports.ClassPickerClasses = void 0;
    var ClassPickerClasses;
    (function (ClassPickerClasses) {
        ClassPickerClasses["Main"] = "class-picker";
        ClassPickerClasses["Button"] = "class-picker-button";
        ClassPickerClasses["ButtonPreview"] = "class-picker-button-preview";
        ClassPickerClasses["ButtonCurrent"] = "class-picker-button-current";
        ClassPickerClasses["OptionsWrapper"] = "class-picker-button-wrapper";
        ClassPickerClasses["OptionsWrapper2"] = "class-picker-button-wrapper-2";
        ClassPickerClasses["OptionsWrapper3"] = "class-picker-button-wrapper-3";
        ClassPickerClasses["OptionsWrapper4"] = "class-picker-button-wrapper-4";
        ClassPickerClasses["OptionsWrapper9"] = "class-picker-button-wrapper-9";
        ClassPickerClasses["OptionsWrapperBorders1"] = "class-picker-button-wrapper-borders1";
        ClassPickerClasses["OptionsWrapperBorders2"] = "class-picker-button-wrapper-borders2";
    })(ClassPickerClasses || (exports.ClassPickerClasses = ClassPickerClasses = {}));
    class ClassPicker extends Component_33.default {
        onMake(switchHandler) {
            this.classes.add(ClassPickerClasses.Main);
            this.switchHandler = switchHandler;
            this.options = [];
            this.currentButton = ClassPickerButton.create()
                .classes.add(ClassPickerClasses.ButtonCurrent)
                .appendTo(this);
            this.optionsWrapper = Component_33.default.create()
                .classes.add(ClassPickerClasses.OptionsWrapper)
                .appendTo(this);
            this.optionsWrapperBorders1 = Component_33.default.create()
                .classes.add(ClassPickerClasses.OptionsWrapperBorders1)
                .appendTo(this.optionsWrapper);
            this.optionsWrapperBorders2 = Component_33.default.create()
                .classes.add(ClassPickerClasses.OptionsWrapperBorders2)
                .appendTo(this.optionsWrapper);
        }
        addOption(option) {
            const existingOption = this.options.find(existing => existing.id === option.id);
            if (existingOption) {
                // already has this option
                existingOption.background = option.background;
                existingOption.icon = option.icon;
                existingOption.button?.setDefinition(option);
                existingOption.item = option.item;
                if (this.currentOption === option.id)
                    this.currentButton.setDefinition(option);
                return this;
            }
            this.options.push(option);
            const button = option.button = ClassPickerButton.create()
                .setDefinition(option)
                .event.subscribe("click", async () => {
                const option = this.options.find(option => option.button === button);
                if (!option) {
                    console.error("Button not assigned to valid option:", button);
                    return;
                }
                await this.switchHandler?.(option.id);
                await this.setCurrent(option.id);
            })
                .appendTo(this.optionsWrapper);
            this.updateOptionsWrapper();
            return this;
        }
        removeOption(id) {
            const index = this.options.findIndex(existing => existing.id === id);
            if (index === -1)
                return;
            const option = this.options[index];
            option.button?.remove();
            this.options.splice(index, 1);
            this.updateOptionsWrapper();
            return this;
        }
        getCurrentOptionDefinition() {
            return this.options.find(option => option.id === this.currentOption);
        }
        updateOptionsWrapper() {
            this.optionsWrapper.classes.remove(ClassPickerClasses.OptionsWrapper2, ClassPickerClasses.OptionsWrapper3, ClassPickerClasses.OptionsWrapper4, ClassPickerClasses.OptionsWrapper9);
            const count = this.optionsWrapper.element.childElementCount - 2;
            if (count > 1)
                this.optionsWrapper.classes.add(ClassPickerClasses[`OptionsWrapper${count > 4 ? 9 : count}`]);
            this.optionsWrapperBorders1.appendTo(this.optionsWrapper);
            this.optionsWrapperBorders2.appendTo(this.optionsWrapper);
        }
        async setCurrent(id, initial = false) {
            while (this.settingCurrent)
                await this.settingCurrent;
            if (id === this.currentOption)
                return;
            const chosenOption = this.options.find(option => option.id === id);
            if (!chosenOption?.button) {
                console.error(`Tried to change to option '${id}' that doesn't exist`);
                return;
            }
            const currentOption = this.getCurrentOptionDefinition();
            if (!currentOption || initial) {
                this.currentOption = id;
                this.currentButton.setDefinition(chosenOption);
                if (!currentOption) {
                    chosenOption.button.remove();
                    delete chosenOption.button;
                    this.updateOptionsWrapper();
                }
                else {
                    chosenOption.button.setDefinition(currentOption);
                    currentOption.button = chosenOption.button;
                    delete chosenOption.button;
                }
            }
            else {
                await (this.settingCurrent = Button_5.default.animateWipeMultiple([this.currentButton, chosenOption.button], async () => {
                    this.currentOption = id;
                    const button = chosenOption.button;
                    this.currentButton.setDefinition(chosenOption);
                    chosenOption.button.setDefinition(currentOption);
                    currentOption.button = chosenOption.button;
                    delete chosenOption.button;
                    let promise;
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises
                    this.event.emit("selectClass", { option: id, button: button, item: chosenOption.item, setPromise: set => promise = set });
                    await promise;
                }));
            }
            delete this.settingCurrent;
        }
    }
    exports.default = ClassPicker;
    class ClassPickerButton extends Button_5.default {
        onMake() {
            super.onMake();
            this.classes.add(ClassPickerClasses.Button);
            Component_33.default.create()
                .classes.add(ClassPickerClasses.ButtonPreview)
                .appendTo(this);
        }
        setDefinition(definition) {
            if (!definition) {
                this.style.remove("--background");
                this.innerIcon?.remove();
            }
            else {
                if (definition.background)
                    this.style.set("--background", `url("${definition.background}")`);
                else
                    this.style.remove("--background");
                if (definition.icon)
                    this.addIcon(icon => icon.style.set("--icon", `url("${definition.icon}")`));
                else
                    this.innerIcon?.remove();
            }
            definition?.initialise?.(this);
            this.definition = definition;
            return this;
        }
    }
    exports.ClassPickerButton = ClassPickerButton;
});
define("ui/InfoBlock", ["require", "exports", "ui/Component"], function (require, exports, Component_34) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InfoBlockClasses = void 0;
    var InfoBlockClasses;
    (function (InfoBlockClasses) {
        InfoBlockClasses["Main"] = "info-block";
        InfoBlockClasses["Borders2"] = "info-block-borders2";
    })(InfoBlockClasses || (exports.InfoBlockClasses = InfoBlockClasses = {}));
    class InfoBlock extends Component_34.default {
        onMake() {
            this.classes.add(InfoBlockClasses.Main);
            Component_34.default.create()
                .classes.add(InfoBlockClasses.Borders2)
                .appendTo(this);
        }
    }
    exports.default = InfoBlock;
});
define("ui/inventory/ItemSubclassTooltip", ["require", "exports", "model/models/enum/DamageTypes", "ui/bungie/DisplayProperties", "ui/bungie/LoadedIcon", "ui/Classes", "ui/Component", "ui/TooltipManager"], function (require, exports, DamageTypes_3, DisplayProperties_10, LoadedIcon_3, Classes_9, Component_35, TooltipManager_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemSubclassTooltipClasses;
    (function (ItemSubclassTooltipClasses) {
        ItemSubclassTooltipClasses["Main"] = "item-subclass-tooltip";
        ItemSubclassTooltipClasses["Header"] = "item-subclass-tooltip-header";
        ItemSubclassTooltipClasses["DamageTypeIcon"] = "item-subclass-tooltip-damage-type-icon";
        ItemSubclassTooltipClasses["IsDamageType"] = "item-subclass-tooltip--damage-type";
        ItemSubclassTooltipClasses["Title"] = "item-subclass-tooltip-title";
        ItemSubclassTooltipClasses["Subtitle"] = "item-subclass-tooltip-subtitle";
        ItemSubclassTooltipClasses["Content"] = "item-subclass-tooltip-content";
        ItemSubclassTooltipClasses["Super"] = "item-subclass-tooltip-super";
        ItemSubclassTooltipClasses["SuperImage"] = "item-subclass-tooltip-super-image";
        ItemSubclassTooltipClasses["SuperName"] = "item-subclass-tooltip-super-name";
        ItemSubclassTooltipClasses["Flavour"] = "item-subclass-tooltip-flavour";
    })(ItemSubclassTooltipClasses || (ItemSubclassTooltipClasses = {}));
    class ItemSubclassTooltip extends TooltipManager_2.Tooltip {
        onMake() {
            this.classes.add(ItemSubclassTooltipClasses.Main);
            this.header.classes.add(ItemSubclassTooltipClasses.Header);
            this.title.classes.add(ItemSubclassTooltipClasses.Title);
            this.subtitle.classes.add(ItemSubclassTooltipClasses.Subtitle);
            this.content.classes.add(ItemSubclassTooltipClasses.Content);
            this.damageTypeIcon = Component_35.default.create()
                .classes.add(ItemSubclassTooltipClasses.DamageTypeIcon)
                .prependTo(this.header);
            this.superWrapper = Component_35.default.create()
                .classes.add(ItemSubclassTooltipClasses.Super)
                .appendTo(this.content);
            this.superImage = LoadedIcon_3.default.create([])
                .classes.add(ItemSubclassTooltipClasses.SuperImage)
                .appendTo(this.superWrapper);
            this.superName = Component_35.default.create()
                .classes.add(ItemSubclassTooltipClasses.SuperName)
                .appendTo(this.superWrapper);
            this.flavour = Component_35.default.create()
                .classes.add(ItemSubclassTooltipClasses.Flavour)
                .appendTo(this.content);
        }
        set(item) {
            this.item = item;
            console.log(DisplayProperties_10.default.name(item.definition), item);
            this.classes.removeWhere(cls => cls.startsWith(ItemSubclassTooltipClasses.IsDamageType))
                .classes.add(`${ItemSubclassTooltipClasses.IsDamageType}-${DamageTypes_3.default.nameOf(item.getDamageType())}`);
            const damageType = DamageTypes_3.default.get(item.getDamageType());
            this.damageTypeIcon.classes.toggle(!damageType?.displayProperties.icon, Classes_9.Classes.Hidden)
                .style.set("--icon", DisplayProperties_10.default.icon(damageType));
            this.title.text.set(DisplayProperties_10.default.name(item.definition));
            this.subtitle.text.set(item.definition.itemTypeDisplayName);
            const superAbility = item.getSocketedPlug("=Subclass/Super");
            const superName = DisplayProperties_10.default.name(superAbility?.definition);
            this.superWrapper.classes.toggle(!superName, Classes_9.Classes.Hidden);
            if (superName) {
                this.superName.text.set(superName);
                const highResIcon = superAbility?.definition?.displayProperties.highResIcon;
                this.superImage.classes.toggle(!highResIcon, Classes_9.Classes.Hidden)
                    .setPath(highResIcon && `https://www.bungie.net${highResIcon}`);
            }
            this.flavour.text.set(item.definition.flavorText);
        }
    }
    exports.default = TooltipManager_2.default.create(tooltip => tooltip
        .make(ItemSubclassTooltip));
});
define("ui/inventory/playeroverview/StatsOverview", ["require", "exports", "model/models/enum/DamageTypes", "ui/inventory/Stat", "ui/inventory/tooltip/ItemStat", "utility/maths/Maths"], function (require, exports, DamageTypes_4, Stat_6, ItemStat_2, Maths_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.StatsOverviewClasses = void 0;
    var StatsOverviewClasses;
    (function (StatsOverviewClasses) {
        StatsOverviewClasses["Main"] = "stats-overview";
        StatsOverviewClasses["IsDamageType"] = "stats-overview--damage-type";
        StatsOverviewClasses["Wrapper"] = "stats-overview-wrapper";
    })(StatsOverviewClasses || (exports.StatsOverviewClasses = StatsOverviewClasses = {}));
    class StatsOverview extends ItemStat_2.default.Wrapper {
        onMake() {
            super.onMake();
            this.classes.add(StatsOverviewClasses.Main);
        }
        set(character, buckets) {
            const equippedItems = buckets.map(bucket => bucket.equippedItem)
                .filter(item => item?.isArmour() || item?.definition.itemCategoryHashes?.includes(50 /* ItemCategoryHashes.Subclasses */));
            const subclass = equippedItems.find(item => item?.definition.itemCategoryHashes?.includes(50 /* ItemCategoryHashes.Subclasses */));
            this.classes.removeWhere(cls => cls.startsWith(StatsOverviewClasses.IsDamageType))
                .classes.add(`${StatsOverviewClasses.IsDamageType}-${DamageTypes_4.default.nameOf(subclass?.getDamageType())}`);
            const displays = [];
            for (const group of Stat_6.ARMOUR_STAT_GROUPS) {
                for (const hash of group) {
                    let statInstance;
                    const statValues = {
                        value: 0,
                        mod: 0,
                        intrinsic: 0,
                        masterwork: 0,
                        roll: 0,
                        subclass: 0,
                        charge: 0,
                    };
                    for (const item of equippedItems) {
                        const stat = item?.stats?.values[hash];
                        let value = stat?.value ?? 0;
                        statValues.mod += stat?.mod ?? 0;
                        statValues.intrinsic += stat?.intrinsic ?? 0;
                        statValues.masterwork += stat?.masterwork ?? 0;
                        statValues.roll += stat?.roll ?? 0;
                        statValues.charge += stat?.charge ?? 0;
                        statInstance ??= stat;
                        if (item?.definition.itemCategoryHashes?.includes(50 /* ItemCategoryHashes.Subclasses */)) {
                            value = 0;
                            statValues.subclass += item.getSocketedPlugs("Subclass/Fragment")
                                .map(fragment => {
                                const isClassStat = fragment.getCategorisationAs(4 /* DeepsightPlugCategory.Subclass */)?.affectsClassStat;
                                if (isClassStat && character.stat?.hash !== hash)
                                    return 0;
                                return fragment.definition?.investmentStats?.find(stat => stat.statTypeHash === hash)?.value ?? 0;
                            })
                                .splat(Maths_4.default.sum);
                        }
                        statValues.value += value;
                    }
                    if (!statInstance?.definition) {
                        console.warn(`No equipped items have stat ${hash}`);
                        continue;
                    }
                    statValues.value += statValues.subclass;
                    displays.push({
                        ...statInstance,
                        ...statValues,
                        override: {
                            max: 100,
                            group: undefined,
                            plus: undefined,
                            chunked: true,
                        },
                    });
                }
            }
            displays.push({
                hash: ItemStat_2.CustomStat.Tiers,
                order: 1002,
                name: "Tiers",
                calculate: (stat, stats, item) => {
                    const armourStats = Stat_6.ARMOUR_STAT_GROUPS.flat();
                    stats = stats.filter(stat => armourStats.includes(stat.hash));
                    const tiers = stats.map(stat => Math.floor((stat.value ?? 0) / 10)).splat(Maths_4.default.sum);
                    const chargeTiers = stats.map(stat => Math.floor((stat.charge ?? 0) / 10)).splat(Maths_4.default.sum);
                    return {
                        value: tiers + chargeTiers,
                        intrinsic: tiers,
                        charge: chargeTiers,
                    };
                },
            });
            this.setStats(displays);
        }
    }
    exports.default = StatsOverview;
});
define("utility/Functions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Functions;
    (function (Functions) {
        function resolve(fn, ...args) {
            return typeof fn === "function" ? fn(...args) : fn;
        }
        Functions.resolve = resolve;
    })(Functions || (Functions = {}));
    exports.default = Functions;
});
define("ui/BackgroundManager", ["require", "exports", "ui/Classes", "ui/Component", "utility/Arrays", "utility/Functions", "utility/Store", "utility/decorator/Bound"], function (require, exports, Classes_10, Component_36, Arrays_5, Functions_1, Store_11, Bound_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BackgroundClasses;
    (function (BackgroundClasses) {
        BackgroundClasses["Surface"] = "background-surface";
        BackgroundClasses["Blur"] = "background-surface-blur";
        BackgroundClasses["Darkened"] = "background-surface--darkened";
        BackgroundClasses["Image"] = "background-image";
    })(BackgroundClasses || (BackgroundClasses = {}));
    class Background extends Component_36.default {
        static initialiseMain() {
            const manager = this.main ??= Background.create([() => Store_11.default.items.settingsBackground])
                .setBlurred(() => Store_11.default.items.settingsBackgroundBlur)
                .appendTo(document.body);
            Store_11.default.event.subscribe("setSettingsBackground", manager.updateBackground);
            Store_11.default.event.subscribe("deleteSettingsBackground", manager.updateBackground);
            Store_11.default.event.subscribe("setSettingsBackgroundBlur", manager.updateBackgroundBlur);
            Store_11.default.event.subscribe("setSettingsBackgroundFollowMouse", manager.updateBackgroundFollowMouse);
        }
        static getScrollAmount() {
            return Store_11.default.items.settingsBackgroundFollowMouse ? 0.05 : 0;
        }
        onMake(path) {
            this.path = path;
            this.classes.add(BackgroundClasses.Surface);
            this.darkened = true;
            this.updateBackground();
            this.updateBackgroundBlur();
            this.updateBackgroundDarkened();
            this.updateBackgroundFollowMouse();
            document.body.addEventListener("mousemove", event => {
                this.element.scrollLeft = (event.clientX / window.innerWidth) * window.innerWidth * Background.getScrollAmount();
                this.element.scrollTop = (event.clientY / window.innerHeight) * window.innerHeight * Background.getScrollAmount();
            });
        }
        setPath(path) {
            this.path = path;
            this.updateBackground();
            return this;
        }
        setBlurred(blurred) {
            this.blurred = blurred;
            this.updateBackgroundBlur();
            return this;
        }
        setDarkened(darkened) {
            this.darkened = darkened;
            this.updateBackgroundDarkened();
            return this;
        }
        updateBackground() {
            const background = Arrays_5.default.resolve(Functions_1.default.resolve(this.path));
            this.removeContents();
            if (background.length) {
                this.classes.add(Classes_10.Classes.Hidden);
                let loaded = 0;
                for (let i = 0; i < background.length; i++) {
                    Component_36.default.create("img")
                        .classes.add(BackgroundClasses.Image, `${BackgroundClasses.Image}-${i}`)
                        .attributes.set("src", background[i])
                        .event.subscribe("load", () => {
                        loaded++;
                        if (loaded >= background.length)
                            this.classes.remove(Classes_10.Classes.Hidden);
                    })
                        .appendTo(this);
                }
            }
        }
        updateBackgroundBlur() {
            this.classes.toggle(!!Functions_1.default.resolve(this.blurred), BackgroundClasses.Blur);
        }
        updateBackgroundDarkened() {
            this.classes.toggle(!!Functions_1.default.resolve(this.darkened), BackgroundClasses.Darkened);
        }
        updateBackgroundFollowMouse() {
            this.style.set("--scroll-amount", `${Background.getScrollAmount()}`);
        }
    }
    exports.default = Background;
    __decorate([
        Bound_14.default
    ], Background.prototype, "updateBackground", null);
    __decorate([
        Bound_14.default
    ], Background.prototype, "updateBackgroundBlur", null);
    __decorate([
        Bound_14.default
    ], Background.prototype, "updateBackgroundDarkened", null);
    __decorate([
        Bound_14.default
    ], Background.prototype, "updateBackgroundFollowMouse", null);
});
define("ui/View", ["require", "exports", "model/models/enum/EnumModel", "ui/BackgroundManager", "ui/Classes", "ui/Component", "ui/Loadable", "utility/EventManager"], function (require, exports, EnumModel_7, BackgroundManager_1, Classes_11, Component_37, Loadable_3, EventManager_18) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var View;
    (function (View) {
        class Factory {
            constructor() {
                this.otherModels = [];
                this.initialisers = [];
                this.definition = [];
            }
            using(...models) {
                this.otherModels.push(...models);
                return this;
            }
            initialise(initialiser) {
                this.initialisers.push(initialiser);
                return this;
            }
            wrapper() {
                return this;
            }
            define() {
                return this;
            }
            helper(helper) {
                Object.assign(this, helper);
                return this;
            }
            configure(definition) {
                this.definition.push(definition);
                return this;
            }
            clone() {
                const clone = Object.assign(new Factory(), this);
                this.definition = this.definition.slice();
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                this.otherModels = [...this.otherModels];
                this.initialisers = [...this.initialisers];
                return clone;
            }
            create(definition) {
                for (let i = this.definition.length - 1; i >= 0; i--) {
                    const currentDef = this.definition[i];
                    definition = typeof currentDef === "function" ? { ...currentDef(definition), ...definition } : { ...currentDef, ...definition };
                }
                return new Handler({
                    ...definition,
                    models: this.otherModels,
                    initialise: async (component, ...requirements) => {
                        await EnumModel_7.default.awaitAll();
                        for (const initialiser of [...this.initialisers, definition.initialise]) {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                            await initialiser?.(component, ...requirements);
                        }
                    },
                });
            }
        }
        View.Factory = Factory;
        function create(definition) {
            return new Handler(definition);
        }
        View.create = create;
        class Handler {
            constructor(definition) {
                Object.assign(this, definition);
            }
            get definition() {
                return this;
            }
            show(...args) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const view = WrapperComponent.create([this, ...args]);
                View.event.emit("show", { view });
            }
            hide() {
                View.event.emit("hide");
            }
        }
        View.Handler = Handler;
        View.event = EventManager_18.EventManager.make();
        let Classes;
        (function (Classes) {
            Classes["Main"] = "view";
            Classes["Content"] = "view-content";
            Classes["Header"] = "view-header";
            Classes["Footer"] = "view-footer";
            Classes["FooterButton"] = "view-footer-button";
            Classes["FooterButtonIcon"] = "view-footer-button-icon";
            Classes["FooterButtonLabel"] = "view-footer-button-label";
            Classes["FooterButtonText"] = "view-footer-button-text";
            Classes["Hidden"] = "view-hidden";
            Classes["Loadable"] = "view-loadable";
            Classes["Title"] = "view-title";
            Classes["Subtitle"] = "view-subtitle";
            Classes["Subview"] = "view-subview";
            Classes["Background"] = "view-background";
        })(Classes = View.Classes || (View.Classes = {}));
        class ContentComponent extends Component_37.default {
            onMake(definition) {
                this.definition = definition;
                this.header = Component_37.default.create()
                    .classes.add(Classes.Header, Classes.Header.replace("-", `-${this.definition.id}-`), Classes_11.Classes.Hidden)
                    .appendTo(this);
                this.title = Component_37.default.create()
                    .classes.add(Classes.Title, Classes.Title.replace("-", `-${this.definition.id}-`), Classes_11.Classes.Hidden)
                    .appendTo(this.header);
                this.subtitle = Component_37.default.create()
                    .classes.add(Classes.Subtitle, Classes.Subtitle.replace("-", `-${this.definition.id}-`), Classes_11.Classes.Hidden)
                    .appendTo(this.header);
                this.classes.add(Classes.Content, `view-${this.definition.id}-content`);
            }
        }
        View.ContentComponent = ContentComponent;
        class WrapperComponent extends Component_37.default {
            get header() { return this.content.header; }
            get title() { return this.content.title; }
            get subtitle() { return this.content.subtitle; }
            get footer() {
                Object.defineProperty(this, "footer", { value: this._footer });
                return this._footer.classes.remove(Classes_11.Classes.Hidden);
            }
            setBackground(...src) {
                this.background?.remove();
                return this.background = BackgroundManager_1.default.create([src])
                    .prependTo(this);
            }
            get hash() {
                let hash = this.definition.hash;
                if (typeof hash === "string" || hash === null)
                    return hash;
                if (typeof hash === "function")
                    hash = hash?.(...this._args.slice(1));
                return hash ?? this.definition.id;
            }
            onMake(definition, ...args) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this._args = [definition, ...args];
                this.definition = definition;
                this.classes.add(Classes.Main, `view-${this.definition.id}`);
                this.style.set("--index", `${WrapperComponent.index++}`);
                this._footer = Component_37.default.create()
                    .classes.add(Classes.Footer, Classes.Footer.replace("-", `-${this.definition.id}-`), Classes_11.Classes.Hidden)
                    .appendTo(this);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
                this.content = ContentComponent.create([definition])
                    .classes.add(Classes.Content.replace("-", `-${this.definition.id}-`))
                    .appendTo(this);
                if (!this.definition.models) {
                    this.initialise(...[]);
                    return;
                }
                let models = this.definition.models;
                if (typeof models === "function")
                    models = models(...args);
                Loadable_3.default.create(...models)
                    .onReady((...results) => this.initialise?.(...results))
                    .classes.add(Classes.Loadable)
                    .appendTo(this);
            }
            setTitle(tweak) {
                this.content.header.classes.remove(Classes_11.Classes.Hidden);
                this.content.title.classes.remove(Classes_11.Classes.Hidden).tweak(tweak);
                this.event.emit("updateTitle");
                return this;
            }
            setSubtitle(type, tweak) {
                this.content.header.classes.remove(Classes_11.Classes.Hidden);
                this.content.subtitle.classes.add(`${Classes.Subtitle}-${type}`).classes.remove(Classes_11.Classes.Hidden).tweak(tweak);
                return this;
            }
            updateHash(...args) {
                const realArgs = this._args;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this._args = [realArgs[0], ...args];
                this.event.emit("updateHash", { args });
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                this._args = realArgs;
                return this;
            }
            initialise(...args) {
                this.definition.initialise?.(this, ...args);
                this.event.emit("initialise");
                return this.content;
            }
            back() {
                this.event.emit("back");
            }
        }
        WrapperComponent.index = 0;
        View.WrapperComponent = WrapperComponent;
    })(View || (View = {}));
    exports.default = View;
});
define("ui/inventory/DraggableItemComponent", ["require", "exports", "ui/form/Draggable", "ui/inventory/ItemComponent"], function (require, exports, Draggable_2, ItemComponent_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DraggableItemClasses = void 0;
    var DraggableItemClasses;
    (function (DraggableItemClasses) {
        DraggableItemClasses["Moving"] = "item-moving";
        DraggableItemClasses["Placeholder"] = "item-moving-placeholder";
    })(DraggableItemClasses || (exports.DraggableItemClasses = DraggableItemClasses = {}));
    class DraggableItem extends ItemComponent_2.default {
        async onMake(item, inventory, handler) {
            await super.onMake(item, inventory, handler);
            new Draggable_2.default(this.element);
            let movingPlaceholder;
            this.event.subscribe("moveStart", event => {
                handler.moveStart(event);
                if (event.defaultPrevented)
                    return;
                this.classes.add(DraggableItemClasses.Moving);
                movingPlaceholder = ItemComponent_2.default.create([item, inventory])
                    .classes.add(DraggableItemClasses.Placeholder)
                    .setTooltipPadding(20);
                handler.createItemPlaceholder(movingPlaceholder);
            });
            this.event.subscribe("move", event => {
                movingPlaceholder?.style.set("--transform", `translate(${event.mouse.x}px, ${event.mouse.y}px)`);
                handler.move(event);
            });
            this.event.subscribe("moveEnd", event => {
                if (movingPlaceholder) {
                    movingPlaceholder.event.emit("mouseout", new MouseEvent("mouseout"));
                    movingPlaceholder.remove();
                    handler.disposeItemPlaceholder(movingPlaceholder);
                }
                this.classes.remove(DraggableItemClasses.Moving);
                handler.moveEnd(event);
            });
        }
    }
    exports.default = DraggableItem;
});
define("ui/Card", ["require", "exports", "ui/Component"], function (require, exports, Component_38) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CardClasses = void 0;
    var CardClasses;
    (function (CardClasses) {
        CardClasses["Main"] = "card";
        CardClasses["Header"] = "card-header";
        CardClasses["Title"] = "card-title";
        CardClasses["TitleButton"] = "card-title-button";
        CardClasses["Icon"] = "card-icon";
        CardClasses["Background"] = "card-background";
        CardClasses["BackgroundWrapper"] = "card-background-wrapper";
        CardClasses["Content"] = "card-content";
        CardClasses["ContentWrapper"] = "card-content-wrapper";
        CardClasses["DisplayModeBlock"] = "card-block";
        CardClasses["DisplayModeBlockHeader"] = "card-block-header";
        CardClasses["DisplayModeBlockTitle"] = "card-block-title";
        CardClasses["DisplayModeBlockTitleButton"] = "card-block-title-button";
        CardClasses["DisplayModeBlockIcon"] = "card-block-icon";
        CardClasses["DisplayModeBlockBackground"] = "card-block-background";
        CardClasses["DisplayModeBlockBackgroundWrapper"] = "card-block-background-wrapper";
        CardClasses["DisplayModeBlockContent"] = "card-block-content";
        CardClasses["DisplayModeBlockContentWrapper"] = "card-block-content-wrapper";
        CardClasses["DisplayModeSection"] = "card-section";
        CardClasses["DisplayModeSectionHeader"] = "card-section-header";
        CardClasses["DisplayModeSectionTitle"] = "card-section-title";
        CardClasses["DisplayModeSectionTitleButton"] = "card-section-title-button";
        CardClasses["DisplayModeSectionIcon"] = "card-section-icon";
        CardClasses["DisplayModeSectionBackground"] = "card-section-background";
        CardClasses["DisplayModeSectionBackgroundWrapper"] = "card-section-background-wrapper";
        CardClasses["DisplayModeSectionContent"] = "card-section-content";
        CardClasses["DisplayModeSectionContentWrapper"] = "card-section-content-wrapper";
        CardClasses["DisplayModeCard"] = "card-card";
        CardClasses["DisplayModeCardHeader"] = "card-card-header";
        CardClasses["DisplayModeCardTitle"] = "card-card-title";
        CardClasses["DisplayModeCardTitleButton"] = "card-card-title-button";
        CardClasses["DisplayModeCardIcon"] = "card-card-icon";
        CardClasses["DisplayModeCardBackground"] = "card-card-background";
        CardClasses["DisplayModeCardBackgroundWrapper"] = "card-card-background-wrapper";
        CardClasses["DisplayModeCardContent"] = "card-card-content";
        CardClasses["DisplayModeCardContentWrapper"] = "card-card-content-wrapper";
    })(CardClasses || (exports.CardClasses = CardClasses = {}));
    const displayModes = [
        CardClasses.DisplayModeBlock,
        CardClasses.DisplayModeSection,
        CardClasses.DisplayModeCard,
    ];
    class Card extends Component_38.default {
        /**
         * Only supports DisplayModeBlock and DisplayModeSection atm
         */
        get icon() {
            if (this._icon?.element.parentElement !== this.title.element)
                delete this._icon;
            return this._icon ??= Component_38.default.create()
                .classes.add(CardClasses.Icon, `${this.getDisplayMode()}-icon`)
                .appendTo(this.title);
        }
        /**
         * Only supports DisplayModeCard atm
         */
        get background() {
            return this._background ??= Component_38.default.create("img")
                .classes.add(CardClasses.Background, `${this.getDisplayMode()}-background`)
                .appendTo(this._backgroundWrapper = Component_38.default.create()
                .classes.add(CardClasses.BackgroundWrapper, `${this.getDisplayMode()}-background-wrapper`)
                .prependTo(this));
        }
        onMake(...args) {
            this.classes.add(CardClasses.Main);
            this.header = Component_38.default.create()
                .classes.add(CardClasses.Header)
                .appendTo(this);
            this.title = Component_38.default.create()
                .classes.add(CardClasses.Title)
                .appendTo(this.header);
            this.contentWrapper = Component_38.default.create()
                .classes.add(CardClasses.ContentWrapper)
                .appendTo(this);
            this.content = Component_38.default.create()
                .classes.add(CardClasses.Content)
                .appendTo(this.contentWrapper);
            this.setDisplayMode(CardClasses.DisplayModeBlock);
        }
        getDisplayMode() {
            const result = this.classes.has(CardClasses.DisplayModeBlock) ? CardClasses.DisplayModeBlock
                : this.classes.has(CardClasses.DisplayModeCard) ? CardClasses.DisplayModeCard
                    : this.classes.has(CardClasses.DisplayModeSection) ? CardClasses.DisplayModeSection
                        : undefined;
            if (!result)
                throw new Error("Card has no display mode");
            return result;
        }
        setDisplayMode(displayMode) {
            const titleButtons = [...this.title.children()].filter(child => child.classes.has(CardClasses.TitleButton));
            for (const displayMode of displayModes) {
                this.classes.remove(displayMode);
                this.header.classes.remove(`${displayMode}-header`);
                this.title.classes.remove(`${displayMode}-title`);
                this.content.classes.remove(`${displayMode}-content`);
                this.contentWrapper.classes.remove(`${displayMode}-content-wrapper`);
                this._icon?.classes.remove(`${displayMode}-icon`);
                this._background?.classes.remove(`${displayMode}-background`);
                this._backgroundWrapper?.classes.remove(`${displayMode}-background-wrapper`);
                titleButtons.forEach(button => button.classes.remove(`${displayMode}-title-button`));
            }
            this.classes.add(displayMode);
            this.header.classes.add(`${displayMode}-header`);
            this.title.classes.add(`${displayMode}-title`);
            this.content.classes.add(`${displayMode}-content`);
            this.contentWrapper.classes.add(`${displayMode}-content-wrapper`);
            this._icon?.classes.add(`${displayMode}-icon`);
            this._background?.classes.add(`${displayMode}-background`);
            this._backgroundWrapper?.classes.add(`${displayMode}-background-wrapper`);
            titleButtons.forEach(button => button.classes.add(`${displayMode}-title-button`));
            return this;
        }
    }
    Card.DISPLAY_MODES = displayModes;
    exports.default = Card;
});
define("ui/inventory/bucket/BucketComponent", ["require", "exports", "model/models/Characters", "ui/Card", "ui/inventory/Slot"], function (require, exports, Characters_4, Card_1, Slot_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BucketClasses = void 0;
    var BucketClasses;
    (function (BucketClasses) {
        BucketClasses["Main"] = "bucket";
        BucketClasses["Header"] = "bucket-header";
        BucketClasses["Title"] = "bucket-title";
        BucketClasses["Icon"] = "bucket-icon";
        BucketClasses["Inventory"] = "bucket-inventory";
        BucketClasses["ItemList"] = "bucket-inventory-item-list";
        BucketClasses["ItemListMain"] = "bucket-inventory-item-list-main";
    })(BucketClasses || (exports.BucketClasses = BucketClasses = {}));
    class BucketComponent extends Card_1.default {
        get view() {
            return this._view?.deref();
        }
        getDropTargets() {
            return this.dropTargets ?? [{ component: this, equipped: false }];
        }
        get bucket() {
            return this.view?.inventory.buckets?.[this.bucketId];
        }
        get owner() {
            return Characters_4.default.getOrCurrent(this.bucket?.characterId);
        }
        get character() {
            return Characters_4.default.get(this.bucket?.characterId);
        }
        get sorter() {
            return this._sort?.deref();
        }
        get emptySlots() {
            return this.slots.filter(slot => slot.isEmpty());
        }
        onMake(view, bucketId) {
            super.onMake(view, bucketId);
            this.classes.add(BucketClasses.Main);
            this.header.classes.add(BucketClasses.Header);
            this.title.classes.add(BucketClasses.Title);
            this.icon.classes.add(BucketClasses.Icon);
            this.content.classes.add(BucketClasses.Inventory);
            this._view = new WeakRef(view);
            this.bucketId = bucketId;
            this.slots = [];
            this.itemComponents = [];
            this.items = [];
        }
        is(...hashes) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            return hashes.includes(this.bucket?.hash);
        }
        registerDropTarget(component, equipped) {
            this.dropTargets ??= [];
            this.dropTargets.push({ component, equipped: equipped ?? false });
        }
        setSortedBy(sort) {
            this._sort = new WeakRef(sort);
            this.update();
            return this;
        }
        update() {
            const updated = this.sort();
            if (updated) {
                this.render();
            }
            return updated;
        }
        shouldDisplayItem(item) {
            return true;
        }
        render(requiredSlots = 0) {
            const oldSlots = this.slots.splice(0, Infinity);
            this.itemComponents.splice(0, Infinity);
            let displayedItems = 0;
            for (const item of this.items) {
                if (item && !this.shouldDisplayItem(item))
                    continue;
                const itemComponent = this.view?.getItemComponent(item)?.setSortedBy(this.getSorter(item));
                if (!itemComponent)
                    continue;
                displayedItems++;
                const slot = Slot_2.default.create()
                    .append(itemComponent)
                    .appendTo(this.content);
                this.itemComponents.push(itemComponent);
                this.slots.push(slot);
            }
            for (let i = displayedItems; i < requiredSlots; i++) {
                const slot = this.createEmptySlot().appendTo(this.content);
                this.slots.push(slot);
            }
            for (const slot of oldSlots)
                slot.remove();
        }
        createEmptySlot() {
            return Slot_2.default.create().setEmpty();
        }
        getSorter(item) {
            return this.sorter;
        }
        sort() {
            const sort = this.sorter;
            if (!this.bucket || !sort)
                return false;
            const items = this.bucket.items.slice().sort(sort.sort);
            const sortHash = items.map(item => `${item.id}:${item.equipped}`).join(",");
            if (this.sortHash === sortHash)
                return false;
            this.sortHash = sortHash;
            this.bucket.fallbackRemovalItem = items[items.length - 1];
            const equippedItem = this.bucket?.equippedItem;
            if (equippedItem)
                equippedItem.fallbackItem = undefined
                    ?? items.find(item => item !== equippedItem
                        && (item.isTierLessThan(equippedItem.tier?.tierType, 5 /* TierType.Superior */)))
                    ?? this.view?.getVaultBucket(this.bucket?.characterId)?.items.find(item => item !== equippedItem
                        && this.bucket?.matches(item)
                        && item.isTierLessThan(equippedItem.tier?.tierType, 5 /* TierType.Superior */));
            this.items = items;
            return true;
        }
    }
    exports.default = BucketComponent;
});
define("ui/inventory/bucket/CharacterBucket", ["require", "exports", "ui/inventory/Slot", "ui/inventory/bucket/BucketComponent"], function (require, exports, Slot_3, BucketComponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CharacterBucketClasses = void 0;
    var CharacterBucketClasses;
    (function (CharacterBucketClasses) {
        CharacterBucketClasses["Main"] = "view-inventory-character-bucket";
        CharacterBucketClasses["Emblem"] = "view-inventory-character-bucket-emblem";
        CharacterBucketClasses["Equipped"] = "view-inventory-character-bucket-equipped";
        CharacterBucketClasses["Inventory"] = "view-inventory-character-bucket-inventory";
    })(CharacterBucketClasses || (exports.CharacterBucketClasses = CharacterBucketClasses = {}));
    class CharacterBucket extends BucketComponent_1.default {
        onMake(view, bucketId) {
            super.onMake(view, bucketId);
            this.classes.add(CharacterBucketClasses.Main);
            Slot_3.default.create()
                .classes.add(CharacterBucketClasses.Emblem)
                .appendTo(this.header);
            this.equippedSlot = Slot_3.default.create()
                .classes.add(CharacterBucketClasses.Equipped)
                .appendTo(this);
            this.content.classes.add(CharacterBucketClasses.Inventory);
            this.registerDropTarget(this.content);
            this.registerDropTarget(this.equippedSlot, true);
        }
        update() {
            const character = this.character;
            const className = character?.class?.displayProperties.name ?? "Unknown";
            this.icon.style.set("--icon", `url("https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_${className.toLowerCase()}.svg")`);
            this.title.text.set(className);
            this.style.set("--background", character && `url("https://www.bungie.net${character.emblem?.secondarySpecial ?? character.emblemBackgroundPath}")`)
                .style.set("--emblem", character && `url("https://www.bungie.net${character.emblem?.secondaryOverlay ?? character.emblemPath}")`);
            return super.update();
        }
        render(requiredSlots = 9) {
            super.render(requiredSlots);
            this.view?.getItemComponent(this.bucket?.equippedItem)
                ?.setSortedBy(this.sorter)
                ?.appendTo(this.equippedSlot);
        }
        shouldDisplayItem(item) {
            return !item.equipped;
        }
    }
    exports.default = CharacterBucket;
});
define("ui/inventory/bucket/InventoryBucket", ["require", "exports", "ui/Card", "ui/inventory/bucket/BucketComponent"], function (require, exports, Card_2, BucketComponent_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InventoryBucketClasses = void 0;
    var InventoryBucketClasses;
    (function (InventoryBucketClasses) {
        InventoryBucketClasses["Main"] = "view-inventory-inventory-bucket";
        InventoryBucketClasses["EmptySlot"] = "view-inventory-inventory-slot-character-bucket-empty-slot";
        InventoryBucketClasses["Content"] = "view-inventory-inventory-bucket-content";
    })(InventoryBucketClasses || (exports.InventoryBucketClasses = InventoryBucketClasses = {}));
    class InventoryBucket extends BucketComponent_2.default {
        onMake(view, bucketId) {
            super.onMake(view, bucketId);
            this.classes.add(InventoryBucketClasses.Main);
            this.content.classes.add(InventoryBucketClasses.Content);
            this.setDisplayMode(Card_2.CardClasses.DisplayModeSection);
        }
        render(requiredSlots = 50) {
            super.render(requiredSlots);
        }
    }
    exports.default = InventoryBucket;
});
define("ui/inventory/bucket/ConsumablesBucket", ["require", "exports", "model/models/items/Bucket", "ui/inventory/bucket/InventoryBucket"], function (require, exports, Bucket_4, InventoryBucket_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ConsumablesBucket extends InventoryBucket_1.default {
        onMake(view) {
            super.onMake(view, Bucket_4.Bucket.id(1469714392 /* InventoryBucketHashes.Consumables */));
            this.icon.style.set("--icon", "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/consumables.svg\")");
            this.title.text.add("Consumables");
        }
    }
    exports.default = ConsumablesBucket;
});
define("ui/inventory/bucket/ModificationsBucket", ["require", "exports", "model/models/items/Bucket", "ui/inventory/bucket/InventoryBucket"], function (require, exports, Bucket_5, InventoryBucket_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InventoryBucketClasses = exports.isLeftoverModificationsVaultItem = void 0;
    const handledBuckets = new Set([
        1498876634 /* InventoryBucketHashes.KineticWeapons */, 2465295065 /* InventoryBucketHashes.EnergyWeapons */, 953998645 /* InventoryBucketHashes.PowerWeapons */,
        3448274439 /* InventoryBucketHashes.Helmet */, 3551918588 /* InventoryBucketHashes.Gauntlets */, 14239492 /* InventoryBucketHashes.ChestArmor */, 20886954 /* InventoryBucketHashes.LegArmor */, 1585787867 /* InventoryBucketHashes.ClassArmor */,
        215593132 /* InventoryBucketHashes.LostItems */, 375726501 /* InventoryBucketHashes.Engrams */,
        1469714392 /* InventoryBucketHashes.Consumables */,
        4023194814 /* InventoryBucketHashes.Ghost */, 2025709351 /* InventoryBucketHashes.Vehicle */, 284967655 /* InventoryBucketHashes.Ships */,
    ]);
    function isLeftoverModificationsVaultItem(item) {
        return item.bucket.isVault()
            && (!item.definition.inventory?.bucketTypeHash
                || !handledBuckets.has(item.definition.inventory.bucketTypeHash));
    }
    exports.isLeftoverModificationsVaultItem = isLeftoverModificationsVaultItem;
    var InventoryBucketClasses;
    (function (InventoryBucketClasses) {
        InventoryBucketClasses["Main"] = "view-inventory-inventory-bucket";
        InventoryBucketClasses["EmptySlot"] = "view-inventory-inventory-slot-character-bucket-empty-slot";
        InventoryBucketClasses["Content"] = "view-inventory-inventory-bucket-content";
    })(InventoryBucketClasses || (exports.InventoryBucketClasses = InventoryBucketClasses = {}));
    class ModificationsBucket extends InventoryBucket_2.default {
        onMake(view) {
            super.onMake(view, Bucket_5.Bucket.id(3313201758 /* InventoryBucketHashes.Modifications */));
            this.icon.style.set("--icon", "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/modifications.svg\")");
            this.title.text.add("Modifications");
        }
    }
    exports.default = ModificationsBucket;
});
define("ui/inventory/bucket/PostmasterBucket", ["require", "exports", "model/models/items/Bucket", "ui/Card", "ui/Classes", "ui/Component", "ui/inventory/bucket/BucketComponent", "ui/view/inventory/slot/IInventorySlotView"], function (require, exports, Bucket_6, Card_3, Classes_12, Component_39, BucketComponent_3, IInventorySlotView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PostmasterBucketClasses = void 0;
    var PostmasterBucketClasses;
    (function (PostmasterBucketClasses) {
        PostmasterBucketClasses["Main"] = "view-inventory-postmaster-bucket";
        PostmasterBucketClasses["Engrams"] = "view-inventory-postmaster-bucket-engrams";
        PostmasterBucketClasses["Warning"] = "view-inventory-postmaster-bucket-warning";
        PostmasterBucketClasses["Class"] = "view-inventory-postmaster-bucket-class";
    })(PostmasterBucketClasses || (exports.PostmasterBucketClasses = PostmasterBucketClasses = {}));
    class PostmasterBucket extends BucketComponent_3.default {
        onMake(view, bucketId) {
            super.onMake(view, bucketId);
            this.classes.add(PostmasterBucketClasses.Main);
            this.setDisplayMode(Card_3.CardClasses.DisplayModeSection);
            this.engrams = EngramsBucket.create([view, Bucket_6.Bucket.id(375726501 /* InventoryBucketHashes.Engrams */, this.character?.characterId)])
                .classes.add(PostmasterBucketClasses.Engrams)
                .tweak(bucket => bucket.header.remove())
                .insertToBefore(this, this.contentWrapper);
            this.icon.style.set("--icon", "url(\"./image/svg/postmaster.svg\")");
            this.title.text.set("Postmaster");
            this.className = Component_39.default.create()
                .classes.add(PostmasterBucketClasses.Class, Classes_12.Classes.Hidden)
                .appendTo(this.title);
        }
        setSortedBy(sort) {
            this.engrams.setSortedBy(sort);
            return super.setSortedBy(sort);
        }
        update() {
            const character = this.character;
            const className = character?.class?.displayProperties.name;
            if (className)
                this.className.classes.remove(Classes_12.Classes.Hidden)
                    .text.set(`\xa0 / \xa0${className}`);
            const updated = super.update();
            const engramsUpdated = this.engrams.update();
            if (!updated && !engramsUpdated)
                return false;
            const items = this.itemComponents.length;
            const engrams = this.engrams.itemComponents.length;
            this.classes.toggle(!items && !engrams, Classes_12.Classes.Hidden)
                .classes.toggle(items > 15, PostmasterBucketClasses.Warning);
            return true;
        }
        render(requiredSlots = 21) {
            super.render(requiredSlots);
        }
        createEmptySlot() {
            return super.createEmptySlot().setSimple();
        }
        getSorter(item) {
            return IInventorySlotView_1.InventorySlotViewHandler.getSorter(item);
        }
    }
    exports.default = PostmasterBucket;
    class EngramsBucket extends BucketComponent_3.default {
        onMake(view, bucketId) {
            super.onMake(view, bucketId);
        }
        render(requiredSlots = 10) {
            super.render(requiredSlots);
        }
        createEmptySlot() {
            return super.createEmptySlot().setSimple();
        }
    }
});
define("ui/inventory/bucket/VaultBucket", ["require", "exports", "model/models/items/Bucket", "ui/Card", "ui/Classes", "ui/Component", "ui/inventory/bucket/BucketComponent"], function (require, exports, Bucket_7, Card_4, Classes_13, Component_40, BucketComponent_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VaultBucketClasses = void 0;
    var VaultBucketClasses;
    (function (VaultBucketClasses) {
        VaultBucketClasses["Main"] = "view-inventory-vault-bucket";
        VaultBucketClasses["Class"] = "view-inventory-vault-bucket-class";
        VaultBucketClasses["Quantity"] = "view-inventory-vault-bucket-quantity";
    })(VaultBucketClasses || (exports.VaultBucketClasses = VaultBucketClasses = {}));
    class VaultBucket extends BucketComponent_4.default {
        onMake(view, bucketId) {
            super.onMake(view, bucketId ?? Bucket_7.Bucket.id(138197802 /* InventoryBucketHashes.General */));
            this.classes.add(VaultBucketClasses.Main);
            this.setDisplayMode(Card_4.CardClasses.DisplayModeSection);
            this.icon.style.set("--icon", "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/vault2.svg\")");
            this.title.text.add("Vault");
            this.classLabel = Component_40.default.create()
                .classes.add(VaultBucketClasses.Class)
                .appendTo(this.title);
            this.quantityLabel = Component_40.default.create()
                .classes.add(VaultBucketClasses.Quantity)
                .appendTo(this.title);
        }
        update() {
            const className = this.character?.class?.displayProperties.name;
            this.classLabel?.classes.toggle(!className, Classes_13.Classes.Hidden)
                .text.set(`\xa0 / \xa0${className}`);
            const updated = super.update();
            if (!updated)
                return false;
            const vaultBucket = this.view?.inventory.getBucket(138197802 /* InventoryBucketHashes.General */);
            const vaultItemCount = this.bucket?.items.length ?? 0;
            const vaultCapacity = this.bucket?.capacity;
            this.quantityLabel.classes.toggle(!vaultCapacity, Classes_13.Classes.Hidden);
            this.quantityLabel.text.set(`${(vaultItemCount)} / ${vaultBucket?.items.length ?? 0} // ${vaultCapacity}`);
            return true;
        }
    }
    exports.default = VaultBucket;
});
define("ui/inventory/bucket/BucketComponents", ["require", "exports", "model/models/items/Bucket", "ui/inventory/bucket/CharacterBucket", "ui/inventory/bucket/ConsumablesBucket", "ui/inventory/bucket/ModificationsBucket", "ui/inventory/bucket/PostmasterBucket", "ui/inventory/bucket/VaultBucket"], function (require, exports, Bucket_8, CharacterBucket_1, ConsumablesBucket_1, ModificationsBucket_1, PostmasterBucket_1, VaultBucket_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BucketComponents;
    (function (BucketComponents) {
        function create(id, view) {
            return createInternal(id, view);
        }
        BucketComponents.create = create;
        function createInternal(id, view) {
            const [hash] = Bucket_8.Bucket.parseId(id);
            switch (hash) {
                case 138197802 /* InventoryBucketHashes.General */:
                    return VaultBucket_1.default.create([view, id]);
                case 215593132 /* InventoryBucketHashes.LostItems */:
                    return PostmasterBucket_1.default.create([view, id]);
                case 3313201758 /* InventoryBucketHashes.Modifications */:
                    return ModificationsBucket_1.default.create([view, id]);
                case 1469714392 /* InventoryBucketHashes.Consumables */:
                    return ConsumablesBucket_1.default.create([view, id]);
                default:
                    return CharacterBucket_1.default.create([view, id]);
            }
        }
    })(BucketComponents || (BucketComponents = {}));
    exports.default = BucketComponents;
});
define("ui/inventory/filter/ItemFilter", ["require", "exports", "ui/bungie/EnumIcon", "ui/Classes", "ui/Component", "ui/form/Button", "ui/form/Drawer", "ui/inventory/filter/Filter", "ui/UiEventBus", "utility/Async", "utility/decorator/Bound", "utility/Store", "utility/Strings"], function (require, exports, EnumIcon_6, Classes_14, Component_41, Button_6, Drawer_2, Filter_1, UiEventBus_4, Async_5, Bound_15, Store_12, Strings_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FilterChipButton = exports.ItemFilterClasses = void 0;
    const QUOTES = {
        "\"": "\"",
        "'": "'",
        "`": "`",
        "(": ")",
        "[": "]",
    };
    var ItemFilterClasses;
    (function (ItemFilterClasses) {
        ItemFilterClasses["Main"] = "item-filter";
        ItemFilterClasses["Button"] = "item-filter-button";
        ItemFilterClasses["ButtonIcon"] = "item-filter-button-icon";
        ItemFilterClasses["ButtonLabel"] = "item-filter-button-label";
        ItemFilterClasses["Input"] = "item-filter-input";
        ItemFilterClasses["Reset"] = "item-filter-reset";
        ItemFilterClasses["FilterChip"] = "item-filter-chip";
        ItemFilterClasses["FilterChipPrefix"] = "item-filter-chip-prefix";
        ItemFilterClasses["FilterChipValue"] = "item-filter-chip-value";
        ItemFilterClasses["FilterChipValueHasIcon"] = "item-filter-chip-value-has-icon";
        ItemFilterClasses["FilterChipValueHasMaskIcon"] = "item-filter-chip-value-has-mask-icon";
        ItemFilterClasses["FilterChipRaw"] = "item-filter-chip-raw";
        ItemFilterClasses["Drawer"] = "item-filter-drawer";
        ItemFilterClasses["DrawerPanel"] = "item-filter-drawer-panel";
        ItemFilterClasses["FiltersHeading"] = "item-filter-heading";
        ItemFilterClasses["SuggestedFilters"] = "item-filter-suggested";
        ItemFilterClasses["FilterId"] = "item-filter-id";
        ItemFilterClasses["FilterChipButton"] = "item-filter-chip-button";
        ItemFilterClasses["FilterChipButtonPrefix"] = "item-filter-chip-button-prefix";
        ItemFilterClasses["FilterChipButtonValue"] = "item-filter-chip-button-value";
        ItemFilterClasses["FilterChipButtonValueHasIcon"] = "item-filter-chip-button-value-has-icon";
        ItemFilterClasses["FilterChipButtonValueHasMaskIcon"] = "item-filter-chip-button-value-has-mask-icon";
        ItemFilterClasses["FilterChipButtonValueHint"] = "item-filter-chip-button-value-hint";
        ItemFilterClasses["FilterChipButtonSelected"] = "item-filter-chip-button-selected";
    })(ItemFilterClasses || (exports.ItemFilterClasses = ItemFilterClasses = {}));
    class FilterChipButton extends Button_6.default {
        constructor() {
            super(...arguments);
            this.visible = true;
        }
        onMake(filter, value, icon, isHint) {
            super.onMake(filter, value, icon, isHint);
            this.isHint = isHint ?? false;
            this.shouldHideByDefault = !isHint && !!filter.suggestedValueHint && !!filter.suggestedValues?.length && filter.suggestedValues.length > 5;
            icon ??= Filter_1.IFilter.icon(value, filter.icon);
            const maskIcon = Filter_1.IFilter.icon(value, filter.maskIcon);
            const usedIcon = icon ?? maskIcon;
            this.prefix = filter.prefix;
            this.value = value;
            this.searchableValue = ` ${value.toLowerCase()}`;
            this.id = `${filter.prefix}${value.toLowerCase()}`;
            this.classes.add(ItemFilterClasses.FilterChipButton)
                .classes.toggle(this.shouldHideByDefault, Classes_14.Classes.Hidden)
                .classes.add(`${ItemFilterClasses.FilterId}-${filter.internalName}`)
                .attributes.set("data-id", this.id)
                .append(Component_41.default.create("span")
                .classes.add(ItemFilterClasses.FilterChipButtonPrefix)
                .text.set(filter.prefix))
                .append(Component_41.default.create("span")
                .classes.add(ItemFilterClasses.FilterChipButtonValue)
                .classes.toggle(isHint ?? false, ItemFilterClasses.FilterChipButtonValueHint)
                .classes.toggle(icon !== undefined, ItemFilterClasses.FilterChipButtonValueHasIcon)
                .classes.toggle(maskIcon !== undefined, ItemFilterClasses.FilterChipButtonValueHasMaskIcon)
                .text.set(value)
                .style.set("--icon", typeof usedIcon === "string" ? usedIcon : undefined)
                .tweak(async (valueSpan) => Array.isArray(usedIcon)
                && !await EnumIcon_6.default.applyIconVar(valueSpan, ...usedIcon)
                && valueSpan.classes.remove(ItemFilterClasses.FilterChipButtonValueHasIcon, ItemFilterClasses.FilterChipButtonValueHasMaskIcon)))
                .style.set("--colour", Filter_1.IFilter.colour(value, filter.colour));
        }
        show() {
            this.classes.remove(Classes_14.Classes.Hidden);
            this.visible = true;
            return this;
        }
        hide() {
            this.classes.add(Classes_14.Classes.Hidden);
            this.visible = false;
            return this;
        }
        toggle(visible) {
            this.classes.toggle(!visible, Classes_14.Classes.Hidden);
            this.visible = visible;
            return this;
        }
    }
    exports.FilterChipButton = FilterChipButton;
    class ItemFilter extends Component_41.default {
        static getFor(filterer) {
            return filterer.uiComponent ??= ItemFilter.create([filterer]);
        }
        onMake(filterer) {
            this.filterer = filterer;
            this.classes.add(ItemFilterClasses.Main);
            ////////////////////////////////////
            // Button
            this.button = Button_6.default.create()
                .classes.add(ItemFilterClasses.Button)
                .event.subscribe("click", this.openDrawer)
                .event.subscribe("focus", this.openDrawer)
                .addIcon(icon => icon.classes.add(ItemFilterClasses.ButtonIcon))
                .appendTo(this);
            this.label = Component_41.default.create()
                .classes.add(ItemFilterClasses.ButtonLabel)
                .text.set(`Filter ${filterer.name}`)
                .appendTo(this.button);
            this.input = Component_41.default.create()
                .classes.add(ItemFilterClasses.Input)
                .attributes.add("contenteditable")
                .attributes.set("spellcheck", "false")
                .attributes.set("placeholder", "No filter enabled")
                .text.set(Store_12.default.items.settingsClearItemFilterOnSwitchingViews ? "" : Store_12.default.items.itemFilter ?? "")
                .event.subscribe("paste", this.onPaste)
                .event.subscribe("input", this.onInput)
                .event.subscribe("focus", () => {
                this.button.attributes.set("tabindex", "-1");
                void this.openDrawer();
            })
                .event.subscribe("blur", () => {
                this.button.attributes.remove("tabindex");
            })
                .appendTo(this.button);
            this.resetButton = Button_6.default.create()
                .classes.add(ItemFilterClasses.Reset, Classes_14.Classes.Hidden)
                .event.subscribe("click", () => this.reset(true))
                .append(Component_41.default.create())
                .appendTo(this.button);
            ////////////////////////////////////
            // Drawer
            this.drawer = Drawer_2.default.create()
                .classes.add(ItemFilterClasses.Drawer)
                .attributes.set("tabindex", "-1")
                .event.subscribe("click", () => this.input.element.focus())
                .appendTo(this);
            this.mainPanel = this.drawer.createPanel();
            Component_41.default.create()
                .classes.add(ItemFilterClasses.FiltersHeading)
                .text.set("Suggested Filters")
                .appendTo(this.mainPanel);
            const suggestedFilters = Component_41.default.create()
                .classes.add(ItemFilterClasses.SuggestedFilters)
                .appendTo(this.mainPanel);
            this.suggestedChips = [];
            for (const filter of filterer.getApplicable()) {
                if (!filter.suggestedValues?.length && !filter.suggestedValueHint)
                    continue;
                if (filter.suggestedValueHint)
                    this.suggestedChips.push(FilterChipButton.create([filter, filter.suggestedValueHint, undefined, true])
                        .event.subscribe("click", () => this.toggleChip(filter))
                        .tweak(filter.tweakChip, filter.suggestedValueHint)
                        .appendTo(suggestedFilters));
                for (const value of filter.suggestedValues ?? [])
                    this.suggestedChips.push(FilterChipButton.create([filter, typeof value === "string" ? value : value.name, typeof value === "string" ? undefined : value.icon])
                        .tweak(filter.tweakChip, typeof value === "string" ? value : value.name)
                        .event.subscribe("click", () => this.toggleChip(filter, typeof value === "string" ? value : value.name))
                        .appendTo(suggestedFilters));
            }
            UiEventBus_4.default.subscribe("keydown", this.onGlobalKeydown);
            this.cleanup();
            document.addEventListener("selectionchange", this.onSelectionChange);
        }
        isFiltered() {
            return this.input.hasContents();
        }
        reset(focus = false) {
            this.input.removeContents();
            this.cleanup(focus);
            this.filterChips();
        }
        async openDrawer() {
            if (!this.drawer.classes.has(Classes_14.Classes.Hidden))
                return this.input.element.focus();
            this.drawer.open();
            await Async_5.default.sleep(0); // next tick
            this.input.element.focus();
            const selection = window.getSelection();
            if (!this.input.element.contains(selection?.focusNode ?? null) || !this.input.element.contains(selection?.anchorNode ?? null))
                selection?.selectAllChildren(this.input.element);
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            document.addEventListener("focusout", this.onFocusOut);
        }
        closeDrawer() {
            this.drawer.close();
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            document.removeEventListener("focusout", this.onFocusOut);
        }
        async onFocusOut() {
            await Async_5.default.sleep(0); // next tick
            if (this.element.contains(document.activeElement))
                return;
            this.closeDrawer();
        }
        onSelectionChange() {
            if (!document.contains(this.element)) {
                document.removeEventListener("selectionchange", this.onSelectionChange);
                return;
            }
            const selection = window.getSelection();
            if (selection?.isCollapsed && this.input.contains(selection.anchorNode) && this.input.contains(selection.focusNode))
                this.filterChips();
        }
        onGlobalKeydown(event) {
            if (!document.contains(this.element)) {
                UiEventBus_4.default.unsubscribe("keydown", this.onGlobalKeydown);
                return;
            }
            if (event.useOverInput("f", "ctrl")) {
                this.input.element.focus();
                void this.openDrawer();
            }
            if (this.input.isFocused()) {
                if (event.useOverInput("Escape")) {
                    this.closeDrawer();
                    this.reset(true);
                }
                if (event.useOverInput("ArrowUp")) {
                    this.selectUp();
                }
                if (event.useOverInput("ArrowDown")) {
                    this.selectDown();
                }
                if (this.currentSelection) {
                    if (event.useOverInput("ArrowLeft")) {
                        this.selectLeft();
                    }
                    if (event.useOverInput("ArrowRight")) {
                        this.selectRight();
                    }
                    if (event.useOverInput(" ") || event.useOverInput("Enter")) {
                        this.currentSelection.event.emit(new MouseEvent("click"));
                        return;
                    }
                }
            }
            if (this.drawer.isOpen() && event.useOverInput("Enter")) {
                this.closeDrawer();
                this.event.emit(new SubmitEvent("submit"));
            }
            // cancel keybinds
            event.useOverInput("b", "ctrl");
            event.useOverInput("i", "ctrl");
            event.useOverInput("u", "ctrl");
        }
        onPaste(event) {
            event.preventDefault();
            const data = event.clipboardData?.getData("text/plain");
            if (!data)
                return;
            const selection = window.getSelection();
            for (let i = 0; i < (selection?.rangeCount ?? 0); i++) {
                const range = selection?.getRangeAt(i);
                if (!range)
                    continue;
                if (!this.input.element.contains(range.startContainer) || !this.input.element.contains(range.endContainer))
                    continue;
                range.deleteContents();
                range.insertNode(document.createTextNode(data.replace(/\n/g, "")));
                range.collapse();
            }
            void this.openDrawer();
            this.cleanup();
            this.filterChips();
        }
        get visibleChips() {
            return this._visibleChips ??= this.suggestedChips.filter(chip => !chip.classes.has(Classes_14.Classes.Hidden));
        }
        getCurrentSelection(from) {
            return this.currentSelection ??= this.getSelectionFrom(from === "front" ? "end" : "front");
        }
        getSelectionFrom(from) {
            return from === "front" ? this.visibleChips[0] : this.visibleChips[this.visibleChips.length - 1];
        }
        findSelection(getSortIndex, currentBox) {
            for (const filter of this.visibleChips)
                filter.getRect(true);
            const sorted = this.visibleChips.sort((a, b) => getSortIndex(b.getRect(), currentBox) - getSortIndex(a.getRect(), currentBox));
            return getSortIndex(sorted[0].getRect(), currentBox) < 0 ? undefined : sorted[0];
        }
        select(from, getSortIndex, defaultToFrom = true) {
            delete this._visibleChips;
            const currentSelection = this.getCurrentSelection("end");
            const currentBox = currentSelection.getRect(true);
            const selection = this.findSelection(getSortIndex, currentBox)
                ?? (defaultToFrom ? this.getSelectionFrom(from) : undefined);
            if (selection) {
                this.currentSelection?.classes.remove(ItemFilterClasses.FilterChipButtonSelected, Button_6.ButtonClasses.Selected);
                this.currentSelection = selection;
                this.currentSelection?.classes.add(ItemFilterClasses.FilterChipButtonSelected, Button_6.ButtonClasses.Selected);
                this.currentSelection?.element.scrollIntoView({ block: "center" });
            }
        }
        selectUp() {
            this.select("end", (rect, currentBox) => currentBox.top < rect.bottom ? -1000000 : (100000 - Math.abs(rect.bottom - currentBox.top)) * 10000 - Math.abs(rect.centerX - currentBox.centerX));
        }
        selectDown() {
            this.select("front", (rect, currentBox) => currentBox.bottom > rect.top ? -1000000 : (100000 - Math.abs(rect.top - currentBox.bottom)) * 10000 - Math.abs(rect.centerX - currentBox.centerX));
        }
        selectLeft() {
            this.select("end", (rect, currentBox) => currentBox.centerY !== rect.centerY ? -10000000 : currentBox.left < rect.right ? -1000000 : 10000 - (Math.abs(rect.centerX - currentBox.centerX)), false);
        }
        selectRight() {
            this.select("front", (rect, currentBox) => currentBox.centerY !== rect.centerY ? -10000000 : currentBox.right > rect.left ? -1000000 : 10000 - (Math.abs(currentBox.centerX - rect.centerX)), false);
        }
        toggleChip(filter, value) {
            const chipText = `${filter.prefix}${!value ? "" : value.includes(" ") ? `"${value}"` : value}`;
            const editingChip = this.getEditingChip();
            const textContent = this.input.element.textContent ?? "";
            let removed = false;
            if (!editingChip) {
                const chipRegex = new RegExp(`(?<=^| |\xa0)${chipText}(?= |\xa0|$)`);
                removed = chipRegex.test(textContent);
                if (removed)
                    this.input.element.textContent = textContent.replace(chipRegex, "");
                else
                    this.input.element.appendChild(document.createTextNode(chipText));
            }
            else {
                editingChip.value?.remove();
                editingChip.prefix.replaceWith(document.createTextNode(chipText));
            }
            this.cleanup();
            if (removed || value)
                this.setCursorAtEnd();
            else
                this.setCursorAtLastChipValue();
            this.filterChips();
        }
        onInput(event) {
            void this.openDrawer();
            this.cleanup();
            this.filterChips();
        }
        cleanup(focus = true) {
            const ranges = this.getRanges();
            const tokens = this.getTokens();
            const selection = window.getSelection();
            selection.removeAllRanges();
            this.input.removeContents();
            this.filterer.reset();
            const rangeElements = ranges.map(() => new Range());
            let lastEnd = -1;
            for (const token of tokens) {
                if (this.input.element.childNodes.length)
                    // space between tokens
                    this.input.element.appendChild(document.createTextNode(" "));
                // handle range being in whitespace
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    for (let ri = 0; ri < 2; ri++) {
                        if (range[ri] <= token.start && range[ri] > lastEnd) {
                            rangeElements[i][ri === 0 ? "setStart" : "setEnd"](this.input.element.lastChild ?? this.input.element, this.input.element.lastChild ? 1 : 0);
                        }
                    }
                }
                const raw = token.raw ?? token.text;
                if (raw[0] === "-") {
                    token.text = `!${token.text.slice(1)}`;
                    if (token.raw)
                        token.raw = `!${token.raw.slice(1)}`;
                }
                const filter = this.filterer.add(raw);
                if (!filter)
                    continue;
                const valueRaw = token.text.slice(filter.prefix.length);
                const value = Strings_4.default.extractFromQuotes(valueRaw).toLowerCase();
                const forceAddQuotes = valueRaw.length > value.length;
                let textNode;
                Component_41.default.create("span")
                    .classes.add(ItemFilterClasses.FilterChip, ItemFilterClasses.FilterChipPrefix)
                    .classes.toggle(filter.id === Filter_1.default.Raw, ItemFilterClasses.FilterChipRaw)
                    .style.set("--colour", Filter_1.IFilter.colour(value, filter.colour))
                    .append(textNode = document.createTextNode(filter.prefix))
                    .appendTo(this.input);
                // handle range being in prefix
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    for (let ri = 0; ri < 2; ri++) {
                        if (range[ri] >= token.start && range[ri] <= token.start + filter.prefix.length) {
                            rangeElements[i][ri === 0 ? "setStart" : "setEnd"](textNode, range[ri] - token.start);
                        }
                    }
                }
                const icon = Filter_1.IFilter.icon(value, filter.icon);
                const maskIcon = Filter_1.IFilter.icon(value, filter.maskIcon);
                const usedIcon = icon ?? maskIcon;
                Component_41.default.create("span")
                    .classes.add(ItemFilterClasses.FilterChip, ItemFilterClasses.FilterChipValue)
                    .classes.add(`${ItemFilterClasses.FilterId}-${filter.internalName}`)
                    .classes.toggle(filter.id === Filter_1.default.Raw, ItemFilterClasses.FilterChipRaw)
                    .classes.toggle(icon !== undefined, ItemFilterClasses.FilterChipValueHasIcon)
                    .classes.toggle(maskIcon !== undefined, ItemFilterClasses.FilterChipValueHasMaskIcon)
                    .style.set("--colour", Filter_1.IFilter.colour(value, filter.colour))
                    .style.set("--icon", typeof usedIcon === "string" ? usedIcon : undefined)
                    .tweak(async (valueSpan) => Array.isArray(usedIcon)
                    && !await EnumIcon_6.default.applyIconVar(valueSpan, ...usedIcon)
                    && valueSpan.classes.remove(ItemFilterClasses.FilterChipValueHasIcon, ItemFilterClasses.FilterChipValueHasMaskIcon))
                    .append(textNode = document.createTextNode(forceAddQuotes || value.includes(" ") ? `"${value}"` : value))
                    .appendTo(this.input);
                // handle range being in value
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    for (let ri = 0; ri < 2; ri++) {
                        if (range[ri] >= token.start + filter.prefix.length && range[ri] <= token.end) {
                            rangeElements[i][ri === 0 ? "setStart" : "setEnd"](textNode, Math.min(range[ri] - (token.start + filter.prefix.length), textNode.length));
                        }
                    }
                }
                lastEnd = token.end;
            }
            if (this.input.element.textContent?.trim())
                this.input.element.appendChild(document.createTextNode("\xa0"));
            // handle range being in whitespace after all tokens
            if (this.input.element.lastChild)
                for (let i = 0; i < ranges.length; i++) {
                    const range = ranges[i];
                    for (let ri = 0; ri < 2; ri++) {
                        if (range[ri] > lastEnd) {
                            rangeElements[i][ri === 0 ? "setStart" : "setEnd"](this.input.element.lastChild, 1);
                        }
                    }
                }
            if (focus) {
                if (!tokens.length)
                    selection.collapse(this.input.element);
                else
                    for (const range of rangeElements) {
                        if (range.startContainer === document || range.endContainer === document)
                            continue;
                        selection.addRange(range);
                    }
            }
            this.resetButton.classes.toggle(!tokens.length, Classes_14.Classes.Hidden);
            Store_12.default.items.itemFilter = this.input.element.textContent ?? "";
            if (this.filterer.hasChanged())
                this.event.emit("filter");
        }
        getEditingChip() {
            const selection = window.getSelection();
            const currentInputChip = !selection.isCollapsed ? undefined
                : (selection.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection.anchorNode)
                    ?.closest(`.${ItemFilterClasses.FilterChip}`);
            const prefix = currentInputChip?.classList.contains(ItemFilterClasses.FilterChipPrefix) ? currentInputChip : currentInputChip?.previousElementSibling;
            const value = currentInputChip?.classList.contains(ItemFilterClasses.FilterChipValue) ? currentInputChip : currentInputChip?.nextElementSibling;
            return prefix ? {
                prefix,
                value,
            } : undefined;
        }
        filterChips() {
            this.currentSelection?.classes.remove(ItemFilterClasses.FilterChipButtonSelected, Button_6.ButtonClasses.Selected);
            delete this.currentSelection;
            const editingChip = this.getEditingChip();
            const currentChips = this.filterer.getFilterIds();
            const prefix = editingChip?.prefix.textContent ?? "";
            const value = Strings_4.default.extractFromQuotes(editingChip?.value?.textContent);
            const id = `${prefix}${value}`;
            const words = !value ? [] : value.toLowerCase().split(/\s+/g);
            for (const chip of this.suggestedChips) {
                if (currentChips.includes(chip.id)) {
                    chip.hide();
                    continue;
                }
                if (chip.isHint) {
                    chip.toggle(!id || chip.id.startsWith(id) && id.length < chip.prefix.length);
                    continue;
                }
                const wordsInChip = () => words.every(word => chip.searchableValue.includes(` ${word}`));
                if (chip.shouldHideByDefault)
                    chip.toggle(!!id && (!prefix && !!words.length && (wordsInChip() || chip.prefix.startsWith(id)) || id.startsWith(chip.prefix) && wordsInChip()));
                else
                    chip.toggle(!id || (!prefix && !!words.length && (wordsInChip() || chip.prefix.startsWith(id)) || id.startsWith(chip.prefix) && wordsInChip()));
            }
        }
        getTokens() {
            const text = `${this.input.element.textContent ?? ""} `; // end text in a space so it ends the last token the same way
            const tokens = [];
            let start = -1;
            for (let i = 0; i < text.length; i++) {
                const isWhitespace = text[i] === " " || text[i] === "\xa0" || text[i] === "\t" || text[i] === "\n" || text[i] === "\r";
                if (start === -1) {
                    // not in token
                    if (!isWhitespace)
                        start = i;
                }
                else {
                    // in token
                    if (isWhitespace) {
                        const tokenText = text.slice(start, i);
                        tokens.push({
                            text: tokenText,
                            raw: tokenText.replace(/["'`[\]()]/g, "")
                                .replace(/[\s\n\r]+/g, " ")
                                .trim(),
                            start,
                            end: i,
                        });
                        start = -1;
                    }
                }
                if (start !== -1 && text[i] in QUOTES) {
                    const quote = QUOTES[text[i]];
                    // upon entering a quote, continue until reaching the end quote
                    const textEndingInQuote = `${this.input.element.textContent ?? ""}${quote}`;
                    for (i++; i < textEndingInQuote.length; i++)
                        if (textEndingInQuote[i] === quote)
                            break;
                    if (i === textEndingInQuote.length - 1)
                        i--;
                }
            }
            return tokens;
        }
        getRanges() {
            let i = 0;
            const selection = window.getSelection();
            const rangePositions = [];
            for (const node of this.input.element.childNodes) {
                let length = 0;
                switch (node.nodeType) {
                    case Node.TEXT_NODE: {
                        length = node.length;
                        break;
                    }
                    case Node.ELEMENT_NODE: {
                        length = node.textContent?.length ?? 0;
                        break;
                    }
                }
                for (let ri = 0; ri < selection.rangeCount; ri++) {
                    rangePositions[ri] ??= [-1, -1];
                    const range = selection.getRangeAt(ri);
                    if (range.startContainer === node || range.startContainer === node.firstChild)
                        rangePositions[ri][0] = i + range.startOffset;
                    if (range.endContainer === node || range.endContainer === node.firstChild)
                        rangePositions[ri][1] = i + range.endOffset;
                }
                i += length;
            }
            return rangePositions.filter(([start, end]) => start !== -1 && end !== -1);
        }
        setCursorAtEnd(node) {
            const selection = window.getSelection();
            selection?.removeAllRanges();
            const range = new Range();
            range.selectNodeContents(node ?? this.input.element);
            range.collapse();
            selection?.addRange(range);
        }
        setCursorAtLastChipValue() {
            this.setCursorAtEnd(this.input.element.querySelector(`.${ItemFilterClasses.FilterChipValue}:last-child`));
        }
    }
    exports.default = ItemFilter;
    __decorate([
        Bound_15.default
    ], ItemFilter.prototype, "reset", null);
    __decorate([
        Bound_15.default
    ], ItemFilter.prototype, "openDrawer", null);
    __decorate([
        Bound_15.default
    ], ItemFilter.prototype, "onFocusOut", null);
    __decorate([
        Bound_15.default
    ], ItemFilter.prototype, "onSelectionChange", null);
    __decorate([
        Bound_15.default
    ], ItemFilter.prototype, "onGlobalKeydown", null);
    __decorate([
        Bound_15.default
    ], ItemFilter.prototype, "onPaste", null);
    __decorate([
        Bound_15.default
    ], ItemFilter.prototype, "onInput", null);
});
define("ui/inventory/filter/Filter", ["require", "exports", "utility/Arrays"], function (require, exports, Arrays_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IFilter = void 0;
    var Filter;
    (function (Filter) {
        Filter[Filter["Element"] = 0] = "Element";
        Filter[Filter["Ammo"] = 1] = "Ammo";
        Filter[Filter["WeaponType"] = 2] = "WeaponType";
        Filter[Filter["Rarity"] = 3] = "Rarity";
        Filter[Filter["Masterwork"] = 4] = "Masterwork";
        Filter[Filter["Adept"] = 5] = "Adept";
        Filter[Filter["Shaped"] = 6] = "Shaped";
        Filter[Filter["Harmonizable"] = 7] = "Harmonizable";
        Filter[Filter["Perk"] = 8] = "Perk";
        Filter[Filter["Moment"] = 9] = "Moment";
        Filter[Filter["Locked"] = 10] = "Locked";
        Filter[Filter["Raw"] = 11] = "Raw";
    })(Filter || (Filter = {}));
    exports.default = Filter;
    var IFilter;
    (function (IFilter) {
        function create(filter) {
            return filter;
        }
        IFilter.create = create;
        function createBoolean(filter) {
            return ["is:", "not:"].map(prefix => ({
                ...filter,
                prefix,
                apply: prefix === "not:" ? (filterValue, item) => !filter.apply(filterValue, item)
                    : (filterValue, item) => filter.apply(filterValue, item),
            }));
        }
        IFilter.createBoolean = createBoolean;
        function async(filterGenerator) {
            return filterGenerator;
        }
        IFilter.async = async;
        function colour(value, colour) {
            if (colour === undefined)
                return undefined;
            if (typeof colour === "function")
                colour = colour(value);
            if (typeof colour === "string")
                return colour;
            return `#${colour.toString(16).padStart(6, "0")}`;
        }
        IFilter.colour = colour;
        function icon(value, icon) {
            if (typeof icon === "function")
                icon = icon(value);
            if (icon === undefined)
                return undefined;
            if (typeof icon === "string")
                return icon;
            if (Array.isArray(icon))
                return icon;
            return Arrays_6.default.tuple(icon, value);
        }
        IFilter.icon = icon;
    })(IFilter || (exports.IFilter = IFilter = {}));
});
define("ui/inventory/filter/filters/FilterAdept", ["require", "exports", "ui/inventory/filter/Filter"], function (require, exports, Filter_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Filter_2.IFilter.createBoolean({
        id: Filter_2.default.Adept,
        colour: 0xFFB21C,
        suggestedValues: ["adept"],
        matches: value => "adept".startsWith(value),
        apply: (value, item) => value === "" || !!item.isAdept(),
        maskIcon: value => value === "" ? undefined
            : "url(\"./image/svg/enhanced.svg\")",
    });
});
define("ui/inventory/filter/filters/FilterAmmo", ["require", "exports", "ui/bungie/DisplayProperties", "ui/inventory/filter/Filter"], function (require, exports, DisplayProperties_11, Filter_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Filter_3.IFilter.create({
        id: Filter_3.default.Ammo,
        prefix: "ammo:",
        colour: 0x444444,
        suggestedValues: ["primary", "special"],
        or: true,
        matches: value => "primary".startsWith(value) || "special".startsWith(value) || "heavy".startsWith(value),
        apply: (value, item) => value === ""
            || item.definition.equippingBlock?.ammoType === ("primary".startsWith(value) ? 1 /* DestinyAmmunitionType.Primary */
                : "special".startsWith(value) ? 2 /* DestinyAmmunitionType.Special */
                    : 3 /* DestinyAmmunitionType.Heavy */),
        icon: value => value === "" ? undefined
            : DisplayProperties_11.default.icon(`/img/destiny_content/ammo_types/${"primary".startsWith(value) ? "primary" : "special".startsWith(value) ? "special" : "heavy"}.png`),
    });
});
define("ui/inventory/filter/filters/FilterElement", ["require", "exports", "model/models/Manifest", "ui/bungie/DisplayProperties", "ui/inventory/ElementTypes", "ui/inventory/filter/Filter"], function (require, exports, Manifest_14, DisplayProperties_12, ElementTypes_2, Filter_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DAMAGE_TYPE_RAID = 1067729826;
    const ENERGY_TYPE_ANY = 1198124803;
    const ENERGY_TYPE_GHOST = 3340383460;
    const ENERGY_TYPE_SUBCLASS = 3440230265;
    exports.default = Filter_4.IFilter.async(async () => {
        const { DestinyDamageTypeDefinition, DestinyEnergyTypeDefinition } = await Manifest_14.default.await();
        const damages = (await DestinyDamageTypeDefinition.all())
            .filter(type => type.hash !== DAMAGE_TYPE_RAID)
            .sort((a, b) => a.enumValue - b.enumValue);
        const energies = (await DestinyEnergyTypeDefinition.all())
            .filter(type => type.hash !== ENERGY_TYPE_ANY && type.hash !== ENERGY_TYPE_GHOST && type.hash !== ENERGY_TYPE_SUBCLASS)
            .sort((a, b) => a.enumValue - b.enumValue);
        function definition(value, item) {
            if (value === "")
                return null;
            const resultDamages = damages.filter(element => element.displayProperties.name.toLowerCase().startsWith(value)
                && (!item || element.hash === item.instance?.damageTypeHash));
            if (resultDamages.length === 1)
                return resultDamages[0];
            if (resultDamages.length > 1)
                return null;
            const resultEnergies = energies.filter(element => element.displayProperties.name.toLowerCase().startsWith(value)
                && (!item || element.hash === item.instance?.energy?.energyTypeHash));
            if (resultEnergies.length === 1)
                return resultEnergies[0];
            if (resultEnergies.length > 1)
                return null;
            return undefined;
        }
        return {
            id: Filter_4.default.Element,
            prefix: "element:",
            suggestedValues: damages.map(element => element.displayProperties.name.toLowerCase()),
            or: true,
            matches: value => damages.some(element => element.displayProperties.name.toLowerCase().startsWith(value)),
            apply: (value, item) => definition(value, item) !== undefined,
            colour: value => ElementTypes_2.default.getColour(definition(value)?.displayProperties.name.toLowerCase()) ?? 0xaaaaaa,
            maskIcon: value => DisplayProperties_12.default.icon(definition(value) ?? undefined),
        };
    });
});
define("ui/inventory/filter/filters/FilterHarmonizable", ["require", "exports", "ui/inventory/filter/Filter"], function (require, exports, Filter_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Filter_5.IFilter.createBoolean({
        id: Filter_5.default.Harmonizable,
        colour: 0xff4e26,
        suggestedValues: ["harmonizer"],
        matches: value => "harmonizer".startsWith(value),
        apply: (value, item) => value === "" || !!item.deepsight?.activation,
        maskIcon: value => value === "" ? undefined
            : "url(\"./image/svg/shaped.svg\")",
    });
});
define("ui/inventory/filter/filters/FilterLocked", ["require", "exports", "ui/inventory/filter/Filter"], function (require, exports, Filter_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Filter_6.IFilter.createBoolean({
        id: Filter_6.default.Locked,
        colour: 0xAAAAAA,
        suggestedValues: ["locked"],
        matches: value => "locked".startsWith(value),
        apply: (value, item) => value === ""
            || item.isLocked()
            || item.isChangingLockState(),
        maskIcon: value => value === "" ? undefined
            : "url(\"./image/svg/lock.svg\")",
    });
});
define("ui/inventory/filter/filters/FilterMasterwork", ["require", "exports", "ui/inventory/filter/Filter"], function (require, exports, Filter_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Filter_7.IFilter.createBoolean({
        id: Filter_7.default.Masterwork,
        colour: 0xd4b73c,
        suggestedValues: ["masterwork"],
        matches: value => "masterwork".startsWith(value),
        apply: (value, item) => value === ""
            || item.isMasterwork()
            || item.definition.hash === 4257549985 // asc shard
            || item.definition.hash === 4257549984 // enc prism
            || item.definition.hash === 3853748946 // enc core
            || item.definition.hash === 2979281381 // upg module
            || item.definition.hash === 353704689, // asc alloy
        maskIcon: value => value === "" ? undefined
            : "url(\"./image/svg/masterwork.svg\")",
    });
});
define("ui/inventory/filter/filters/FilterMoment", ["require", "exports", "model/models/Manifest", "ui/bungie/DisplayProperties", "ui/inventory/filter/Filter"], function (require, exports, Manifest_15, DisplayProperties_13, Filter_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Filter_8.IFilter.async(async () => {
        const { DeepsightMomentDefinition: DeepsightSourceDefinition } = await Manifest_15.default.await();
        const sources = (await DeepsightSourceDefinition.all())
            .sort((a, b) => b.hash - a.hash);
        function momentMatches(moment, value) {
            moment.displayProperties.nameLowerCase ??= moment.displayProperties.name?.toLowerCase();
            return moment.displayProperties.nameLowerCase?.startsWith(value)
                || moment.id.startsWith(value);
        }
        function getAllMatches(value) {
            return sources.filter(source => momentMatches(source, value));
        }
        return {
            id: Filter_8.default.Moment,
            prefix: "moment:",
            colour: 0x3B3287,
            suggestedValueHint: "expansion, season, or event",
            suggestedValues: sources.map(source => DisplayProperties_13.default.name(source) ?? source.id),
            or: true,
            apply: (value, item) => !item.moment ? false : momentMatches(item.moment, value),
            maskIcon: value => {
                if (!value)
                    return undefined;
                const matches = getAllMatches(value.toLowerCase());
                if (matches.length !== 1)
                    return undefined;
                const icon = matches[0].displayProperties.icon;
                return `url("${icon?.startsWith("/") ? `https://www.bungie.net${icon}` : icon}")`;
            },
        };
    });
});
define("ui/inventory/tooltip/ItemClarity", ["require", "exports", "model/models/enum/EnumModelMap", "ui/Classes", "ui/Component", "ui/bungie/EnumIcon", "utility/Env", "utility/Strings"], function (require, exports, EnumModelMap_2, Classes_15, Component_42, EnumIcon_7, Env_5, Strings_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemClarityDefinitions = exports.ItemClarityClasses = void 0;
    var ItemClarityClasses;
    (function (ItemClarityClasses) {
        ItemClarityClasses["Main"] = "item-plug-tooltip-clarity";
        ItemClarityClasses["Title"] = "item-plug-tooltip-clarity-title";
        ItemClarityClasses["TitleName"] = "item-plug-tooltip-clarity-title-name";
        ItemClarityClasses["Logo"] = "item-plug-tooltip-clarity-logo";
        ItemClarityClasses["Description"] = "item-plug-tooltip-clarity-description";
        ItemClarityClasses["Line"] = "item-plug-tooltip-clarity-line";
        ItemClarityClasses["ListItem"] = "item-plug-tooltip-clarity-list-item";
        ItemClarityClasses["Spacer"] = "item-plug-tooltip-clarity-spacer";
        ItemClarityClasses["Label"] = "item-plug-tooltip-clarity-label";
        ItemClarityClasses["LabelInline"] = "item-plug-tooltip-clarity-label-inline";
        ItemClarityClasses["Numeric"] = "item-plug-tooltip-clarity-numeric";
        ItemClarityClasses["NumericUnknown"] = "item-plug-tooltip-clarity-numeric-unknown";
        ItemClarityClasses["Estimate"] = "item-plug-tooltip-clarity-estimate";
        ItemClarityClasses["StackSizeSeparator"] = "item-plug-tooltip-clarity-stack-size-separator";
        ItemClarityClasses["EnhancedArrow"] = "item-plug-tooltip-clarity-enhanced-arrow";
        ItemClarityClasses["EnhancedLine"] = "item-plug-tooltip-clarity-enhanced-line";
        ItemClarityClasses["Table"] = "item-plug-tooltip-clarity-table";
        ItemClarityClasses["Table_IsFirstColumnAllLabels"] = "item-plug-tooltip-clarity-table_is-first-column-all-labels";
        ItemClarityClasses["TableRow"] = "item-plug-tooltip-clarity-table-row";
        ItemClarityClasses["TableCell"] = "item-plug-tooltip-clarity-table-cell";
        ItemClarityClasses["TableCellNumeric"] = "item-plug-tooltip-clarity-table-cell-numeric";
        ItemClarityClasses["TableCellText"] = "item-plug-tooltip-clarity-table-cell-text";
        ItemClarityClasses["PVE"] = "item-plug-tooltip-clarity-pve";
        ItemClarityClasses["PVP"] = "item-plug-tooltip-clarity-pvp";
        ItemClarityClasses["PVEVP"] = "item-plug-tooltip-clarity-pvevp";
        ItemClarityClasses["LabelPVEVP"] = "item-plug-tooltip-clarity-label-pvevp";
        ItemClarityClasses["LabelPVE"] = "item-plug-tooltip-clarity-label-pve";
        ItemClarityClasses["LabelPVP"] = "item-plug-tooltip-clarity-label-pvp";
        ItemClarityClasses["Definitions"] = "item-plug-tooltip-clarity-definitions";
        ItemClarityClasses["Definition"] = "item-plug-tooltip-clarity-definition";
        ItemClarityClasses["DefinitionName"] = "item-plug-tooltip-clarity-definition-name";
        ItemClarityClasses["DefinitionNameIndex"] = "item-plug-tooltip-clarity-definition-name-index";
    })(ItemClarityClasses || (exports.ItemClarityClasses = ItemClarityClasses = {}));
    class ItemClarity extends Component_42.default {
        get isPresent() {
            return !this.classes.has(Classes_15.Classes.Hidden);
        }
        onMake() {
            this.classes.add(ItemClarityClasses.Main);
            const title = Component_42.default.create()
                .classes.add(ItemClarityClasses.Title)
                .appendTo(this);
            Component_42.default.create("img")
                .classes.add(ItemClarityClasses.Logo)
                .attributes.set("src", "https://avatars.githubusercontent.com/u/117947315?s=48&v=4")
                .appendTo(title);
            Component_42.default.create("span")
                .classes.add(ItemClarityClasses.TitleName)
                .text.set("Clarity")
                .appendTo(title);
            title.text.add(" / Community Insights");
            this.description = Component_42.default.create()
                .appendTo(this);
        }
        set(clarityDescription) {
            this.classes.add(Classes_15.Classes.Hidden);
            this.description.removeContents();
            if (!clarityDescription?.descriptions.en?.length)
                return false;
            this.classes.remove(Classes_15.Classes.Hidden);
            appendClarityDescriptionComponents(this.description, clarityDescription.descriptions.en, { index: 0 });
            return true;
        }
    }
    exports.default = ItemClarity;
    class ItemClarityDefinitions extends Component_42.default {
        get isPresent() {
            return !this.classes.has(Classes_15.Classes.Hidden);
        }
        onMake() {
            this.classes.add(ItemClarityClasses.Definitions);
        }
        set(clarityDescription) {
            this.classes.add(Classes_15.Classes.Hidden);
            this.removeContents();
            let definitions;
            // eslint-disable-next-line prefer-const
            definitions = extractDefinitions(clarityDescription?.descriptions.en);
            if (!definitions?.length)
                return false;
            // uncomment to test multiple definitions
            // definitions = [...definitions.slice(), ...definitions.slice()];
            this.classes.remove(Classes_15.Classes.Hidden);
            for (let i = 0; i < definitions.length; i++) {
                const definition = definitions[i];
                Component_42.default.create()
                    .classes.add(ItemClarityClasses.Definition)
                    .classes.add(...classNames(definition))
                    .append(Component_42.default.create("p")
                    .classes.add(ItemClarityClasses.DefinitionName)
                    .append(Component_42.default.create("sup")
                    .classes.add(ItemClarityClasses.DefinitionNameIndex)
                    .text.set(`${i + 1}`))
                    .text.add(definition.text ?? ""))
                    .tweak(appendClarityDescriptionComponents, definition.title, { index: 0 })
                    .appendTo(this);
            }
        }
    }
    exports.ItemClarityDefinitions = ItemClarityDefinitions;
    function appendClarityDescriptionComponents(parent, content, definitionIndex, parentClassNames) {
        if (typeof content === "string")
            content = [{ text: content }];
        for (let i = 0; i < content.length; i++) {
            let component = content[i];
            const singleChild = component.linesContent?.length === 1 ? component.linesContent?.[0] : undefined;
            if (component.formula || singleChild?.formula)
                // can't render formulas
                continue;
            const isLast = i >= content.length - 1 || content.slice(i + 1).every(component => component.classNames?.includes("spacer") || component.formula || (component.linesContent?.length === 1 && component.linesContent[0].formula));
            const isLine = !!component.linesContent?.length;
            const isLabel = isLine && extractText(component.linesContent[component.linesContent.length - 1]).trimEnd().endsWith(":");
            const isListItem = isLine && extractText(component.linesContent[0]).trimStart().startsWith("• ");
            const isLabelledLine = isLine && Strings_5.default.includesOnce(extractText(component), ": ");
            const isEnhancedEffect = isLine && isLast && extractText(component.linesContent[0]).trimStart().startsWith("🡅");
            const isEnhancedArrow = component.classNames?.includes("enhancedArrow") ?? false;
            const isSpacer = component.classNames?.includes("spacer") ?? false;
            const isPVE = !parentClassNames?.includes("pve") && (component.classNames?.includes("pve") || singleChild?.classNames?.includes("pve") || false);
            const isPVP = !parentClassNames?.includes("pvp") && (component.classNames?.includes("pvp") || singleChild?.classNames?.includes("pvp") || false);
            const imageDef = component.classNames?.map(className => EnumModelMap_2.default[className]).find(def => def);
            if (imageDef) {
                EnumIcon_7.default.create(imageDef)
                    .appendTo(parent);
                continue;
            }
            if (isPVE || isPVP)
                component = trimTextMatchingFromStart(component, "[PVE] ", "[PVP] ", "[PVE]", "[PVP]", "[PvE] ", "[PvP] ", "[PvE]", "[PvP]");
            const element = Component_42.default.create(isLine ? "div" : isSpacer ? "br" : component.table?.length ? "div" : "span")
                .classes.toggle(isLine, ItemClarityClasses.Line)
                .classes.toggle(isListItem, ItemClarityClasses.ListItem)
                .classes.toggle(isSpacer, ItemClarityClasses.Spacer)
                .classes.toggle(isEnhancedEffect, ItemClarityClasses.EnhancedLine)
                .classes.toggle(isLabel, ItemClarityClasses.Label)
                .classes.toggle(isEnhancedArrow, ItemClarityClasses.EnhancedArrow)
                .classes.toggle(!!component.table?.length, ItemClarityClasses.Table)
                .classes.toggle(isPVE, ItemClarityClasses.PVE)
                .classes.toggle(isPVP, ItemClarityClasses.PVP)
                .classes.toggle(isPVE || isPVP, ItemClarityClasses.PVEVP)
                .classes.toggle(!!component.title, ItemClarityClasses.DefinitionName)
                .classes.add(...isLine ? [ItemClarityClasses.Line] : [], ...classNames(component))
                .append(!isPVE && !isPVP ? undefined : Component_42.default.create("span")
                .classes.add(ItemClarityClasses.LabelPVEVP, isPVE ? ItemClarityClasses.LabelPVE : ItemClarityClasses.LabelPVP)
                .text.set(isPVE ? "PVE" : "PVP"))
                .tweak(appendClarityText, isEnhancedArrow ? "" : component.text ?? "", component.classNames ?? [], isPVP || isPVE)
                .tweak(appendClarityDescriptionComponents, isLabelledLine ? [] : component.linesContent ?? [], definitionIndex, [...isPVE ? ["pve"] : [], ...isPVP ? ["pvp"] : [], ...isListItem ? ["list-item"] : []])
                .tweak(appendClarityTableRowComponents, component.table ?? [], definitionIndex)
                .tweak(appendClarityLabelledLineComponents, !isLabelledLine ? [] : component.linesContent, definitionIndex)
                .append(!component.title ? undefined : Component_42.default.create("sup")
                .classes.add(ItemClarityClasses.DefinitionNameIndex)
                .text.set(`${++definitionIndex.index}`));
            if (element.element.childNodes.length || element.element.classList.length)
                element.appendTo(parent);
        }
    }
    function appendClarityTableRowComponents(parent, rows, definitionIndex) {
        for (let c = 0; c < (rows[0]?.rowContent.length ?? 0); c++) {
            // delete columns where all rows (which aren't the first label row) are empty or a dash
            const shouldDeleteColumn = rows.every((row, i) => {
                const columnText = extractText(row.rowContent[c].cellContent).trim();
                return !columnText || columnText === "-" || (!i && !parseFloat(columnText));
            });
            if (shouldDeleteColumn) {
                rows = rows.map((row) => ({
                    ...row,
                    rowContent: row.rowContent.filter((cell, i) => i !== c),
                }));
            }
            if (!c && !shouldDeleteColumn) {
                // make a note of tables where the first column of every row is a label (or empty)
                const isFirstColumnAllLabels = rows.every((row, i) => {
                    const columnText = extractText(row.rowContent[c].cellContent).trim();
                    return !columnText || (!parseFloat(columnText) && !nonNumericNumberRegex.test(columnText));
                });
                parent.classes.toggle(isFirstColumnAllLabels, ItemClarityClasses.Table_IsFirstColumnAllLabels);
            }
        }
        for (const row of rows) {
            Component_42.default.create()
                .classes.add(ItemClarityClasses.TableRow, ...classNames(row))
                .tweak(appendClarityTableCellComponents, row.rowContent, definitionIndex)
                .appendTo(parent);
        }
    }
    const empy = [];
    function classNames(component) {
        return Env_5.default.DEEPSIGHT_ENVIRONMENT === "dev" ? component.classNames?.map(c => `-clarity-${c}`) ?? empy : empy;
    }
    function appendClarityTableCellComponents(parent, cells, definitionIndex) {
        for (const cell of cells) {
            const cellContent = extractText(cell.cellContent).trim();
            const isNumeric = !isNaN(parseFloat(cellContent)) || nonNumericNumberRegex.test(cellContent.replace(unknownValueBracketsRegex, "?"));
            Component_42.default.create()
                .classes.add(ItemClarityClasses.TableCell, ...classNames(cell))
                .classes.toggle(isNumeric, ItemClarityClasses.TableCellNumeric)
                .classes.toggle(!isNumeric, ItemClarityClasses.TableCellText)
                .tweak(appendClarityDescriptionComponents, cellContent === "-" ? [] : cell.cellContent, definitionIndex)
                .appendTo(parent);
        }
    }
    /**
     * Splits description content by `: `, wrapping the label section in an element to be styled.
     * This only detects `: ` instances in the `text` property in this level.
     * If no `: ` was detected all content is appended directly to the parent.
     */
    function appendClarityLabelledLineComponents(parent, content, definitionIndex) {
        const label = [];
        const value = [];
        let split = false;
        for (const component of content) {
            const sections = component.text?.split(": ");
            if (sections?.length === 2) {
                split = true;
                label.push({ ...component, text: sections[0] });
                value.push({ ...component, text: sections[1] });
            }
            else {
                (split ? value : label).push(component);
            }
        }
        if (!split) {
            appendClarityDescriptionComponents(parent, content, definitionIndex);
            return;
        }
        label.push({ text: ": " });
        Component_42.default.create("span")
            .classes.add(ItemClarityClasses.LabelInline)
            .tweak(appendClarityDescriptionComponents, label, definitionIndex)
            .appendTo(parent);
        appendClarityDescriptionComponents(parent, value, definitionIndex);
    }
    // use regular expressions to split out numbers, stack size separators `|`, and unknown values `(?)`
    const numericSplitNumericStart = /(?:(?<![\w\d.!+%-])|(?<=\d(?:st|nd|rd|th)-))(?=[x+-]?[.\d])/;
    const numericSplitUnknownStart = /(?<![\w\d.!+%-])(?=\?)/;
    const numericSplitNumericEnd = /(?<=[\d?][%x°+]?\??)(?![\dx?%°+.])/;
    const numericSplitRegex = Strings_5.default.mergeRegularExpressions("g", numericSplitNumericStart, numericSplitUnknownStart, numericSplitNumericEnd);
    const stackSizeSplitRegex = /(?=\|)|(?<=\|)/g;
    const unknownValueBracketsRegex = /\(\?\)|\[\?\]/g;
    const nonNumericNumberRegex = /^\?$|x[\d?]|[\d?](?:th|[%°-])/;
    function appendClarityText(parent, text, classNames, isPVEVP) {
        text = Strings_5.default.trimTextMatchingFromStart(text, "• ");
        if (isPVEVP)
            // pvp numeric values sometimes are wrapped in square brackets, we don't want them
            text = Strings_5.default.extractFromSquareBrackets(text);
        text = text.replace(unknownValueBracketsRegex, "?");
        const sections = text.split(numericSplitRegex);
        for (const section of sections) {
            if (!section)
                continue;
            const parsedFloat = !isNaN(parseFloat(Strings_5.default.trimTextMatchingFromStart(section, "x")));
            const nonNumericNumber = nonNumericNumberRegex.test(section);
            if (parsedFloat || nonNumericNumber) {
                Component_42.default.create("span")
                    .classes.add(ItemClarityClasses.Numeric)
                    .classes.toggle(nonNumericNumber, ItemClarityClasses.NumericUnknown)
                    .text.set(nonNumericNumber ? section
                    : Strings_5.default.trimTextMatchingFromEnd(section, "?"))
                    // sometimes numbers end in ? showing that it's an estimate, make that ? superscript
                    .append(nonNumericNumber || !section.endsWith("?") ? undefined
                    : Component_42.default.create("span")
                        .classes.add(ItemClarityClasses.Estimate)
                        .text.set("?"))
                    .appendTo(parent);
                continue;
            }
            const sections = section.split(stackSizeSplitRegex);
            for (const section of sections) {
                if (section.trim() === "|") {
                    Component_42.default.create("span")
                        .classes.add(ItemClarityClasses.StackSizeSeparator)
                        .text.set("/")
                        .appendTo(parent);
                    continue;
                }
                parent.text.add(section);
            }
        }
    }
    /**
     * Extracts text from description components.
     */
    function extractText(content) {
        content = typeof content === "string" ? [{ text: content }] : Array.isArray(content) ? content : [content];
        let result = "";
        for (const component of content) {
            result += component.text ?? "";
            if (component.linesContent?.length)
                result += extractText(component.linesContent);
        }
        return result;
    }
    function extractDefinitions(content) {
        if (Array.isArray(content))
            return content.flatMap(component => extractDefinitions(component.linesContent ?? component));
        return typeof content === "object" && content.text && content.title ? content : [];
    }
    function trimTextMatchingFromStart(content, ...matching) {
        if (!content)
            return undefined;
        if (typeof content === "string") {
            for (const text of matching)
                content = Strings_5.default.trimTextMatchingFromStart(content, text);
            return content;
        }
        if (Array.isArray(content)) {
            content = content.slice();
            content[0] = trimTextMatchingFromStart(content[0], ...matching);
            return content;
        }
        return {
            ...content,
            text: trimTextMatchingFromStart(content.text, ...matching),
            linesContent: trimTextMatchingFromStart(content.linesContent, ...matching),
        };
    }
});
define("ui/inventory/ItemPlugTooltip", ["require", "exports", "model/models/enum/DamageTypes", "ui/bungie/DisplayProperties", "ui/bungie/EnumIcon", "ui/bungie/LoadedIcon", "ui/Classes", "ui/Component", "ui/Hints", "ui/inventory/tooltip/ItemClarity", "ui/TooltipManager", "ui/UiEventBus", "utility/decorator/Bound", "utility/Strings"], function (require, exports, DamageTypes_5, DisplayProperties_14, EnumIcon_8, LoadedIcon_4, Classes_16, Component_43, Hints_2, ItemClarity_1, TooltipManager_3, UiEventBus_5, Bound_16, Strings_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemPlugTooltipClasses;
    (function (ItemPlugTooltipClasses) {
        ItemPlugTooltipClasses["Main"] = "item-plug-tooltip";
        ItemPlugTooltipClasses["Content"] = "item-plug-tooltip-content";
        ItemPlugTooltipClasses["Image"] = "item-plug-tooltip-image";
        ItemPlugTooltipClasses["Description"] = "item-plug-tooltip-description";
        ItemPlugTooltipClasses["IsPerk"] = "item-plug-tooltip--perk";
        ItemPlugTooltipClasses["IsEnhanced"] = "item-plug-tooltip--enhanced";
        ItemPlugTooltipClasses["IsExotic"] = "item-plug-tooltip--exotic";
        ItemPlugTooltipClasses["IsDamageType"] = "item-plug-tooltip--damage-type";
        ItemPlugTooltipClasses["Perks"] = "item-plug-tooltip-perks";
        ItemPlugTooltipClasses["Perk"] = "item-plug-tooltip-perk";
        ItemPlugTooltipClasses["PerkIsDisabled"] = "item-plug-tooltip-perk--disabled";
        ItemPlugTooltipClasses["PerkIcon"] = "item-plug-tooltip-perk-icon";
        ItemPlugTooltipClasses["PerkIconIsStat"] = "item-plug-tooltip-perk-icon--stat";
        ItemPlugTooltipClasses["PerkDescription"] = "item-plug-tooltip-perk-description";
        ItemPlugTooltipClasses["Keyword"] = "item-plug-tooltip-keyword";
        ItemPlugTooltipClasses["Keywords"] = "item-plug-tooltip-keywords";
        ItemPlugTooltipClasses["KeywordIcon"] = "item-plug-tooltip-keyword-icon";
        ItemPlugTooltipClasses["KeywordName"] = "item-plug-tooltip-keyword-name";
        ItemPlugTooltipClasses["KeywordDescription"] = "item-plug-tooltip-keyword-description";
        ItemPlugTooltipClasses["ClarityURL"] = "item-plug-tooltip-clarity-url";
        ItemPlugTooltipClasses["Extra"] = "item-plug-tooltip-extra";
        ItemPlugTooltipClasses["ExtraHeader"] = "item-plug-tooltip-extra-header";
        ItemPlugTooltipClasses["ExtraContent"] = "item-plug-tooltip-extra-content";
    })(ItemPlugTooltipClasses || (ItemPlugTooltipClasses = {}));
    class ItemPlugTooltip extends TooltipManager_3.Tooltip {
        onMake() {
            this.classes.add(ItemPlugTooltipClasses.Main);
            this.content.classes.add(ItemPlugTooltipClasses.Content);
            this.image = LoadedIcon_4.default.create([])
                .classes.add(ItemPlugTooltipClasses.Image)
                .appendTo(this.content);
            this.description = Component_43.default.create()
                .classes.add(ItemPlugTooltipClasses.Description)
                .appendTo(this.content);
            this.perks = Component_43.default.create()
                .classes.add(ItemPlugTooltipClasses.Perks)
                .appendTo(this.content);
            this.clarity = ItemClarity_1.default.create()
                .insertToAfter(this, this.content);
            this.hintShowDefinitions = Hints_2.Hint.create([Hints_2.IInput.get("KeyE")])
                .classes.add(Classes_16.Classes.ShowIfNotExtraInfo)
                .tweak(hint => hint.label.text.set("Show Definitions"))
                .appendTo(this.hints);
            Hints_2.Hint.create([Hints_2.IInput.get("MouseMiddle")])
                .tweak(hint => hint.label.text.add("Visit ")
                .append(Component_43.default.create("span")
                .classes.add(ItemPlugTooltipClasses.ClarityURL)
                .text.set("d2clarity.com")))
                .appendTo(this.hints);
            this.extra.classes.add(ItemPlugTooltipClasses.Extra);
            this.extra.header.classes.add(ItemPlugTooltipClasses.ExtraHeader);
            this.extra.content.classes.add(ItemPlugTooltipClasses.ExtraContent);
            this.keywords = ItemPlugKeywords.create()
                .appendTo(this.extra.content);
            this.clarityDefinitions = ItemClarity_1.ItemClarityDefinitions.create()
                .appendTo(this.extra.content);
            UiEventBus_5.default.subscribe("keyup", this.onGlobalKeyup);
        }
        set(plug, perk, item) {
            this.plug = plug;
            this.perk = perk;
            this.item = item;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            window.plug = plug;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            window.perk = perk;
            console.log(DisplayProperties_14.default.name(perk?.definition) ?? DisplayProperties_14.default.name(plug.definition), plug, perk);
            const damageType = plug.getCategorisationAs(4 /* DeepsightPlugCategory.Subclass */)?.damageType;
            this.classes.removeWhere(cls => cls.startsWith(ItemPlugTooltipClasses.IsDamageType))
                .classes.add(damageType && `${ItemPlugTooltipClasses.IsDamageType}-${DamageTypes_5.default.nameOf(damageType)}`);
            this.title.text.set(DisplayProperties_14.default.name(perk?.definition) ?? DisplayProperties_14.default.name(plug.definition));
            this.subtitle.removeContents();
            const keywords = [];
            const description = {
                character: item?.owner,
            };
            this.subtitle.text.set(plug.is("=Masterwork/ExoticCatalyst") ? "Catalyst" : plug.definition?.itemTypeDisplayName ?? "Unknown");
            this.description.tweak(DisplayProperties_14.default.applyDescription, DisplayProperties_14.default.description(perk?.definition) ?? DisplayProperties_14.default.description(plug.definition), description);
            if (description.keywords)
                keywords.push(description.keywords);
            this.header.classes.toggle(plug.is("Perk"), ItemPlugTooltipClasses.IsPerk);
            this.header.classes.toggle(plug.is("Perk/TraitEnhanced", "Intrinsic/FrameEnhanced", "=Masterwork/ExoticCatalyst"), ItemPlugTooltipClasses.IsEnhanced);
            this.header.classes.toggle((plug.is("Intrinsic") || plug.is("=Masterwork/ExoticCatalyst")) && item?.definition.inventory?.tierTypeHash === 2759499571 /* ItemTierTypeHashes.Exotic */, ItemPlugTooltipClasses.IsExotic);
            this.image.classes.toggle(!plug.definition?.secondaryIcon, Classes_16.Classes.Hidden)
                .setPath(plug.definition?.secondaryIcon && `https://www.bungie.net${plug.definition.secondaryIcon}`);
            this.perks.removeContents();
            if (!perk) {
                for (const perk of plug.perks) {
                    if (perk.perkVisibility === 2 /* ItemPerkVisibility.Hidden */ || !perk.definition.displayProperties.description)
                        continue;
                    if (plug.definition?.displayProperties.description && (perk.definition.displayProperties.description === plug.definition.displayProperties.description || Strings_6.default.fuzzyMatches(perk.definition.displayProperties.description, plug.definition.displayProperties.description)))
                        continue;
                    const subclassCategorisation = (perk.definition.displayProperties.name === plug.definition?.displayProperties.name || perk.definition.displayProperties.icon === plug.definition?.displayProperties.icon)
                        && plug.getCategorisationAs(4 /* DeepsightPlugCategory.Subclass */);
                    const icon = subclassCategorisation && subclassCategorisation.damageType
                        ? EnumIcon_8.default.create([DamageTypes_5.default, subclassCategorisation.damageType])
                        : !perk.definition.displayProperties.icon ? undefined
                            : LoadedIcon_4.default.create([`https://www.bungie.net${perk.definition.displayProperties.icon}`])
                                .classes.toggle(perk.definition.displayProperties.name === "Stat Penalty" || perk.definition.displayProperties.name === "Stat Increase", ItemPlugTooltipClasses.PerkIconIsStat);
                    const description = {};
                    Component_43.default.create()
                        .classes.add(ItemPlugTooltipClasses.Perk)
                        .classes.toggle(perk.perkVisibility === 1 /* ItemPerkVisibility.Disabled */, ItemPlugTooltipClasses.PerkIsDisabled)
                        .append(icon?.classes.add(ItemPlugTooltipClasses.PerkIcon))
                        .append(Component_43.default.create()
                        .classes.add(ItemPlugTooltipClasses.PerkDescription)
                        .tweak(DisplayProperties_14.default.applyDescription, DisplayProperties_14.default.description(perk.definition), description))
                        .appendTo(this.perks);
                    if (description.keywords)
                        keywords.push(description.keywords);
                }
            }
            this.clarity.set(plug.clarity);
            this.clarityDefinitions.set(plug.clarity);
            this.footer.classes.toggle(!this.clarity.isPresent, Classes_16.Classes.Hidden);
            this.extra.classes.toggle(!this.clarityDefinitions.isPresent, Classes_16.Classes.Hidden);
            this.hintShowDefinitions.classes.toggle(!this.clarityDefinitions.isPresent, Classes_16.Classes.Hidden);
            void this.keywords.set(Promise.all(keywords).then(keywords => keywords.flat()).then(keywords => {
                if (this.plug === plug) {
                    const hasDefs = this.clarityDefinitions.isPresent || !!keywords.length;
                    this.footer.classes.toggle(!this.clarity.isPresent && !hasDefs, Classes_16.Classes.Hidden);
                    this.extra.classes.toggle(!hasDefs, Classes_16.Classes.Hidden);
                    this.hintShowDefinitions.classes.toggle(!hasDefs, Classes_16.Classes.Hidden);
                }
                return keywords;
            }));
        }
        onGlobalKeyup(event) {
            if (this.clarity.isPresent && event.hovering(".view-item-socket-plug") && event.use("MouseMiddle")) {
                window.open("https://www.d2clarity.com", "_blank");
            }
        }
    }
    __decorate([
        Bound_16.default
    ], ItemPlugTooltip.prototype, "onGlobalKeyup", null);
    let set = 0;
    class ItemPlugKeywords extends Component_43.default {
        constructor() {
            super(...arguments);
            this.setTime = 0;
        }
        onMake() {
            this.classes.add(ItemPlugTooltipClasses.Keywords);
        }
        async set(keywords) {
            this.removeContents();
            const time = this.setTime = set++;
            keywords = await keywords;
            if (this.setTime !== time)
                return;
            for (const keyword of new Set(keywords)) {
                Component_43.default.create()
                    .classes.add(ItemPlugTooltipClasses.Keyword)
                    .append(!keyword.displayProperties.icon ? undefined
                    : LoadedIcon_4.default.create([`https://www.bungie.net${keyword.displayProperties.icon}`])
                        .classes.add(ItemPlugTooltipClasses.KeywordIcon))
                    .append(Component_43.default.create()
                    .classes.add(ItemPlugTooltipClasses.KeywordName)
                    .text.set(DisplayProperties_14.default.name(keyword)))
                    .append(Component_43.default.create()
                    .classes.add(ItemPlugTooltipClasses.KeywordDescription)
                    .tweak(DisplayProperties_14.default.applyDescription, DisplayProperties_14.default.description(keyword)))
                    .appendTo(this);
            }
        }
    }
    exports.default = TooltipManager_3.default.create(tooltip => tooltip
        .make(ItemPlugTooltip));
});
define("ui/inventory/filter/filters/FilterPerk", ["require", "exports", "model/models/Inventory", "ui/bungie/DisplayProperties", "ui/inventory/ItemPlugTooltip", "ui/inventory/filter/Filter", "utility/Arrays"], function (require, exports, Inventory_2, DisplayProperties_15, ItemPlugTooltip_1, Filter_9, Arrays_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Filter_9.IFilter.async(async () => {
        const inventory = await Inventory_2.default.await();
        const perks = [...new Map(Object.values(inventory.items ?? {})
                .flatMap(item => item.getSockets("Perk", "Intrinsic"))
                .flatMap(socket => socket.plugs)
                .map((plug) => !DisplayProperties_15.default.name(plug.definition) ? undefined : {
                plug,
                name: DisplayProperties_15.default.name(plug.definition),
                icon: DisplayProperties_15.default.icon(plug.definition),
            })
                .filter(Arrays_7.default.filterFalsy)
                .map(plug => [plug.name, plug])).values()];
        function getMatchingPerk(filterValue) {
            filterValue = filterValue.toLowerCase();
            let match;
            for (const perk of perks) {
                if (perk.name.toLowerCase().startsWith(filterValue)) {
                    if (match)
                        return undefined;
                    match = perk;
                }
            }
            return match;
        }
        return ({
            id: Filter_9.default.Perk,
            prefix: "perk:",
            colour: 0x4887ba,
            suggestedValueHint: "perk name",
            suggestedValues: perks,
            apply: (value, item) => {
                return item.sockets.some(socket => socket?.plugs.some(plug => {
                    if (!plug.definition)
                        return false;
                    plug.definition.displayProperties.nameLowerCase ??= plug.definition.displayProperties.name.toLowerCase();
                    return plug.definition.displayProperties.nameLowerCase.startsWith(value);
                })) ?? false;
            },
            icon: filterValue => getMatchingPerk(filterValue)?.icon,
            tweakChip: (chip, filterValue) => {
                const perk = getMatchingPerk(filterValue);
                if (!perk?.plug)
                    return;
                chip.setTooltip(ItemPlugTooltip_1.default, {
                    initialise: tooltip => perk?.plug && tooltip.set(perk.plug),
                    differs: tooltip => tooltip.plug?.plugItemHash !== perk?.plug.plugItemHash,
                });
            },
        });
    });
});
define("ui/inventory/Rarities", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Rarities;
    (function (Rarities) {
        Rarities.COLOURS = {
            [3772930460 /* ItemTierTypeHashes.BasicCurrency */]: 0xdddddd,
            [1801258597 /* ItemTierTypeHashes.BasicQuest */]: 0xdddddd,
            [3340296461 /* ItemTierTypeHashes.Common */]: 0xdddddd,
            [2395677314 /* ItemTierTypeHashes.Uncommon */]: 0x5fa16d,
            [2127292149 /* ItemTierTypeHashes.Rare */]: 0x7eaadf,
            [4008398120 /* ItemTierTypeHashes.Legendary */]: 0x774493,
            [2759499571 /* ItemTierTypeHashes.Exotic */]: 0xf5dc56,
        };
        function getColour(tier) {
            return Rarities.COLOURS[tier]
                ?.toString(16)
                .padStart(6, "0")
                .padStart(7, "#");
        }
        Rarities.getColour = getColour;
    })(Rarities || (Rarities = {}));
    exports.default = Rarities;
});
define("ui/inventory/filter/filters/FilterRarity", ["require", "exports", "model/models/Manifest", "ui/inventory/Rarities", "ui/inventory/filter/Filter"], function (require, exports, Manifest_16, Rarities_1, Filter_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Filter_10.IFilter.async(async () => {
        const { DeepsightTierTypeDefinition } = await Manifest_16.default.await();
        const tiers = (await DeepsightTierTypeDefinition.all())
            .sort((a, b) => b.tierType - a.tierType);
        function definition(value, item) {
            if (value === "")
                return null;
            const resultDamages = tiers.filter(element => element.displayProperties.name?.toLowerCase().startsWith(value)
                && (!item || element.hash === item.definition.inventory?.tierTypeHash));
            if (resultDamages.length === 1)
                return resultDamages[0];
            if (resultDamages.length > 1)
                return null;
            return undefined;
        }
        return {
            id: Filter_10.default.Rarity,
            prefix: "rarity:",
            suggestedValues: Array.from(new Set(tiers.map(element => element.displayProperties.name?.toLowerCase()).filter(v => v))),
            or: true,
            matches: value => tiers.some(element => element.displayProperties.name?.toLowerCase().startsWith(value)),
            apply: (value, item) => definition(value, item) !== undefined,
            colour: value => Rarities_1.default.getColour(definition(value)?.hash) ?? 0xdddddd,
            maskIcon: value => value === "" ? undefined
                : "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/engram.svg\")",
        };
    });
});
define("ui/inventory/filter/filters/FilterShaped", ["require", "exports", "ui/inventory/filter/Filter"], function (require, exports, Filter_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Filter_11.IFilter.createBoolean({
        id: Filter_11.default.Shaped,
        colour: 0xff8d5c,
        suggestedValues: ["shaped"],
        matches: value => "shaped".startsWith(value),
        apply: (value, item) => value === "" || !!item.shaped,
        maskIcon: value => value === "" ? undefined
            : "url(\"./image/svg/shaped.svg\")",
    });
});
define("ui/inventory/filter/filters/FilterWeaponType", ["require", "exports", "model/models/Inventory", "model/models/enum/WeaponTypes", "ui/inventory/filter/Filter", "utility/Arrays"], function (require, exports, Inventory_3, WeaponTypes_2, Filter_12, Arrays_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Filter_12.IFilter.async(async () => {
        const inventory = await Inventory_3.default.await();
        return ({
            id: Filter_12.default.WeaponType,
            prefix: "type:",
            colour: 0x333333,
            suggestedValueHint: "weapon type name",
            suggestedValues: [...new Set(Object.values(inventory.items ?? {})
                    .filter(item => item.definition.itemType === 3 /* DestinyItemType.Weapon */)
                    .map(item => item.definition.itemTypeDisplayName)
                    .filter(Arrays_8.default.filterFalsy))],
            or: true,
            apply: (value, item) => {
                item.definition.itemTypeDisplayNameLowerCase ??= (item.definition.itemTypeDisplayName ?? "Unknown").toLowerCase();
                return item.definition.itemTypeDisplayNameLowerCase.startsWith(value);
            },
            maskIcon: WeaponTypes_2.default,
        });
    });
});
define("ui/inventory/filter/FilterManager", ["require", "exports", "ui/inventory/filter/Filter", "ui/inventory/filter/filters/FilterAdept", "ui/inventory/filter/filters/FilterAmmo", "ui/inventory/filter/filters/FilterElement", "ui/inventory/filter/filters/FilterHarmonizable", "ui/inventory/filter/filters/FilterLocked", "ui/inventory/filter/filters/FilterMasterwork", "ui/inventory/filter/filters/FilterMoment", "ui/inventory/filter/filters/FilterPerk", "ui/inventory/filter/filters/FilterRarity", "ui/inventory/filter/filters/FilterShaped", "ui/inventory/filter/filters/FilterWeaponType", "utility/Arrays", "utility/Strings"], function (require, exports, Filter_13, FilterAdept_1, FilterAmmo_1, FilterElement_1, FilterHarmonizable_1, FilterLocked_1, FilterMasterwork_1, FilterMoment_1, FilterPerk_1, FilterRarity_1, FilterShaped_1, FilterWeaponType_1, Arrays_9, Strings_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let filterMap;
    class FilterManager {
        constructor(configuration) {
            this.current = [];
            this.last = [];
            Object.assign(this, configuration);
        }
        static async init() {
            if (filterMap)
                return;
            const initialFilterMap = {
                [Filter_13.default.Ammo]: FilterAmmo_1.default,
                [Filter_13.default.Element]: await (0, FilterElement_1.default)(),
                [Filter_13.default.WeaponType]: await (0, FilterWeaponType_1.default)(),
                [Filter_13.default.Perk]: await (0, FilterPerk_1.default)(),
                [Filter_13.default.Moment]: await (0, FilterMoment_1.default)(),
                [Filter_13.default.Shaped]: FilterShaped_1.default,
                [Filter_13.default.Masterwork]: FilterMasterwork_1.default,
                [Filter_13.default.Locked]: FilterLocked_1.default,
                [Filter_13.default.Harmonizable]: FilterHarmonizable_1.default,
                [Filter_13.default.Rarity]: await (0, FilterRarity_1.default)(),
                [Filter_13.default.Adept]: FilterAdept_1.default,
                [Filter_13.default.Raw]: {
                    id: Filter_13.default.Raw,
                    prefix: "",
                    colour: undefined,
                    apply: (value, item) => new RegExp(`(?<=^| )${value}`).test(item.definition.displayProperties.name.toLowerCase()),
                },
            };
            for (let [type, filterArr] of Object.entries(initialFilterMap)) {
                filterArr = Arrays_9.default.resolve(filterArr);
                for (let i = 0; i < filterArr.length; i++) {
                    const filter = filterArr[i];
                    if (+type !== filter.id)
                        throw new Error(`Filter ${Filter_13.default[+type]} implementation miscategorised`);
                    filter.internalName ??= Filter_13.default[filter.id].toLowerCase();
                    filter.id = (i ? `${filter.id}:${i}` : filter.id);
                    initialFilterMap[filter.id] = filter;
                }
            }
            filterMap = initialFilterMap;
        }
        getApplicable() {
            return Object.values(filterMap)
                .filter(filter => !this.inapplicable.some(inapplicable => `${filter.id}`.startsWith(`${inapplicable}`)))
                .sort((a, b) => parseInt(`${a.id}`) - parseInt(`${b.id}`));
        }
        apply(item) {
            const orFilters = Array.from(new Set(this.current.map(filter => filter.filter)))
                .filter(filterId => filterMap[filterId].or)
                .map(filterId => this.current.filter(filter => filter.filter === filterId));
            const otherFilters = this.current.filter(filter => !filterMap[filter.filter].or);
            return otherFilters.every(filter => filterMap[filter.filter].apply(filter.value, item))
                && orFilters.every(instances => instances.some(filter => filterMap[filter.filter].apply(filter.value, item)));
        }
        add(token) {
            token = token.toLowerCase();
            for (const filter of this.getApplicable()) {
                if (!token.startsWith(filter.prefix))
                    continue;
                const value = Strings_7.default.extractFromQuotes(token.slice(filter.prefix.length));
                if (filter.matches?.(value) ?? true) {
                    this.current.push({
                        filter: filter.id,
                        value,
                    });
                    return filter;
                }
            }
            console.error(`Somehow, no filters matched the token "${token}" 😕`);
        }
        reset() {
            this.current.splice(0, Infinity);
        }
        hasChanged() {
            const isIdentical = this.last.length === this.current.length
                && this.last.every((filter, i) => filter.filter === this.current[i].filter
                    && filter.value === this.current[i].value);
            // it's alright that it's the same filters, they get dumped from current rather than modified
            this.last = this.current.slice();
            return !isIdentical;
        }
        getFilterIds() {
            return this.current.map(filter => `${filterMap[filter.filter].prefix}${filter.value}`);
        }
    }
    exports.default = FilterManager;
});
define("ui/view/inventory/InventoryView", ["require", "exports", "model/models/Characters", "model/models/items/Bucket", "model/models/items/Item", "ui/Classes", "ui/Component", "ui/Hints", "ui/UiEventBus", "ui/View", "ui/form/Button", "ui/form/Drawer", "ui/inventory/DraggableItemComponent", "ui/inventory/ItemComponent", "ui/inventory/bucket/BucketComponents", "ui/inventory/filter/FilterManager", "ui/inventory/filter/ItemFilter", "ui/inventory/sort/ItemSort", "ui/inventory/sort/SortManager", "utility/Arrays", "utility/Store", "utility/decorator/Bound"], function (require, exports, Characters_5, Bucket_9, Item_3, Classes_17, Component_44, Hints_3, UiEventBus_6, View_1, Button_7, Drawer_3, DraggableItemComponent_1, ItemComponent_3, BucketComponents_1, FilterManager_1, ItemFilter_1, ItemSort_1, SortManager_1, Arrays_10, Store_13, Bound_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InventoryViewClasses = void 0;
    var InventoryViewClasses;
    (function (InventoryViewClasses) {
        InventoryViewClasses["Main"] = "view-inventory";
        InventoryViewClasses["Content"] = "view-inventory-content";
        InventoryViewClasses["Footer"] = "view-inventory-footer";
        InventoryViewClasses["SlotPendingRemoval"] = "view-inventory-pending-removal";
        InventoryViewClasses["HighestPower"] = "view-inventory-highest-power";
        InventoryViewClasses["ItemMoving"] = "view-inventory-item-moving";
        InventoryViewClasses["ItemMovingOriginal"] = "view-inventory-item-moving-original";
        InventoryViewClasses["BucketDropTarget"] = "view-inventory-bucket-drop-target";
        InventoryViewClasses["BucketMovingFrom"] = "view-inventory-bucket-moving-from";
        InventoryViewClasses["Hints"] = "view-inventory-hints";
        InventoryViewClasses["HintsButton"] = "view-inventory-hints-button";
        InventoryViewClasses["HintsDrawer"] = "view-inventory-hints-drawer";
        InventoryViewClasses["Hint"] = "view-inventory-hint";
        InventoryViewClasses["HintIcon"] = "view-inventory-hint-icon";
        InventoryViewClasses["ItemFilteredOut"] = "view-inventory-item-filtered-out";
        InventoryViewClasses["LayoutColumns"] = "view-inventory-layout-columns";
        InventoryViewClasses["LayoutRows"] = "view-inventory-layout-rows";
        InventoryViewClasses["LayoutBucket"] = "view-inventory-layout-bucket";
    })(InventoryViewClasses || (exports.InventoryViewClasses = InventoryViewClasses = {}));
    class InventoryViewWrapper extends View_1.default.WrapperComponent {
    }
    class InventoryView extends Component_44.default.makeable().of(InventoryViewWrapper) {
        async onMake(inventory) {
            InventoryView.hasExisted = true;
            InventoryView.current = this;
            this.inventory = inventory;
            inventory.setShouldSkipCharacters(() => !InventoryView.current);
            this.classes.add(InventoryViewClasses.Main);
            this.super.content.classes.add(InventoryViewClasses.Content);
            if (!Characters_5.default.hasAny()) {
                this.super.setTitle(title => title.text.set("No Guardians Were Found..."));
                this.super.setSubtitle("small", subtitle => subtitle.text.set("Your ghost continues its search..."));
                return;
            }
            this.bucketComponents = {};
            this.equipped = {};
            this.itemMap = new Map();
            await SortManager_1.default.init();
            this.super.definition.layout?.(this);
            inventory.event.subscribe("update", this.update);
            this.event.subscribe("hide", () => {
                inventory.event.unsubscribe("update", this.update);
                if (InventoryView.current === this)
                    delete InventoryView.current;
            });
            this.preUpdateInit();
            this.update();
            this.super.footer.classes.add(InventoryViewClasses.Footer);
            await FilterManager_1.default.init();
            this.initSortAndFilter();
            this.hints = Component_44.default.create()
                .classes.add(InventoryViewClasses.Hints)
                .event.subscribe("mouseenter", () => this.hintsDrawer.open("mouse"))
                .event.subscribe("mouseleave", () => this.hintsDrawer.close("mouse"))
                .appendTo(this.super.footer);
            Button_7.default.create()
                .classes.remove(Button_7.ButtonClasses.Main)
                .classes.add(InventoryViewClasses.HintsButton, View_1.default.Classes.FooterButton)
                .addIcon(icon => icon.classes.add(InventoryViewClasses.HintIcon))
                .tweak(button => button.innerIcon?.classes.add(View_1.default.Classes.FooterButtonIcon))
                .append(Component_44.default.create()
                .classes.add(View_1.default.Classes.FooterButtonLabel)
                .text.set("Help"))
                .append(Component_44.default.create()
                .classes.add(View_1.default.Classes.FooterButtonText)
                .text.set("Keybinds & more"))
                .event.subscribe("click", () => this.hintsDrawer.toggle("click"))
                .appendTo(this.hints);
            this.hintsDrawer = Drawer_3.default.create()
                .classes.add(InventoryViewClasses.HintsDrawer)
                .appendTo(this.hints);
            this.hintsDrawer.createPanel()
                .append(Component_44.default.create("p")
                .classes.add(InventoryViewClasses.Hint)
                .append(Hints_3.Hint.create([Hints_3.IInput.get("KeyF1")]))
                .text.add("\xa0 Player overview"))
                .append(Component_44.default.create("p")
                .classes.add(InventoryViewClasses.Hint)
                .classes.toggle(!!Store_13.default.items.settingsAlwaysShowExtra, Classes_17.Classes.Hidden)
                .append(Hints_3.Hint.create([Hints_3.IInput.get("KeyE")]))
                .text.add("\xa0 More information"))
                .append(Component_44.default.create("p")
                .classes.add(InventoryViewClasses.Hint)
                .append(Hints_3.Hint.create([Hints_3.IInput.get("KeyS", "Ctrl")]))
                .text.add("\xa0 Configure sort"))
                .append(Component_44.default.create("p")
                .classes.add(InventoryViewClasses.Hint)
                .append(Hints_3.Hint.create([Hints_3.IInput.get("KeyF", "Ctrl")]))
                .text.add("\xa0 Configure filter"));
            UiEventBus_6.default.subscribe("keydown", this.onGlobalKeydown);
        }
        addBuckets(bucketIds, initialiser) {
            for (const bucketId of Arrays_10.default.resolve(bucketIds))
                this.bucketComponents[bucketId] = BucketComponents_1.default.create(bucketId, this)
                    .setSortedBy(this.super.definition.sort)
                    .tweak(initialiser)
                    .appendTo(this.super.content);
            return this;
        }
        addBucketsTo(component, bucketIds, initialiser) {
            for (const bucketId of Arrays_10.default.resolve(bucketIds))
                this.bucketComponents[bucketId] = BucketComponents_1.default.create(bucketId, this)
                    .setSortedBy(this.super.definition.sort)
                    .tweak(initialiser)
                    .appendTo(component);
            return this;
        }
        getBuckets() {
            return Object.values(this.bucketComponents ?? {});
        }
        getBucket(value) {
            if (!value)
                return undefined;
            const bucket = this.bucketComponents[typeof value === "string" ? value : value instanceof Bucket_9.Bucket ? value.id : value.bucket.id];
            if (bucket)
                return bucket;
            return !(value instanceof Item_3.default) ? undefined
                : Object.values(this.bucketComponents)
                    .find(bucket => bucket?.items.includes(value));
        }
        getVaultBucket(character) {
            return (character && this.bucketComponents[Bucket_9.Bucket.id(138197802 /* InventoryBucketHashes.General */, character)])
                ?? this.bucketComponents[Bucket_9.Bucket.id(138197802 /* InventoryBucketHashes.General */)];
        }
        getPostmasterBucket(character) {
            return character && this.bucketComponents[Bucket_9.Bucket.id(215593132 /* InventoryBucketHashes.LostItems */, character)];
        }
        getItemComponent(item) {
            if (!item)
                return undefined;
            let itemComponent = this.itemMap.get(item);
            if (itemComponent)
                return itemComponent;
            itemComponent = this.createItemComponent(item);
            this.itemMap.set(item, itemComponent);
            return itemComponent;
        }
        preUpdateInit() { }
        initSortAndFilter() {
            this.sorter = ItemSort_1.default.create([this.super.definition.sort])
                .event.subscribe("sort", this.sort)
                .tweak(itemSort => itemSort.button
                .classes.remove(Button_7.ButtonClasses.Main)
                .classes.add(View_1.default.Classes.FooterButton)
                .innerIcon?.classes.add(View_1.default.Classes.FooterButtonIcon))
                .tweak(itemSort => itemSort.label.classes.add(View_1.default.Classes.FooterButtonLabel))
                .tweak(itemSort => itemSort.sortText.classes.add(View_1.default.Classes.FooterButtonText))
                .appendTo(this.super.footer);
            this.filterer = ItemFilter_1.default.getFor(this.super.definition.filter)
                .event.subscribe("filter", this.filter)
                .event.subscribe("submit", () => document.querySelector(`.${ItemComponent_3.ItemClasses.Main}:not([tabindex="-1"])`)?.focus())
                .tweak(itemFilter => itemFilter.button
                .classes.remove(Button_7.ButtonClasses.Main)
                .classes.add(View_1.default.Classes.FooterButton)
                .innerIcon?.classes.add(View_1.default.Classes.FooterButtonIcon))
                .tweak(itemFilter => itemFilter.label.classes.add(View_1.default.Classes.FooterButtonLabel))
                .tweak(itemFilter => itemFilter.input.classes.add(View_1.default.Classes.FooterButtonText))
                .appendTo(this.super.footer);
            this.filter();
        }
        update() {
            this.updateItems();
            this.sort();
            this.filter();
        }
        updateItems() {
            const bucketEntries = Object.entries(this.inventory.buckets ?? {});
            for (const [item, component] of this.itemMap) {
                if (!bucketEntries.some(([, bucket]) => bucket.items.includes(item))) {
                    // this item doesn't exist anymore
                    component.remove();
                    this.itemMap.delete(item);
                }
            }
        }
        sort() {
            for (const bucket of Object.values(this.bucketComponents)) {
                bucket?.update();
            }
        }
        filter() {
            for (const [item, component] of this.itemMap) {
                const filteredOut = !this.super.definition.filter.apply(item);
                component.classes.toggle(filteredOut, InventoryViewClasses.ItemFilteredOut)
                    .attributes.toggle(filteredOut, "tabindex", "-1");
            }
        }
        onGlobalKeydown(event) {
            if (!document.contains(this.element)) {
                UiEventBus_6.default.unsubscribe("keydown", this.onGlobalKeydown);
                return;
            }
            if (this.hintsDrawer.isOpen() && event.useOverInput("Escape")) {
                this.hintsDrawer.close(true);
            }
            if (this.filterer.isFiltered() && event.use("Escape")) {
                this.filterer.reset();
            }
        }
        onItemMoveStart(item, event) {
            this.super.definition.onItemMoveStart?.(this, this.super, item, event);
        }
        createItemComponent(item) {
            item.event.subscribe("bucketChange", this.update);
            if (!item.canTransfer())
                return ItemComponent_3.default.create([item, this.inventory]);
            return DraggableItemComponent_1.default.create([item, this.inventory, {
                    createItemPlaceholder: item => {
                        this.itemMoving?.remove();
                        this.itemMoving = item.appendTo(this);
                    },
                    disposeItemPlaceholder: item => {
                        if (this.itemMoving === item)
                            delete this.itemMoving;
                    },
                    moveStart: event => {
                        if (window.innerWidth <= 800)
                            return event.preventDefault();
                        this.getBucket(item)
                            ?.classes.add(InventoryViewClasses.BucketMovingFrom);
                        this.onItemMoveStart(item, event);
                    },
                    move: event => {
                        for (const bucket of this.getBuckets()) {
                            if (!bucket || bucket.is(1469714392 /* InventoryBucketHashes.Consumables */, 3313201758 /* InventoryBucketHashes.Modifications */, 215593132 /* InventoryBucketHashes.LostItems */))
                                continue;
                            for (const { component } of bucket.getDropTargets())
                                component.classes.toggle(component.intersects(event.mouse, true) && !component.element.matches(`.${Classes_17.Classes.Hidden} *`), InventoryViewClasses.BucketDropTarget);
                        }
                    },
                    moveEnd: async (event) => {
                        this.getBucket(item)
                            ?.classes.remove(InventoryViewClasses.BucketMovingFrom);
                        let dropBucket;
                        let dropEquipped = false;
                        for (const bucket of this.getBuckets()) {
                            if (!bucket || bucket.is(1469714392 /* InventoryBucketHashes.Consumables */, 3313201758 /* InventoryBucketHashes.Modifications */, 215593132 /* InventoryBucketHashes.LostItems */, 3284755031 /* InventoryBucketHashes.Subclass */))
                                continue;
                            let intersections = false;
                            for (const { component, equipped } of bucket.getDropTargets()) {
                                component.classes.remove(InventoryViewClasses.BucketDropTarget);
                                if (!intersections && !dropBucket && component.intersects(event.mouse, true) && !component.element.matches(`.${Classes_17.Classes.Hidden} *`)) {
                                    intersections = true;
                                    dropEquipped = equipped;
                                }
                            }
                            if (!intersections || dropBucket)
                                continue;
                            dropBucket = bucket;
                        }
                        if (!dropBucket?.bucket)
                            return;
                        if (item.bucket.id === dropBucket.bucket.id && item.equipped === dropEquipped)
                            return;
                        if (dropBucket.bucket.isCharacter()) {
                            if (dropEquipped)
                                return item.equip(dropBucket.bucket.characterId);
                            else if (item.equipped && item.bucket.id === dropBucket.bucket.id)
                                return item.unequip();
                        }
                        await item.transferToBucket(dropBucket.bucket);
                    },
                }]);
        }
    }
    exports.default = InventoryView;
    __decorate([
        Bound_17.default
    ], InventoryView.prototype, "addBuckets", null);
    __decorate([
        Bound_17.default
    ], InventoryView.prototype, "addBucketsTo", null);
    __decorate([
        Bound_17.default
    ], InventoryView.prototype, "update", null);
    __decorate([
        Bound_17.default
    ], InventoryView.prototype, "sort", null);
    __decorate([
        Bound_17.default
    ], InventoryView.prototype, "filter", null);
    __decorate([
        Bound_17.default
    ], InventoryView.prototype, "onGlobalKeydown", null);
});
define("utility/Tuples", ["require", "exports", "utility/Arrays"], function (require, exports, Arrays_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Tuples;
    (function (Tuples) {
        function make(...values) {
            return values;
        }
        Tuples.make = make;
        const nullishFilters = Object.fromEntries(Arrays_11.default.range(6)
            .map(index => make(index, (value) => value[index] !== undefined && value[index] !== null)));
        function filterNullish(index) {
            return nullishFilters[index];
        }
        Tuples.filterNullish = filterNullish;
        const falsyFilters = Object.fromEntries(Arrays_11.default.range(6)
            .map(index => make(index, (value) => value[index])));
        function filterFalsy(index) {
            return falsyFilters[index];
        }
        Tuples.filterFalsy = filterFalsy;
        function getter(index) {
            return tuple => tuple[index];
        }
        Tuples.getter = getter;
        function filter(index, predicate) {
            return (tuple, i) => predicate(tuple[index], i);
        }
        Tuples.filter = filter;
    })(Tuples || (Tuples = {}));
    exports.default = Tuples;
});
define("ui/view/inventory/slot/IInventorySlotView", ["require", "exports", "utility/Tuples"], function (require, exports, Tuples_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InventorySlotViewHandler = exports.IInventorySlotViewDefinition = void 0;
    var IInventorySlotViewDefinition;
    (function (IInventorySlotViewDefinition) {
        function is(definition) {
            return definition !== undefined && "slot" in definition && typeof definition.slot === "number";
        }
        IInventorySlotViewDefinition.is = is;
        function as(definition) {
            return is(definition) ? definition : undefined;
        }
        IInventorySlotViewDefinition.as = as;
    })(IInventorySlotViewDefinition || (exports.IInventorySlotViewDefinition = IInventorySlotViewDefinition = {}));
    var InventorySlotViewHandler;
    (function (InventorySlotViewHandler) {
        function getSorter(item) {
            return Object.values(viewManager.registry)
                .map(view => Tuples_1.default.make(view, IInventorySlotViewDefinition.is(view.definition) ? view.definition.slot : undefined))
                .findMap(Tuples_1.default.filter(1, slot => slot === item.definition.inventory?.bucketTypeHash), ([view]) => IInventorySlotViewDefinition.as(view.definition)?.sort);
        }
        InventorySlotViewHandler.getSorter = getSorter;
    })(InventorySlotViewHandler || (exports.InventorySlotViewHandler = InventorySlotViewHandler = {}));
});
define("ui/view/inventory/slot/InventorySlotView", ["require", "exports", "model/models/Characters", "model/models/Inventory", "model/models/items/Bucket", "ui/Component", "ui/View", "ui/view/inventory/InventoryView"], function (require, exports, Characters_6, Inventory_4, Bucket_10, Component_45, View_2, InventoryView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InventorySlotViewClasses = void 0;
    var InventorySlotViewClasses;
    (function (InventorySlotViewClasses) {
        InventorySlotViewClasses["Column"] = "view-inventory-slot-column";
        InventorySlotViewClasses["CharacterBuckets"] = "view-inventory-slot-character-buckets";
        InventorySlotViewClasses["CharacterBucket"] = "view-inventory-slot-character-bucket";
        InventorySlotViewClasses["VaultBucket"] = "view-inventory-slot-vault-bucket";
        InventorySlotViewClasses["VaultBuckets"] = "view-inventory-slot-vault-buckets";
        InventorySlotViewClasses["VaultBucketMerged"] = "view-inventory-slot-vault-bucket-merged";
        InventorySlotViewClasses["PostmasterBucket"] = "view-inventory-slot-postmaster-bucket";
        InventorySlotViewClasses["PostmasterBuckets"] = "view-inventory-slot-postmaster-buckets";
    })(InventorySlotViewClasses || (exports.InventorySlotViewClasses = InventorySlotViewClasses = {}));
    exports.default = new View_2.default.Factory()
        .using(Inventory_4.default.createModel())
        .define()
        .initialise((view, model) => view.make(InventoryView_1.default, model))
        .wrapper()
        .configure(definition => ({
        layout: view => {
            const charactersColumn = Component_45.default.create()
                .classes.add(InventorySlotViewClasses.CharacterBuckets, InventorySlotViewClasses.Column)
                .appendTo(view.super.content);
            Characters_6.default.getSorted()
                .map(character => Bucket_10.Bucket.id(definition.slot, character.characterId))
                .collect(bucketIds => view.addBucketsTo(charactersColumn, bucketIds, bucket => bucket
                .classes.add(InventorySlotViewClasses.CharacterBucket)));
            const vaultsColumn = Component_45.default.create()
                .classes.add(InventorySlotViewClasses.VaultBuckets, InventorySlotViewClasses.Column)
                .appendTo(view.super.content);
            if (definition.mergedVaults)
                view.addBucketsTo(vaultsColumn, Bucket_10.Bucket.id(138197802 /* InventoryBucketHashes.General */, undefined, definition.slot), bucket => bucket
                    .classes.add(InventorySlotViewClasses.VaultBucket, InventorySlotViewClasses.VaultBucketMerged));
            else
                Characters_6.default.getSorted()
                    .map(character => Bucket_10.Bucket.id(138197802 /* InventoryBucketHashes.General */, character.characterId, definition.slot))
                    .collect(bucketIds => view.addBucketsTo(vaultsColumn, bucketIds, bucket => bucket
                    .classes.add(InventorySlotViewClasses.VaultBucket)));
            Component_45.default.create()
                .classes.add(InventorySlotViewClasses.PostmasterBuckets, InventorySlotViewClasses.Column)
                .appendTo(view.super.content)
                .tweak(column => Characters_6.default.getSorted()
                .map(character => Bucket_10.Bucket.id(215593132 /* InventoryBucketHashes.LostItems */, character.characterId))
                .collect(bucketIds => view.addBucketsTo(column, bucketIds, bucket => bucket
                .classes.add(InventorySlotViewClasses.PostmasterBucket))));
        },
    }));
});
define("ui/view/inventory/slot/InventoryArmourSlotView", ["require", "exports", "ui/inventory/filter/Filter", "ui/inventory/filter/FilterManager", "ui/inventory/sort/Sort", "ui/inventory/sort/SortManager", "ui/view/inventory/slot/InventorySlotView"], function (require, exports, Filter_14, FilterManager_2, Sort_22, SortManager_2, InventorySlotView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FILTER_MANAGER_ARMOUR_DEFINITION = exports.SORT_MANAGER_ARMOUR_DEFINITION = exports.VIEW_NAME_ARMOUR = exports.VIEW_ID_ARMOUR = exports.FILTERS_INAPPLICABLE_ARMOUR = exports.SORTS_INAPPLICABLE_ARMOUR = exports.SORTS_DEFAULT_ARMOUR = void 0;
    exports.SORTS_DEFAULT_ARMOUR = [Sort_22.default.Exotic, Sort_22.default.Rarity, Sort_22.default.StatDistribution, Sort_22.default.Masterwork, Sort_22.default.Power, Sort_22.default.Energy];
    exports.SORTS_INAPPLICABLE_ARMOUR = [
        Sort_22.default.Pattern,
        Sort_22.default.AmmoType,
        Sort_22.default.Shaped,
        Sort_22.default.WeaponType,
        Sort_22.default.Quantity,
        Sort_22.default.DamageType,
        Sort_22.default.Harmonizable,
    ];
    exports.FILTERS_INAPPLICABLE_ARMOUR = [
        Filter_14.default.Ammo,
        Filter_14.default.WeaponType,
        Filter_14.default.Perk,
        Filter_14.default.Shaped,
        Filter_14.default.Element,
        Filter_14.default.Harmonizable,
        Filter_14.default.Adept,
    ];
    exports.VIEW_ID_ARMOUR = "armour";
    exports.VIEW_NAME_ARMOUR = "Armour";
    exports.SORT_MANAGER_ARMOUR_DEFINITION = {
        id: exports.VIEW_ID_ARMOUR,
        name: exports.VIEW_NAME_ARMOUR,
        default: exports.SORTS_DEFAULT_ARMOUR,
        inapplicable: exports.SORTS_INAPPLICABLE_ARMOUR,
    };
    exports.FILTER_MANAGER_ARMOUR_DEFINITION = {
        id: exports.VIEW_ID_ARMOUR,
        name: exports.VIEW_NAME_ARMOUR,
        inapplicable: exports.FILTERS_INAPPLICABLE_ARMOUR,
    };
    exports.default = InventorySlotView_1.default.clone().configure({
        sort: new SortManager_2.default(exports.SORT_MANAGER_ARMOUR_DEFINITION),
        filter: new FilterManager_2.default(exports.FILTER_MANAGER_ARMOUR_DEFINITION),
        separateVaults: true,
        parentViewId: exports.VIEW_ID_ARMOUR,
    });
});
define("ui/view/inventory/slot/InventoryArmsView", ["require", "exports", "ui/view/inventory/slot/InventoryArmourSlotView"], function (require, exports, InventoryArmourSlotView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryArmourSlotView_1.default.create({
        id: "arms",
        name: "Arms",
        slot: 3551918588 /* InventoryBucketHashes.Gauntlets */,
    });
});
define("ui/view/inventory/slot/InventoryChestView", ["require", "exports", "ui/view/inventory/slot/InventoryArmourSlotView"], function (require, exports, InventoryArmourSlotView_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryArmourSlotView_2.default.create({
        id: "chest",
        name: "Chest",
        slot: 14239492 /* InventoryBucketHashes.ChestArmor */,
    });
});
define("ui/view/inventory/slot/InventoryClassItemView", ["require", "exports", "ui/inventory/sort/Sort", "ui/inventory/sort/SortManager", "ui/view/inventory/slot/InventoryArmourSlotView"], function (require, exports, Sort_23, SortManager_3, InventoryArmourSlotView_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryArmourSlotView_3.default.create({
        id: "class-item",
        name: "Class Item",
        slot: 1585787867 /* InventoryBucketHashes.ClassArmor */,
        sort: new SortManager_3.default({
            id: "class-items",
            name: "Class Items",
            default: InventoryArmourSlotView_3.SORTS_DEFAULT_ARMOUR,
            inapplicable: [...InventoryArmourSlotView_3.SORTS_INAPPLICABLE_ARMOUR, Sort_23.default.Exotic, Sort_23.default.StatDistribution, Sort_23.default.StatTotal, "stat-.*"],
        }),
    });
});
define("ui/view/inventory/slot/InventoryWeaponSlotView", ["require", "exports", "ui/inventory/filter/FilterManager", "ui/inventory/sort/Sort", "ui/inventory/sort/SortManager", "ui/view/inventory/slot/InventorySlotView"], function (require, exports, FilterManager_3, Sort_24, SortManager_4, InventorySlotView_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FILTER_MANAGER_WEAPONS_DEFINITION = exports.SORT_MANAGER_WEAPONS_DEFINITION = exports.VIEW_NAME_WEAPONS = exports.VIEW_ID_WEAPONS = exports.FILTERS_INAPPLICABLE_WEAPONS = exports.SORTS_INAPPLICABLE_WEAPONS = exports.SORTS_DEFAULT_WEAPONS = void 0;
    exports.SORTS_DEFAULT_WEAPONS = [Sort_24.default.Pattern, Sort_24.default.Rarity, Sort_24.default.Masterwork, Sort_24.default.Power, Sort_24.default.DamageType, Sort_24.default.AmmoType];
    exports.SORTS_INAPPLICABLE_WEAPONS = [Sort_24.default.Energy, Sort_24.default.StatTotal, Sort_24.default.StatDistribution, Sort_24.default.Quantity, "stat-.*"];
    exports.FILTERS_INAPPLICABLE_WEAPONS = [];
    exports.VIEW_ID_WEAPONS = "weapons";
    exports.VIEW_NAME_WEAPONS = "Weapons";
    exports.SORT_MANAGER_WEAPONS_DEFINITION = {
        id: exports.VIEW_ID_WEAPONS,
        name: exports.VIEW_NAME_WEAPONS,
        default: exports.SORTS_DEFAULT_WEAPONS,
        inapplicable: exports.SORTS_INAPPLICABLE_WEAPONS,
    };
    exports.FILTER_MANAGER_WEAPONS_DEFINITION = {
        id: exports.VIEW_ID_WEAPONS,
        name: exports.VIEW_NAME_WEAPONS,
        inapplicable: exports.FILTERS_INAPPLICABLE_WEAPONS,
    };
    exports.default = InventorySlotView_2.default.clone().configure({
        sort: new SortManager_4.default(exports.SORT_MANAGER_WEAPONS_DEFINITION),
        filter: new FilterManager_3.default(exports.FILTER_MANAGER_WEAPONS_DEFINITION),
        parentViewId: exports.VIEW_ID_WEAPONS,
        mergedVaults: true,
    });
});
define("ui/view/inventory/slot/InventoryEnergyView", ["require", "exports", "ui/view/inventory/slot/InventoryWeaponSlotView"], function (require, exports, InventoryWeaponSlotView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryWeaponSlotView_1.default.create({
        id: "energy",
        name: "Energy",
        slot: 2465295065 /* InventoryBucketHashes.EnergyWeapons */,
    });
});
define("ui/view/inventory/slot/InventoryHelmetView", ["require", "exports", "ui/view/inventory/slot/InventoryArmourSlotView"], function (require, exports, InventoryArmourSlotView_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryArmourSlotView_4.default.create({
        id: "helmet",
        name: "Helmet",
        slot: 3448274439 /* InventoryBucketHashes.Helmet */,
    });
});
define("ui/view/inventory/slot/InventoryKineticView", ["require", "exports", "ui/view/inventory/slot/InventoryWeaponSlotView"], function (require, exports, InventoryWeaponSlotView_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryWeaponSlotView_2.default.create({
        id: "kinetic",
        name: "Kinetic",
        slot: 1498876634 /* InventoryBucketHashes.KineticWeapons */,
    });
});
define("ui/view/inventory/slot/InventoryLegsView", ["require", "exports", "ui/view/inventory/slot/InventoryArmourSlotView"], function (require, exports, InventoryArmourSlotView_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryArmourSlotView_5.default.create({
        id: "legs",
        name: "Legs",
        slot: 20886954 /* InventoryBucketHashes.LegArmor */,
    });
});
define("ui/view/inventory/slot/InventoryPowerView", ["require", "exports", "ui/inventory/filter/Filter", "ui/inventory/filter/FilterManager", "ui/view/inventory/slot/InventoryWeaponSlotView"], function (require, exports, Filter_15, FilterManager_4, InventoryWeaponSlotView_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryWeaponSlotView_3.default.create({
        id: "power",
        name: "Power",
        slot: 953998645 /* InventoryBucketHashes.PowerWeapons */,
        filter: new FilterManager_4.default({
            id: "heavyWeapons",
            name: "Heavy Weapons",
            inapplicable: [...InventoryWeaponSlotView_3.FILTERS_INAPPLICABLE_WEAPONS, Filter_15.default.Ammo],
        }),
    });
});
define("ui/inventory/playeroverview/PlayerOverviewCharacterPanel", ["require", "exports", "ui/Classes", "ui/Component", "ui/InfoBlock", "ui/form/ClassPicker", "ui/inventory/ItemComponent", "ui/inventory/ItemPowerLevel", "ui/inventory/ItemSubclassTooltip", "ui/inventory/Slot", "ui/inventory/playeroverview/StatsOverview", "ui/view/inventory/slot/IInventorySlotView", "ui/view/inventory/slot/InventoryArmsView", "ui/view/inventory/slot/InventoryChestView", "ui/view/inventory/slot/InventoryClassItemView", "ui/view/inventory/slot/InventoryEnergyView", "ui/view/inventory/slot/InventoryHelmetView", "ui/view/inventory/slot/InventoryKineticView", "ui/view/inventory/slot/InventoryLegsView", "ui/view/inventory/slot/InventoryPowerView", "utility/maths/Maths"], function (require, exports, Classes_18, Component_46, InfoBlock_1, ClassPicker_1, ItemComponent_4, ItemPowerLevel_2, ItemSubclassTooltip_1, Slot_4, StatsOverview_1, IInventorySlotView_2, InventoryArmsView_1, InventoryChestView_1, InventoryClassItemView_1, InventoryEnergyView_1, InventoryHelmetView_1, InventoryKineticView_1, InventoryLegsView_1, InventoryPowerView_1, Maths_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlayerOverviewCharacterPanelClasses = void 0;
    var PlayerOverviewCharacterPanelClasses;
    (function (PlayerOverviewCharacterPanelClasses) {
        PlayerOverviewCharacterPanelClasses["Main"] = "player-overview-drawer-panel";
        PlayerOverviewCharacterPanelClasses["CharacterSettings"] = "player-overview-character-settings";
        PlayerOverviewCharacterPanelClasses["CharacterWrapper"] = "player-overview-character-wrapper";
        PlayerOverviewCharacterPanelClasses["SubclassPicker"] = "player-overview-subclass-picker";
        PlayerOverviewCharacterPanelClasses["SlotGroup"] = "player-overview-slot-group";
        PlayerOverviewCharacterPanelClasses["Slot"] = "player-overview-slot";
        PlayerOverviewCharacterPanelClasses["SlotOption"] = "player-overview-slot-option";
        PlayerOverviewCharacterPanelClasses["SlotOptionEquipped"] = "player-overview-slot-option-equipped";
        PlayerOverviewCharacterPanelClasses["SlotOptionHighestPower"] = "player-overview-slot-option-highest-power";
        PlayerOverviewCharacterPanelClasses["OverviewSlot"] = "player-overview-slot-overview";
        PlayerOverviewCharacterPanelClasses["Item"] = "player-overview-item";
        PlayerOverviewCharacterPanelClasses["ItemEquipped"] = "player-overview-item-equipped";
        PlayerOverviewCharacterPanelClasses["ItemHighestPower"] = "player-overview-item-highest-power";
        PlayerOverviewCharacterPanelClasses["ItemSame"] = "player-overview-item-same";
        PlayerOverviewCharacterPanelClasses["Power"] = "player-overview-power";
        PlayerOverviewCharacterPanelClasses["PowerTotal"] = "player-overview-power-total";
        PlayerOverviewCharacterPanelClasses["PowerEquipped"] = "player-overview-power-equipped";
        PlayerOverviewCharacterPanelClasses["PowerHighestPower"] = "player-overview-power-highest-power";
        PlayerOverviewCharacterPanelClasses["PowerTotalLabel"] = "player-overview-power-total-label";
        PlayerOverviewCharacterPanelClasses["PowerTotalLabelEquipped"] = "player-overview-power-total-label-equipped";
        PlayerOverviewCharacterPanelClasses["PowerTotalLabelHighestPower"] = "player-overview-power-total-label-highest-power";
        PlayerOverviewCharacterPanelClasses["LoadoutsButton"] = "player-overview-loadouts-button";
        PlayerOverviewCharacterPanelClasses["LoadoutsButtonIcon"] = "player-overview-loadouts-button-icon";
        PlayerOverviewCharacterPanelClasses["LoadoutsButtonIcon1"] = "player-overview-loadouts-button-icon-1";
        PlayerOverviewCharacterPanelClasses["LoadoutsButtonIcon2"] = "player-overview-loadouts-button-icon-2";
        PlayerOverviewCharacterPanelClasses["LoadoutsButtonIcon3"] = "player-overview-loadouts-button-icon-3";
        PlayerOverviewCharacterPanelClasses["ArtifactSlot"] = "player-overview-artifact-slot";
        PlayerOverviewCharacterPanelClasses["Artifact"] = "player-overview-artifact";
        PlayerOverviewCharacterPanelClasses["StatsOverviewBlock"] = "player-overview-stats-overview-block";
    })(PlayerOverviewCharacterPanelClasses || (exports.PlayerOverviewCharacterPanelClasses = PlayerOverviewCharacterPanelClasses = {}));
    const slotViews = [
        [
            InventoryKineticView_1.default,
            InventoryEnergyView_1.default,
            InventoryPowerView_1.default,
        ],
        [
            InventoryHelmetView_1.default,
            InventoryArmsView_1.default,
            InventoryChestView_1.default,
            InventoryLegsView_1.default,
            InventoryClassItemView_1.default,
        ],
    ];
    class PlayerOverviewCharacterPanel extends Component_46.default {
        onMake() {
            this.classes.add(PlayerOverviewCharacterPanelClasses.Main);
            const wrapper = Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.CharacterWrapper)
                .appendTo(this);
            const characterSettings = Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.CharacterSettings)
                .appendTo(wrapper);
            this.subclassPicker = ClassPicker_1.default.create([])
                .classes.add(PlayerOverviewCharacterPanelClasses.SubclassPicker)
                .event.subscribe("selectClass", event => {
                if (event.item?.character)
                    event.setPromise(event.item.equip(event.item.character));
            })
                .appendTo(characterSettings);
            this.loadoutsButton = Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.LoadoutsButton)
                .append(Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon, PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon1))
                .append(Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon, PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon2))
                .append(Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon, PlayerOverviewCharacterPanelClasses.LoadoutsButtonIcon3))
                .appendTo(characterSettings);
            this.artifactSlot = Slot_4.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.ArtifactSlot)
                .appendTo(characterSettings);
            this.artifact = ItemComponent_4.default.create([])
                .classes.add(PlayerOverviewCharacterPanelClasses.Artifact)
                .appendTo(this.artifactSlot);
            const slotComponent = Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.Slot, PlayerOverviewCharacterPanelClasses.OverviewSlot)
                .appendTo(wrapper);
            const slotOptionHighestPower = Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.SlotOption, PlayerOverviewCharacterPanelClasses.SlotOptionHighestPower)
                .appendTo(slotComponent);
            const slotOptionEquipped = Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.SlotOption, PlayerOverviewCharacterPanelClasses.SlotOptionEquipped)
                .appendTo(slotComponent);
            Component_46.default.create()
                .text.add("Equipped")
                .classes.add(PlayerOverviewCharacterPanelClasses.PowerTotalLabel, PlayerOverviewCharacterPanelClasses.PowerTotalLabelEquipped)
                .appendTo(slotOptionEquipped);
            this.powerTotalEquipped = ItemPowerLevel_2.default.create([])
                .classes.add(PlayerOverviewCharacterPanelClasses.Power, PlayerOverviewCharacterPanelClasses.PowerTotal, PlayerOverviewCharacterPanelClasses.PowerEquipped)
                .appendTo(slotOptionEquipped);
            Component_46.default.create()
                .text.add("Max")
                .classes.add(PlayerOverviewCharacterPanelClasses.PowerTotalLabel, PlayerOverviewCharacterPanelClasses.PowerTotalLabelHighestPower)
                .appendTo(slotOptionHighestPower);
            this.powerTotalHighest = ItemPowerLevel_2.default.create([])
                .classes.add(PlayerOverviewCharacterPanelClasses.Power, PlayerOverviewCharacterPanelClasses.PowerTotal, PlayerOverviewCharacterPanelClasses.PowerHighestPower)
                .appendTo(slotOptionHighestPower);
            this.slotComponents = {};
            for (let groupIndex = 0; groupIndex < slotViews.length; groupIndex++) {
                const viewGroup = slotViews[groupIndex];
                const groupColumn = Component_46.default.create()
                    .classes.add(PlayerOverviewCharacterPanelClasses.SlotGroup)
                    .appendTo(wrapper);
                for (const view of viewGroup) {
                    this.slotComponents[view.definition.slot] = SlotComponent.create([groupIndex])
                        .classes.add(PlayerOverviewCharacterPanelClasses.Slot)
                        .appendTo(groupColumn);
                }
            }
            InfoBlock_1.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.StatsOverviewBlock)
                .append(this.statsOverview = StatsOverview_1.default.create())
                .appendTo(this);
        }
        set(inventory, character, buckets) {
            const seasonalArtifact = buckets.find(bucket => bucket.is(1506418338 /* InventoryBucketHashes.SeasonalArtifact */));
            void this.artifact.setItem(seasonalArtifact?.equippedItem);
            this.statsOverview.set(character, buckets);
            for (const subclass of inventory.getBucket(3284755031 /* InventoryBucketHashes.Subclass */, character.characterId)?.items ?? []) {
                this.subclassPicker.addOption({
                    id: subclass.definition.hash,
                    background: `https://www.bungie.net${subclass.definition.displayProperties.icon}`,
                    item: subclass,
                    initialise: button => button.setTooltip(ItemSubclassTooltip_1.default, {
                        initialise: tooltip => tooltip.set(subclass),
                        differs: tooltip => tooltip.item?.id !== subclass.id,
                    }),
                });
                if (subclass.equipped)
                    void this.subclassPicker.setCurrent(subclass.definition.hash, true);
            }
            const equippedItems = {};
            const highestPowerItems = {};
            for (const item of buckets.flatMap(bucket => bucket.items)) {
                const view = slotViews.flat().find(view => item.definition.inventory?.bucketTypeHash === view.definition.slot);
                if (!view)
                    continue;
                const slot = view.definition.slot;
                if (item.equipped)
                    equippedItems[slot] = item;
                const highestPower = highestPowerItems[slot]?.instance?.primaryStat?.value ?? 0;
                const itemPower = item.instance?.primaryStat?.value ?? 0;
                if (itemPower > highestPower || (itemPower === highestPower && item.equipped))
                    highestPowerItems[slot] = item;
            }
            const currentPower = Maths_5.default.average(...Object.values(equippedItems)
                .map(item => item?.instance?.primaryStat?.value ?? 0));
            const maximisedPower = Maths_5.default.average(...Object.values(highestPowerItems)
                .map(item => item?.instance?.primaryStat?.value ?? 0));
            this.powerTotalEquipped.setPower(currentPower);
            this.powerTotalHighest.setPower(maximisedPower);
            const equippedLog = [];
            const highestPowerLog = [];
            const previous = this.previousItemInstanceIds ??= [];
            let i = 0;
            for (let groupIndex = 0; groupIndex < slotViews.length; groupIndex++) {
                const viewGroup = slotViews[groupIndex];
                for (const view of viewGroup) {
                    const slot = view.definition.slot;
                    let name = view.definition.name ?? "Unknown View";
                    if (typeof name === "function")
                        name = name();
                    const equippedItem = equippedItems[slot];
                    if (!equippedItem) {
                        console.warn(`No equipped item for slot ${name}`);
                        continue;
                    }
                    const slotComponent = this.slotComponents[slot]
                        .attributes.set("data-name", name);
                    if (previous[i++] !== equippedItem.reference.itemInstanceId) {
                        equippedLog.push(`\n    ${name}:`, equippedItem?.definition.displayProperties.name, equippedItem);
                        previous[i - 1] = equippedItem.reference.itemInstanceId;
                    }
                    const highestPowerItem = highestPowerItems[slot];
                    if (!highestPowerItem)
                        console.warn(`No highest power item for slot ${name}`);
                    else {
                        if (previous[i++] !== highestPowerItem.reference.itemInstanceId) {
                            highestPowerLog.push(`\n    ${name}:`, highestPowerItem?.definition.displayProperties.name, highestPowerItem);
                            previous[i - 1] = highestPowerItem.reference.itemInstanceId;
                        }
                    }
                    slotComponent.set(inventory, equippedItem, highestPowerItem, maximisedPower);
                }
            }
            if (equippedLog.length || highestPowerLog.length)
                console.log(character.class.displayProperties.name, 
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
                ...!equippedLog.length ? [] : [`\n  Equipped Items - ${Math.floor(currentPower)}${currentPower % 1 ? ` ${(currentPower % 1) * 8}/8` : ""}`, ...equippedLog], 
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment
                ...!highestPowerLog.length ? [] : [`\n\n  Highest Power Items - ${Math.floor(maximisedPower)}${maximisedPower % 1 ? ` ${(maximisedPower % 1) * 8}/8` : ""}`, ...highestPowerLog]);
        }
    }
    exports.default = PlayerOverviewCharacterPanel;
    class SlotComponent extends Component_46.default {
        onMake(type) {
            const slotOptionEquipped = Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.SlotOption, PlayerOverviewCharacterPanelClasses.SlotOptionEquipped);
            const slotOptionHighestPower = Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.SlotOption, PlayerOverviewCharacterPanelClasses.SlotOptionHighestPower);
            if (type === 0)
                this.append(slotOptionHighestPower, slotOptionEquipped);
            else
                this.append(slotOptionEquipped, slotOptionHighestPower);
            this.itemEquipped = ItemComponent_4.default.create([])
                .classes.add(PlayerOverviewCharacterPanelClasses.Item, PlayerOverviewCharacterPanelClasses.ItemEquipped)
                .appendTo(slotOptionEquipped);
            this.powerLevelEquipped = ItemPowerLevel_2.default.create([])
                .classes.add(PlayerOverviewCharacterPanelClasses.Power, PlayerOverviewCharacterPanelClasses.PowerEquipped)
                .appendTo(slotOptionEquipped);
            this.itemHighestPowerIsSame = Component_46.default.create()
                .classes.add(PlayerOverviewCharacterPanelClasses.Item, PlayerOverviewCharacterPanelClasses.ItemHighestPower, PlayerOverviewCharacterPanelClasses.ItemSame)
                .appendTo(slotOptionHighestPower);
            this.itemHighestPower = ItemComponent_4.default.create([])
                .classes.add(PlayerOverviewCharacterPanelClasses.Item, PlayerOverviewCharacterPanelClasses.ItemHighestPower)
                .appendTo(slotOptionHighestPower);
            this.powerLevelHighest = ItemPowerLevel_2.default.create([])
                .classes.add(PlayerOverviewCharacterPanelClasses.Power, PlayerOverviewCharacterPanelClasses.PowerHighestPower)
                .appendTo(slotOptionHighestPower);
        }
        set(inventory, equippedItem, highestPowerItem, maximisedTotalPower) {
            void this.itemEquipped.setSortedBy(IInventorySlotView_2.InventorySlotViewHandler.getSorter(equippedItem))
                .setItem(equippedItem, inventory);
            const equippedPower = equippedItem.instance?.primaryStat?.value ?? 0;
            this.powerLevelEquipped.setPower(equippedPower, equippedPower - Math.floor(maximisedTotalPower));
            if (!highestPowerItem || highestPowerItem === equippedItem) {
                this.itemHighestPowerIsSame.classes.remove(Classes_18.Classes.Hidden);
                this.itemHighestPower.classes.add(Classes_18.Classes.Hidden);
                return;
            }
            this.itemHighestPowerIsSame.classes.add(Classes_18.Classes.Hidden);
            this.itemHighestPower.classes.remove(Classes_18.Classes.Hidden);
            void this.itemHighestPower.setSortedBy(IInventorySlotView_2.InventorySlotViewHandler.getSorter(highestPowerItem))
                .setItem(highestPowerItem, inventory);
            const highestPowerPower = highestPowerItem.instance?.primaryStat?.value ?? 0;
            this.powerLevelHighest.setPower(highestPowerPower, highestPowerPower - Math.floor(maximisedTotalPower));
        }
    }
});
define("ui/PlayerOverview", ["require", "exports", "model/models/Characters", "model/models/Inventory", "model/models/Memberships", "ui/Component", "ui/form/ClassPicker", "ui/form/Drawer", "ui/InfoBlock", "ui/inventory/playeroverview/PlayerOverviewCharacterPanel", "ui/inventory/sort/SortManager", "ui/Loadable", "ui/UiEventBus", "utility/Async", "utility/decorator/Bound"], function (require, exports, Characters_7, Inventory_5, Memberships_7, Component_47, ClassPicker_2, Drawer_4, InfoBlock_2, PlayerOverviewCharacterPanel_1, SortManager_5, Loadable_4, UiEventBus_7, Async_6, Bound_18) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PlayerOverviewClasses = void 0;
    var PlayerOverviewClasses;
    (function (PlayerOverviewClasses) {
        PlayerOverviewClasses["Main"] = "player-overview";
        PlayerOverviewClasses["Container"] = "player-overview-container";
        PlayerOverviewClasses["Identity"] = "player-overview-identity";
        PlayerOverviewClasses["IdentityUsername"] = "player-overview-identity-username";
        PlayerOverviewClasses["IdentityCode"] = "player-overview-identity-code";
        PlayerOverviewClasses["Drawer"] = "player-overview-drawer";
        PlayerOverviewClasses["ClassSelection"] = "player-overview-class-selection";
        PlayerOverviewClasses["CharacterPicker"] = "player-overview-character-picker";
        PlayerOverviewClasses["CharacterPickerButton"] = "player-overview-character-picker-button";
        PlayerOverviewClasses["WIP"] = "player-overview-wip";
    })(PlayerOverviewClasses || (exports.PlayerOverviewClasses = PlayerOverviewClasses = {}));
    var PlayerOverview;
    (function (PlayerOverview) {
        class Component extends Component_47.default {
            async onMake(memberships, inventory) {
                this.classes.add(PlayerOverviewClasses.Main);
                this.inventory = inventory;
                this.displayName = memberships.bungieNetUser.cachedBungieGlobalDisplayName;
                this.code = `${memberships.bungieNetUser.cachedBungieGlobalDisplayNameCode ?? "????"}`.padStart(4, "0");
                Component_47.default.create()
                    .classes.add(PlayerOverviewClasses.Identity)
                    .append(Component_47.default.create()
                    .classes.add(PlayerOverviewClasses.IdentityUsername)
                    .text.set(memberships.bungieNetUser.cachedBungieGlobalDisplayName))
                    .append(Component_47.default.create()
                    .classes.add(PlayerOverviewClasses.IdentityCode)
                    .text.set(`#${this.code}`))
                    .event.subscribe("click", () => this.drawer.open("click"))
                    .appendTo(this);
                this.drawer = Drawer_4.default.create()
                    .classes.add(PlayerOverviewClasses.Drawer)
                    .appendTo(this);
                this.currencyOverview = InfoBlock_2.default.create()
                    .append(Component_47.default.create()
                    .classes.add(PlayerOverviewClasses.WIP))
                    .appendTo(this.drawer);
                this.classSelection = Component_47.default.create()
                    .classes.add(PlayerOverviewClasses.ClassSelection)
                    .appendTo(this.drawer);
                this.characterPicker = ClassPicker_2.default.create([])
                    .classes.add(PlayerOverviewClasses.CharacterPicker)
                    .event.subscribe("selectClass", event => {
                    const panel = this.panels[event.option];
                    if (!panel) {
                        console.error(`Selected unknown option '${event.option}'`);
                        return;
                    }
                    this.drawer.showPanel(this.panels[event.option]);
                })
                    .appendTo(this.classSelection);
                this.panels = {};
                await SortManager_5.default.init();
                inventory.event.subscribe("update", this.update);
                inventory.event.subscribe("itemUpdate", this.update);
                this.update();
                this.event.subscribe("mouseenter", () => this.drawer.open("mouseenter"));
                this.event.subscribe("mouseleave", () => this.drawer.close("mouseenter"));
                document.body.addEventListener("click", this.onClick);
                UiEventBus_7.default.subscribe("keydown", this.onKeydown);
                UiEventBus_7.default.subscribe("keyup", this.onKeyup);
                viewManager.event.subscribe("show", () => Async_6.default.schedule(10, this.showIfHash));
                viewManager.event.subscribe("initialise", this.showIfHash);
                this.drawer.event.subscribe("openDrawer", () => {
                    const currentCharacterId = Characters_7.default.getCurrent()?.characterId;
                    if (currentCharacterId)
                        void this.characterPicker.setCurrent(currentCharacterId, true);
                });
            }
            update() {
                this.updateCharacters();
                this.drawer.enable();
            }
            updateCharacters() {
                const characters = Characters_7.default.getSorted()
                    .slice()
                    // sort characters by active option so that the active option stays the visible panel
                    .sort((a, b) => a.characterId === this.characterPicker.currentOption ? -1 : b.characterId === this.characterPicker.currentOption ? 1 : 0);
                if (!characters.length) {
                    console.warn("No characters found");
                    this.drawer.removePanels();
                    this.panels = {};
                    this.drawer.disable();
                    return;
                }
                for (const character of characters) {
                    const bucket = this.inventory.getCharacterBuckets(character.characterId);
                    if (!bucket) {
                        console.warn(`No bucket found for the character ${character.characterId}`);
                        this.drawer.removePanel(this.panels[character.characterId]);
                        continue;
                    }
                    const panel = this.panels[character.characterId] ??= this.drawer.createPanel().make(PlayerOverviewCharacterPanel_1.default);
                    panel.set(this.inventory, character, bucket);
                    const className = character.class?.displayProperties.name ?? "Unknown";
                    const background = character.emblem?.secondarySpecial ?? character.emblemBackgroundPath;
                    this.characterPicker.addOption({
                        id: character.characterId,
                        background: background && `https://www.bungie.net${background}`,
                        icon: `https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_${className.toLowerCase()}.svg`,
                    });
                }
                // remove deleted characters
                for (const option of [...this.characterPicker.options])
                    if (!characters.some(character => character.characterId === option.id))
                        this.characterPicker.removeOption(option.id);
            }
            onClick(event) {
                if (!this.exists())
                    return document.body.removeEventListener("click", this.onClick);
                if (event.target.closest(`.${PlayerOverviewClasses.Main}`))
                    return;
                this.drawer.close(true);
            }
            onKeydown(event) {
                if (!document.contains(this.element)) {
                    UiEventBus_7.default.unsubscribe("keydown", this.onKeydown);
                    return;
                }
                if ((event.use("c") || event.use("p") || event.use("o") || event.use("F1")) && this.drawer.toggle("key"))
                    this.drawer.element.focus();
                if (this.drawer.isOpen() && event.useOverInput("Escape"))
                    this.drawer.close(true);
            }
            onKeyup(event) {
                if (!document.contains(this.element)) {
                    UiEventBus_7.default.unsubscribe("keyup", this.onKeyup);
                    return;
                }
                if (!this.element.contains(document.activeElement) && !event.matches("e"))
                    this.drawer.close(true);
            }
            showIfHash() {
                if (location.hash === "#overview")
                    this.drawer.open("hash");
                else
                    this.drawer.close(true);
            }
        }
        __decorate([
            Bound_18.default
        ], Component.prototype, "update", null);
        __decorate([
            Bound_18.default
        ], Component.prototype, "onClick", null);
        __decorate([
            Bound_18.default
        ], Component.prototype, "onKeydown", null);
        __decorate([
            Bound_18.default
        ], Component.prototype, "onKeyup", null);
        __decorate([
            Bound_18.default
        ], Component.prototype, "showIfHash", null);
        PlayerOverview.Component = Component;
        function create() {
            return Loadable_4.default.create(Memberships_7.default, Inventory_5.default.await())
                .onReady((memberships, inventory) => Component.create([memberships, inventory]))
                .setSimple()
                .classes.add(PlayerOverviewClasses.Container);
        }
        PlayerOverview.create = create;
    })(PlayerOverview || (PlayerOverview = {}));
    exports.default = PlayerOverview;
});
define("ui/TextLogo", ["require", "exports", "ui/Component", "utility/Env"], function (require, exports, Component_48, Env_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextLogoClasses;
    (function (TextLogoClasses) {
        TextLogoClasses["Main"] = "text-logo";
        TextLogoClasses["Deep"] = "text-logo-deep";
        TextLogoClasses["Sight"] = "text-logo-sight";
        TextLogoClasses["Dot"] = "text-logo-dot";
        TextLogoClasses["Gg"] = "text-logo-gg";
        TextLogoClasses["NonProd"] = "text-logo-nonprod";
    })(TextLogoClasses || (TextLogoClasses = {}));
    class TextLogo extends Component_48.default {
        onMake() {
            this.classes.add(TextLogoClasses.Main)
                .append(Component_48.default.create("span")
                .classes.add(TextLogoClasses.Deep)
                .text.set("deep")
                .append(Env_6.default.DEEPSIGHT_ENVIRONMENT === "prod" ? undefined : Component_48.default.create("span")
                .classes.add(TextLogoClasses.NonProd)
                .text.set(Env_6.default.DEEPSIGHT_ENVIRONMENT === "dev" ? "est" : "er")))
                .append(Component_48.default.create("span")
                .classes.add(TextLogoClasses.Sight)
                .text.set("sight"))
                .append(Component_48.default.create("span")
                .classes.add(TextLogoClasses.Dot)
                .text.set("."))
                .append(Component_48.default.create("span")
                .classes.add(TextLogoClasses.Gg)
                .text.set("gg"));
        }
    }
    exports.default = TextLogo;
});
define("ui/List", ["require", "exports", "ui/Component"], function (require, exports, Component_49) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var List;
    (function (List_1) {
        class List extends Component_49.default {
            addItem(initialiser) {
                Component_49.default.create("li")
                    .tweak(initialiser)
                    .appendTo(this);
                return this;
            }
        }
        class Unordered extends List {
        }
        Unordered.defaultType = "ul";
        List_1.Unordered = Unordered;
        class Ordered extends List {
        }
        Ordered.defaultType = "ol";
        List_1.Ordered = Ordered;
    })(List || (List = {}));
    exports.default = List;
});
define("ui/view/documentation/DocumentationCard", ["require", "exports", "ui/Component", "ui/List"], function (require, exports, Component_50, List_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentationCardClasses = void 0;
    var DocumentationCardClasses;
    (function (DocumentationCardClasses) {
        DocumentationCardClasses["Main"] = "documentation-card";
        DocumentationCardClasses["Heading"] = "documentation-card-heading";
        DocumentationCardClasses["Content"] = "documentation-card-content";
        DocumentationCardClasses["Image"] = "documentation-card-image";
        DocumentationCardClasses["Imagery"] = "documentation-card-imagery";
        DocumentationCardClasses["ContentParagraph"] = "documentation-card-content-paragraph";
        DocumentationCardClasses["List"] = "documentation-card-content-list";
    })(DocumentationCardClasses || (exports.DocumentationCardClasses = DocumentationCardClasses = {}));
    class DocumentationCard extends Component_50.default {
        onMake() {
            this.classes.add(DocumentationCardClasses.Main);
            this.heading = Component_50.default.create("h3")
                .classes.add(DocumentationCardClasses.Heading)
                .appendTo(this);
            this.content = Component_50.default.create()
                .classes.add(DocumentationCardClasses.Content)
                .appendTo(this);
        }
        setTitle(title) {
            this.heading.text.set(title);
            return this;
        }
        addImage(image) {
            this.imagery ??= Component_50.default.create()
                .classes.add(DocumentationCardClasses.Imagery)
                .appendTo(this);
            Component_50.default.create("img")
                .classes.add(DocumentationCardClasses.Image)
                .attributes.set("src", image)
                // .attributes.set("loading", "lazy")
                .appendTo(this.imagery);
            return this;
        }
        addParagraph(content) {
            Component_50.default.create("p")
                .classes.add(DocumentationCardClasses.ContentParagraph)
                .text.set(content)
                .appendTo(this.content);
            return this;
        }
        addList(initialiser) {
            List_2.default.Unordered.create()
                .classes.add(DocumentationCardClasses.List)
                .tweak(initialiser)
                .appendTo(this.content);
            return this;
        }
    }
    exports.default = DocumentationCard;
});
define("ui/view/documentation/DocumentationSection", ["require", "exports", "ui/Component", "ui/view/documentation/DocumentationCard"], function (require, exports, Component_51, DocumentationCard_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentationSectionClasses = void 0;
    var DocumentationSectionClasses;
    (function (DocumentationSectionClasses) {
        DocumentationSectionClasses["Main"] = "documentation-section";
        DocumentationSectionClasses["Heading"] = "documentation-section-heading";
    })(DocumentationSectionClasses || (exports.DocumentationSectionClasses = DocumentationSectionClasses = {}));
    class DocumentationSection extends Component_51.default {
        onMake() {
            this.classes.add(DocumentationSectionClasses.Main);
            this.content = [];
        }
        setTitle(title) {
            this.title = title;
            Component_51.default.create("h2")
                .classes.add(DocumentationSectionClasses.Heading)
                .text.set(title)
                .prependTo(this);
            return this;
        }
        addSection(initialiser) {
            this.content.push(DocumentationSection.create()
                .tweak(initialiser)
                .appendTo(this));
            return this;
        }
        addCard(initialiser) {
            this.content.push(DocumentationCard_1.default.create()
                .tweak(initialiser)
                .appendTo(this));
            return this;
        }
    }
    exports.default = DocumentationSection;
});
define("ui/view/documentation/DocumentationPage", ["require", "exports", "ui/Component", "ui/view/documentation/DocumentationSection"], function (require, exports, Component_52, DocumentationSection_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DocumentationPageClasses = void 0;
    var DocumentationPageClasses;
    (function (DocumentationPageClasses) {
        DocumentationPageClasses["Main"] = "documentation-page";
        DocumentationPageClasses["Nav"] = "documentation-page-nav";
        DocumentationPageClasses["NavHeading"] = "documentation-page-nav-heading";
        DocumentationPageClasses["NavLink"] = "documentation-page-nav-link";
    })(DocumentationPageClasses || (exports.DocumentationPageClasses = DocumentationPageClasses = {}));
    class DocumentationPage extends DocumentationSection_1.default {
        onMake() {
            this.classes.add(DocumentationPageClasses.Main);
            this.nav = Component_52.default.create("nav")
                .classes.add(DocumentationPageClasses.Nav)
                .appendTo(this);
            super.onMake();
        }
        regenerateNav() {
            this.nav.removeContents();
            this.generateSectionNav(this, this.nav);
        }
        generateSectionNav(section, into) {
            for (const content of section.content) {
                if (content instanceof DocumentationSection_1.default) {
                    const thisContentInto = !content.title ? into : Component_52.default.create("nav")
                        .classes.add(DocumentationPageClasses.Nav)
                        .append(Component_52.default.create("h3")
                        .classes.add(DocumentationPageClasses.NavHeading)
                        .text.set(content.title))
                        .appendTo(into);
                    this.generateSectionNav(content, thisContentInto);
                }
                else {
                    Component_52.default.create("button")
                        .classes.add(DocumentationPageClasses.NavLink)
                        .text.set(content.heading.text.get() ?? undefined)
                        .appendTo(into);
                }
            }
        }
    }
    exports.default = DocumentationPage;
});
define("ui/view/AboutView", ["require", "exports", "ui/Component", "ui/View", "ui/view/documentation/DocumentationPage"], function (require, exports, Component_53, View_3, DocumentationPage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AboutViewClasses = void 0;
    var AboutViewClasses;
    (function (AboutViewClasses) {
        AboutViewClasses["Details"] = "view-about-details";
        AboutViewClasses["DetailsSummary"] = "view-about-details-summary";
    })(AboutViewClasses || (exports.AboutViewClasses = AboutViewClasses = {}));
    exports.default = View_3.default.create({
        id: "about",
        name: "About",
        noDestinationButton: true,
        initialise: view => view
            .setTitle(title => title.text.set("deepsight.gg"))
            .tweak(view => view.content
            .append(DocumentationPage_1.default.create()
            .addSection(section => section
            .setTitle("A New Destiny 2 Item Manager Approaches...")
            .addCard(card => card
            .addParagraph("deepsight.gg is an item manager for Destiny 2, made to look and feel like the in-game UI, providing functionality not before seen in other item managers. Using deepsight.gg, you can sort armour by your own customisable targeted stat distributions, you can easily add any number of wishlists for specific rolls of weapons, and more!")))
            .addSection(section => section
            .setTitle("Features")
            .addCard(card => card
            .setTitle("Slot Views")
            .addParagraph("One view per slot — Kinetic, Energy, Power, Helmet, Arms, Chest, Legs, Class Item. This results in more items being displayable at one time, at a larger size, and allows quickly transferring them between characters and the vault.")
            .addParagraph("All views display the postmaster for each character.")
            .addParagraph("The highest power 1 or 2 item(s) in each slot displays with a special animation. Never dismantle these ones except for infusion, or you'll lower your drop power!")
            .addImage("./image/about/slot-views.png"))
            .addCard(card => card
            .setTitle("Persistent, highly-customisable sort/filter")
            .addParagraph("Views each have a persistent, configurable sort — weapon views share one, armour views share one, and the class item view has one.")
            .addParagraph("You can configure the order that sorts are applied, or if they're applied at all.")
            .addParagraph("Weapon Sorts")
            .addList(list => list
            .addItem(item => item.text.set("Power"))
            .addItem(item => item.text.set("Name"))
            .addItem(item => item.text.set("Ammo Type"))
            .addItem(item => item.text.set("Masterwork"))
            .addItem(item => item.text.set("Rarity"))
            .addItem(item => item.text.set("Shaped"))
            .addItem(item => item.text.set("Moment (ie the little watermark icon on all items)"))
            .addItem(item => item.text.set("Gives Pattern Progress")))
            .addImage("./image/about/weapon-sorts.png")
            .addParagraph("Armour Sorts")
            .addList(list => list
            .addItem(item => item.text.set("Power"))
            .addItem(item => item.text.set("Name"))
            .addItem(item => item.text.set("Energy"))
            .addItem(item => item.text.set("Masterwork"))
            .addItem(item => item.text.set("Rarity"))
            .addItem(item => item.text.set("Shaped"))
            .addItem(item => item.text.set("Moment"))
            .addItem(item => item.text.set("Stat Total"))
            .addItem(item => item.text.set("Stat Distribution (Customisable, targeted distribution per-class. See below.)")))
            .addImage("./image/about/armour-sorts.png"))
            .addCard(card => card
            .tweak(card => card.heading
            .text.add("Press ")
            .append(Component_53.default.create("kbd")
            .text.set("E"))
            .text.add(" to show details on items"))
            .tweak(card => card.content.append(Component_53.default.create("p")
            .text.add("Just like in-game, you can hold ")
            .append(Component_53.default.create("kbd")
            .text.set("E"))
            .text.add(" to show extra details on items. If you'd like this to be a toggle instead, it can be changed in Settings.")))
            .addParagraph("The details that appear on items is based on the highest active sorts.")
            .addImage("./image/about/extra-details-on-armour-items.png"))
            .addCard(card => card
            .setTitle("Stat Distribution Sort")
            .addParagraph("Ideal armour is a high stat total in specific stats, and it changes based on build and class. When armour has low stat totals, it's easy to see that they should be dismantled. When they're high... it's a bit harder. To more easily determine at a glance which armour is good, deepsight.gg supports the Stat Distribution sort.")
            .addParagraph("To set custom targeted stat distributions, click the gear on the Stat Distribution sort, then the class you want to set a targeted distribution for.")
            .addParagraph("Stats in Destiny are split into two groups — group 1 is Mobility, Resilience, and Recovery, and group 2 is Discipline, Intellect, and Strength.Except for rare exceptions, each group can only roll a stat total of, at maximum, 34. Therefore, the ideal roll is 34 total in each group, distributed as you prefer.")
            .addParagraph("When a stat type is enabled, ie, the checkbox is checked, the quality of an armour roll will be based on how close that stat is to the exact value you select.")
            .addParagraph("When a stat type is disabled, ie, the checkbox is unchecked, the quality of an armour roll will be based on whether that stat, and any other unchecked stats, add up to the maximum roll of 34 for the group.")
            .addImage("./image/about/stat-distribution-1.png"))
            .addCard(card => card
            .setTitle("Examples")
            .addParagraph("I want hunter armour that is mostly in mobility and resilience for PvE. I uncheck mobility and resilience, and check recovery and set it to 2, the minimum value for a stat to be. That means that my Mob/Res/Rec group's distribution quality will be 100% if recovery is 2, and mobility and resilience add up to 32 — a perfect roll.")
            .addImage("./image/about/stat-distribution-2.png")
            .addParagraph("I want warlock armour that is at minimum mobility, and maximum discipline. I uncheck resilience and recovery, and check mobility and set it to 2, the minimum value. I uncheck intellect and strength, and then check the discipline box and set it to the maximum of 30.")
            .addImage("./image/about/stat-distribution-3.png"))
            .addCard(card => card
            .setTitle("Player Overview")
            .addParagraph("Hovering over your bungie display name and code displays a player overview, including all characters' equipped items, and their average power. It also displays all characters' highest power items — this is the average that drops will be based around.")
            .addImage("./image/about/player-overview.png"))
            .addCard(card => card
            .setTitle("Details View")
            .addParagraph("Right clicking on weapons displays the perks and stats of weapons, just like in-game.")
            .addImage("./image/about/details-view.png"))
            .addCard(card => card
            .setTitle("Collections")
            .addParagraph("View a list of all weapons and armour from a particular moment — seasons, expansions, events, etc — and the possible rolls of each.")
            .addParagraph("When an event is active, it goes to the top.")
            .addParagraph("The shaped weapon icon means different things depending on the colour. Orange means the pattern is unlocked, but you haven't shaped that weapon yet. White means a pattern exists for the weapon, but you haven't completed it yet. Black means you've shaped the weapon, so it's irrelevant.")
            .addImage("./image/about/collections-view.png"))
            .addCard(card => card
            .setTitle("Details in collections item tooltips")
            .addParagraph("To see a quick preview of the perks that can roll on a weapon, simpy mouse over the item in collections, and it'll list the whole perk pool. Right clicking gives a more detailed view.")
            .addParagraph("The tooltip also displays any pattern progress.")
            .addImage("./image/about/pattern-progress.png"))
            .addCard(card => card
            .setTitle("Perk Wishlisting")
            .addParagraph("When inspecting a weapon in collections, you can add wishlisted rolls. If an item doesn't match your wishlist, it's displayed with a lime border and icon to show that it should be dismantled.")
            .addParagraph("When creating a wishlist, you can select any number of perks in each column.")
            .addList(list => list
            .addItem(item => item.text.set("If no perks are selected in a column, that means a weapon will match your wishlist no matter the perks it has in that column."))
            .addItem(item => item.text.set("If one perk is selected in a column, that means a weapon will match your wishlist only if it has that exact perk in that column."))
            .addItem(item => item.text.set("If more than one perk is selected in a column, that means a weapon will match your wishlist only if it has one or more of the perks you've selected in that column.")))
            .addImage("./image/about/perk-wishlisting.png")))
            .addSection(section => section
            .setTitle("FAQ")
            .addCard(card => card
            .setTitle("Will you ever add a view displaying everything, like DIM?")
            .addParagraph("Probably not, mostly because it's not really possible to display that many items all at one time without a cost to ease of use and aesthetics. I'm not really interested in sacrificing deepsight.gg's quality and performance just so that more items can be displayed in a long list you have to scroll through anyway."))
            .addCard(card => card
            .setTitle("Will you ever add support for loadouts, like DIM?")
            .addParagraph("Coming soon... hopefully."))
            .addCard(card => card
            .setTitle("Why can't I...")
            .addParagraph("deepsight.gg is made by Chiri Vulpes, a hobby project by a single developer, and it was primarily made for her own use cases — sorting her vault in a specific way, and wishlisting weapon rolls. She — or, well, I — would like to help a lot of other people get what they want out of an item manager, too, but it takes a while to do this stuff, so you'll have to be patient!")))
            .addSection(section => section)
            .addSection(section => section
            .setTitle("About")
            .addCard(card => card
            .style.set("margin-right", "0")
            .style.set("align-self", "flex-start")
            .addParagraph("deepsight.gg is a hobby project by a single developer, Chiri Vulpes. The greatest struggle she has is knowing whether she likes UI/UX work more or less than Destiny itself.")
            .tweak(card => card.content.append(Component_53.default.create("p")
            .text.add("This is an open source project, which means that the code is available for viewing, using, and contributing on ")
            .append(Component_53.default.create("a")
            .attributes.set("href", "https://github.com/ChiriVulpes/deepsight.gg")
            .attributes.set("target", "_blank")
            .text.set("GitHub"))
            .text.add(".")))
            .tweak(card => card.content.append(Component_53.default.create("p")
            .text.add("If you'd like to request a feature, report a bug, or even just chat, consider stopping by the ")
            .append(Component_53.default.create("a")
            .attributes.set("href", "https://discord.gg/dMFRMXZZnY")
            .attributes.set("target", "_blank")
            .text.set("Discord"))
            .text.add("!"))))
            .addCard(card => card
            .setTitle("Notes & Credits")
            .tweak(card => card.content.append(Component_53.default.create("p")
            .text.add("deepsight.gg would not exist without the prior art of other community-made Destiny apps (mainly ")
            .append(Component_53.default.create("a")
            .attributes.set("href", "https://app.destinyitemmanager.com/")
            .attributes.set("target", "_blank")
            .text.set("Destiny Item Manager"))
            .text.add(" and ")
            .append(Component_53.default.create("a")
            .attributes.set("href", "https://bray.tech/")
            .attributes.set("target", "_blank")
            .text.set("Braytech"))
            .text.add(") and the amazing resources that are: ")))
            .addList(list => list
            .addItem(item => item.append(Component_53.default.create("a")
            .attributes.set("href", "https://github.com/DestinyItemManager/bungie-api-ts")
            .attributes.set("target", "_blank")
            .text.set("Bungie API TypeScript support")))
            .addItem(item => item.append(Component_53.default.create("a")
            .attributes.set("href", "https://github.com/DestinyItemManager/d2-additional-info")
            .attributes.set("target", "_blank")
            .text.set("d2-additional-info")))
            .addItem(item => item.append(Component_53.default.create("a")
            .attributes.set("href", "https://github.com/justrealmilk/destiny-icons")
            .attributes.set("target", "_blank")
            .text.set("Destiny Icons"))))
            .tweak(card => card.content.append(Component_53.default.create("p")
            .text.add("Some (rare) parts of deepsight.gg are ported straight from DIM, such as ")
            .append(Component_53.default.create("a")
            .attributes.set("href", "https://github.com/ChiriVulpes/deepsight.gg/blob/main/src/ui/inventory/tooltip/stats/RecoilDirection.ts")
            .attributes.set("target", "_blank")
            .text.set("RecoilDirection.ts"))
            .text.add(". There is basically zero chance I would've been smart enough to do that, given that I'm primarily a UI/UX developer.")))
            .addParagraph("deepsight.gg takes heavy hints from both Destiny 2 and Braytech. There is nothing that I love more than making UI look pretty and be easy to use, and the UIs in Braytech especially have been a huge inspiration."))))),
    });
});
define("ui/view/appnav/AppInfo", ["require", "exports", "ui/Classes", "ui/Component", "ui/form/Button", "ui/form/Drawer", "ui/Loadable", "ui/LoadingManager", "ui/TextLogo", "ui/view/AboutView", "utility/Env"], function (require, exports, Classes_19, Component_54, Button_8, Drawer_5, Loadable_5, LoadingManager_2, TextLogo_1, AboutView_1, Env_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppInfoClasses = void 0;
    var AppInfoClasses;
    (function (AppInfoClasses) {
        AppInfoClasses["Container"] = "app-info-container";
        AppInfoClasses["Drawer"] = "app-info-drawer";
        AppInfoClasses["LogoContainer"] = "app-info-logo-container";
        AppInfoClasses["Logo"] = "app-info-logo";
        AppInfoClasses["Title"] = "app-info-title";
        AppInfoClasses["Versions"] = "app-info-versions";
        AppInfoClasses["ApiDownWarning"] = "app-info-api-down-warning";
        AppInfoClasses["Links"] = "app-info-links";
        AppInfoClasses["Row"] = "app-info-row";
    })(AppInfoClasses || (exports.AppInfoClasses = AppInfoClasses = {}));
    class AppInfo extends Component_54.default {
        onMake() {
            this.classes.add(AppInfoClasses.Container);
            Loadable_5.default.create(LoadingManager_2.default.model)
                .onReady(() => Component_54.default.create()
                .classes.add(AppInfoClasses.Logo, Classes_19.Classes.Logo))
                .classes.add(AppInfoClasses.LogoContainer)
                .setSimple()
                .setPersistent()
                .prependTo(this);
            TextLogo_1.default.create()
                .classes.add(AppInfoClasses.Title)
                .appendTo(this);
            const appInfoDrawer = Drawer_5.default.create()
                .classes.add(AppInfoClasses.Drawer)
                .appendTo(this);
            appInfoDrawer.createPanel()
                .append(Component_54.default.create()
                .classes.add(Classes_19.Classes.ShowIfAPIDown, AppInfoClasses.ApiDownWarning)
                .append(Component_54.default.create("h3")
                .classes.add(Classes_19.Classes.WarningText)
                .text.set("Bungie API Error"))
                .append(Component_54.default.create("p")
                .text.set("I promise it's not my fault! Probably!"))
                .append(Component_54.default.create("p")
                .text.set("Consider checking ")
                .append(Component_54.default.create("a")
                .attributes.set("href", "https://twitter.com/BungieHelp")
                .attributes.set("target", "_blank")
                .text.set("Bungie Help"))
                .text.add(" on Twitter.")))
                .append(Component_54.default.create()
                .classes.add(AppInfoClasses.Row)
                .append(Component_54.default.create("label")
                .text.set("A fresh take on vault management..."))
                .append(Button_8.default.create()
                .text.set("About / FAQ")
                .event.subscribe("click", () => AboutView_1.default.show())))
                .append(Component_54.default.create()
                .classes.add(AppInfoClasses.Links)
                .append(Component_54.default.create("h3")
                .text.set("Feature requests? Bug reports?"))
                .append(Component_54.default.create("p")
                .text.add("Come chat on the ")
                .append(Component_54.default.create("a")
                .attributes.set("href", "https://discord.gg/dMFRMXZZnY")
                .attributes.set("target", "_blank")
                .text.set("Discord"))
                .text.add("!"))
                .append(Component_54.default.create("h3")
                .text.set("Open source!"))
                .append(Component_54.default.create("p")
                .text.add("Check out the project's ")
                .append(Component_54.default.create("a")
                .attributes.set("href", "https://github.com/ChiriVulpes/deepsight.gg")
                .attributes.set("target", "_blank")
                .text.set("GitHub"))
                .text.add("!")))
                .append(Component_54.default.create()
                .classes.add(Classes_19.Classes.SmallText, AppInfoClasses.Versions)
                .text.set("deepsight.gg /// ")
                .text.add(Env_7.default.DEEPSIGHT_BUILD_NUMBER ? `${Env_7.default.DEEPSIGHT_ENVIRONMENT === "beta" ? "beta " : ""}build #${Env_7.default.DEEPSIGHT_BUILD_NUMBER} // ${Env_7.default.DEEPSIGHT_BUILD_SHA?.slice(0, 7) ?? ""}` : "unknown build"));
            this.event.subscribe("click", () => appInfoDrawer.open("click"))
                .event.subscribe("mouseenter", () => appInfoDrawer.open("mouse"))
                .event.subscribe("mouseleave", () => appInfoDrawer.close("mouse"));
            document.body.addEventListener("click", event => {
                const element = event.target;
                if (!element?.closest(`.${AppInfoClasses.Container}`))
                    appInfoDrawer.close("click");
            });
        }
    }
    exports.default = AppInfo;
});
define("ui/Label", ["require", "exports", "ui/Component"], function (require, exports, Component_55) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LabelClasses = void 0;
    var LabelClasses;
    (function (LabelClasses) {
        LabelClasses["Main"] = "label-wrapper";
        LabelClasses["Label"] = "label";
        LabelClasses["Content"] = "label-content";
    })(LabelClasses || (exports.LabelClasses = LabelClasses = {}));
    class Label extends Component_55.default {
        onMake() {
            this.classes.add(LabelClasses.Main);
            this.label = Component_55.default.create()
                .classes.add(LabelClasses.Label)
                .appendTo(this);
            this.content = Component_55.default.create()
                .classes.add(LabelClasses.Content)
                .appendTo(this);
        }
    }
    exports.default = Label;
});
define("ui/view/AuthView", ["require", "exports", "ui/Classes", "ui/Component", "ui/form/Button", "ui/Label", "ui/TextLogo", "ui/View", "ui/view/AboutView", "utility/Async", "utility/endpoint/bungie/Bungie", "utility/Env"], function (require, exports, Classes_20, Component_56, Button_9, Label_1, TextLogo_2, View_4, AboutView_2, Async_7, Bungie_6, Env_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AuthViewClasses = void 0;
    var AuthViewClasses;
    (function (AuthViewClasses) {
        AuthViewClasses["Logo"] = "view-auth-logo";
        AuthViewClasses["Header"] = "view-auth-header";
        AuthViewClasses["Title"] = "view-auth-title";
        AuthViewClasses["State"] = "view-auth-state";
        AuthViewClasses["AuthButton"] = "view-auth-button-auth";
        AuthViewClasses["Nav"] = "view-auth-nav";
        AuthViewClasses["Splash"] = "view-auth-splash";
        AuthViewClasses["About"] = "view-auth-about";
        AuthViewClasses["ScrollDownHint"] = "view-auth-scroll-down-hint";
    })(AuthViewClasses || (exports.AuthViewClasses = AuthViewClasses = {}));
    exports.default = View_4.default.create({
        id: "auth",
        hash: null,
        name: "Authenticate",
        auth: "none",
        initialise: view => {
            if (Bungie_6.default.authenticated && Env_8.default.DEEPSIGHT_ENVIRONMENT !== "dev")
                return Async_7.default.sleep(1).then(() => viewManager.showDefaultView());
            view.content
                .append(Component_56.default.create()
                .classes.add(AuthViewClasses.Splash)
                .append(Component_56.default.create()
                .classes.add(AuthViewClasses.Header)
                .append(Component_56.default.create()
                .classes.add(AuthViewClasses.Logo, Classes_20.Classes.Logo))
                .append(TextLogo_2.default.create()
                .classes.add(AuthViewClasses.Title)))
                .append(Label_1.default.create()
                .classes.add(AuthViewClasses.State)
                .tweak(_ => _.label.text.set("Account"))
                .tweak(_ => _.content.text.set("Not Authenticated")))
                .append(Button_9.default.create()
                .classes.add(AuthViewClasses.AuthButton)
                .setPrimary()
                .setAttention()
                .setLaserFocus()
                .text.set("Authenticate")
                .event.subscribe("click", () => void Bungie_6.default.authenticate("start").catch(err => console.error(err)))));
            const scrollDownHint = Component_56.default.create()
                .classes.add(AuthViewClasses.ScrollDownHint)
                .text.set("Not convinced? Scroll down!")
                .appendTo(view.content);
            view.content.append(Component_56.default.create()
                .classes.add(AuthViewClasses.About)
                .append(View_4.default.WrapperComponent.create([AboutView_2.default])
                .classes.add(View_4.default.Classes.Subview)));
            view.content.event.subscribe("scroll", () => {
                scrollDownHint.classes.toggle(view.content.element.scrollTop > 0, Classes_20.Classes.Hidden);
            });
        },
    });
});
define("model/models/Moments", ["require", "exports", "model/Model", "model/models/Manifest", "model/models/ProfileBatch"], function (require, exports, Model_13, Manifest_17, ProfileBatch_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Model_13.default.createDynamic("Daily", async (_) => Manifest_17.default.await()
        .then(async (manifest) => {
        const { DeepsightMomentDefinition, DestinyEventCardDefinition } = manifest;
        const moments = await DeepsightMomentDefinition.all();
        const profile = await ProfileBatch_7.default.await();
        const result = [];
        for (let moment of moments) {
            if (typeof moment.event === "number") {
                const eventCard = await DestinyEventCardDefinition.get(moment.event);
                if (eventCard)
                    moment = { ...moment, eventCard };
            }
            result.push(moment);
        }
        result.sort((a, b) => getSortIndex(profile, b) - getSortIndex(profile, a));
        return result;
    }));
    function getSortIndex(profile, moment) {
        if (profile?.profile?.data?.activeEventCardHash !== moment.eventCard?.hash)
            return moment.hash;
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const eventCardEndTime = +moment.eventCard?.endTime;
        if (eventCardEndTime && eventCardEndTime * 1000 > Date.now())
            return Infinity; // current event gets sorted highest
        return moment.hash;
    }
});
define("ui/form/Paginator", ["require", "exports", "ui/Component", "ui/form/Button", "utility/maths/Maths"], function (require, exports, Component_57, Button_10, Maths_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PaginatorPage = exports.PaginatorClasses = void 0;
    var PaginatorClasses;
    (function (PaginatorClasses) {
        PaginatorClasses["Main"] = "paginator";
        PaginatorClasses["PageWrapper"] = "paginator-page-wrapper";
        PaginatorClasses["Page"] = "paginator-page";
        PaginatorClasses["PageHasNext"] = "paginator-page-has-next";
        PaginatorClasses["PageHasPrev"] = "paginator-page-has-prev";
        PaginatorClasses["Button"] = "paginator-button";
        PaginatorClasses["ButtonNext"] = "paginator-button-next";
        PaginatorClasses["ButtonPrev"] = "paginator-button-prev";
        PaginatorClasses["ButtonArrow"] = "paginator-button-arrow";
        PaginatorClasses["ButtonArrowNext"] = "paginator-button-arrow-next";
        PaginatorClasses["ButtonArrowPrev"] = "paginator-button-arrow-prev";
        PaginatorClasses["Preview"] = "paginator-preview";
        PaginatorClasses["PreviewPage"] = "paginator-preview-page";
        PaginatorClasses["PreviewPageCurrent"] = "paginator-preview-page-current";
    })(PaginatorClasses || (exports.PaginatorClasses = PaginatorClasses = {}));
    class Paginator extends Component_57.default {
        constructor() {
            super(...arguments);
            this.scrolling = false;
        }
        onMake() {
            this.classes.add(PaginatorClasses.Main);
            this.pages = [];
            this.previewPages = [];
            this.pageIndex = 0;
            this.buttonPrev = Button_10.default.create()
                .classes.add(PaginatorClasses.Button, PaginatorClasses.ButtonPrev)
                .setPrimary()
                .append(Component_57.default.create()
                .classes.add(PaginatorClasses.ButtonArrow, PaginatorClasses.ButtonArrowPrev))
                .event.subscribe("click", () => this.showPage(this.pageIndex - 1))
                .appendTo(this);
            this.pageWrapper = Component_57.default.create()
                .classes.add(PaginatorClasses.PageWrapper)
                .appendTo(this);
            this.buttonNext = Button_10.default.create()
                .classes.add(PaginatorClasses.Button, PaginatorClasses.ButtonNext)
                .setPrimary()
                .append(Component_57.default.create()
                .classes.add(PaginatorClasses.ButtonArrow, PaginatorClasses.ButtonArrowNext))
                .event.subscribe("click", () => this.showPage(this.pageIndex + 1))
                .appendTo(this);
            this.preview = Component_57.default.create()
                .classes.add(PaginatorClasses.Preview)
                .appendTo(this);
            this.event.subscribe("wheel", event => event.shiftKey
                && this.showPage(this.pageIndex + Math.sign(event.deltaY))
                && event.preventDefault());
            this.event.subscribe("mousedown", event => {
                if (event.button === 1) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            });
        }
        filler(perPage, pageInitialiser) {
            let page;
            let filled = Infinity;
            const result = {
                perPage,
                increment: incrementPageInitialiser => {
                    return result.add(1, incrementPageInitialiser);
                },
                add: (value, incrementPageInitialiser) => {
                    if (filled + value > perPage && !(value >= perPage && !filled))
                        filled = 0, page = this.page()
                            .tweak(pageInitialiser)
                            .tweak(incrementPageInitialiser)
                            .style.set("--paginator-page-size", `${perPage}`);
                    filled += value;
                    return page;
                },
            };
            return result;
        }
        page(initialiser) {
            const index = this.pages.length;
            const page = PaginatorPage.create([index])
                .classes.add(PaginatorClasses.Page)
                .tweak(initialiser)
                .appendTo(this.pageWrapper);
            this.pages.push(page);
            const preview = Component_57.default.create()
                .classes.add(PaginatorClasses.PreviewPage)
                .classes.toggle(!index, PaginatorClasses.PreviewPageCurrent)
                .appendTo(this.preview);
            this.previewPages.push(preview);
            this.updateButtons();
            return initialiser ? this : page;
        }
        showPage(pageIndex) {
            const page = this.pages[pageIndex];
            if (!page)
                return false;
            this.pageIndex = pageIndex;
            this.scroll();
            for (const page of this.previewPages)
                page.classes.remove(PaginatorClasses.PreviewPageCurrent);
            this.previewPages[pageIndex]?.classes.add(PaginatorClasses.PreviewPageCurrent);
            this.updateButtons();
            return true;
        }
        updateButtons() {
            this.buttonPrev.setDisabled(this.pageIndex === 0);
            this.buttonNext.setDisabled(this.pageIndex === this.pages.length - 1);
        }
        scroll() {
            if (this.scrolling)
                return;
            this.scrolling = true;
            let lastStep = Date.now();
            const tickRate = 1000 / 30;
            const scrollSpeed = 1 / 3;
            const step = () => {
                const now = Date.now();
                const delta = (now - lastStep) / tickRate;
                lastStep = now;
                const paddingleft = 0;
                const pageElement = this.pages[this.pageIndex].element;
                const wrapperElement = this.pageWrapper.element;
                const offsetLeft = pageElement.offsetLeft - wrapperElement.offsetLeft + paddingleft;
                const scrollLeft = wrapperElement.scrollLeft;
                const targetScrollLeft = offsetLeft - paddingleft;
                const diff = targetScrollLeft - scrollLeft;
                if (Math.abs(diff) > 2) {
                    const newScrollLeft = Maths_6.default.lerp(targetScrollLeft, scrollLeft, 0.5 ** (delta * scrollSpeed));
                    const scrollDiff = newScrollLeft - scrollLeft;
                    this.pageWrapper.element.scrollLeft = scrollDiff > 0 ? Math.ceil(newScrollLeft) : Math.floor(newScrollLeft);
                    requestAnimationFrame(step);
                    return;
                }
                this.pageWrapper.element.scrollLeft = targetScrollLeft;
                this.scrolling = false;
            };
            requestAnimationFrame(step);
        }
    }
    exports.default = Paginator;
    class PaginatorPage extends Component_57.default {
        onMake(page) {
            this.classes.add(PaginatorClasses.Page);
            this.page = page;
        }
    }
    exports.PaginatorPage = PaginatorPage;
});
define("ui/Timestamp", ["require", "exports", "ui/Classes", "ui/Component", "utility/Time", "utility/decorator/Bound"], function (require, exports, Classes_21, Component_58, Time_6, Bound_19) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TimestampClasses = void 0;
    var TimestampClasses;
    (function (TimestampClasses) {
        TimestampClasses["Main"] = "timestamp";
    })(TimestampClasses || (exports.TimestampClasses = TimestampClasses = {}));
    // note: these components persist in memory forever
    class Timestamp extends Component_58.default {
        constructor() {
            super(...arguments);
            this.rendering = false;
        }
        onMake(time, format = "relative", options) {
            this.classes.add(TimestampClasses.Main);
            this.setTime(time);
            this.setDisplayMode(format, options);
        }
        setDisplayMode(mode, options) {
            this.mode = mode;
            this.options = options;
            if (!this.rendering)
                this.render();
            return this;
        }
        setTime(time) {
            this.time = time;
            this.classes.toggle(time === undefined, Classes_21.Classes.Hidden);
            if (time === undefined)
                return this.text.set("");
            if (!this.rendering)
                this.render();
            return this;
        }
        render() {
            this.rendering = true;
            const time = this.time ?? 0;
            this.text.set(time - Date.now() < 0 ? "expired" : Time_6.default[this.mode]?.(this.time ?? 0, this.options));
            if (this.mode === "relative")
                window.setTimeout(this.render, 900); // less than 1 second so that we never miss a second
            else
                this.rendering = false;
        }
    }
    Timestamp.defaultType = "span";
    exports.default = Timestamp;
    __decorate([
        Bound_19.default
    ], Timestamp.prototype, "render", null);
});
define("ui/view/collections/ExoticArmourRewardComponent", ["require", "exports", "ui/inventory/ItemComponent"], function (require, exports, ItemComponent_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ExoticArmourRewardComponentClasses = void 0;
    var ExoticArmourRewardComponentClasses;
    (function (ExoticArmourRewardComponentClasses) {
        ExoticArmourRewardComponentClasses["Main"] = "item-exotic-armour-reward";
    })(ExoticArmourRewardComponentClasses || (exports.ExoticArmourRewardComponentClasses = ExoticArmourRewardComponentClasses = {}));
    const paths = {
        [176055472 /* InventoryItemHashes.IfSoloExoticChestArmorRareDummy */]: "./image/png/item/chest.png",
        [1387420892 /* InventoryItemHashes.IfSoloExoticHeadArmorRareDummy */]: "./image/png/item/head.png",
        [2850782006 /* InventoryItemHashes.IfSoloExoticLegsArmorRareDummy */]: "./image/png/item/legs.png",
        [1572351682 /* InventoryItemHashes.IfSoloExoticArmsArmorRareDummy */]: "./image/png/item/arms.png",
    };
    class ExoticArmourRewardComponent extends ItemComponent_5.default {
        static is(item) {
            return item.definition.hash in paths;
        }
        async onMake(item, inventory) {
            item.reference.state = 4 /* ItemState.Masterwork */;
            await super.onMake(item, inventory);
            this.classes.add(ExoticArmourRewardComponentClasses.Main);
            this.clearTooltip();
        }
        initialiseIcon(icon) {
            const path = paths[this.item?.definition.hash];
            if (path) {
                icon.setPath(path);
            }
        }
    }
    exports.default = ExoticArmourRewardComponent;
});
define("ui/view/collections/ICollectionsView", ["require", "exports", "ui/bungie/DisplayProperties", "ui/inventory/ItemComponent", "ui/inventory/Slot", "ui/view/collections/ExoticArmourRewardComponent"], function (require, exports, DisplayProperties_16, ItemComponent_6, Slot_5, ExoticArmourRewardComponent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ICollectionsView;
    (function (ICollectionsView) {
        const bucketOrder = [
            1498876634 /* InventoryBucketHashes.KineticWeapons */,
            2465295065 /* InventoryBucketHashes.EnergyWeapons */,
            953998645 /* InventoryBucketHashes.PowerWeapons */,
            3448274439 /* InventoryBucketHashes.Helmet */,
            3551918588 /* InventoryBucketHashes.Gauntlets */,
            14239492 /* InventoryBucketHashes.ChestArmor */,
            20886954 /* InventoryBucketHashes.LegArmor */,
            1585787867 /* InventoryBucketHashes.ClassArmor */,
        ];
        function addItems(component, items, inventory) {
            component.append(...items
                .sort(item => item.definition.inventory?.tierType ?? 0 /* TierType.Unknown */, item => item.isWeapon() ? 1 : 0, item => item.deepsight?.pattern ? inventory?.craftedItems.has(item.definition.hash) ? 0 : item.deepsight.pattern.progress?.complete ? 3 : 2 : 1, item => item.definition.classType ?? 3 /* DestinyClass.Unknown */, (a, b) => (a.collectible?.sourceHash ?? -1) - (b.collectible?.sourceHash ?? -1), 
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            item => 999 - (bucketOrder.indexOf(item.definition.inventory?.bucketTypeHash) + 1), (a, b) => (a.collectible?.index ?? 0) - (b.collectible?.index ?? 0), (a, b) => (DisplayProperties_16.default.name(a.definition) ?? "").localeCompare(DisplayProperties_16.default.name(b.definition) ?? ""))
                .map(item => Slot_5.default.create()
                .append(ExoticArmourRewardComponent_1.default.is(item) ? ExoticArmourRewardComponent_1.default.create([item, inventory])
                : ItemComponent_6.default.create([item, inventory]))));
        }
        ICollectionsView.addItems = addItems;
    })(ICollectionsView || (ICollectionsView = {}));
    exports.default = ICollectionsView;
});
define("ui/view/collections/CollectionsCurrentlyAvailableActivity", ["require", "exports", "model/models/items/Source", "ui/Card", "ui/Component", "ui/Timestamp", "ui/bungie/DisplayProperties", "ui/view/collections/ICollectionsView"], function (require, exports, Source_2, Card_5, Component_59, Timestamp_1, DisplayProperties_17, ICollectionsView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollectionsCurrentlyAvailableActivity = exports.CollectionsCurrentlyAvailableActivityClasses = void 0;
    const moreInfoLinks = {
        nightfall: "https://bray.tech/weeklies#nightfall",
        "lost-sector": "https://bray.tech/weeklies#lost-sector",
        dungeon: "https://bray.tech/weeklies#dungeon",
        raid: "https://bray.tech/weeklies#raid",
    };
    const rotationLinks = {
        nightfall: "https://bray.tech/weeklies/rotations#nightfall",
        "lost-sector": "https://bray.tech/weeklies/rotations#lost-sector",
        dungeon: "https://bray.tech/weeklies/rotations#dungeon",
        raid: "https://bray.tech/weeklies/rotations#raid",
        "exotic-mission": "https://bray.tech/weeklies/rotations#exotic-mission",
    };
    var CollectionsCurrentlyAvailableActivityClasses;
    (function (CollectionsCurrentlyAvailableActivityClasses) {
        CollectionsCurrentlyAvailableActivityClasses["Activity"] = "view-collections-currently-available-activity";
        CollectionsCurrentlyAvailableActivityClasses["ActivityIcon"] = "view-collections-currently-available-activity-icon";
        CollectionsCurrentlyAvailableActivityClasses["ActivityIconContainer"] = "view-collections-currently-available-activity-icon-container";
        CollectionsCurrentlyAvailableActivityClasses["ActivityTitle"] = "view-collections-currently-available-activity-title";
        CollectionsCurrentlyAvailableActivityClasses["ActivityDescription"] = "view-collections-currently-available-activity-description";
        CollectionsCurrentlyAvailableActivityClasses["ActivityRewards"] = "view-collections-currently-available-activity-rewards";
        CollectionsCurrentlyAvailableActivityClasses["ActivityRewardsLong"] = "view-collections-currently-available-activity-rewards-long";
        CollectionsCurrentlyAvailableActivityClasses["ActivityHeader"] = "view-collections-currently-available-activity-header";
        CollectionsCurrentlyAvailableActivityClasses["ActivityHeaderBookmark"] = "view-collections-currently-available-activity-header-bookmark";
        CollectionsCurrentlyAvailableActivityClasses["ActivityHeaderBookmarkIcon"] = "view-collections-currently-available-activity-header-bookmark-icon";
        CollectionsCurrentlyAvailableActivityClasses["ActivityHeaderSubtitle"] = "view-collections-currently-available-activity-header-subtitle";
        CollectionsCurrentlyAvailableActivityClasses["ActivityHeaderSubtitleNote"] = "view-collections-currently-available-activity-header-subtitle-note";
        CollectionsCurrentlyAvailableActivityClasses["ActivityHeaderSubtitleExpiry"] = "view-collections-currently-available-activity-header-subtitle-expiry";
        CollectionsCurrentlyAvailableActivityClasses["ActivityHeaderSubtitleExpiryLink"] = "view-collections-currently-available-activity-header-subtitle-expiry-link";
    })(CollectionsCurrentlyAvailableActivityClasses || (exports.CollectionsCurrentlyAvailableActivityClasses = CollectionsCurrentlyAvailableActivityClasses = {}));
    class CollectionsCurrentlyAvailableActivity extends Card_5.default {
        onMake(activity, source, activityType, items, inventory) {
            super.onMake(activity, source, activityType, items, inventory);
            this.source = source;
            this.setDisplayMode(Card_5.CardClasses.DisplayModeCard);
            this.classes.add(CollectionsCurrentlyAvailableActivityClasses.Activity);
            this.attributes.set("tabindex", "0");
            const icon = source?.dropTable.displayProperties?.icon;
            // wrap the icon in a container so we can make it really big and use overflow hidden on it 
            Component_59.default.create()
                .classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityIconContainer)
                .append(this.icon.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityIcon)
                .style.set("--icon", DisplayProperties_17.default.icon(icon) ?? DisplayProperties_17.default.icon(activity)))
                .prependTo(this);
            this.background.attributes.set("src", `https://www.bungie.net${activity.pgcrImage}`);
            // ensure fake card header (which contains the card hover sheen and the box shadow contrast reducer border) 
            // is after the icon & background
            this.header.appendTo(this);
            // overwrite header with the real one
            this.header = Component_59.default.create()
                .classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeader)
                .insertToBefore(this, this.contentWrapper);
            Component_59.default.create()
                .classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderBookmark)
                .style.set("--background", `var(--background-${source.dropTable.type})`)
                .append(Component_59.default.create()
                .classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderBookmarkIcon)
                .style.set("--icon", DisplayProperties_17.default.icon(source.dropTable.typeDisplayProperties) ?? DisplayProperties_17.default.icon(icon) ?? DisplayProperties_17.default.icon(activity)))
                .appendTo(this.header);
            const note = source.type === Source_2.SourceType.Rotator ? "Rotator"
                : source.type === Source_2.SourceType.Repeatable ? "Repeatable"
                    : undefined;
            let expiryWrapper;
            Component_59.default.create()
                .classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitle)
                .text.add(DisplayProperties_17.default.name(source.dropTable.typeDisplayProperties) ?? "Unknown")
                .append(note && Component_59.default.create("span")
                .classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitleNote)
                .text.add(" \xa0 // \xa0 ")
                .text.add(note))
                .append(!source.endTime ? undefined : expiryWrapper = Component_59.default.create("span")
                .classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitleExpiry)
                .text.add(" \xa0 / \xa0 "))
                .appendTo(this.header);
            const timestamp = expiryWrapper && Timestamp_1.default.create([source.endTime, "relative", { components: 2, label: false }])
                .appendTo(expiryWrapper);
            const rotationLink = expiryWrapper && rotationLinks[source.dropTable.type];
            if (rotationLink)
                Component_59.default.create("a")
                    .classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityHeaderSubtitleExpiryLink)
                    .attributes.set("href", rotationLink)
                    .attributes.set("target", "_blank")
                    .append(timestamp)
                    .appendTo(expiryWrapper);
            const moreInfoLink = moreInfoLinks[source.dropTable.type];
            if (moreInfoLink)
                this.event.subscribe("contextmenu", () => window.open(moreInfoLink, "_blank"));
            this.title.classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityTitle)
                .text.set(undefined
                ?? DisplayProperties_17.default.name(source.dropTable.displayProperties)
                ?? DisplayProperties_17.default.name(activity))
                .appendTo(this.content); // the title should be part of the content instead of part of the header
            Component_59.default.create()
                .classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityDescription)
                .tweak(DisplayProperties_17.default.applyDescription, (undefined
                ?? DisplayProperties_17.default.description(source.dropTable.displayProperties)
                ?? DisplayProperties_17.default.description(activity)), {
                character: inventory?.currentCharacter.characterId,
                singleLine: true,
            })
                .appendTo(this.content);
            const rewards = Component_59.default.create()
                .classes.add(CollectionsCurrentlyAvailableActivityClasses.ActivityRewards)
                .classes.toggle(items.length > 10, CollectionsCurrentlyAvailableActivityClasses.ActivityRewardsLong)
                .style.set("--length", `${items.length > 10 ? 8 : items.length}`)
                .appendTo(this.content);
            ICollectionsView_1.default.addItems(rewards, items, inventory);
        }
    }
    exports.CollectionsCurrentlyAvailableActivity = CollectionsCurrentlyAvailableActivity;
});
define("model/models/items/ItemEquippableDummies", ["require", "exports", "model/models/Manifest", "utility/Arrays"], function (require, exports, Manifest_18, Arrays_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ItemEquippableDummies;
    (function (ItemEquippableDummies) {
        async function findPreferredCopy(item) {
            const { DestinyInventoryItemDefinition } = await Manifest_18.default.await();
            if (typeof item !== "string") {
                const definition = typeof item === "object" ? item : await DestinyInventoryItemDefinition.get(item);
                if (!definition?.displayProperties.name)
                    return undefined;
                item = definition.displayProperties.name;
            }
            const matching = await DestinyInventoryItemDefinition.all("name", item);
            const [preferred] = ((await Promise.all(matching.filter(item => !is(item))
                .map(async (item) => Arrays_12.default.tuple(item, await getPreferredCopySortIndex(item)))))
                .sort(([, a], [, b]) => b - a))
                .map(([item]) => item);
            return preferred;
        }
        ItemEquippableDummies.findPreferredCopy = findPreferredCopy;
        function is(item) {
            return !item.equippable
                || item.itemCategoryHashes?.includes(3109687656 /* ItemCategoryHashes.Dummies */)
                || !(item.itemCategoryHashes?.includes(1 /* ItemCategoryHashes.Weapon */) || item.itemCategoryHashes?.includes(20 /* ItemCategoryHashes.Armor */));
        }
        ItemEquippableDummies.is = is;
        async function getPreferredCopySortIndex(item) {
            const { DestinyPowerCapDefinition } = await Manifest_18.default.await();
            const powerCap = await DestinyPowerCapDefinition.get(item.quality?.versions[item.quality.currentVersion]?.powerCapHash);
            return (item.collectibleHash ? 100000 : 0)
                + (item.plug ? 0 : 10000)
                + ((powerCap?.powerCap ?? 0) < 900000 ? 0 : 1000);
        }
        ItemEquippableDummies.getPreferredCopySortIndex = getPreferredCopySortIndex;
    })(ItemEquippableDummies || (ItemEquippableDummies = {}));
    exports.default = ItemEquippableDummies;
});
define("model/models/Collections", ["require", "exports", "model/Model", "model/models/Manifest", "model/models/ProfileBatch", "model/models/items/Item", "model/models/items/ItemEquippableDummies", "ui/bungie/DisplayProperties", "utility/Debug"], function (require, exports, Model_14, Manifest_19, ProfileBatch_8, Item_4, ItemEquippableDummies_1, DisplayProperties_18, Debug_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Collections;
    (function (Collections) {
        const moments = {};
        function moment(moment) {
            return moments[moment.hash] ??= Model_14.default.createDynamic("Daily", async () => {
                const manifest = await Manifest_19.default.await();
                const { DestinyInventoryItemDefinition } = manifest;
                const profile = await ProfileBatch_8.default.await();
                const itemDefs = await DestinyInventoryItemDefinition.all("iconWatermark", typeof moment.iconWatermark === "string" ? moment.iconWatermark : "?")
                    .then(items => items
                    .filter(item => item.displayProperties.name && !ItemEquippableDummies_1.default.is(item)));
                const map = new Map();
                const issues = new Set();
                for (const itemB of itemDefs) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    const name = `${DisplayProperties_18.default.name(itemB)} ${itemB.equippingBlock?.equipmentSlotTypeHash}`;
                    const existing = map.get(name);
                    if (existing?.size) {
                        const [itemA] = existing;
                        const itemAIndex = await ItemEquippableDummies_1.default.getPreferredCopySortIndex(itemA);
                        const itemBIndex = await ItemEquippableDummies_1.default.getPreferredCopySortIndex(itemB);
                        if (itemBIndex < itemAIndex)
                            // don't replace itemA copy if itemB copy is worse
                            continue;
                        if (itemAIndex === itemBIndex) {
                            if (itemA.displayProperties.icon !== itemB.displayProperties.icon) {
                                // allow identical items with different icons
                                existing.add(itemB);
                                continue;
                            }
                            if (Debug_2.Debug.collectionsDuplicates)
                                console.warn("Could not find difference between:", name, itemA, itemB);
                            issues.add(itemA);
                            issues.add(itemB);
                            continue;
                        }
                    }
                    map.set(name, new Set([itemB]));
                }
                let useItemDefs;
                if (Debug_2.Debug.collectionsDuplicates && issues.size > 0) {
                    useItemDefs = [...issues.values()];
                }
                else {
                    useItemDefs = [...map.values()].flatMap(items => [...items.values()]);
                }
                // eslint-disable-next-line no-constant-condition
                return Promise.all(useItemDefs
                    .map(item => Item_4.default.createFake(manifest, profile, item)));
            });
        }
        Collections.moment = moment;
    })(Collections || (Collections = {}));
    exports.default = Collections;
});
define("ui/view/collections/CollectionsMoment", ["require", "exports", "model/Model", "model/models/Characters", "model/models/Collections", "ui/Component", "ui/Details", "ui/Loadable", "ui/view/collections/ICollectionsView"], function (require, exports, Model_15, Characters_8, Collections_1, Component_60, Details_2, Loadable_6, ICollectionsView_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollectionsMomentClasses = void 0;
    var CollectionsMomentClasses;
    (function (CollectionsMomentClasses) {
        CollectionsMomentClasses["Moment"] = "view-collections-moment";
        CollectionsMomentClasses["MomentContent"] = "view-collections-moment-content";
        CollectionsMomentClasses["Bucket"] = "view-collections-bucket";
        CollectionsMomentClasses["BucketTitle"] = "view-collections-bucket-title";
    })(CollectionsMomentClasses || (exports.CollectionsMomentClasses = CollectionsMomentClasses = {}));
    class CollectionsMoment extends Details_2.default {
        onMake(moment, inventory, defaultOpen = false) {
            super.onMake(moment, inventory);
            this.classes.add(CollectionsMomentClasses.Moment)
                .toggle(defaultOpen)
                .tweak(details => details.summary.text.set(moment.displayProperties.name));
            Loadable_6.default.create(Model_15.default.createTemporary(async () => {
                if (!defaultOpen)
                    await this.event.waitFor("toggle");
                return Collections_1.default.moment(moment).await();
            }))
                .onReady(items => {
                console.log(moment.displayProperties.name, items);
                const weapons = [];
                const classItems = {};
                for (const item of items) {
                    if (item.isWeapon()) {
                        weapons.push(item);
                        continue;
                    }
                    (classItems[item.definition.classType] ??= [])
                        .push(item);
                }
                const wrapper = Component_60.default.create()
                    .classes.add(CollectionsMomentClasses.MomentContent);
                if (weapons.length)
                    Component_60.default.create()
                        .classes.add(CollectionsMomentClasses.Bucket)
                        .append(Component_60.default.create()
                        .classes.add(CollectionsMomentClasses.BucketTitle)
                        .text.set("Weapons"))
                        .tweak(ICollectionsView_2.default.addItems, weapons, inventory)
                        .appendTo(wrapper);
                for (const cls of Characters_8.default.getSortedClasses()) {
                    const items = classItems[cls];
                    if (!items?.length)
                        continue;
                    Component_60.default.create()
                        .classes.add(CollectionsMomentClasses.Bucket)
                        .append(Component_60.default.create()
                        .classes.add(CollectionsMomentClasses.BucketTitle)
                        .text.set(cls === 0 /* DestinyClass.Titan */ ? "Titan" : cls === 1 /* DestinyClass.Hunter */ ? "Hunter" : "Warlock")
                        .text.add(" Armor"))
                        .tweak(ICollectionsView_2.default.addItems, items, inventory)
                        .appendTo(wrapper);
                }
                return wrapper;
            })
                .setSimple()
                .appendTo(this);
        }
    }
    exports.default = CollectionsMoment;
});
define("ui/view/collections/CollectionsCurrentlyAvailable", ["require", "exports", "model/models/items/Item", "ui/Details", "ui/form/Paginator", "ui/view/collections/CollectionsCurrentlyAvailableActivity", "ui/view/collections/CollectionsMoment", "utility/Arrays", "utility/Objects"], function (require, exports, Item_5, Details_3, Paginator_1, CollectionsCurrentlyAvailableActivity_1, CollectionsMoment_1, Arrays_13, Objects_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollectionsCurrentlyAvailableClasses = void 0;
    var CollectionsCurrentlyAvailableClasses;
    (function (CollectionsCurrentlyAvailableClasses) {
        CollectionsCurrentlyAvailableClasses["Main"] = "view-collections-currently-available";
        CollectionsCurrentlyAvailableClasses["Heading"] = "view-collections-currently-available-heading";
        CollectionsCurrentlyAvailableClasses["ActivityWrapperPaginator"] = "view-collections-currently-available-activity-wrapper-paginator";
        CollectionsCurrentlyAvailableClasses["ActivityWrapperPaginatorButton"] = "view-collections-currently-available-activity-wrapper-paginator-button";
        CollectionsCurrentlyAvailableClasses["ActivityWrapper"] = "view-collections-currently-available-activity-wrapper";
        CollectionsCurrentlyAvailableClasses["ActivityWrapperPage"] = "view-collections-currently-available-activity-wrapper-page";
    })(CollectionsCurrentlyAvailableClasses || (exports.CollectionsCurrentlyAvailableClasses = CollectionsCurrentlyAvailableClasses = {}));
    const activityOrder = Object.keys({
        trials: true,
        "lost-sector": true,
        nightfall: true,
        raid: true,
        dungeon: true,
        "exotic-mission": true,
    });
    const availabilityOrder = ["rotator", "repeatable", undefined];
    class CollectionsCurrentlyAvailable extends Details_3.default {
        async onMake(manifest, profile, inventory) {
            super.onMake(manifest, profile, inventory);
            this.classes.add(CollectionsCurrentlyAvailableClasses.Main, CollectionsMoment_1.CollectionsMomentClasses.Moment);
            this.summary.text.set("Currently Available");
            this.open();
            const items = await this.discoverItems(manifest, profile);
            const sources = items.flatMap(item => item.sources ?? Arrays_13.default.EMPTY)
                .map(source => source.masterActivityDefinition && (source.isActiveMasterDrop || source.masterActivityDefinition?.activityModeTypes?.includes(46 /* DestinyActivityModeType.ScoredNightfall */))
                ? Arrays_13.default.tuple(source.dropTable.hash, source.masterActivityDefinition, source)
                : Arrays_13.default.tuple(source.dropTable.hash, source.activityDefinition, source))
                .sort(([, , a], [, , b]) => a.type - b.type);
            // .filter((source): source is [number, DestinyActivityDefinition, ISource] => !!source);
            const activityWrapper = Paginator_1.default.create()
                .classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPaginator)
                .appendTo(this);
            activityWrapper.pageWrapper.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapper);
            activityWrapper.buttonNext.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPaginatorButton);
            activityWrapper.buttonPrev.classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPaginatorButton);
            const activityFiller = activityWrapper.filler(4, page => page
                .classes.add(CollectionsCurrentlyAvailableClasses.ActivityWrapperPage));
            const { DestinyActivityTypeDefinition, DestinyActivityModeDefinition } = manifest;
            const added = new Set();
            const activityCards = [];
            for (const [hash, activity, source] of sources) {
                if (added.has(hash))
                    continue;
                if (source.endTime && new Date(source.endTime).getTime() < Date.now())
                    continue;
                added.add(hash);
                const sourceItems = items.filter(item => item.sources?.some(source => source.dropTable.hash === hash && (false
                    || item.definition.hash in (source.dropTable.dropTable ?? Objects_6.default.EMPTY)
                    || source.dropTable.encounters?.some(encounter => item.definition.hash in (encounter.dropTable ?? Objects_6.default.EMPTY))
                    || source.isActiveDrop
                    || source.isActiveMasterDrop)));
                if (!sourceItems.length)
                    continue;
                // eslint-disable-next-line no-constant-condition
                const activityType = false ? undefined
                    // dungeon type doesn't have icon, use mode instead
                    : activity.activityTypeHash === 608898761 /* ActivityTypeHashes.Dungeon */ ? await DestinyActivityModeDefinition.get(608898761 /* ActivityModeHashes.Dungeon */)
                        // trials type doesn't have icon, use mode instead
                        : activity.activityTypeHash === 2112637710 /* ActivityTypeHashes.TrialsOfOsiris */ ? await DestinyActivityModeDefinition.get(1673724806 /* ActivityModeHashes.TrialsOfOsiris */)
                            // lost sector type doesn't have icon, use mode instead
                            : activity.activityTypeHash === 103143560 /* ActivityTypeHashes.LostSector */ ? await DestinyActivityModeDefinition.get(103143560 /* ActivityModeHashes.LostSector */)
                                : await DestinyActivityTypeDefinition.get(activity.activityTypeHash);
                activityCards.push(CollectionsCurrentlyAvailableActivity_1.CollectionsCurrentlyAvailableActivity.create([activity, source, activityType, sourceItems, inventory])
                    .event.subscribe("mouseenter", () => console.log(activity?.displayProperties?.name, activity, source)));
            }
            activityCards
                .sort((a, b) => activityOrder.indexOf(a.source.dropTable.type) - activityOrder.indexOf(b.source.dropTable.type))
                .sort((a, b) => availabilityOrder.indexOf(a.source.dropTable.availability) - availabilityOrder.indexOf(b.source.dropTable.availability))
                .forEach(card => card.appendTo(activityFiller.increment()));
        }
        async discoverItems(manifest, profile) {
            const itemHashes = new Set();
            const { DeepsightDropTableDefinition, DestinyInventoryItemDefinition, DestinyActivityDefinition } = manifest;
            const dropTables = await DeepsightDropTableDefinition.all();
            for (const source of dropTables) {
                const masterActivityDefinition = await DestinyActivityDefinition.get(source.master?.activityHash);
                const intervals = source.rotations?.current ?? 0;
                if (source.availability) {
                    for (const dropHash of Object.keys(source.dropTable ?? Objects_6.default.EMPTY))
                        itemHashes.add(+dropHash);
                    for (const encounter of source.encounters ?? [])
                        for (const dropHash of Object.keys(encounter.dropTable ?? Objects_6.default.EMPTY))
                            itemHashes.add(+dropHash);
                    if (source.rotations) {
                        const drop = resolveRotation(source.rotations.drops, intervals);
                        if (typeof drop === "number")
                            itemHashes.add(drop);
                        else if (typeof drop === "object")
                            for (const id of Object.keys(drop))
                                itemHashes.add(+id);
                    }
                }
                if (masterActivityDefinition) {
                    if (source.rotations) {
                        const masterDrop = resolveRotation(source.rotations.masterDrops, intervals);
                        if (typeof masterDrop === "number")
                            itemHashes.add(masterDrop);
                        else if (typeof masterDrop === "object")
                            for (const id of Object.keys(masterDrop))
                                itemHashes.add(+id);
                    }
                    for (const dropHash of Object.keys(source.master?.dropTable ?? Objects_6.default.EMPTY))
                        itemHashes.add(+dropHash);
                }
            }
            // let start = Date.now();
            const defs = await Promise.all(Array.from(itemHashes).map(hash => DestinyInventoryItemDefinition.get(hash)));
            // console.log("defs", Date.now() - start);
            // start = Date.now();
            const items = await Promise.all(defs.map(def => def && Item_5.default.createFake(manifest, profile ?? {}, def)));
            // console.log("fake items", Date.now() - start);
            return items.filter((item) => !!item && (item.isWeapon() || item.isExotic()));
        }
    }
    exports.default = CollectionsCurrentlyAvailable;
    function resolveRotation(rotation, interval) {
        return !rotation?.length ? undefined : rotation?.[interval % rotation.length];
    }
});
define("ui/view/collections/CollectionsView", ["require", "exports", "model/Model", "model/models/Inventory", "model/models/Manifest", "model/models/Moments", "model/models/ProfileBatch", "ui/View", "ui/view/collections/CollectionsCurrentlyAvailable", "ui/view/collections/CollectionsMoment", "utility/endpoint/bungie/Bungie"], function (require, exports, Model_16, Inventory_6, Manifest_20, Moments_1, ProfileBatch_9, View_5, CollectionsCurrentlyAvailable_1, CollectionsMoment_2, Bungie_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const CollectionsViewModel = Model_16.default.createTemporary(async (api) => {
        if (!Bungie_7.default.authenticated)
            return [];
        const profile = ProfileBatch_9.default.latest ?? await api.subscribeProgressAndWait(ProfileBatch_9.default, 0.5);
        const inventory = await api.subscribeProgressAndWait(Inventory_6.default.createModel(), 0.5, 0.5);
        return [profile, inventory];
    });
    exports.default = View_5.default.create({
        models: [Manifest_20.default, Moments_1.default, CollectionsViewModel],
        id: "collections",
        name: "Collections",
        auth: "optional",
        initialise: (view, manifest, moments, [profile, inventory]) => {
            view.setTitle(title => title.text.set("Collections"));
            CollectionsCurrentlyAvailable_1.default.create([manifest, profile, inventory])
                .appendTo(view.content);
            let shownExpansion = false;
            let shownSeason = false;
            for (const moment of moments) {
                let defaultOpen = false;
                if (!shownExpansion && moment.expansion) {
                    defaultOpen = true;
                    shownExpansion = true;
                }
                if (!shownSeason && moment.season) {
                    defaultOpen = true;
                    shownSeason = true;
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                if (profile?.profile?.data?.activeEventCardHash === moment.eventCard?.hash && (+moment.eventCard?.endTime ?? 0) * 1000 > Date.now())
                    defaultOpen = true;
                CollectionsMoment_2.default.create([moment, inventory, defaultOpen])
                    .appendTo(view.content);
            }
        },
    });
});
define("ui/view/item/ItemSockets", ["require", "exports", "ui/bungie/DisplayProperties", "ui/Card", "ui/Classes", "ui/Component", "ui/form/Button", "ui/inventory/ItemPlugTooltip"], function (require, exports, DisplayProperties_19, Card_6, Classes_22, Component_61, Button_11, ItemPlugTooltip_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemPlug = exports.ItemSocket = exports.ItemSocketsClasses = void 0;
    var ItemSocketsClasses;
    (function (ItemSocketsClasses) {
        ItemSocketsClasses["Main"] = "view-item-sockets";
        ItemSocketsClasses["SocketsContainer"] = "view-item-sockets-container";
        ItemSocketsClasses["Socket"] = "view-item-socket";
        ItemSocketsClasses["Plug"] = "view-item-socket-plug";
        ItemSocketsClasses["PlugSelected"] = "view-item-socket-plug-selected";
        ItemSocketsClasses["PlugName"] = "view-item-socket-plug-name";
        ItemSocketsClasses["PlugDescription"] = "view-item-socket-plug-description";
        ItemSocketsClasses["PlugEnhanced"] = "view-item-socket-plug-enhanced";
        ItemSocketsClasses["PlugEffects"] = "view-item-socket-plug-effects";
        ItemSocketsClasses["PlugExotic"] = "view-item-socket-plug-exotic";
        ItemSocketsClasses["PlugRequiredLevel"] = "view-item-socket-plug-required-level";
        ItemSocketsClasses["PlugType"] = "view-item-socket-plug-type";
        ItemSocketsClasses["PlugIconInner"] = "view-item-socket-plug-icon-inner";
        ItemSocketsClasses["PlugIconInnerType"] = "view-item-socket-plug-icon-inner-type";
        // PlugRequiredLevelWrapper = "view-item-socket-plug-required-level-wrapper",
        ItemSocketsClasses["Socketed"] = "view-item-socket-plug-socketed";
    })(ItemSocketsClasses || (exports.ItemSocketsClasses = ItemSocketsClasses = {}));
    class ItemSockets extends Card_6.default {
        get socketClasses() { return []; }
        get plugClasses() { return []; }
        async onMake(item, inventory) {
            super.onMake(item, inventory);
            this.item = item;
            this.inventory = inventory;
            this.classes.add(ItemSocketsClasses.Main);
            this.setDisplayMode(Card_6.CardClasses.DisplayModeSection);
            this.title.text.set(this.getTitle());
            this.addedSockets = [];
            this.maxSocketPlugs = 0;
            await this.initialise();
            this.classes.toggle(!this.addedSockets.length, Classes_22.Classes.Hidden);
            Component_61.default.create()
                .classes.add(ItemSocketsClasses.SocketsContainer)
                .append(...this.addedSockets.splice(0, Infinity))
                .appendTo(this.content);
            // Loadable.create(Promise.resolve().then(() => Async.sleep(2000)))
            // 	.onReady(() => ))
            // 	.appendTo(this.content);
        }
        addSocketsByType(...anyOfTypes) {
            return this.addSockets(...this.item.getSockets(...anyOfTypes));
        }
        addSockets(...sockets) {
            const components = [];
            for (const socket of sockets) {
                if (socket.state?.isVisible !== false) {
                    let socketComponent;
                    let i = 0;
                    for (const plug of socket.plugs) {
                        if (!socket.state && plug.is("Intrinsic/FrameEnhanced"))
                            continue;
                        if (plug.is("Perk/TraitLocked"))
                            continue;
                        if (i++ && plug.is("Intrinsic/Exotic"))
                            continue;
                        if (!plug.definition?.displayProperties.name)
                            continue;
                        socketComponent ??= this.addSocket()
                            .classes.add(...this.socketClasses);
                        socketComponent.addPlug(plug, undefined, this.item)
                            .classes.add(...this.plugClasses);
                    }
                    if (socketComponent)
                        components.push(socketComponent);
                }
            }
            return components;
        }
        addPerksByPlugType(...anyOfTypes) {
            return this.addPerks(...this.item.getSockets(...anyOfTypes));
        }
        addPerks(...sockets) {
            const components = [];
            for (const socket of sockets) {
                if (socket.state?.isVisible !== false) {
                    for (const plug of socket.plugs) {
                        if (!socket.state && plug.is("Perk/TraitEnhanced", "Intrinsic/FrameEnhanced"))
                            continue;
                        if (socket.is("Masterwork/ExoticCatalyst") && !this.item.isMasterwork())
                            continue;
                        for (const perk of plug.perks) {
                            if (perk.perkVisibility === 2 /* ItemPerkVisibility.Hidden */ || !perk.definition.isDisplayable)
                                continue;
                            const socketComponent = this.addSocket()
                                .classes.add(...this.socketClasses);
                            components.push(socketComponent);
                            socketComponent.addPlug(plug, perk, this.item)
                                .classes.add(...this.plugClasses);
                        }
                    }
                }
            }
            return components;
        }
        addSocket(initialiser) {
            const socket = ItemSocket.create()
                .tweak(initialiser);
            socket.event.subscribe("addPlug", () => this.updateSocket(socket));
            this.addedSockets.push(socket);
            this.updateSocket(socket);
            return socket;
        }
        updateSocket(socket) {
            const old = this.maxSocketPlugs;
            this.maxSocketPlugs = Math.max(this.maxSocketPlugs, socket.plugs.length);
            if (old === this.maxSocketPlugs)
                return;
            this.style.set("--max-socket-plugs", `${this.maxSocketPlugs}`);
        }
        hasSockets() {
            return !!this.addedSockets.length;
        }
    }
    exports.default = ItemSockets;
    class ItemSocket extends Component_61.default {
        onMake() {
            this.classes.add(ItemSocketsClasses.Socket);
            this.plugs = [];
        }
        addPlug(plug, perkOrInitialiser, itemOrInitialiser, initialiser) {
            const perk = typeof perkOrInitialiser === "function" ? undefined : perkOrInitialiser;
            const item = typeof itemOrInitialiser === "function" ? undefined : itemOrInitialiser;
            initialiser = typeof perkOrInitialiser === "function" ? perkOrInitialiser : typeof itemOrInitialiser === "function" ? itemOrInitialiser : initialiser;
            const component = ItemPlug.create([plug, perk, item])
                .tweak(initialiser)
                .appendTo(this);
            this.plugs.push(component);
            this.event.emit("addPlug");
            return component;
        }
    }
    exports.ItemSocket = ItemSocket;
    class ItemPlug extends Button_11.default {
        onMake(plug, perk, item) {
            super.onMake();
            this.classes.add(ItemSocketsClasses.Plug);
            this.addIcon();
            this.label = Component_61.default.create("label")
                .classes.add(ItemSocketsClasses.PlugName)
                .appendTo(this);
            this.description = Component_61.default.create()
                .classes.add(ItemSocketsClasses.PlugDescription)
                .appendTo(this);
            if (plug)
                this.using(plug, perk, item);
        }
        using(plug, perk, item, displayRequiredLevels = false) {
            this.hash = perk?.definition.hash ?? plug.definition?.hash ?? -1;
            this.plug = plug;
            this.perk = perk;
            this.item = item;
            this.classes.toggle(!!plug.socketed, ItemSocketsClasses.Socketed)
                .classes.toggle((plug.is("Intrinsic", "=Masterwork/ExoticCatalyst")) && item?.definition.inventory?.tierTypeHash === 2759499571 /* ItemTierTypeHashes.Exotic */, ItemSocketsClasses.PlugExotic)
                .classes.toggle(plug.is("Perk/TraitEnhanced", "Intrinsic/FrameEnhanced", "=Masterwork/ExoticCatalyst"), ItemSocketsClasses.PlugEnhanced)
                .classes.removeWhere(cls => cls.startsWith(ItemSocketsClasses.PlugType))
                .classes.add(`${ItemSocketsClasses.PlugType}-${plug.categorisation?.categoryName.toLowerCase()}`)
                .classes.add(`${ItemSocketsClasses.PlugType}-${plug.type.replaceAll("/", "-").toLowerCase()}`)
                .setIcon(DisplayProperties_19.default.icon(perk?.definition) ?? DisplayProperties_19.default.icon(plug.definition))
                .setName(DisplayProperties_19.default.name(perk?.definition) ?? DisplayProperties_19.default.name(plug.definition) ?? "Unknown")
                .setDescription(DisplayProperties_19.default.description(perk?.definition) ?? DisplayProperties_19.default.description(plug.definition));
            this.innerIcon?.classes.add(ItemSocketsClasses.PlugIconInner)
                .classes.add(`${ItemSocketsClasses.PlugIconInnerType}-${plug.categorisation?.categoryName.toLowerCase()}`)
                .classes.add(`${ItemSocketsClasses.PlugIconInnerType}-${plug.type.replaceAll("/", "-").toLowerCase()}`);
            if (item?.deepsight?.pattern && !item.instance && plug.is("Perk"))
                // Component.create()
                // 	.classes.add(ItemSocketsClasses.PlugRequiredLevelWrapper)
                // .append(
                Component_61.default.create()
                    .classes.add(ItemSocketsClasses.PlugRequiredLevel)
                    .text.set(`${plug.craftingRequirements?.requiredLevel ?? 1}`) //)
                    .appendTo(this);
            this.setTooltip(ItemPlugTooltip_2.default, {
                initialise: tooltip => tooltip.set(plug, perk, item),
                differs: tooltip => tooltip.plug?.plugItemHash !== plug.plugItemHash,
            });
        }
        setName(name) {
            this.label.text.set(name ?? "Unknown");
            return this;
        }
        setDescription(description) {
            this.description.text.set(description?.replace(/\n{2,}/g, "\n") ?? "");
            return this;
        }
        setIcon(icon) {
            this.innerIcon.style.set("--icon", icon);
            return this;
        }
    }
    exports.ItemPlug = ItemPlug;
});
define("ui/view/collections/ModsView", ["require", "exports", "model/Model", "model/models/Manifest", "model/models/items/Plugs", "ui/Component", "ui/Details", "ui/Loadable", "ui/View", "ui/form/Paginator", "ui/view/collections/CollectionsMoment", "ui/view/item/ItemSockets"], function (require, exports, Model_17, Manifest_21, Plugs_4, Component_62, Details_4, Loadable_7, View_6, Paginator_2, CollectionsMoment_3, ItemSockets_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ModsViewClasses = void 0;
    var ModsViewClasses;
    (function (ModsViewClasses) {
        ModsViewClasses["PlugList"] = "view-mods-plug-list";
        ModsViewClasses["PlugListContent"] = "view-mods-plug-list-content";
        ModsViewClasses["PlugListPage"] = "view-mods-plug-list-page";
        ModsViewClasses["Plug"] = "view-mods-plug";
        ModsViewClasses["TypeWrapper"] = "view-mods-type-wrapper";
    })(ModsViewClasses || (exports.ModsViewClasses = ModsViewClasses = {}));
    const capitalisationRegex = /(?<=[a-z])(?=[A-Z])/g;
    exports.default = View_6.default.create({
        models: [Manifest_21.default],
        id: "mods",
        name: "Mods",
        auth: "optional",
        parentViewId: "collections",
        initialise: async (view, Manifest) => {
            view.setTitle(title => title.text.set("Mods"));
            view.setSubtitle("lore", subtitle => subtitle
                .text.set("An exhaustive list of every mod, perk, cosmetic, and more..."));
            let detailsIndex = 0;
            const plugs = await Manifest.DeepsightPlugCategorisation.all();
            const categories = Array.from(new Set(plugs.map(plug => plug.categoryName))).sort();
            for (const category of categories) {
                const categoryDetails = Details_4.default.create()
                    .classes.add(CollectionsMoment_3.CollectionsMomentClasses.Moment)
                    .style.set("--index", `${detailsIndex++}`)
                    .appendTo(view.content);
                categoryDetails.summary.text.set(category.replace(capitalisationRegex, " "));
                const categoryPlugs = plugs.filter(plug => plug.categoryName === category);
                const types = Array.from(new Set(categoryPlugs.map(plug => plug.typeName))).sort();
                for (const type of types) {
                    let typeDetails = categoryDetails;
                    if (type) {
                        typeDetails = Details_4.default.create()
                            .classes.add(CollectionsMoment_3.CollectionsMomentClasses.Moment, ModsViewClasses.TypeWrapper)
                            .style.set("--index", `${detailsIndex++}`)
                            .appendTo(categoryDetails);
                        typeDetails.summary.text.set(type?.replace(capitalisationRegex, " "));
                    }
                    const typePlugs = categoryPlugs.filter(plug => plug.typeName === type);
                    Loadable_7.default.create(Model_17.default.createTemporary(async () => {
                        await typeDetails.event.waitFor("toggle");
                        const result = [];
                        for (const plugCategorisation of typePlugs)
                            result.push(await Plugs_4.Plug.resolveFromHash(Manifest, plugCategorisation.hash, true));
                        return result;
                    }))
                        .onReady((plugs) => {
                        const plugList = Paginator_2.default.create()
                            .classes.add(ModsViewClasses.PlugList);
                        plugList.pageWrapper.classes.add(ModsViewClasses.PlugListContent);
                        plugs = plugs.sort((a, b) => (a.definition?.displayProperties?.name ?? "").localeCompare(b.definition?.displayProperties?.name ?? ""));
                        const helper = plugList.filler(25);
                        for (const plug of plugs)
                            if (plug.definition?.displayProperties?.name)
                                ItemSockets_1.ItemPlug.create([plug, undefined, undefined])
                                    .classes.add(ModsViewClasses.Plug)
                                    .appendTo(helper.increment(page => page
                                    .classes.add(ModsViewClasses.PlugListPage)));
                        const storage = Component_62.default.create();
                        typeDetails.event.subscribe("toggle", () => plugList.appendTo(storage.contains(plugList) ? typeDetails : storage)
                            .attributes.remove("inert"));
                        return plugList;
                    })
                        .setSimple()
                        .appendTo(typeDetails);
                }
            }
        },
    });
});
define("ui/view/ErrorView", ["require", "exports", "ui/form/Button", "ui/View", "utility/endpoint/bungie/Bungie"], function (require, exports, Button_12, View_7, Bungie_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ErrorViewClasses;
    (function (ErrorViewClasses) {
        ErrorViewClasses["Button"] = "view-error-button";
    })(ErrorViewClasses || (ErrorViewClasses = {}));
    exports.default = View_7.default.create({
        id: "error",
        name: "Error",
        redirectOnLoad: true,
        noDestinationButton: true,
        noHashChange: true,
        initialise: view => {
            let [_, code, definition] = view._args;
            if (!definition) {
                if (Bungie_8.default.apiDown)
                    definition = {
                        title: "Error: Weasel",
                        subtitle: "Could not connect to Destiny 2 servers...",
                        buttonText: "Bungie Help Twitter",
                        buttonClick: () => window.open("https://twitter.com/BungieHelp", "_blank")?.focus(),
                    };
                else if (code === 404)
                    definition = {
                        title: "Error: Not Found",
                        subtitle: "You are forever lost in the dark corners of time...",
                        buttonText: "Return to Orbit",
                        buttonClick: () => viewManager.showDefaultView(),
                    };
                else
                    definition = {
                        title: "Your Light Fades Away...",
                        subtitle: "Restarting From Last Checkpoint...",
                        buttonText: "Reload App",
                        buttonClick: () => location.reload(),
                    };
            }
            view.setTitle(title => title.text.set(definition.title));
            view.setSubtitle("small", subtitle => subtitle.text.set(definition.subtitle));
            Button_12.default.create()
                .classes.add(ErrorViewClasses.Button)
                .setPrimary()
                .setAttention()
                .text.set(definition.buttonText)
                .event.subscribe("click", definition.buttonClick)
                .appendTo(view.content);
        },
    });
});
define("ui/view/collections/vendor/VendorDisplay", ["require", "exports", "ui/Component", "ui/form/Button"], function (require, exports, Component_63, Button_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VendorDisplayClasses = void 0;
    var VendorDisplayClasses;
    (function (VendorDisplayClasses) {
        VendorDisplayClasses["Main"] = "vendor-display";
        VendorDisplayClasses["Title"] = "vendor-display-title";
        VendorDisplayClasses["TitleText"] = "vendor-display-title-text";
        VendorDisplayClasses["TitleBox"] = "vendor-display-title-box";
        VendorDisplayClasses["TitleHasDescription"] = "vendor-display-title--has-description";
        VendorDisplayClasses["Subtitle"] = "vendor-display-subtitle";
        VendorDisplayClasses["Description"] = "vendor-display-description";
        VendorDisplayClasses["DescriptionText"] = "vendor-display-description-text";
        VendorDisplayClasses["Button"] = "vendor-display-button";
    })(VendorDisplayClasses || (exports.VendorDisplayClasses = VendorDisplayClasses = {}));
    class VendorDisplay extends Component_63.default {
        onMake(vendor, description = true) {
            this.classes.add(VendorDisplayClasses.Main);
            Component_63.default.create()
                .classes.add(VendorDisplayClasses.Subtitle)
                .text.set(vendor.displayProperties.subtitle)
                .appendTo(this);
            const hasDescription = description && !!vendor.displayProperties.description && vendor.displayProperties.description !== vendor.displayProperties.subtitle;
            Component_63.default.create()
                .classes.add(VendorDisplayClasses.Title)
                .classes.toggle(hasDescription, VendorDisplayClasses.TitleHasDescription)
                .append(Component_63.default.create()
                .classes.add(VendorDisplayClasses.TitleText)
                .text.set(vendor.displayProperties.name))
                .append(Component_63.default.create()
                .classes.add(VendorDisplayClasses.TitleBox))
                .appendTo(this);
            if (hasDescription)
                Component_63.default.create()
                    .classes.add(VendorDisplayClasses.Description)
                    .append(Component_63.default.create()
                    .classes.add(VendorDisplayClasses.DescriptionText)
                    .text.set(vendor.displayProperties.description))
                    .appendTo(this);
        }
    }
    (function (VendorDisplay) {
        class Button extends Button_13.default {
            onMake(vendor) {
                super.onMake(vendor);
                this.classes.add(VendorDisplayClasses.Button);
                this.display = VendorDisplay.create([vendor])
                    .appendTo(this);
            }
        }
        VendorDisplay.Button = Button;
    })(VendorDisplay || (VendorDisplay = {}));
    exports.default = VendorDisplay;
});
define("ui/view/collections/VendorView", ["require", "exports", "model/Model", "model/models/Manifest", "model/models/items/Item", "ui/Card", "ui/Component", "ui/LoadingManager", "ui/View", "ui/bungie/DisplayProperties", "ui/form/Paginator", "ui/inventory/ItemComponent", "ui/inventory/Slot", "ui/view/ErrorView", "ui/view/collections/vendor/VendorDisplay", "utility/Objects"], function (require, exports, Model_18, Manifest_22, Item_6, Card_7, Component_64, LoadingManager_3, View_8, DisplayProperties_20, Paginator_3, ItemComponent_7, Slot_6, ErrorView_1, VendorDisplay_1, Objects_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VendorViewClasses = exports.resolveVendorURL = void 0;
    function getId(vendor) {
        return vendor.displayProperties.name
            ?.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/'/g, "")
            .replace(/[^a-z0-9_-]+/g, "-");
    }
    async function resolveVendorURL(vendorId, api) {
        const manifest = await api.subscribeProgressAndWait(Manifest_22.default, 1);
        const { DeepsightVendorDefinition } = manifest;
        const vendors = await DeepsightVendorDefinition.all();
        const searchHash = +vendorId;
        return vendors.find(vendor => vendor.hash === searchHash
            || vendorId === getId(vendor));
    }
    exports.resolveVendorURL = resolveVendorURL;
    var VendorViewClasses;
    (function (VendorViewClasses) {
        VendorViewClasses["Information"] = "view-vendor-information";
        VendorViewClasses["Wares"] = "view-vendor-wares";
        VendorViewClasses["WaresBackdrop2"] = "view-vendor-wares-backdrop-2";
        VendorViewClasses["CategoryPaginator"] = "view-vendor-category-paginator";
        VendorViewClasses["CategoryPaginatorPageWrapper"] = "view-vendor-category-paginator-page-wrapper";
        VendorViewClasses["CategoryPaginatorPage"] = "view-vendor-category-paginator-page";
        VendorViewClasses["Category"] = "view-vendor-category";
        VendorViewClasses["CategoryContent"] = "view-vendor-category-content";
    })(VendorViewClasses || (exports.VendorViewClasses = VendorViewClasses = {}));
    const vendorViewBase = View_8.default.create({
        models: (vendor) => [Manifest_22.default, Model_18.default.createTemporary(async (api) => typeof vendor !== "string" ? vendor : resolveVendorURL(vendor, api), "resolveVendorURL")],
        id: "vendor",
        hash: (vendor) => typeof vendor === "string" ? `vendor/${vendor}` : `vendor/${getId(vendor)}`,
        name: (vendor) => typeof vendor === "string" ? "Vendor Details" : DisplayProperties_20.default.name(vendor, "Vendor Details"),
        noDestinationButton: true,
        initialise: async (view, manifest, vendorResult) => {
            LoadingManager_3.default.end(view.definition.id);
            const vendor = vendorResult;
            if (!vendor) {
                return ErrorView_1.default.show(404, {
                    title: "Error: No Vendor Found",
                    subtitle: "Your ghost continues its search...",
                    buttonText: "View Collections",
                    buttonClick: () => viewManager.showCollections(),
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            window.$i = window.vendor = vendor;
            console.log(DisplayProperties_20.default.name(vendor), vendor);
            if (vendor.background)
                view.setBackground(`../.${vendor.background}`).setDarkened(false);
            VendorDisplay_1.default.Button.create([vendor])
                .event.subscribe("click", () => viewManager.showVendors())
                .appendTo(view.content);
            const appendItemSlot = async (to, itemRef, initialiser) => {
                const itemDef = await manifest.DestinyInventoryItemDefinition.get(itemRef.itemHash);
                if (!itemDef)
                    return;
                const item = await Item_6.default.createFake(manifest, { itemComponents: itemRef.itemComponent }, itemDef, undefined, `${itemRef.vendorItemIndex}`);
                const itemComponent = ItemComponent_7.default.create([])
                    .appendTo(Slot_6.default.create().appendTo(to));
                await itemComponent.setItem(item);
                initialiser?.(itemComponent);
            };
            const informationIndex = vendor.categories.findIndex(category => false
                || category.identifier.endsWith(".help.name")
                || category.items.some(item => DisplayProperties_20.default.name(item) === "Event Information")); // TODO this should be fixed in the vendor manifest
            const informationCategory = vendor.categories[informationIndex];
            const categories = vendor.categories.filter(category => category !== informationCategory);
            if (informationCategory)
                Component_64.default.create()
                    .classes.add(VendorViewClasses.Information)
                    .tweak(appendItemSlot, informationCategory.items[0], item => item.classes.add(ItemComponent_7.ItemClasses.Borderless))
                    .appendTo(view.content);
            const wares = Component_64.default.create()
                .classes.add(VendorViewClasses.Wares)
                .append(Component_64.default.create()
                .classes.add(VendorViewClasses.WaresBackdrop2))
                .appendTo(view.content);
            const categoryPaginator = Paginator_3.default.create()
                .classes.add(VendorViewClasses.CategoryPaginator)
                .appendTo(wares);
            categoryPaginator.pageWrapper.classes.add(VendorViewClasses.CategoryPaginatorPageWrapper);
            const filler = categoryPaginator.filler(16);
            for (const category of categories) {
                const categorySection = Card_7.default.create()
                    .classes.add(VendorViewClasses.Category, `${VendorViewClasses.Category}-${category.identifier.toLowerCase().replace(/[^a-z]+/g, "-")}`)
                    .setDisplayMode(Card_7.CardClasses.DisplayModeSection);
                categorySection.content.classes.add(VendorViewClasses.CategoryContent);
                let size = 0;
                if (category.displayProperties.name) {
                    size++;
                    Component_64.default.create()
                        .tweak(DisplayProperties_20.default.applyDescription, category.displayProperties.name, { singleLine: true })
                        .appendTo(categorySection.title);
                }
                let catItemsSize = 0;
                for (const itemRef of category.items) {
                    await appendItemSlot(categorySection.content, itemRef);
                    catItemsSize += 1 / 7;
                }
                size += Math.ceil(catItemsSize) * 2;
                categorySection.appendTo(filler.add(size, page => page.classes.add(VendorViewClasses.CategoryPaginatorPage)));
            }
        },
    });
    class VendorViewClass extends View_8.default.Handler {
    }
    const VendorView = Objects_7.default.inherit(vendorViewBase, VendorViewClass);
    exports.default = VendorView;
});
define("ui/view/collections/VendorsView", ["require", "exports", "model/models/Manifest", "ui/Component", "ui/View", "ui/view/collections/VendorView", "ui/view/collections/vendor/VendorDisplay"], function (require, exports, Manifest_23, Component_65, View_9, VendorView_1, VendorDisplay_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.VendorsViewClasses = void 0;
    var VendorsViewClasses;
    (function (VendorsViewClasses) {
        VendorsViewClasses["Vendor"] = "view-vendors-vendor";
        VendorsViewClasses["GroupTitle"] = "view-vendors-group-title";
    })(VendorsViewClasses || (exports.VendorsViewClasses = VendorsViewClasses = {}));
    exports.default = View_9.default.create({
        models: [Manifest_23.default],
        id: "vendors",
        name: "Vendors",
        auth: "optional",
        parentViewId: "collections",
        initialise: async (view, Manifest) => {
            const vendors = (await Manifest.DeepsightVendorDefinition.all())
                .sort((a, b) => (a.displayProperties.name ?? "").localeCompare(b.displayProperties.name ?? ""))
                .sort((a, b) => (b.moment ?? Infinity) - (a.moment ?? Infinity));
            for (const group of [3227191227 /* VendorGroupHashes.LimitedTime */, 427939601 /* VendorGroupHashes.Seasonal */, 679769104 /* VendorGroupHashes.Tower */, 2537374699 /* VendorGroupHashes.Destination */]) {
                const groupDef = await Manifest.DestinyVendorGroupDefinition.get(group);
                const groupVendors = vendors.filter(vendor => vendor.groups.includes(group));
                if (!groupVendors.length)
                    continue;
                Component_65.default.create()
                    .classes.add(View_9.default.Classes.Title, VendorsViewClasses.GroupTitle)
                    .text.set(groupDef?.categoryName)
                    .appendTo(view.content);
                for (const vendor of groupVendors) {
                    VendorDisplay_2.default.Button.create([vendor])
                        .classes.add(VendorsViewClasses.Vendor)
                        .event.subscribe("click", () => VendorView_1.default.show(vendor))
                        .appendTo(view.content);
                }
            }
        },
    });
});
define("ui/view/inventory/equipment/InventorySlotColumnsView", ["require", "exports", "model/models/Characters", "model/models/Inventory", "model/models/items/Bucket", "ui/Component", "ui/View", "ui/view/inventory/InventoryView", "utility/Functions"], function (require, exports, Characters_9, Inventory_7, Bucket_11, Component_66, View_10, InventoryView_2, Functions_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InventorySlotColumnsViewClasses = void 0;
    var InventorySlotColumnsViewClasses;
    (function (InventorySlotColumnsViewClasses) {
        InventorySlotColumnsViewClasses["Content"] = "view-slot-columns-content";
        InventorySlotColumnsViewClasses["SectionTitle"] = "view-slot-columns-section-title";
        InventorySlotColumnsViewClasses["SectionContent"] = "view-slot-columns-section-content";
        InventorySlotColumnsViewClasses["SectionWeapons"] = "view-slot-columns-section-weapons";
        InventorySlotColumnsViewClasses["SectionArmour"] = "view-slot-columns-section-armour";
        InventorySlotColumnsViewClasses["SlotColumn"] = "view-slot-columns-slot-column";
        InventorySlotColumnsViewClasses["PostmasterColumn"] = "view-slot-columns-slot-column-postmaster";
        InventorySlotColumnsViewClasses["SlotColumnTitle"] = "view-slot-columns-slot-column-title";
    })(InventorySlotColumnsViewClasses || (exports.InventorySlotColumnsViewClasses = InventorySlotColumnsViewClasses = {}));
    exports.default = new View_10.default.Factory()
        .using(Inventory_7.default.createModel())
        .define()
        .initialise((view, model) => view.make(InventoryView_2.default, model))
        .wrapper()
        .configure(definition => ({
        layout: view => {
            const chars = Characters_9.default.getSorted();
            view.super.content
                .classes.add(InventorySlotColumnsViewClasses.Content)
                .style.set("--buckets", `${definition.mergedVaults ? chars.length + 1 : chars.length * 2}`);
            for (const childView of definition.childViews) {
                const column = Component_66.default.create()
                    .classes.add(InventorySlotColumnsViewClasses.SlotColumn)
                    .appendTo(view.super.content);
                Component_66.default.create()
                    .classes.add(InventorySlotColumnsViewClasses.SlotColumnTitle)
                    .text.set(Functions_2.default.resolve(childView.name) ?? "?")
                    .appendTo(column);
                for (const character of chars) {
                    view.addBucketsTo(column, Bucket_11.Bucket.id(childView.definition.slot, character.characterId));
                    if (!definition.mergedVaults)
                        view.addBucketsTo(column, Bucket_11.Bucket.id(138197802 /* InventoryBucketHashes.General */, character.characterId, childView.definition.slot));
                }
                if (definition.mergedVaults)
                    view.addBucketsTo(column, Bucket_11.Bucket.id(138197802 /* InventoryBucketHashes.General */, undefined, childView.definition.slot));
            }
            if (definition.childViews.length <= 3)
                Component_66.default.create()
                    .classes.add(InventorySlotColumnsViewClasses.SlotColumn, InventorySlotColumnsViewClasses.PostmasterColumn)
                    .append(Component_66.default.create())
                    .appendTo(view.super.content)
                    .tweak(column => chars
                    .map(character => Bucket_11.Bucket.id(215593132 /* InventoryBucketHashes.LostItems */, character.characterId))
                    .collect(bucketIds => view.addBucketsTo(column, bucketIds)));
        },
        onItemMoveStart(view, wrapper, item, event) {
            if (definition.scrollToTop) {
                wrapper.content.element.scrollTo({ top: 0, behavior: "smooth" });
            }
        },
    }));
});
define("ui/view/inventory/equipment/InventoryArmourView", ["require", "exports", "ui/inventory/filter/FilterManager", "ui/inventory/sort/SortManager", "ui/view/inventory/equipment/InventorySlotColumnsView", "ui/view/inventory/slot/InventoryArmourSlotView", "ui/view/inventory/slot/InventoryArmsView", "ui/view/inventory/slot/InventoryChestView", "ui/view/inventory/slot/InventoryClassItemView", "ui/view/inventory/slot/InventoryHelmetView", "ui/view/inventory/slot/InventoryLegsView"], function (require, exports, FilterManager_5, SortManager_6, InventorySlotColumnsView_1, InventoryArmourSlotView_6, InventoryArmsView_2, InventoryChestView_2, InventoryClassItemView_2, InventoryHelmetView_2, InventoryLegsView_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventorySlotColumnsView_1.default.clone().create({
        id: InventoryArmourSlotView_6.VIEW_ID_ARMOUR,
        name: InventoryArmourSlotView_6.VIEW_NAME_ARMOUR,
        sort: new SortManager_6.default(InventoryArmourSlotView_6.SORT_MANAGER_ARMOUR_DEFINITION),
        filter: new FilterManager_5.default(InventoryArmourSlotView_6.FILTER_MANAGER_ARMOUR_DEFINITION),
        childViews: [InventoryHelmetView_2.default, InventoryArmsView_2.default, InventoryChestView_2.default, InventoryLegsView_2.default, InventoryClassItemView_2.default],
        mergedVaults: false,
    });
});
define("ui/view/inventory/slot/InventoryEquipmentSlotView", ["require", "exports", "ui/inventory/filter/Filter", "ui/inventory/filter/FilterManager", "ui/inventory/sort/Sort", "ui/inventory/sort/SortManager", "ui/view/inventory/slot/InventorySlotView"], function (require, exports, Filter_16, FilterManager_6, Sort_25, SortManager_7, InventorySlotView_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FILTER_MANAGER_EQUIPMENT_DEFINITION = exports.SORT_MANAGER_EQUIPMENT_DEFINITION = exports.VIEW_NAME_EQUIPMENT = exports.VIEW_ID_EQUIPMENT = exports.FILTERS_INAPPLICABLE_EQUIPMENT = exports.SORTS_INAPPLICABLE_EQUIPMENT = exports.SORTS_DEFAULT_EQUIPMENT = void 0;
    exports.SORTS_DEFAULT_EQUIPMENT = [Sort_25.default.Rarity, Sort_25.default.Masterwork, Sort_25.default.Name];
    exports.SORTS_INAPPLICABLE_EQUIPMENT = [
        Sort_25.default.Power,
        Sort_25.default.Energy,
        Sort_25.default.Pattern,
        Sort_25.default.Shaped,
        Sort_25.default.StatTotal,
        Sort_25.default.StatDistribution,
        Sort_25.default.AmmoType,
        Sort_25.default.DamageType,
        Sort_25.default.WeaponType,
        Sort_25.default.Quantity,
        Sort_25.default.Harmonizable,
        "stat-.*",
    ];
    exports.FILTERS_INAPPLICABLE_EQUIPMENT = [
        Filter_16.default.Ammo,
        Filter_16.default.Element,
        Filter_16.default.Perk,
        Filter_16.default.Shaped,
        Filter_16.default.WeaponType,
        Filter_16.default.Harmonizable,
        Filter_16.default.Adept,
    ];
    exports.VIEW_ID_EQUIPMENT = "equipment";
    exports.VIEW_NAME_EQUIPMENT = "Equipment";
    exports.SORT_MANAGER_EQUIPMENT_DEFINITION = {
        id: exports.VIEW_ID_EQUIPMENT,
        name: exports.VIEW_NAME_EQUIPMENT,
        default: exports.SORTS_DEFAULT_EQUIPMENT,
        inapplicable: exports.SORTS_INAPPLICABLE_EQUIPMENT,
    };
    exports.FILTER_MANAGER_EQUIPMENT_DEFINITION = {
        id: exports.VIEW_ID_EQUIPMENT,
        name: exports.VIEW_NAME_EQUIPMENT,
        inapplicable: exports.FILTERS_INAPPLICABLE_EQUIPMENT,
    };
    exports.default = InventorySlotView_3.default.clone().configure({
        sort: new SortManager_7.default(exports.SORT_MANAGER_EQUIPMENT_DEFINITION),
        filter: new FilterManager_6.default(exports.FILTER_MANAGER_EQUIPMENT_DEFINITION),
        parentViewId: exports.VIEW_ID_EQUIPMENT,
        mergedVaults: true,
    });
});
define("ui/view/inventory/slot/InventoryGhostView", ["require", "exports", "ui/view/inventory/slot/InventoryEquipmentSlotView"], function (require, exports, InventoryEquipmentSlotView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryEquipmentSlotView_1.default.create({
        id: "ghost",
        name: "Ghost",
        slot: 4023194814 /* InventoryBucketHashes.Ghost */,
    });
});
define("ui/view/inventory/slot/InventoryShipView", ["require", "exports", "ui/view/inventory/slot/InventoryEquipmentSlotView"], function (require, exports, InventoryEquipmentSlotView_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryEquipmentSlotView_2.default.create({
        id: "ship",
        name: "Ship",
        slot: 284967655 /* InventoryBucketHashes.Ships */,
    });
});
define("ui/view/inventory/slot/InventorySparrowView", ["require", "exports", "ui/view/inventory/slot/InventoryEquipmentSlotView"], function (require, exports, InventoryEquipmentSlotView_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventoryEquipmentSlotView_3.default.create({
        id: "sparrow",
        name: "Sparrow",
        slot: 2025709351 /* InventoryBucketHashes.Vehicle */,
    });
});
define("ui/view/inventory/equipment/InventoryEquipmentView", ["require", "exports", "ui/inventory/filter/FilterManager", "ui/inventory/sort/SortManager", "ui/view/inventory/equipment/InventorySlotColumnsView", "ui/view/inventory/slot/InventoryEquipmentSlotView", "ui/view/inventory/slot/InventoryGhostView", "ui/view/inventory/slot/InventoryShipView", "ui/view/inventory/slot/InventorySparrowView"], function (require, exports, FilterManager_7, SortManager_8, InventorySlotColumnsView_2, InventoryEquipmentSlotView_4, InventoryGhostView_1, InventoryShipView_1, InventorySparrowView_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventorySlotColumnsView_2.default.clone().create({
        id: InventoryEquipmentSlotView_4.VIEW_ID_EQUIPMENT,
        name: InventoryEquipmentSlotView_4.VIEW_NAME_EQUIPMENT,
        sort: new SortManager_8.default(InventoryEquipmentSlotView_4.SORT_MANAGER_EQUIPMENT_DEFINITION),
        filter: new FilterManager_7.default(InventoryEquipmentSlotView_4.FILTER_MANAGER_EQUIPMENT_DEFINITION),
        childViews: [InventoryGhostView_1.default, InventorySparrowView_1.default, InventoryShipView_1.default],
        mergedVaults: true,
    });
});
define("ui/view/inventory/equipment/InventoryWeaponsView", ["require", "exports", "ui/inventory/filter/FilterManager", "ui/inventory/sort/SortManager", "ui/view/inventory/equipment/InventorySlotColumnsView", "ui/view/inventory/slot/InventoryEnergyView", "ui/view/inventory/slot/InventoryKineticView", "ui/view/inventory/slot/InventoryPowerView", "ui/view/inventory/slot/InventoryWeaponSlotView"], function (require, exports, FilterManager_8, SortManager_9, InventorySlotColumnsView_3, InventoryEnergyView_2, InventoryKineticView_2, InventoryPowerView_2, InventoryWeaponSlotView_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = InventorySlotColumnsView_3.default.clone().create({
        id: InventoryWeaponSlotView_4.VIEW_ID_WEAPONS,
        name: InventoryWeaponSlotView_4.VIEW_NAME_WEAPONS,
        sort: new SortManager_9.default(InventoryWeaponSlotView_4.SORT_MANAGER_WEAPONS_DEFINITION),
        filter: new FilterManager_8.default(InventoryWeaponSlotView_4.FILTER_MANAGER_WEAPONS_DEFINITION),
        onItemMoveStart(view, wrapper, item, event) {
            wrapper.content.element.scrollTo({ top: 0, behavior: "smooth" });
        },
        childViews: [InventoryKineticView_2.default, InventoryEnergyView_2.default, InventoryPowerView_2.default],
        mergedVaults: true,
    });
});
define("ui/view/inventory/InventoryInventoryView", ["require", "exports", "model/models/Characters", "model/models/Inventory", "model/models/items/Bucket", "ui/Component", "ui/View", "ui/inventory/filter/Filter", "ui/inventory/filter/FilterManager", "ui/inventory/sort/Sort", "ui/inventory/sort/SortManager", "ui/view/inventory/InventoryView"], function (require, exports, Characters_10, Inventory_8, Bucket_12, Component_67, View_11, Filter_17, FilterManager_9, Sort_26, SortManager_10, InventoryView_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InventoryInventoryViewClasses = exports.FILTER_MANAGER_INVENTORY_DEFINITION = exports.SORT_MANAGER_INVENTORY_DEFINITION = exports.VIEW_NAME_INVENTORY = exports.VIEW_ID_INVENTORY = exports.FILTERS_INAPPLICABLE_INVENTORY = exports.SORTS_INAPPLICABLE_INVENTORY = exports.SORTS_DEFAULT_INVENTORY = void 0;
    exports.SORTS_DEFAULT_INVENTORY = [Sort_26.default.Rarity, Sort_26.default.Name, Sort_26.default.Quantity];
    exports.SORTS_INAPPLICABLE_INVENTORY = [
        Sort_26.default.Power,
        Sort_26.default.Energy,
        Sort_26.default.Pattern,
        Sort_26.default.Shaped,
        Sort_26.default.Masterwork,
        Sort_26.default.StatTotal,
        Sort_26.default.StatDistribution,
        Sort_26.default.AmmoType,
        Sort_26.default.DamageType,
        Sort_26.default.WeaponType,
        Sort_26.default.Harmonizable,
        "stat-.*",
    ];
    exports.FILTERS_INAPPLICABLE_INVENTORY = [
        Filter_17.default.Ammo,
        Filter_17.default.WeaponType,
        Filter_17.default.Element,
        Filter_17.default.Perk,
        Filter_17.default.Shaped,
        Filter_17.default.Harmonizable,
        Filter_17.default.Adept,
    ];
    exports.VIEW_ID_INVENTORY = "inventory";
    exports.VIEW_NAME_INVENTORY = "Inventory";
    exports.SORT_MANAGER_INVENTORY_DEFINITION = {
        id: exports.VIEW_ID_INVENTORY,
        name: exports.VIEW_NAME_INVENTORY,
        default: exports.SORTS_DEFAULT_INVENTORY,
        inapplicable: exports.SORTS_INAPPLICABLE_INVENTORY,
    };
    exports.FILTER_MANAGER_INVENTORY_DEFINITION = {
        id: exports.VIEW_ID_INVENTORY,
        name: exports.VIEW_NAME_INVENTORY,
        inapplicable: exports.FILTERS_INAPPLICABLE_INVENTORY,
    };
    var InventoryInventoryViewClasses;
    (function (InventoryInventoryViewClasses) {
        InventoryInventoryViewClasses["Content"] = "view-inventory-inventory-content";
        InventoryInventoryViewClasses["PostmasterBuckets"] = "view-inventory-inventory-postmaster-buckets";
        InventoryInventoryViewClasses["VaultBuckets"] = "view-inventory-inventory-vault-buckets";
        InventoryInventoryViewClasses["ConsumablesBucket"] = "view-inventory-inventory-consumables-bucket";
        InventoryInventoryViewClasses["ModificationsBucket"] = "view-inventory-inventory-modifications-bucket";
    })(InventoryInventoryViewClasses || (exports.InventoryInventoryViewClasses = InventoryInventoryViewClasses = {}));
    exports.default = new View_11.default.Factory()
        .using(Inventory_8.default.createModel())
        .define()
        .initialise((view, model) => view.make(InventoryView_3.default, model))
        .wrapper()
        .create({
        id: exports.VIEW_ID_INVENTORY,
        name: exports.VIEW_NAME_INVENTORY,
        layout: view => {
            view.addBuckets([
                Bucket_12.Bucket.id(1469714392 /* InventoryBucketHashes.Consumables */),
                Bucket_12.Bucket.id(138197802 /* InventoryBucketHashes.General */, undefined, 1469714392 /* InventoryBucketHashes.Consumables */),
            ]);
            view.addBuckets([
                Bucket_12.Bucket.id(3313201758 /* InventoryBucketHashes.Modifications */),
                Bucket_12.Bucket.id(138197802 /* InventoryBucketHashes.General */, undefined, 3313201758 /* InventoryBucketHashes.Modifications */),
            ]);
            const postmasters = Component_67.default.create()
                .classes.add(InventoryInventoryViewClasses.PostmasterBuckets)
                .appendTo(view.super.content);
            Characters_10.default.getSorted()
                .map(character => Bucket_12.Bucket.id(215593132 /* InventoryBucketHashes.LostItems */, character.characterId))
                .collect(bucketIds => view.addBucketsTo(postmasters, bucketIds));
        },
        sort: new SortManager_10.default(exports.SORT_MANAGER_INVENTORY_DEFINITION),
        filter: new FilterManager_9.default(exports.FILTER_MANAGER_INVENTORY_DEFINITION),
    });
});
define("ui/view/item/ItemIntrinsics", ["require", "exports", "ui/view/item/ItemSockets"], function (require, exports, ItemSockets_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemIntrinsicsClasses = void 0;
    var ItemIntrinsicsClasses;
    (function (ItemIntrinsicsClasses) {
        ItemIntrinsicsClasses["IntrinsicSocket"] = "view-item-socket-intrinsic";
    })(ItemIntrinsicsClasses || (exports.ItemIntrinsicsClasses = ItemIntrinsicsClasses = {}));
    class ItemIntrinsics extends ItemSockets_2.default {
        getTitle() {
            return "Intrinsic Traits";
        }
        get socketClasses() { return [ItemIntrinsicsClasses.IntrinsicSocket]; }
        initialise() {
            this.addSocketsByType("Intrinsic");
            this.addPerksByPlugType("=Masterwork/ExoticCatalyst");
        }
    }
    exports.default = ItemIntrinsics;
});
define("ui/view/item/ItemPerks", ["require", "exports", "ui/Card", "ui/Classes", "ui/Component", "ui/form/Button", "ui/form/Checkbox", "ui/form/Drawer", "ui/UiEventBus", "ui/view/item/ItemSockets", "utility/decorator/Bound", "utility/Store"], function (require, exports, Card_8, Classes_23, Component_68, Button_14, Checkbox_2, Drawer_6, UiEventBus_8, ItemSockets_3, Bound_20, Store_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemPerksClasses = void 0;
    var ItemPerksClasses;
    (function (ItemPerksClasses) {
        ItemPerksClasses["Main"] = "view-item-perks";
        ItemPerksClasses["ButtonWishlistPerks"] = "view-item-perks-button-wishlist-perks";
        ItemPerksClasses["MarkedAsJunk"] = "view-item-perks-button-wishlist-perks-marked-as-junk";
        ItemPerksClasses["Shaped"] = "view-item-perks-button-wishlist-perks-shaped";
        ItemPerksClasses["ViewingWishlist"] = "view-item-perks-viewing-wishlist";
        ItemPerksClasses["Wishlisting"] = "view-item-perks-wishlisting";
        ItemPerksClasses["WishlistContainer"] = "view-item-perks-wishlist-container";
        ItemPerksClasses["WishlistButtonAdd"] = "view-item-perks-wishlist-button-add";
        ItemPerksClasses["WishlistButtonAddPlusIcon"] = "view-item-perks-wishlist-button-add-plus-icon";
        ItemPerksClasses["WishlistButtonConfirm"] = "view-item-perks-wishlist-button-confirm";
        ItemPerksClasses["WishlistButtonConfirmIcon"] = "view-item-perks-wishlist-button-confirm-icon";
        ItemPerksClasses["WishlistDrawer"] = "view-item-perks-wishlist-drawer";
        ItemPerksClasses["Wishlist"] = "view-item-perks-wishlist-drawer-wishlist";
        ItemPerksClasses["WishlistTitle"] = "view-item-perks-wishlist-drawer-wishlist-title";
        ItemPerksClasses["WishlistRemove"] = "view-item-perks-wishlist-drawer-wishlist-remove";
        ItemPerksClasses["WishlistRemoveIcon"] = "view-item-perks-wishlist-drawer-wishlist-remove-icon";
        ItemPerksClasses["WishlistNameInput"] = "view-item-perks-wishlist-name-input";
        ItemPerksClasses["NoRollsPlease"] = "view-item-perks-wishlist-no-rolls-please";
    })(ItemPerksClasses || (exports.ItemPerksClasses = ItemPerksClasses = {}));
    class ItemPerks extends ItemSockets_3.default {
        getTitle() {
            return (this.item.definition.itemCategoryHashes?.includes(43 /* ItemCategoryHashes.Sparrows */) ? "Vehicle" : "Weapon")
                + " Perks";
        }
        initialise() {
            this.classes.add(ItemPerksClasses.Main);
            this.sockets = this.addSocketsByType("Perk");
            this.wishlists = Store_14.default.items[`item${this.item.definition.hash}PerkWishlists`];
            if (this.item.instance) {
                Button_14.default.create()
                    .classes.add(Card_8.CardClasses.TitleButton, Card_8.CardClasses.DisplayModeSectionTitleButton, ItemPerksClasses.ButtonWishlistPerks)
                    .classes.toggle(this.wishlists?.length === 0, ItemPerksClasses.MarkedAsJunk)
                    .classes.toggle(!!this.item.shaped, ItemPerksClasses.Shaped)
                    .text.set(this.item.shaped ? "Weapon Level Perk Unlocks" : this.wishlists?.length === 0 ? "Marked as Junk" : "Wishlist Perks")
                    .event.subscribe("click", () => this.event.emit("showCollections"))
                    .appendTo(this.title);
                // move socketed plugs first
                for (const socket of this.sockets)
                    for (const plug of socket.plugs)
                        if (plug.plug?.socketed)
                            plug.prependTo(socket);
                return;
            }
            if (this.inventory.craftedItems.has(this.item.definition.hash)) {
                delete Store_14.default.items[`item${this.item.definition.hash}PerkWishlists`];
                return;
            }
            this.saveWishlists({ preserveMarkedAsJunk: true });
            for (const socket of this.sockets) {
                for (const plug of socket.plugs) {
                    plug.event.subscribe("click", () => {
                        if (plug.plug?.is("Perk/TraitEnhanced"))
                            return;
                        if (!this.editingWishlist)
                            this.editNewWishlist();
                        plug.classes.toggle(ItemSockets_3.ItemSocketsClasses.PlugSelected);
                        if (this.editingWishlist) {
                            const plugs = [];
                            for (const socket of this.sockets) {
                                for (const plug of socket.plugs) {
                                    if (plug.classes.has(ItemSockets_3.ItemSocketsClasses.PlugSelected)) {
                                        plugs.push(plug.hash);
                                    }
                                }
                            }
                            this.editingWishlist.plugs = plugs;
                            this.saveWishlists({ preserveEmptyWishlists: true });
                        }
                    });
                }
            }
            this.wishlistNameInput = Component_68.default.create()
                .classes.add(ItemPerksClasses.WishlistNameInput)
                .text.set(this.wishlists?.length === 0 ? "MARKED AS JUNK" : "WISHLIST")
                .attributes.set("contenteditable", "")
                .attributes.add("inert")
                .event.subscribe("input", () => {
                if (!this.editingWishlist)
                    return;
                this.editingWishlist.name = this.wishlistNameInput.text.get()?.trim().slice(0, 20) ?? "";
                this.saveWishlists({ preserveEmptyWishlists: true });
            })
                .event.subscribe("paste", this.onPaste);
            this.wishlistContainer = Component_68.default.create()
                .classes.add(ItemPerksClasses.WishlistContainer)
                .event.subscribe("mouseenter", () => {
                if (this.editingWishlist)
                    return;
                this.wishlistDrawer.open("mouse");
                this.wishlistNameInput.text.set("WISHLIST");
                this.wishlistButton.classes.remove(ItemPerksClasses.MarkedAsJunk);
            })
                .event.subscribe("mouseleave", () => {
                this.wishlistDrawer.close("mouse");
                if (!this.editingWishlist) {
                    const displayMarkedAsJunk = this.wishlists?.length === 0;
                    this.wishlistNameInput.text.set(displayMarkedAsJunk ? "MARKED AS JUNK" : "WISHLIST");
                    this.wishlistButton.classes.toggle(displayMarkedAsJunk, ItemPerksClasses.MarkedAsJunk);
                }
            })
                .appendTo(this.title);
            this.wishlistDrawer = Drawer_6.default.create()
                .classes.add(ItemPerksClasses.WishlistDrawer)
                .appendTo(this.wishlistContainer);
            this.wishlistDrawer.focusOnClick = false;
            this.renderWishlists();
            this.wishlistConfirmButton = Button_14.default.create()
                .classes.add(ItemPerksClasses.WishlistButtonConfirm)
                .attributes.add("inert")
                .event.subscribe("click", event => this.doneEditingWishlist(event))
                .append(Component_68.default.create()
                .classes.add(ItemPerksClasses.WishlistButtonConfirmIcon));
            this.wishlistButton = Button_14.default.create("div")
                .classes.add(Card_8.CardClasses.TitleButton, Card_8.CardClasses.DisplayModeSectionTitleButton, ItemPerksClasses.WishlistButtonAdd)
                .classes.toggle(this.wishlists?.length === 0, ItemPerksClasses.MarkedAsJunk)
                .attributes.set("tabindex", "0")
                .attributes.set("role", "button")
                .event.subscribe("click", () => {
                if (this.editingWishlist)
                    return;
                this.editNewWishlist();
            })
                .append(Component_68.default.create()
                .classes.add(ItemPerksClasses.WishlistButtonAddPlusIcon))
                .append(this.wishlistNameInput)
                .append(this.wishlistConfirmButton)
                .appendTo(this.wishlistContainer);
            UiEventBus_8.default.until(viewManager.event.waitFor("hide"), events => events
                .subscribe("keydown", this.onKeydown));
        }
        renderWishlists() {
            this.wishlistDrawer.removeContents();
            for (const wishlist of this.wishlists ?? []) {
                Component_68.default.create()
                    .classes.add(ItemPerksClasses.Wishlist)
                    .append(Button_14.default.create()
                    .classes.add(ItemPerksClasses.WishlistTitle)
                    .text.set(wishlist.name)
                    .event.subscribe("click", () => this.editWishlist(wishlist)))
                    .append(Button_14.default.create()
                    .classes.add(ItemPerksClasses.WishlistRemove)
                    .append(Component_68.default.create()
                    .classes.add(ItemPerksClasses.WishlistRemoveIcon))
                    .event.subscribe("click", () => this.removeWishlist(wishlist)))
                    .event.subscribe("mouseenter", () => this.displayWishlist(wishlist))
                    .event.subscribe("mouseleave", () => this.undisplayWishlist(wishlist))
                    .appendTo(this.wishlistDrawer);
            }
            this.wishlistNoRollsPlease = Checkbox_2.default.create([this.wishlists?.length === 0])
                .classes.add(ItemPerksClasses.NoRollsPlease)
                .classes.toggle(!!this.wishlists?.length, Classes_23.Classes.Hidden)
                .attributes.toggle(!!this.wishlists?.length, "inert")
                .tweak(checkbox => checkbox.label.text.set("Mark all rolls as junk"))
                .tweak(checkbox => checkbox.description.text.set("No perk combination satisfies me!"))
                .event.subscribe("update", ({ checked }) => {
                if (!this.wishlists?.length) {
                    this.wishlists = checked ? [] : undefined;
                    this.saveWishlists({ preserveMarkedAsJunk: true });
                }
            })
                .appendTo(this.wishlistDrawer);
        }
        displayWishlist(wishlist) {
            this.classes.add(ItemPerksClasses.ViewingWishlist);
            this.displayedWishlist = wishlist;
            for (const socket of this.sockets) {
                for (const plug of socket.plugs) {
                    plug.classes.toggle(wishlist.plugs.includes(plug.hash), ItemSockets_3.ItemSocketsClasses.PlugSelected);
                }
            }
        }
        undisplayWishlist(wishlist) {
            if (this.displayedWishlist !== wishlist)
                return;
            this.classes.remove(ItemPerksClasses.ViewingWishlist);
            for (const socket of this.sockets)
                for (const plug of socket.plugs)
                    plug.classes.remove(ItemSockets_3.ItemSocketsClasses.PlugSelected);
        }
        editNewWishlist() {
            return this.editWishlist({ name: `Wishlist${this.wishlists?.length ? ` ${this.wishlists.length + 1}` : ""}`, plugs: [] });
        }
        editWishlist(wishlist) {
            if (this.displayedWishlist)
                this.undisplayWishlist(this.displayedWishlist);
            this.wishlists ??= [];
            if (!this.wishlists.includes(wishlist))
                this.wishlists.push(wishlist);
            this.backupEditingWishlist = { ...wishlist, plugs: [...wishlist.plugs] };
            this.editingWishlist = wishlist;
            this.classes.add(ItemPerksClasses.Wishlisting);
            this.wishlistButton.classes.add(Button_14.ButtonClasses.Selected);
            for (const socket of this.sockets) {
                for (const plug of socket.plugs) {
                    plug.classes.toggle(wishlist.plugs.includes(plug.hash), ItemSockets_3.ItemSocketsClasses.PlugSelected);
                }
            }
            this.wishlistNameInput.attributes.remove("inert");
            this.wishlistConfirmButton.attributes.remove("inert");
            this.wishlistNameInput.text.set(wishlist.name);
            window.getSelection()?.selectAllChildren(this.wishlistNameInput.element);
            this.wishlistDrawer.close(true);
            this.saveWishlists({ preserveEmptyWishlists: true });
            this.renderWishlists();
        }
        cancelEditingWishlist() {
            this.editingWishlist = this.backupEditingWishlist;
            this.doneEditingWishlist();
            if (this.wishlistNameInput.isFocused())
                this.wishlistButton.focus();
        }
        doneEditingWishlist(event) {
            delete this.editingWishlist;
            this.classes.remove(ItemPerksClasses.Wishlisting);
            this.wishlistButton.classes.remove(Button_14.ButtonClasses.Selected);
            this.wishlistNameInput.attributes.add("inert");
            this.wishlistConfirmButton.attributes.add("inert");
            for (const socket of this.sockets)
                for (const plug of socket.plugs)
                    plug.classes.remove(ItemSockets_3.ItemSocketsClasses.PlugSelected);
            this.saveWishlists();
            this.renderWishlists();
            event?.stopImmediatePropagation();
            const hovered = document.querySelectorAll(":hover");
            if (this.wishlistContainer.contains(hovered[hovered.length - 1]))
                this.wishlistDrawer.open("mouse");
        }
        removeWishlist(wishlist) {
            if (this.displayedWishlist === wishlist)
                this.undisplayWishlist(wishlist);
            const index = this.wishlists?.indexOf(wishlist);
            if (index !== undefined && index >= 0)
                this.wishlists.splice(index, 1);
            this.saveWishlists();
            this.renderWishlists();
        }
        cleanupWishlists(options) {
            if (!options?.preserveEmptyWishlists)
                this.wishlists = this.wishlists?.filter(wishlist => wishlist.name !== "" && wishlist.plugs.length > 0);
            if (!this.wishlists?.length && !options?.preserveMarkedAsJunk)
                delete this.wishlists;
            if (!this.editingWishlist) {
                const displayMarkedAsJunk = this.wishlists?.length === 0 && !this.wishlistDrawer?.isOpen();
                this.wishlistNameInput?.text.set(displayMarkedAsJunk ? "MARKED AS JUNK" : "WISHLIST");
                this.wishlistButton?.classes.toggle(displayMarkedAsJunk, ItemPerksClasses.MarkedAsJunk);
            }
        }
        saveWishlists(options) {
            this.cleanupWishlists(options);
            Store_14.default.items[`item${this.item.definition.hash}PerkWishlists`] = this.wishlists;
        }
        onKeydown(event) {
            if (this.editingWishlist && event.useOverInput("Escape"))
                this.cancelEditingWishlist();
            if (this.wishlistButton.isFocused() && !this.editingWishlist && (event.use(" ") || event.use("Enter")))
                this.editNewWishlist();
        }
        onPaste(event) {
            event.preventDefault();
            const data = event.clipboardData?.getData("text/plain");
            if (!data)
                return;
            const selection = window.getSelection();
            for (let i = 0; i < (selection?.rangeCount ?? 0); i++) {
                const range = selection?.getRangeAt(i);
                if (!range)
                    continue;
                if (!this.wishlistNameInput.element.contains(range.startContainer) || !this.wishlistNameInput.element.contains(range.endContainer))
                    continue;
                range.deleteContents();
                range.insertNode(document.createTextNode(data.replace(/\n/g, "")));
                range.collapse();
            }
        }
    }
    exports.default = ItemPerks;
    __decorate([
        Bound_20.default
    ], ItemPerks.prototype, "onKeydown", null);
});
define("ui/view/item/ItemView", ["require", "exports", "model/Model", "model/models/Inventory", "model/models/items/Item", "model/models/Manifest", "ui/bungie/DisplayProperties", "ui/Component", "ui/form/Button", "ui/inventory/ElementTypes", "ui/inventory/ItemComponent", "ui/inventory/tooltip/ItemAmmo", "ui/inventory/tooltip/ItemStat", "ui/inventory/tooltip/ItemStatTracker", "ui/LoadingManager", "ui/View", "ui/view/ErrorView", "ui/view/item/ItemIntrinsics", "ui/view/item/ItemPerks", "utility/Objects"], function (require, exports, Model_19, Inventory_9, Item_7, Manifest_24, DisplayProperties_21, Component_69, Button_15, ElementTypes_3, ItemComponent_8, ItemAmmo_2, ItemStat_3, ItemStatTracker_2, LoadingManager_4, View_12, ErrorView_2, ItemIntrinsics_1, ItemPerks_1, Objects_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemViewClasses = exports.resolveItemURL = void 0;
    async function resolveItemURL(url, api) {
        const [bucketId, itemId] = url.split("/");
        const total = bucketId === "collections" ? 3 : 2;
        const manifest = await api.subscribeProgressAndWait(Manifest_24.default, 1 / total);
        const inventory = await api.subscribeProgressAndWait(Inventory_9.default.createModel(), 1 / total, 1 / total);
        const { DestinyInventoryItemDefinition } = manifest;
        if (bucketId !== "collections")
            return inventory.items?.[itemId];
        const itemDef = await DestinyInventoryItemDefinition.get(itemId);
        if (!itemDef)
            return;
        api.emitProgress(1);
        return Item_7.default.createFake(manifest, inventory.profile, itemDef);
    }
    exports.resolveItemURL = resolveItemURL;
    var ItemViewClasses;
    (function (ItemViewClasses) {
        ItemViewClasses["Item"] = "view-item-header-item";
        ItemViewClasses["ItemDefinition"] = "view-item-definition";
        ItemViewClasses["FlavourText"] = "view-item-flavour-text";
        ItemViewClasses["PerksModsTraits"] = "view-item-perks-mods-traits";
        ItemViewClasses["ButtonViewInCollections"] = "view-item-button-view-in-collections";
        ItemViewClasses["LockButton"] = "view-item-lock-button";
        ItemViewClasses["LockButtonLocked"] = "view-item-lock-button-locked";
        ItemViewClasses["StatsContainer"] = "view-item-stats-container";
        ItemViewClasses["Stats"] = "view-item-stats";
        ItemViewClasses["PrimaryInfo"] = "view-item-primary-info";
        ItemViewClasses["PrimaryInfoPowerLabel"] = "view-item-primary-info-power-label";
        ItemViewClasses["PrimaryInfoPower"] = "view-item-primary-info-power";
        ItemViewClasses["PrimaryInfoElement"] = "view-item-primary-info-element";
        ItemViewClasses["PrimaryInfoAmmo"] = "view-item-primary-info-ammo";
        ItemViewClasses["PrimaryInfoTracker"] = "view-item-primary-info-tracker";
    })(ItemViewClasses || (exports.ItemViewClasses = ItemViewClasses = {}));
    const itemViewBase = View_12.default.create({
        models: (item) => [Manifest_24.default, Inventory_9.default.createModel(), Model_19.default.createTemporary(async (api) => typeof item !== "string" ? item : resolveItemURL(item, api), "resolveItemURL")],
        id: "item",
        hash: (item) => typeof item === "string" ? `item/${item}` : `item/${item.bucket.isCollections() ? "collections" : "inventory"}/${item.bucket.isCollections() ? item.definition.hash : item.id}`,
        name: (item) => typeof item === "string" ? "Item Details" : item.definition.displayProperties.name,
        noDestinationButton: true,
        initialise: async (view, manifest, inventory, itemResult) => {
            LoadingManager_4.default.end(view.definition.id);
            const item = itemResult;
            if (!item) {
                return ErrorView_2.default.show(404, {
                    title: "Error: No Item Found",
                    subtitle: "Your ghost continues its search...",
                    buttonText: "View Collections",
                    buttonClick: () => viewManager.showCollections(),
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            window.$i = window.item = item;
            console.log(DisplayProperties_21.default.name(item.definition), item);
            view.classes.toggle(!item.instance, ItemViewClasses.ItemDefinition)
                .setTitle(title => title.text.set(item.definition.displayProperties.name))
                .setSubtitle("caps", subtitle => subtitle.text.set(item.definition.itemTypeDisplayName));
            const screenshot = item.getOrnament()?.definition?.screenshot ?? item.definition.screenshot;
            const secondaryIcon = item.definition.secondaryIcon;
            if (screenshot)
                view.setBackground(`https://www.bungie.net${screenshot}`, ...secondaryIcon ? [`https://www.bungie.net${secondaryIcon}`] : [])
                    .setDarkened(false);
            if (!item.bucket.isCollections()) {
                const lockButton = Button_15.default.create()
                    .classes.add(ItemViewClasses.LockButton)
                    .classes.toggle(item.isLocked(), ItemViewClasses.LockButtonLocked)
                    .event.subscribe("click", async () => {
                    lockButton.classes.toggle(ItemViewClasses.LockButtonLocked);
                    const locked = await item.setLocked(lockButton.classes.has(ItemViewClasses.LockButtonLocked));
                    lockButton.classes.toggle(locked, ItemViewClasses.LockButtonLocked);
                })
                    .appendTo(view.title);
            }
            ItemComponent_8.default.create([item])
                .classes.remove(ItemComponent_8.ItemClasses.NotAcquired)
                .classes.add(ItemViewClasses.Item)
                .clearTooltip()
                .setDisableInteractions()
                .event.subscribe("mouseenter", () => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                window.$i = window.item = item;
                console.log(DisplayProperties_21.default.name(item.definition), item);
            })
                .prependTo(view.header);
            Component_69.default.create("p")
                .classes.add(ItemViewClasses.FlavourText)
                .text.set(item.definition.flavorText)
                .appendTo(view.header);
            if (item.instance)
                Button_15.default.create()
                    .classes.add(ItemViewClasses.ButtonViewInCollections)
                    .text.set("View in Collections")
                    .event.subscribe("click", () => ItemView.showCollections(item))
                    .appendTo(view.header);
            Component_69.default.create()
                .classes.add(ItemViewClasses.PerksModsTraits)
                .append(ItemPerks_1.default.create([item, inventory])
                .event.subscribe("showCollections", () => ItemView.showCollections(item)))
                // .append(ItemMods.create([item]))
                .append(ItemIntrinsics_1.default.create([item, inventory]))
                .appendTo(view.content);
            const statsContainer = Component_69.default.create()
                .classes.add(ItemViewClasses.StatsContainer)
                .appendTo(view.content);
            const energy = item.instance?.energy;
            const { DestinyDamageTypeDefinition, DestinyEnergyTypeDefinition } = manifest;
            const damageType = await DestinyDamageTypeDefinition.get(item.instance?.damageTypeHash ?? item.definition.defaultDamageTypeHash);
            const energyType = await DestinyEnergyTypeDefinition.get(energy?.energyTypeHash);
            const character = inventory?.getCharacter(item.character);
            const elementTypeName = (damageType?.displayProperties.name ?? energyType?.displayProperties.name ?? "Unknown").toLowerCase();
            Component_69.default.create()
                .classes.add(ItemViewClasses.PrimaryInfo)
                .append(Component_69.default.create()
                .classes.add(ItemViewClasses.PrimaryInfoPowerLabel)
                .text.set("POWER"))
                .append(Component_69.default.create()
                .classes.add(ItemViewClasses.PrimaryInfoElement, `${ItemViewClasses.PrimaryInfoElement}-${elementTypeName}`)
                .style.set("--icon", DisplayProperties_21.default.icon(damageType) ?? DisplayProperties_21.default.icon(energyType))
                .style.set("--colour", ElementTypes_3.default.getColour(elementTypeName)))
                .append(Component_69.default.create()
                .classes.add(ItemViewClasses.PrimaryInfoPower)
                .text.set(`${item.getPower() || character?.power || 0}`))
                .append(ItemAmmo_2.default.create()
                .classes.add(ItemViewClasses.PrimaryInfoAmmo)
                .setItem(item))
                .append(ItemStatTracker_2.default.create()
                .classes.add(ItemViewClasses.PrimaryInfoTracker)
                .setItem(item))
                .appendTo(statsContainer);
            const stats = ItemStat_3.default.Wrapper.create()
                .classes.add(ItemViewClasses.Stats);
            if (stats.setItem(item))
                stats.appendTo(statsContainer);
        },
    });
    class ItemViewClass extends View_12.default.Handler {
        showCollections(item) {
            this.show(`collections/${item.definition.hash}`);
        }
    }
    const ItemView = Objects_8.default.inherit(itemViewBase, ItemViewClass);
    exports.default = ItemView;
});
define("ui/view/item/ArtifactView", ["require", "exports", "model/Model", "model/models/Inventory", "model/models/Manifest", "ui/bungie/DisplayProperties", "ui/Component", "ui/form/Button", "ui/inventory/ItemComponent", "ui/LoadingManager", "ui/View", "ui/view/item/ItemView", "utility/Objects"], function (require, exports, Model_20, Inventory_10, Manifest_25, DisplayProperties_22, Component_70, Button_16, ItemComponent_9, LoadingManager_5, View_13, ItemView_1, Objects_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.resolveArtifactURL = void 0;
    async function resolveArtifactURL(url, api) {
        const inventory = await api.subscribeProgressAndWait(Inventory_10.default.createModel(), 1 / 4, 2 / 4);
        return inventory.getBucket(1506418338 /* InventoryBucketHashes.SeasonalArtifact */, (url ?? inventory.currentCharacter.characterId))?.equippedItem;
    }
    exports.resolveArtifactURL = resolveArtifactURL;
    var ArtifactViewClasses;
    (function (ArtifactViewClasses) {
        ArtifactViewClasses["Item"] = "view-artifact-header-item";
        ArtifactViewClasses["ItemDefinition"] = "view-artifact-definition";
        ArtifactViewClasses["FlavourText"] = "view-artifact-flavour-text";
    })(ArtifactViewClasses || (ArtifactViewClasses = {}));
    const artifactViewBase = View_13.default.create({
        models: (itemOrCharacterId) => [Manifest_25.default, Inventory_10.default.createModel(), Model_20.default.createTemporary(async (api) => typeof itemOrCharacterId === "object" ? itemOrCharacterId : resolveArtifactURL(itemOrCharacterId, api), "resolveArtifactURL")],
        id: "artifact",
        name: (itemOrCharacterId) => (typeof itemOrCharacterId !== "string" ? itemOrCharacterId?.definition.displayProperties.name : undefined) ?? "Artifact Details",
        hash: (itemOrCharacterId) => typeof itemOrCharacterId === "string" ? `artifact/${itemOrCharacterId}` : itemOrCharacterId?.bucket.characterId ? `artifact/${itemOrCharacterId.bucket.characterId}` : "artifact",
        noDestinationButton: true,
        initialise: async (view, manifest, inventory, itemResult) => {
            LoadingManager_5.default.end(view.definition.id);
            const item = itemResult;
            if (!item) {
                view.setTitle(title => title.text.set("No Artifact Was Found..."));
                view.setSubtitle("small", subtitle => subtitle.text.set("Your ghost continues its search..."));
                // const content = Component.create()
                // 	.appendTo(view.content);
                // Button.create()
                // 	.text.set("View Collections")
                // 	.setPrimary()
                // 	.setAttention()
                // 	.event.subscribe("click", () => viewManager.showCollections())
                // 	.appendTo(content);
                return;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            window.$i = window.item = item;
            console.log(DisplayProperties_22.default.name(item.definition), item);
            view.updateHash(item);
            view.header.classes.add("view-item-header");
            view.classes.toggle(!item.instance, ArtifactViewClasses.ItemDefinition)
                .setTitle(title => title.text.set(item.definition.displayProperties.name)
                .classes.add("view-item-title"))
                .setSubtitle("caps", subtitle => subtitle.text.set(item.definition.itemTypeDisplayName));
            if (item.definition.screenshot)
                view.setBackground(`https://www.bungie.net${item.definition.screenshot}`);
            if (!item.bucket.isCollections()) {
                const lockButton = Button_16.default.create()
                    .classes.add(ItemView_1.ItemViewClasses.LockButton)
                    .classes.toggle(item.isLocked(), ItemView_1.ItemViewClasses.LockButtonLocked)
                    .event.subscribe("click", async () => {
                    lockButton.classes.toggle(ItemView_1.ItemViewClasses.LockButtonLocked);
                    const locked = await item.setLocked(lockButton.classes.has(ItemView_1.ItemViewClasses.LockButtonLocked));
                    lockButton.classes.toggle(locked, ItemView_1.ItemViewClasses.LockButtonLocked);
                })
                    .appendTo(view.title);
            }
            ItemComponent_9.default.create([item])
                .classes.add(ItemView_1.ItemViewClasses.Item)
                .clearTooltip()
                .setDisableInteractions()
                .event.subscribe("mouseenter", () => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                window.$i = window.item = item;
                console.log(DisplayProperties_22.default.name(item.definition), item);
            })
                .prependTo(view.header);
            Component_70.default.create("p")
                .classes.add(ArtifactViewClasses.FlavourText)
                .text.set(item.definition.flavorText)
                .appendTo(view.header);
        },
    });
    class ArtifactViewClass extends View_13.default.Handler {
    }
    const ArtifactView = Objects_9.default.inherit(artifactViewBase, ArtifactViewClass);
    exports.default = ArtifactView;
});
define("ui/view/itemtooltip/ItemTooltipView", ["require", "exports", "model/Model", "model/models/Inventory", "model/models/Manifest", "ui/Component", "ui/form/Button", "ui/inventory/ItemTooltip", "ui/LoadingManager", "ui/View", "ui/view/item/ItemView"], function (require, exports, Model_21, Inventory_11, Manifest_26, Component_71, Button_17, ItemTooltip_2, LoadingManager_6, View_14, ItemView_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ItemTooltipViewClasses = void 0;
    var ItemTooltipViewClasses;
    (function (ItemTooltipViewClasses) {
        ItemTooltipViewClasses["Tooltip"] = "view-item-tooltip-tooltip";
        ItemTooltipViewClasses["Button"] = "view-item-tooltip-button";
        ItemTooltipViewClasses["Buttons"] = "view-item-tooltip-buttons";
    })(ItemTooltipViewClasses || (exports.ItemTooltipViewClasses = ItemTooltipViewClasses = {}));
    const tooltipViewModels = [Manifest_26.default, Inventory_11.default.createModel()];
    exports.default = View_14.default.create({
        models: (item) => [
            ...tooltipViewModels,
            ...typeof item !== "string" ? []
                : [Model_21.default.createTemporary(async (api) => (0, ItemView_2.resolveItemURL)(item, api))]
        ],
        noDestinationButton: true,
        id: "item-tooltip",
        hash: (item) => typeof item === "string" ? `item-tooltip/${item}` : `item-tooltip/${item.bucket.isCollections() ? "collections" : item.bucket.hash}/${item.id}`,
        name: (item) => typeof item === "string" ? "Item" : item.definition.displayProperties.name,
        initialise: async (view, manifest, inventory, itemModel) => {
            LoadingManager_6.default.end(view.definition.id);
            const item = view._args[1] = itemModel ?? view._args[1];
            console.log(item.definition.displayProperties.name, item);
            const character = inventory.getCharacter(item.character);
            const itemTooltip = ItemTooltip_2.default.createRaw()
                .classes.add(ItemTooltipViewClasses.Tooltip);
            await itemTooltip.setItem(item, inventory);
            itemTooltip.appendTo(view.content);
            itemTooltip.footer.remove();
            const { DestinyClassDefinition } = manifest;
            const buttons = Component_71.default.create()
                .classes.add(ItemTooltipViewClasses.Buttons)
                .appendTo(view.content);
            const cls = !character ? undefined : await DestinyClassDefinition.get(character.classHash);
            const className = cls?.displayProperties.name ?? "Unknown";
            const isEngram = item.reference.bucketHash === 375726501 /* InventoryBucketHashes.Engrams */;
            if (!item.bucket.isCharacter() && !item.equipped && !isEngram)
                Button_17.default.create()
                    .classes.add(ItemTooltipViewClasses.Button)
                    .text.set(`Pull to ${className}`)
                    .event.subscribe("click", () => {
                    void item.transferToCharacter(character.characterId);
                    view.back();
                })
                    .appendTo(buttons);
            if (item.bucket.isCharacter() && !item.equipped)
                Button_17.default.create()
                    .classes.add(ItemTooltipViewClasses.Button)
                    .text.set(`Equip to ${className}`)
                    .event.subscribe("click", () => {
                    void item.equip(character.characterId);
                    view.back();
                })
                    .appendTo(buttons);
            if (item.bucket.isVault() && !item.equipped && !isEngram)
                Button_17.default.create()
                    .classes.add(ItemTooltipViewClasses.Button)
                    .text.set("Vault")
                    .event.subscribe("click", () => {
                    void item.transferToVault();
                    view.back();
                })
                    .appendTo(buttons);
            if (!isEngram)
                Button_17.default.create()
                    .classes.add(ItemTooltipViewClasses.Button)
                    .text.set("Details")
                    .event.subscribe("click", () => ItemView_2.default.show(item))
                    .appendTo(buttons);
        },
    });
});
define("model/models/WallpaperMoments", ["require", "exports", "model/Model", "model/models/manifest/DeepsightManifest"], function (require, exports, Model_22, DeepsightManifest_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createWallpaperThumbnail = void 0;
    exports.default = Model_22.default.createDynamic("Daily", async (_) => DeepsightManifest_3.DeepsightManifest.await()
        .then(async (manifest) => {
        const wallpaperMomentsRaw = await manifest.DeepsightWallpaperDefinition.all();
        const moments = await manifest.DeepsightMomentDefinition.all();
        return wallpaperMomentsRaw
            .map(def => ({
            ...def,
            moment: moments.find(moment => def.hash === moment.hash),
        }))
            .sort((a, b) => +(a.moment?.hash || 0) - +(b.moment?.hash || 0));
    }));
    async function createWallpaperThumbnail(wallpaper) {
        const image = new Image();
        image.src = wallpaper;
        await new Promise(resolve => image.onload = resolve);
        const canvas = document.createElement("canvas");
        canvas.width = 144;
        canvas.height = 81;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
        return canvas;
    }
    exports.createWallpaperThumbnail = createWallpaperThumbnail;
});
define("ui/view/settings/SettingsBackground", ["require", "exports", "model/models/WallpaperMoments", "ui/Card", "ui/Component", "ui/form/Button", "ui/form/Checkbox", "ui/Loadable", "utility/Store"], function (require, exports, WallpaperMoments_1, Card_9, Component_72, Button_18, Checkbox_3, Loadable_8, Store_15) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SettingsBackgroundClasses;
    (function (SettingsBackgroundClasses) {
        SettingsBackgroundClasses["BackgroundOptions"] = "settings-background-options";
        SettingsBackgroundClasses["InternalWrapper"] = "settings-background-options-wrapper";
        SettingsBackgroundClasses["Wallpaper"] = "settings-background-options-wallpaper";
        SettingsBackgroundClasses["WallpaperLoadingThumbnail"] = "settings-background-options-wallpaper-loading-thumbnail";
        SettingsBackgroundClasses["WallpaperMoment"] = "settings-background-options-wallpaper-moment";
        SettingsBackgroundClasses["WallpaperMomentWallpapers"] = "settings-background-options-wallpaper-moment-list";
        SettingsBackgroundClasses["WallpaperMomentLabel"] = "settings-background-options-wallpaper-moment-label";
        SettingsBackgroundClasses["WallpaperImage"] = "settings-background-options-wallpaper-image";
    })(SettingsBackgroundClasses || (SettingsBackgroundClasses = {}));
    class SettingsBackground extends Card_9.default {
        onMake() {
            super.onMake();
            this.title.text.set("Background");
            let scrollLeft = 0;
            const momentsWrapper = Loadable_8.default.create(WallpaperMoments_1.default)
                .onReady(moments => Component_72.default.create()
                .classes.add(SettingsBackgroundClasses.InternalWrapper)
                .append(...[...moments].reverse().map(moment => Component_72.default.create()
                .classes.add(SettingsBackgroundClasses.WallpaperMoment)
                .append(Component_72.default.create()
                .classes.add(SettingsBackgroundClasses.WallpaperMomentLabel)
                .text.set(moment.moment.displayProperties.name))
                .append(Component_72.default.create()
                .classes.add(SettingsBackgroundClasses.WallpaperMomentWallpapers)
                .append(...moment.wallpapers.map(wallpaper => Button_18.default.create()
                .classes.add(SettingsBackgroundClasses.Wallpaper)
                .classes.toggle(Store_15.default.items.settingsBackground === wallpaper, Button_18.ButtonClasses.Selected)
                .event.subscribe("click", (event) => {
                document.querySelector(`.${SettingsBackgroundClasses.Wallpaper}.${Button_18.ButtonClasses.Selected}`)
                    ?.classList.remove(Button_18.ButtonClasses.Selected);
                if (Store_15.default.items.settingsBackground === wallpaper) {
                    delete Store_15.default.items.settingsBackground;
                    return;
                }
                event.target.classList.add(Button_18.ButtonClasses.Selected);
                Store_15.default.items.settingsBackground = wallpaper;
            })
                .append(Component_72.default.create("img")
                .classes.add(SettingsBackgroundClasses.WallpaperImage)
                .attributes.set("loading", "lazy")
                .attributes.set("src", wallpaper))
                .tweak(button => button.attributes.set("data-wallpaper", wallpaper))))))))
                .classes.add(SettingsBackgroundClasses.BackgroundOptions)
                .setSimple()
                .event.subscribe("wheel", event => {
                if (event.shiftKey)
                    return;
                if (Math.sign(event.deltaY) !== Math.sign(scrollLeft - momentsWrapper.element.scrollLeft))
                    scrollLeft = momentsWrapper.element.scrollLeft;
                scrollLeft += event.deltaY;
                if (scrollLeft + momentsWrapper.element.clientWidth > momentsWrapper.element.scrollWidth)
                    scrollLeft = momentsWrapper.element.scrollWidth - momentsWrapper.element.clientWidth;
                if (scrollLeft < 0)
                    scrollLeft = 0;
                momentsWrapper.element.scrollLeft = scrollLeft;
            })
                .appendTo(this.content);
            // async function renderThumbnails () {
            // 	let hasUnloadedThumbnail = false;
            // 	let i = -1;
            // 	for (const button of sourcesWrapper.element.getElementsByClassName(SettingsBackgroundClasses.Wallpaper)) {
            // 		i++;
            // 		if (button.classList.contains(SettingsBackgroundClasses.WallpaperLoadingThumbnail))
            // 			continue;
            // 		if (sourcesWrapper.element.scrollLeft + 500 > i * 144) {
            // 			button.classList.add(SettingsBackgroundClasses.WallpaperLoadingThumbnail);
            // 			button.append(await createWallpaperThumbnail((button as HTMLElement).dataset.wallpaper!));
            // 			continue;
            // 		}
            // 		hasUnloadedThumbnail = true;
            // 	}
            // 	if (hasUnloadedThumbnail)
            // 		// eslint-disable-next-line @typescript-eslint/no-misused-promises
            // 		setTimeout(renderThumbnails, 1);
            // }
            // void Async.sleep(500).then(renderThumbnails);
            Checkbox_3.default.create([Store_15.default.items.settingsBackgroundBlur])
                .tweak(checkbox => checkbox.label.text.set("Blur Background"))
                .event.subscribe("update", ({ checked }) => Store_15.default.items.settingsBackgroundBlur = checked ? true : undefined)
                .appendTo(this.content);
            Checkbox_3.default.create([Store_15.default.items.settingsBackgroundFollowMouse])
                .tweak(checkbox => checkbox.label.text.set("Follow Mouse"))
                .event.subscribe("update", ({ checked }) => Store_15.default.items.settingsBackgroundFollowMouse = checked ? true : undefined)
                .appendTo(this.content);
        }
    }
    exports.default = SettingsBackground;
});
define("ui/form/DescribedButton", ["require", "exports", "ui/Component", "ui/form/Button"], function (require, exports, Component_73, Button_19) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DescribedButtonClasses = void 0;
    var DescribedButtonClasses;
    (function (DescribedButtonClasses) {
        DescribedButtonClasses["Description"] = "button-description";
    })(DescribedButtonClasses || (exports.DescribedButtonClasses = DescribedButtonClasses = {}));
    class DescribedButton extends Component_73.default {
        onMake() {
            this.button = Button_19.default.basic()
                .appendTo(this);
            this.description = Component_73.default.create("p")
                .classes.add(DescribedButtonClasses.Description)
                .appendTo(this);
        }
    }
    exports.default = DescribedButton;
});
define("ui/form/Dropdown", ["require", "exports", "ui/Component", "ui/form/Button", "utility/decorator/Bound"], function (require, exports, Component_74, Button_20, Bound_21) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DropdownOption = exports.DropdownClasses = void 0;
    var DropdownClasses;
    (function (DropdownClasses) {
        DropdownClasses["Main"] = "dropdown";
        DropdownClasses["Label"] = "dropdown-label";
        DropdownClasses["Container"] = "dropdown-container";
        DropdownClasses["Option"] = "dropdown-option";
        DropdownClasses["OptionActive"] = "dropdown-option-active";
    })(DropdownClasses || (exports.DropdownClasses = DropdownClasses = {}));
    class Dropdown extends Component_74.default {
        onMake() {
            this.classes.add(DropdownClasses.Main);
            this.attributes.set("tabindex", "0");
            this.options = [];
            this.activeReasons = new Set();
            this.container = Component_74.default.create()
                .classes.add(DropdownClasses.Container)
                .appendTo(Component_74.default.create()
                .appendTo(this));
            this.event.subscribe("mouseenter", this.onMouseEnter);
            this.event.subscribe("focus", this.onFocus);
            this.event.subscribe("blur", this.onBlur);
        }
        addLabel(initialiser) {
            Component_74.default.create("label")
                .classes.add(DropdownClasses.Label)
                .tweak(initialiser)
                .prependTo(this);
            return this;
        }
        addOption(initialiser) {
            const option = DropdownOption.create()
                .attributes.add("inert");
            this.activeOption ??= option.classes.add(DropdownClasses.OptionActive);
            this.options.push(option);
            option.tweak(initialiser)
                .appendTo(this.container);
            option.event.subscribe("click", event => this.onOptionClick(option, event));
            setTimeout(() => {
                this.style.set("--content-width", `${this.container.element.clientWidth}px`);
            }, 10);
            return this;
        }
        setActive(reason) {
            if (!this.activeReasons.size) {
                for (const option of this.options) {
                    option.attributes.remove("inert");
                }
            }
            this.activeReasons.add(reason);
        }
        setInactive(reason) {
            this.activeReasons.delete(reason);
            if (!this.activeReasons.size) {
                for (const option of this.options) {
                    option.attributes.add("inert");
                }
            }
        }
        onOptionClick(option, event) {
            this.activeOption.classes.remove(DropdownClasses.OptionActive);
            this.activeOption = option.classes.add(DropdownClasses.OptionActive);
            this.event.emit("change");
        }
        onMouseEnter(event) {
            window.addEventListener("mousemove", this.onMouseMove);
            this.setActive("mouse");
        }
        onMouseMove(event) {
            const target = event.target;
            if (target?.closest(`.${DropdownClasses.Main}`) !== this.element) {
                window.removeEventListener("mousemove", this.onMouseMove);
                this.setInactive("mouse");
            }
        }
        onFocus(event) {
            window.addEventListener("keypress", this.onKeypress);
        }
        onBlur(event) {
            window.removeEventListener("keypress", this.onKeypress);
        }
        onKeypress(event) {
            if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                this.setActive("keyboard");
                document.addEventListener("focusin", this.onActiveElementChange);
            }
        }
        onActiveElementChange(event) {
            if (document.activeElement?.closest(`.${DropdownClasses.Main}`) !== this.element) {
                this.setInactive("keyboard");
                document.removeEventListener("focusin", this.onActiveElementChange);
            }
        }
    }
    exports.default = Dropdown;
    __decorate([
        Bound_21.default
    ], Dropdown.prototype, "onMouseEnter", null);
    __decorate([
        Bound_21.default
    ], Dropdown.prototype, "onMouseMove", null);
    __decorate([
        Bound_21.default
    ], Dropdown.prototype, "onFocus", null);
    __decorate([
        Bound_21.default
    ], Dropdown.prototype, "onBlur", null);
    __decorate([
        Bound_21.default
    ], Dropdown.prototype, "onKeypress", null);
    __decorate([
        Bound_21.default
    ], Dropdown.prototype, "onActiveElementChange", null);
    class DropdownOption extends Button_20.default {
        onMake() {
            this.classes.add(DropdownClasses.Option);
        }
    }
    exports.DropdownOption = DropdownOption;
});
define("ui/view/settings/SettingsDeviceStorage", ["require", "exports", "model/Model", "model/models/Items", "model/models/Memberships", "model/models/Profile", "ui/Card", "ui/Component", "ui/form/DescribedButton", "ui/form/Dropdown", "utility/endpoint/bungie/Bungie", "utility/Store"], function (require, exports, Model_23, Items_2, Memberships_8, Profile_2, Card_10, Component_75, DescribedButton_1, Dropdown_1, Bungie_9, Store_16) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const membershipNames = {
        [0 /* BungieMembershipType.None */]: "None",
        [-1 /* BungieMembershipType.All */]: "All",
        [1 /* BungieMembershipType.TigerXbox */]: "Xbox",
        [2 /* BungieMembershipType.TigerPsn */]: "Playstation",
        [3 /* BungieMembershipType.TigerSteam */]: "Steam",
        [4 /* BungieMembershipType.TigerBlizzard */]: "Blizzard",
        [5 /* BungieMembershipType.TigerStadia */]: "Stadia",
        [6 /* BungieMembershipType.TigerEgs */]: "Epic",
        [10 /* BungieMembershipType.TigerDemon */]: "Demon",
        [254 /* BungieMembershipType.BungieNext */]: "BungieNext",
    };
    class SettingsDeviceStorage extends Card_10.default {
        async onMake() {
            super.onMake();
            this.title.text.set("Account & Storage");
            const memberships = !Bungie_9.default.authenticated ? undefined : await Memberships_8.default.await().catch(() => undefined);
            // if cross save is disabled and there's more than one membership, show a selection for which destiny membership should be viewed
            if ((memberships?.destinyMemberships.length ?? 0) > 1) {
                const membershipsDropdown = Dropdown_1.default.create()
                    .addLabel(label => label.text.set("Platform"))
                    .tweak(dropdown => memberships.destinyMemberships.forEach(membership => dropdown.addOption(option => option
                    .attributes.set("data-membership-type", `${membership.membershipType}`)
                    .text.set(membershipNames[membership.membershipType] ?? "Unknown Membership Type"))))
                    .tweak(dropdown => dropdown.options.forEach(option => {
                    if (+option.attributes.get("data-membership-type") === Store_16.default.items.destinyMembershipType)
                        option.click();
                }))
                    .event.subscribe("change", () => {
                    Store_16.default.items.destinyMembershipType = +membershipsDropdown.activeOption.attributes.get("data-membership-type");
                    void Profile_2.default.reset();
                    void Items_2.default.reset();
                })
                    .appendTo(this.content);
            }
            DescribedButton_1.default.create()
                .tweak(wrapper => wrapper.button.text.set("Clear Destiny Cache"))
                .tweak(wrapper => wrapper.description
                .text.set("Removes the Destiny manifest (a large database of information about the game downloaded from the Bungie.net API), your profile information, and some other misc Destiny data downloaded from other projects. Does not clear your deepsight.gg settings.")
                .append(Component_75.default.create("p")
                .append(Component_75.default.create("b").text.set("Note:"))
                .text.add(" Continuing to use the app will re-download the deleted data.")))
                .tweak(wrapper => wrapper.button.event.subscribe("click", async () => {
                await Model_23.default.clearCache(true);
                location.reload();
            }))
                .appendTo(this.content);
            if (Bungie_9.default.authenticated)
                DescribedButton_1.default.create()
                    .tweak(wrapper => wrapper.button.text.set("Unauthorise"))
                    .tweak(wrapper => wrapper.description.text.set("Forgets your Bungie.net authentication. (Note that the authentication token is not sent anywhere except Bungie.net, and it's stored on your device.)"))
                    .tweak(wrapper => wrapper.button.event.subscribe("click", async () => {
                    await Model_23.default.clearCache(true);
                    Bungie_9.default.resetAuthentication();
                    location.reload();
                }))
                    .appendTo(this.content);
        }
    }
    exports.default = SettingsDeviceStorage;
});
define("ui/view/settings/SettingsInventoryDisplay", ["require", "exports", "ui/Card", "ui/Component", "ui/form/Checkbox", "utility/Store"], function (require, exports, Card_11, Component_76, Checkbox_4, Store_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SettingsInformationDisplay extends Card_11.default {
        onMake() {
            super.onMake();
            this.title.text.set("Inventory Display");
            Checkbox_4.default.create([Store_17.default.items.settingsAlwaysShowExtra])
                .tweak(checkbox => checkbox.label.text.set("Always Show Extra Information"))
                .tweak(checkbox => checkbox.description.text.set("Additional information will always be displayed. On items — the relevant sort information. In tooltips — where applicable, a secondary tooltip detailing content in the main tooltip."))
                .event.subscribe("update", ({ checked }) => Store_17.default.items.settingsAlwaysShowExtra = checked ? true : undefined)
                .appendTo(this.content);
            Checkbox_4.default.create([Store_17.default.items.settingsToggleExtra])
                .tweak(checkbox => checkbox.label.text.set("Toggle Extra Information"))
                .tweak(checkbox => checkbox.description
                .append(Component_76.default.create("kbd").text.set("E"))
                .text.add(" toggles whether extra information is displayed, instead of requiring the key to be held."))
                .event.subscribe("update", ({ checked }) => Store_17.default.items.settingsToggleExtra = checked ? true : undefined)
                .appendTo(this.content);
            Checkbox_4.default.create([Store_17.default.items.settingsDisplayLocksOnItems])
                .tweak(checkbox => checkbox.label.text.set("Always Display Locks on Items"))
                .tweak(checkbox => checkbox.description.text.set("Display a lock in the centre left of locked items even when extra information isn't shown."))
                .event.subscribe("update", ({ checked }) => Store_17.default.items.settingsDisplayLocksOnItems = checked ? true : undefined)
                .appendTo(this.content);
            // Checkbox.create([!Store.items.settingsClearItemFilterOnSwitchingViews])
            // 	.tweak(checkbox => checkbox.label.text.set("Persistent Item Filter"))
            // 	.tweak(checkbox => checkbox.description.text.set("When reloading the page or switching between views (ie, from Kinetic to Special), any filters are retained."))
            // 	.event.subscribe("update", ({ checked }) =>
            // 		Store.items.settingsClearItemFilterOnSwitchingViews = !checked ? true : undefined)
            // 	.appendTo(this.content);
            Checkbox_4.default.create([Store_17.default.items.settingsDisplayWishlistedHighlights])
                .tweak(checkbox => checkbox.label.text.set("Highlight Items Matching Wishlists"))
                .tweak(checkbox => checkbox.description.text.set("Items that exactly match a wishlist you've created will be highlighted with a teal border."))
                .event.subscribe("update", ({ checked }) => Store_17.default.items.settingsDisplayWishlistedHighlights = checked ? true : undefined)
                .appendTo(this.content);
            Checkbox_4.default.create([!Store_17.default.items.settingsDisableDisplayNonWishlistedHighlights])
                .tweak(checkbox => checkbox.label.text.set("Highlight Items Not Matching Wishlists"))
                .tweak(checkbox => checkbox.description.text.set("Items that do not match wishlists you've created will be highlighted with a lime border."))
                .event.subscribe("update", ({ checked }) => Store_17.default.items.settingsDisplayWishlistedHighlights = !checked ? true : undefined)
                .appendTo(this.content);
        }
    }
    exports.default = SettingsInformationDisplay;
});
define("ui/view/settings/SettingsItemMovement", ["require", "exports", "ui/Card", "ui/form/Checkbox", "utility/Store"], function (require, exports, Card_12, Checkbox_5, Store_18) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SettingsItemMovement extends Card_12.default {
        onMake() {
            super.onMake();
            this.title.text.set("Item Movement");
            Checkbox_5.default.create([!Store_18.default.items.settingsDisableReturnOnFailure])
                .tweak(checkbox => checkbox.label.text.set("Return Items to Starting Location on Failure"))
                .tweak(checkbox => checkbox.description.text.set("When moving an item from one character to another, the item is first pulled into the vault. If in the process of moving the item, it fails to complete a step, this causes the item to be put back where it was originally."))
                .event.subscribe("update", ({ checked }) => Store_18.default.items.settingsDisableReturnOnFailure = !checked ? true : undefined)
                .appendTo(this.content);
        }
    }
    exports.default = SettingsItemMovement;
});
define("ui/view/SettingsView", ["require", "exports", "ui/Component", "ui/View", "ui/view/settings/SettingsBackground", "ui/view/settings/SettingsDeviceStorage", "ui/view/settings/SettingsInventoryDisplay", "ui/view/settings/SettingsItemMovement"], function (require, exports, Component_77, View_15, SettingsBackground_1, SettingsDeviceStorage_1, SettingsInventoryDisplay_1, SettingsItemMovement_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = View_15.default.create({
        id: "settings",
        name: "Settings",
        auth: "optional",
        initialiseDestinationButton: button => button.text.remove(),
        initialise: view => view
            .setTitle(title => title.text.set("Settings"))
            .tweak(view => view.content.append(Component_77.default.create()
            .classes.add("view-settings-cards")
            .append(SettingsInventoryDisplay_1.default.create())
            .append(SettingsItemMovement_1.default.create())
            .append(SettingsBackground_1.default.create())
            .append(SettingsDeviceStorage_1.default.create()))),
    });
});
define("ui/ViewManager", ["require", "exports", "Constants", "ui/View", "ui/view/AboutView", "ui/view/AuthView", "ui/view/collections/CollectionsView", "ui/view/collections/ModsView", "ui/view/collections/VendorsView", "ui/view/collections/VendorView", "ui/view/ErrorView", "ui/view/inventory/equipment/InventoryArmourView", "ui/view/inventory/equipment/InventoryEquipmentView", "ui/view/inventory/equipment/InventoryWeaponsView", "ui/view/inventory/InventoryInventoryView", "ui/view/inventory/slot/InventoryArmsView", "ui/view/inventory/slot/InventoryChestView", "ui/view/inventory/slot/InventoryClassItemView", "ui/view/inventory/slot/InventoryEnergyView", "ui/view/inventory/slot/InventoryGhostView", "ui/view/inventory/slot/InventoryHelmetView", "ui/view/inventory/slot/InventoryKineticView", "ui/view/inventory/slot/InventoryLegsView", "ui/view/inventory/slot/InventoryPowerView", "ui/view/inventory/slot/InventoryShipView", "ui/view/inventory/slot/InventorySparrowView", "ui/view/item/ArtifactView", "ui/view/item/ItemView", "ui/view/itemtooltip/ItemTooltipView", "ui/view/SettingsView", "utility/Async", "utility/endpoint/bungie/Bungie", "utility/EventManager", "utility/Strings", "utility/URL"], function (require, exports, Constants_1, View_16, AboutView_3, AuthView_1, CollectionsView_1, ModsView_1, VendorsView_1, VendorView_2, ErrorView_3, InventoryArmourView_1, InventoryEquipmentView_1, InventoryWeaponsView_1, InventoryInventoryView_1, InventoryArmsView_3, InventoryChestView_3, InventoryClassItemView_3, InventoryEnergyView_3, InventoryGhostView_2, InventoryHelmetView_3, InventoryKineticView_3, InventoryLegsView_3, InventoryPowerView_3, InventoryShipView_2, InventorySparrowView_2, ArtifactView_1, ItemView_3, ItemTooltipView_1, SettingsView_1, Async_8, Bungie_10, EventManager_19, Strings_8, URL_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const registry = Object.fromEntries([
        AuthView_1.default,
        InventoryWeaponsView_1.default,
        InventoryArmourView_1.default,
        InventoryKineticView_3.default,
        InventoryEnergyView_3.default,
        InventoryPowerView_3.default,
        InventoryHelmetView_3.default,
        InventoryArmsView_3.default,
        InventoryChestView_3.default,
        InventoryLegsView_3.default,
        InventoryClassItemView_3.default,
        InventoryEquipmentView_1.default,
        InventoryGhostView_2.default,
        InventorySparrowView_2.default,
        InventoryShipView_2.default,
        InventoryInventoryView_1.default,
        CollectionsView_1.default,
        SettingsView_1.default,
        ItemView_3.default,
        ErrorView_3.default,
        ItemTooltipView_1.default,
        AboutView_3.default,
        ModsView_1.default,
        ArtifactView_1.default,
        VendorsView_1.default,
        VendorView_2.default,
    ].map((view) => [view.id, view]));
    View_16.default.event.subscribe("show", ({ view }) => ViewManager.show(view));
    View_16.default.event.subscribe("hide", () => ViewManager.hide());
    URL_2.default.event.subscribe("navigate", () => {
        ViewManager.showByHash(URL_2.default.path ?? URL_2.default.hash);
    });
    class ViewManager {
        static get registry() {
            return registry;
        }
        static getDefaultView() {
            return Bungie_10.default.authenticated ? InventoryWeaponsView_1.default : AuthView_1.default;
        }
        static hasView() {
            return !!this.view;
        }
        static showDefaultView() {
            this.getDefaultView().show();
        }
        static showByHash(hash) {
            if (hash === this.view?.hash)
                return;
            if (hash === null)
                return this.showDefaultView();
            const view = registry[hash] ?? registry[Strings_8.default.sliceTo(hash, "/")];
            if (view?.redirectOnLoad === true || hash === "")
                return this.showDefaultView();
            else if (view?.redirectOnLoad)
                return this.showByHash(view.redirectOnLoad);
            if (!view) {
                if (this.actionRegistry[hash])
                    this.actionRegistry[hash]();
                else if (location.hash !== `#${hash}`)
                    console.warn(`Tried to navigate to an unknown view '${hash}'`);
                ErrorView_3.default.show(404);
                return;
            }
            const args = [];
            if (view !== registry[hash])
                args.push(Strings_8.default.sliceAfter(hash, "/"));
            view.show(...args);
        }
        static show(view) {
            if (this.view === view)
                return;
            const oldView = this.view;
            if (oldView) {
                oldView.event.emit("hide");
                this.event.emit("hide", { view: oldView });
                oldView.classes.add(View_16.default.Classes.Hidden);
                void Async_8.default.sleep(1000).then(() => oldView.remove());
            }
            this.view = view;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            window.view = view;
            view.appendTo(document.body);
            view.event.until("hide", manager => manager
                .subscribe("updateTitle", () => this.updateDocumentTitle(view))
                .subscribe("updateHash", () => this.updateHash(view))
                .subscribe("back", () => this.hide())
                .subscribe("initialise", () => this.event.emit("initialise", { view })));
            this.updateDocumentTitle(view);
            this.updateHash(view);
            this.event.emit("show", { view });
        }
        static updateHash(view) {
            if (view.definition.noHashChange)
                return;
            if (URL_2.default.path !== view.hash)
                URL_2.default.path = view.hash;
            if (URL_2.default.hash === URL_2.default.path)
                URL_2.default.hash = null;
        }
        static showItem(item) {
            if (item.definition.itemCategoryHashes?.includes(1378222069 /* ItemCategoryHashes.SeasonalArtifacts */))
                ArtifactView_1.default.show(item);
            else
                ItemView_3.default.show(item);
        }
        static showVendors() {
            VendorsView_1.default.show();
        }
        static showVendor(vendor) {
            VendorView_2.default.show(typeof vendor === "number" ? `${vendor}` : vendor);
        }
        static showCollections(item) {
            if (item)
                ItemView_3.default.showCollections(item);
            else
                CollectionsView_1.default.show();
        }
        static showItemTooltip(item) {
            ItemTooltipView_1.default.show(item);
        }
        static hide() {
            history.back();
        }
        static updateDocumentTitle(view) {
            let name = view.definition.name;
            if (typeof name === "function")
                name = name(...view._args.slice(1));
            document.title = name ? `${name} // ${Constants_1.APP_NAME}` : Constants_1.APP_NAME;
        }
        static registerHashAction(hash, action) {
            this.actionRegistry[hash] = action;
            return this;
        }
    }
    ViewManager.event = EventManager_19.EventManager.make();
    ViewManager.actionRegistry = {};
    exports.default = ViewManager;
    window.addEventListener("popstate", event => {
        ViewManager.showByHash(URL_2.default.path ?? URL_2.default.hash);
        if (!ViewManager.hasView())
            ViewManager.showDefaultView();
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    window.viewManager = ViewManager;
});
define("ui/AppNav", ["require", "exports", "ui/Classes", "ui/Component", "ui/form/Button", "ui/PlayerOverview", "ui/UiEventBus", "ui/view/appnav/AppInfo", "utility/decorator/Bound", "utility/endpoint/bungie/Bungie", "utility/Store", "utility/URL"], function (require, exports, Classes_24, Component_78, Button_21, PlayerOverview_1, UiEventBus_9, AppInfo_1, Bound_22, Bungie_11, Store_19, URL_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ClassesAppNav = void 0;
    var ClassesAppNav;
    (function (ClassesAppNav) {
        ClassesAppNav["Main"] = "app-nav";
        ClassesAppNav["IdentityContainer"] = "app-nav-identity-container";
        ClassesAppNav["Destinations"] = "app-nav-destinations";
        ClassesAppNav["Compress"] = "app-nav-compress";
        ClassesAppNav["DestinationsToggle"] = "app-nav-destinations-toggle";
        ClassesAppNav["DestinationsClose"] = "app-nav-destinations-close";
        ClassesAppNav["Destination"] = "app-nav-destination";
        ClassesAppNav["DestinationAuthRequired"] = "app-nav-destination-auth-required";
        ClassesAppNav["DestinationNoAuthRequired"] = "app-nav-destination-no-auth-required";
        ClassesAppNav["DestinationChildActive"] = "app-nav-destination-child-active";
        ClassesAppNav["DestinationChildren"] = "app-nav-destination-children";
        ClassesAppNav["DocumentHasAppNav"] = "has-app-nav";
    })(ClassesAppNav || (exports.ClassesAppNav = ClassesAppNav = {}));
    class AppNav extends Component_78.default {
        onMake(viewManager) {
            this.destinationButtons = {};
            this.destinationDropdownWrappers = [];
            this.viewGrid = [];
            this.viewPos = { x: 0, y: 0 };
            this.classes.add(ClassesAppNav.Main);
            this.appInfo = AppInfo_1.default.create()
                .appendTo(this);
            viewManager.registerHashAction("overview", () => {
                viewManager.event.subscribeOnce("show", () => {
                    if (Bungie_11.default.authenticated)
                        URL_3.default.hash = "overview";
                });
            });
            this.tryInsertPlayerOverview();
            Bungie_11.default.event.subscribe("authenticated", this.tryInsertPlayerOverview);
            Bungie_11.default.event.subscribe("resetAuthentication", () => {
                this.playerOverview?.remove();
                delete this.playerOverview;
            });
            this.destinationsWrapper = Component_78.default.create()
                .classes.add(ClassesAppNav.Destinations)
                .appendTo(this);
            Component_78.default.create()
                .classes.add(ClassesAppNav.DestinationsClose)
                .event.subscribe("click", () => this.destinationsWrapper.classes.remove(Classes_24.Classes.Active))
                .appendTo(this);
            Button_21.default.create()
                .classes.add(ClassesAppNav.DestinationsToggle)
                .event.subscribe("click", () => this.destinationsWrapper.classes.toggle(Classes_24.Classes.Active))
                .appendTo(this.destinationsWrapper);
            const viewTree = {};
            for (const destinationViewHandler of Object.values(viewManager.registry)) {
                if (destinationViewHandler.noDestinationButton)
                    continue;
                let name = destinationViewHandler.definition.name;
                if (typeof name === "function")
                    name = name();
                const destinationButton = this.destinationButtons[destinationViewHandler.id] = Button_21.default.create()
                    .classes.add(ClassesAppNav.Destination, `app-nav-destination-${destinationViewHandler.id}`)
                    .classes.toggle((destinationViewHandler.definition.auth ?? "required") === "required", ClassesAppNav.DestinationAuthRequired)
                    .classes.toggle((destinationViewHandler.definition.auth) === "none", ClassesAppNav.DestinationNoAuthRequired)
                    .text.set(name ?? "Unknown View")
                    .tweak(destinationViewHandler.initialiseDestinationButton)
                    .event.subscribe("click", () => destinationViewHandler.show());
                if (!destinationViewHandler.parentViewId) {
                    destinationButton.appendTo(this.destinationsWrapper);
                    const column = this.viewGrid.length;
                    this.viewGrid.push([destinationViewHandler]);
                    viewTree[destinationViewHandler.id] ??= { buttons: [], column };
                    continue;
                }
                const branch = viewTree[destinationViewHandler.parentViewId];
                branch.buttons.push(destinationButton);
                this.viewGrid[branch.column].push(destinationViewHandler);
            }
            for (const [parentViewId, branch] of Object.entries(viewTree)) {
                if (!branch.buttons.length)
                    continue;
                const parentViewDestinationButton = this.destinationButtons[parentViewId];
                if (!parentViewDestinationButton) {
                    console.warn("Tried to child destination button(s) to a nonexistent parent:", parentViewId);
                    continue;
                }
                this.destinationDropdownWrappers.push(Component_78.default.create()
                    .classes.add(ClassesAppNav.DestinationChildren, `app-nav-destination-${parentViewId}-parent`)
                    .append(...branch.buttons)
                    .insertToAfter(this.destinationsWrapper, parentViewDestinationButton)
                    .prepend(parentViewDestinationButton));
            }
            viewManager.event.subscribe("show", ({ view }) => this.showing(view));
            Store_19.default.event.subscribe("setSettingsEquipmentView", this.refreshDestinationButtons);
            this.refreshDestinationButtons();
            UiEventBus_9.default.subscribe("keydown", this.onGlobalKeydown);
        }
        refreshDestinationButtons() {
            let showing = 0;
            for (const [id, destinationButton] of Object.entries(this.destinationButtons)) {
                const destinationViewHandler = viewManager.registry[id];
                const hidden = destinationViewHandler.displayDestinationButton?.() === false;
                destinationButton.classes.toggle(hidden, Classes_24.Classes.Hidden);
                if (!hidden && !destinationViewHandler.parentViewId)
                    showing++;
            }
            this.classes.toggle(showing > 6, ClassesAppNav.Compress);
        }
        showing(view) {
            for (const button of Object.values(this.destinationButtons))
                button.classes.remove(Classes_24.Classes.Active);
            for (const wrapper of this.destinationDropdownWrappers)
                wrapper.classes.remove(ClassesAppNav.DestinationChildActive);
            this.destinationButtons[view.definition.id]?.classes.add(Classes_24.Classes.Active);
            if (view.definition.parentViewId)
                this.destinationButtons[view.definition.id]?.parent()?.classes.add(ClassesAppNav.DestinationChildActive);
            document.documentElement.classList.add(ClassesAppNav.DocumentHasAppNav);
            this.destinationsWrapper.classes.remove(Classes_24.Classes.Active);
            const x = this.viewGrid.findIndex(column => column.some(handler => handler.id === view.definition.id));
            const y = this.viewGrid[x]?.findIndex(handler => handler.id === view.definition.id);
            this.viewPos = { x, y };
        }
        tryInsertPlayerOverview() {
            if (!Bungie_11.default.authenticated || this.playerOverview)
                return;
            this.playerOverview = PlayerOverview_1.default.create()
                .classes.add(ClassesAppNav.IdentityContainer)
                .insertToAfter(this, this.appInfo);
        }
        isDestinationVisible(id) {
            return !!this.destinationButtons[id].element.offsetWidth;
        }
        getActualViewY() {
            return Math.max(0, this.viewGrid[this.viewPos.x]
                .filter(view => this.isDestinationVisible(view.id))
                .indexOf(this.viewGrid[this.viewPos.x][this.viewPos.y]));
        }
        changeViewX(amount) {
            for (let x = this.viewPos.x + amount; x >= 0 && x < this.viewGrid.length; x += amount) {
                const column = this.viewGrid[x].filter(view => this.isDestinationVisible(view.id));
                if (!column.length)
                    continue;
                const view = column[Math.min(this.getActualViewY(), column.length - 1)];
                view.show();
                return;
            }
        }
        changeViewY(amount) {
            const column = this.viewGrid[this.viewPos.x].filter(view => this.isDestinationVisible(view.id));
            if (!column.length)
                return;
            const y = this.getActualViewY();
            const newY = Math.max(0, Math.min(y + amount, column.length - 1));
            if (y === newY)
                return;
            column[newY].show();
        }
        onGlobalKeydown(event) {
            if (!document.contains(this.element)) {
                UiEventBus_9.default.unsubscribe("keydown", this.onGlobalKeydown);
                return;
            }
            if (this.viewPos.x === -1 || this.viewPos.y === -1)
                return;
            switch (event.key) {
                case "ArrowDown":
                    return this.changeViewY(1);
                case "ArrowUp":
                    return this.changeViewY(-1);
                case "ArrowRight":
                    return this.changeViewX(1);
                case "ArrowLeft":
                    return this.changeViewX(-1);
            }
        }
    }
    AppNav.defaultType = "nav";
    exports.default = AppNav;
    __decorate([
        Bound_22.default
    ], AppNav.prototype, "refreshDestinationButtons", null);
    __decorate([
        Bound_22.default
    ], AppNav.prototype, "tryInsertPlayerOverview", null);
    __decorate([
        Bound_22.default
    ], AppNav.prototype, "onGlobalKeydown", null);
});
define("utility/Fonts", ["require", "exports", "ui/Component", "utility/Async"], function (require, exports, Component_79, Async_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Fonts;
    (function (Fonts) {
        const TEST_STRING = "mmmmm";
        const FONTS = {
            "neue-haas-grotesk": ["Neue Haas Grotesk Display Pro", "Neue Haas Grotesk Display", "Neue Haas Grotesk"],
        };
        async function check() {
            const monospaceSpan = Component_79.default.create("span")
                .style.set("font-family", "monospace")
                .style.set("opacity", "0")
                .style.set("user-select", "none")
                .style.set("pointer-events", "none")
                .style.set("font-size", "48px")
                .style.set("position", "absolute")
                .style.set("top", "0")
                .style.set("left", "0")
                .text.set(TEST_STRING)
                .appendTo(document.body);
            for (const [id, variants] of Object.entries(FONTS)) {
                const variantSpans = variants.map(variant => [variant, Component_79.default.create("span")
                        .style.set("font-family", `"${variant}", monospace`)
                        .style.set("opacity", "0")
                        .style.set("user-select", "none")
                        .style.set("pointer-events", "none")
                        .style.set("font-size", "48px")
                        .style.set("position", "absolute")
                        .style.set("top", "0")
                        .style.set("left", "0")
                        .text.set(TEST_STRING)
                        .appendTo(document.body)]);
                await Async_9.default.sleep(100);
                for (const [variant, span] of variantSpans) {
                    if (span.element.clientWidth !== monospaceSpan.element.clientWidth) {
                        Component_79.default.get(document.documentElement)
                            .style.set(`--font-${id}`, `"${variant}"`)
                            .classes.add(`has-font-${id}`);
                        break;
                    }
                }
                for (const [, span] of variantSpans) {
                    span.remove();
                }
            }
            monospaceSpan.remove();
        }
        Fonts.check = check;
    })(Fonts || (Fonts = {}));
    exports.default = Fonts;
});
define("DeepsightGG", ["require", "exports", "model/Model", "model/models/Activities", "ui/AppNav", "ui/BackgroundManager", "ui/UiEventBus", "ui/view/AuthView", "ui/ViewManager", "utility/endpoint/bungie/Bungie", "utility/Env", "utility/Fonts", "utility/URL"], function (require, exports, Model_24, Activities_2, AppNav_1, BackgroundManager_2, UiEventBus_10, AuthView_2, ViewManager_1, Bungie_12, Env_9, Fonts_1, URL_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    void screen?.orientation?.lock?.("portrait-primary").catch(() => { });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    window.Activities = Activities_2.default;
    class DeepsightGG {
        constructor() {
            void this.main();
        }
        async main() {
            UiEventBus_10.default.subscribe("keydown", event => {
                if (event.use("F6"))
                    for (const stylesheet of document.querySelectorAll("link[rel=stylesheet]")) {
                        const href = stylesheet.getAttribute("href");
                        const newHref = `${href.slice(0, Math.max(0, href.indexOf("?")) || Infinity)}?${Math.random().toString().slice(2)}`;
                        stylesheet.setAttribute("href", newHref);
                    }
                if (event.use("F4"))
                    document.documentElement.classList.add("persist-tooltips");
            });
            UiEventBus_10.default.subscribe("keyup", event => {
                if (event.use("F4"))
                    document.documentElement.classList.remove("persist-tooltips");
            });
            BackgroundManager_2.default.initialiseMain();
            await Env_9.default.load();
            void Fonts_1.default.check();
            Bungie_12.default.event.subscribe("resetAuthentication", async (_) => {
                await Model_24.default.clearCache();
                AuthView_2.default.show();
                document.documentElement.classList.remove("authenticated");
            });
            Bungie_12.default.event.subscribe("authenticated", _ => {
                document.documentElement.classList.add("authenticated");
            });
            await Bungie_12.default.authenticate("complete");
            if (Bungie_12.default.authenticated) {
                Bungie_12.default.event.subscribe("apiDown", () => document.body.classList.add("bungie-api-down"));
                Bungie_12.default.event.subscribe("querySuccess", () => document.body.classList.remove("bungie-api-down"));
                document.documentElement.classList.add("authenticated");
            }
            AppNav_1.default.create([ViewManager_1.default])
                .appendTo(document.body);
            const path = URL_4.default.path ?? URL_4.default.hash;
            if (path === AuthView_2.default.id) {
                URL_4.default.hash = null;
                URL_4.default.path = null;
            }
            ViewManager_1.default.showByHash(URL_4.default.path ?? URL_4.default.hash);
        }
    }
    exports.default = DeepsightGG;
});
define("utility/DOMRect", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function default_2() {
        Object.defineProperty(DOMRect.prototype, "centerX", {
            get() {
                return this.left + this.width / 2;
            },
        });
        Object.defineProperty(DOMRect.prototype, "centerY", {
            get() {
                return this.top + this.height / 2;
            },
        });
    }
    exports.default = default_2;
});
define("index", ["require", "exports", "DeepsightGG", "utility/Arrays", "utility/DOMRect"], function (require, exports, DeepsightGG_1, Arrays_14, DOMRect_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    (0, DOMRect_1.default)();
    Arrays_14.default.applyPrototypes();
    new DeepsightGG_1.default();
});
define("utility/endpoint/bungie/endpoint/destiny2/GetPGCR", ["require", "exports", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, BungieEndpoint_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_10.default
        .at((activityId) => `/Destiny2/Stats/PostGameCarnageReport/${activityId}/`)
        .returning()
        .allowErrorStatus("DestinyPGCRNotFound")
        .setSubdomain("stats");
});
define("model/models/RecentPGCR", ["require", "exports", "model/Model", "model/models/Manifest", "utility/Async", "utility/Time", "utility/endpoint/bungie/endpoint/destiny2/GetPGCR"], function (require, exports, Model_25, Manifest_27, Async_10, Time_7, GetPGCR_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var RecentPGCR;
    (function (RecentPGCR) {
        const RecentID = Model_25.default.create("recent pgcr", {
            cache: "Global",
            resetTime: "Daily",
            async generate() {
                let left = 14008975359;
                let right = 137438953470;
                let targetTime = new Date().setUTCHours(17, 0, 0, 0); // Destiny reset time
                if (targetTime > Date.now())
                    targetTime -= Time_7.default.days(1);
                let attempts = 0;
                while (true) {
                    attempts++;
                    console.debug("[PGCR Search] Current range:", left, right, "Query count:", attempts);
                    const mid = Math.floor((left + right) / 2);
                    const response = await GetPGCR_1.default.query(mid);
                    if ("period" in response) {
                        if (new Date(response.period).getTime() > targetTime)
                            return mid;
                        left = mid + 1;
                    }
                    else {
                        right = mid - 1;
                    }
                    if (attempts >= 100) {
                        console.error("[PGCR Search] Failed to find a recent PGCR.");
                        return undefined;
                    }
                    await Async_10.default.sleep(100);
                }
            },
        });
        /**
         * Starting at any PGCR created since the daily reset, searches one by one through them to find a match.
         * @param descriptor A human-readable descriptor
         * @param filter
         * @returns
         */
        async function search(descriptor, filter) {
            let id = await RecentID.await();
            if (id === undefined)
                return undefined;
            const { DestinyActivityDefinition } = await Manifest_27.default.await();
            let attempts = 0;
            while (true) {
                id++;
                attempts++;
                console.debug(`[PGCR Search] Searching for ${descriptor}. Query count:`, attempts);
                const pgcr = await GetPGCR_1.default.query(id);
                if (!("period" in pgcr))
                    continue;
                const activityDef = await DestinyActivityDefinition.get(pgcr.activityDetails.referenceId);
                if (!activityDef)
                    continue;
                if (filter(activityDef, pgcr)) {
                    console.log(`[PGCR Search] Found ${descriptor}:`, activityDef.displayProperties?.name, activityDef, pgcr);
                    return { pgcr, activityDef };
                }
                if (attempts >= 500) {
                    console.error(`[PGCR Search] Failed to find ${descriptor}...`);
                    return undefined;
                }
                await Async_10.default.sleep(100);
            }
        }
        RecentPGCR.search = search;
    })(RecentPGCR || (RecentPGCR = {}));
    exports.default = RecentPGCR;
});
define("utility/endpoint/bungie/endpoint/GetCoreSettings", ["require", "exports", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, BungieEndpoint_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_11.default.at("/Settings/")
        .returning();
});
define("model/models/Settings", ["require", "exports", "model/Model", "utility/endpoint/bungie/endpoint/GetCoreSettings"], function (require, exports, Model_26, GetCoreSettings_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Model_26.default.create("settings", {
        cache: "Global",
        resetTime: "Daily",
        generate: _ => GetCoreSettings_1.default.query(),
    });
});
define("ui/ExtraInfoManager", ["require", "exports", "ui/UiEventBus", "utility/Store"], function (require, exports, UiEventBus_11, Store_20) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExtraInfoManager {
        constructor() {
            this.enablers = new Set();
            UiEventBus_11.default.subscribe("keydown", event => {
                if (event.use("e"))
                    if (Store_20.default.items.settingsToggleExtra)
                        this.toggle("KEY");
                    else
                        this.enable("KEY");
            });
            UiEventBus_11.default.subscribe("keyup", event => {
                if (!Store_20.default.items.settingsToggleExtra && event.use("e"))
                    this.disable("KEY");
            });
            if (Store_20.default.items.settingsAlwaysShowExtra)
                document.documentElement.classList.add("show-extra-info");
            Store_20.default.event.subscribe("setSettingsAlwaysShowExtra", ({ value }) => this.update());
        }
        enable(id) {
            this.enablers.add(id);
            this.update();
            document.documentElement.classList.toggle("show-extra-info", !Store_20.default.items.settingsAlwaysShowExtra);
        }
        disable(id) {
            this.enablers.delete(id);
            if (!this.enablers.size)
                this.update();
        }
        update() {
            document.documentElement.classList.toggle("show-extra-info", !!Store_20.default.items.settingsAlwaysShowExtra === !this.enablers.size);
        }
        toggle(id, newState = !this.enablers.has(id)) {
            if (newState)
                this.enable(id);
            else
                this.disable(id);
        }
    }
    exports.default = new ExtraInfoManager;
});
define("ui/view/item/ItemMods", ["require", "exports", "ui/view/item/ItemSockets"], function (require, exports, ItemSockets_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // export enum ItemModsClasses {
    // 	Mod = "view-item-socket-plug-mod",
    // }
    class ItemMods extends ItemSockets_4.default {
        getTitle() {
            return "Weapon Mods";
        }
        initialise() {
            this.addSocketsByType("Mod");
        }
    }
    exports.default = ItemMods;
});
define("utility/endpoint/bungie/endpoint/destiny2/GetCharacter", ["require", "exports", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, BungieEndpoint_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_12.default
        .at((membershipType, destinyMembershipId, characterId, components) => `/Destiny2/${membershipType}/Profile/${destinyMembershipId}/Character/${characterId}/`)
        .request((membershipType, destinyMembershipId, characterId, components) => ({
        search: {
            components: components.join(","),
        },
    }))
        .returning();
});
define("utility/endpoint/bungie/endpoint/destiny2/GetVendor", ["require", "exports", "utility/endpoint/bungie/BungieEndpoint"], function (require, exports, BungieEndpoint_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BungieEndpoint_13.default
        .at((membershipType, destinyMembershipId, characterId, vendorHash, components) => `/Destiny2/${membershipType}/Profile/${destinyMembershipId}/Character/${characterId}/Vendors/${vendorHash}/`)
        .request((membershipType, destinyMembershipId, characterId, vendorHash, components) => ({
        search: {
            components: components.join(","),
        },
    }))
        .returning();
});
