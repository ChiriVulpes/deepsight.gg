
export interface IEnvironment {
	FVM_BUNGIE_CLIENT_ID: string;
	FVM_BUNGIE_API_KEY: string;
	FVM_BUNGIE_API_SECRET: string;
}

class Dummy { }

class Env extends (Dummy as new () => Readonly<IEnvironment>) {
	public async load () {
		Object.assign(this, await fetch("/env.json").then(response => response.json()));
	}
}

export default new Env;
