import Database from "utility/Database";

export interface ICachedModel<T> {
	cacheTime: number;
	persist?: true;
	value: T;
	version: string | number;
}

export interface IModelCache {
	models: ICachedModel<any>;
}

export default Database.schema<IModelCache>("modelCache",
	database => {
		database.createObjectStore("models");
	},
);
