
export interface IEnvironment {
	FVM_BUNGIE_CLIENT_ID: string;
	FVM_BUNGIE_API_KEY: string;
	FVM_BUNGIE_API_SECRET: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Env extends Readonly<IEnvironment> { }
class Env {
	public async load () {
		Object.assign(this, await fetch("/env.json").then(response => response.json()));
	}
}

export default new Env;
