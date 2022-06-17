
export interface IEnvironment {
	FVM_ENVIRONMENT: "dev" | "prod";
	FVM_BUNGIE_CLIENT_ID: string;
	FVM_BUNGIE_API_KEY: string;
	FVM_BUNGIE_API_SECRET: string;
}

interface Env extends Readonly<IEnvironment> { }
class Env {
	public async load () {
		Object.assign(this, await fetch("/env.json").then(response => response.json()));
		document.documentElement.classList.add(`environment-${this.FVM_ENVIRONMENT}`);
	}
}

export default new Env;
