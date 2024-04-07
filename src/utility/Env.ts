
export interface IEnvironment {
	DEEPSIGHT_ENVIRONMENT: "dev" | "beta" | "prod";
	DEEPSIGHT_PATH: string;
	DEEPSIGHT_BUNGIE_CLIENT_ID: string;
	DEEPSIGHT_BUNGIE_API_KEY: string;
	DEEPSIGHT_BUNGIE_API_SECRET: string;
	DEEPSIGHT_BUILD_NUMBER?: string;
	DEEPSIGHT_BUILD_SHA?: string;
}

interface Env extends Readonly<IEnvironment> { }
class Env {
	public async load () {
		const origin = location.origin;
		const root = location.pathname.startsWith("/beta/") ? "/beta/" : "/";
		Object.assign(this, await fetch(origin + root + "env.json").then(response => response.json()));
		document.documentElement.classList.add(`environment-${this.DEEPSIGHT_ENVIRONMENT}`);
		Object.assign(window, { Env: this });
	}

	public path (path: string) {
		if (path.startsWith("/"))
			path = path.slice(1);

		else if (path.startsWith("./"))
			path = path.slice(2);

		return this.DEEPSIGHT_PATH + path;
	}
}

export default new Env;
