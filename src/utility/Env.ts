
export interface IEnvironment {
	DEEPSIGHT_ENVIRONMENT: "dev" | "prod";
	DEEPSIGHT_BUNGIE_CLIENT_ID: string;
	DEEPSIGHT_BUNGIE_API_KEY: string;
	DEEPSIGHT_BUNGIE_API_SECRET: string;
}

interface Env extends Readonly<IEnvironment> { }
class Env {
	public async load () {
		Object.assign(this, await fetch("/env.json").then(response => response.json()));
		document.documentElement.classList.add(`environment-${this.DEEPSIGHT_ENVIRONMENT}`);
	}
}

export default new Env;
