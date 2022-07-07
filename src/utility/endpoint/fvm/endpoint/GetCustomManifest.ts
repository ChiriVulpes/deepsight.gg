import Endpoint from "utility/endpoint/Endpoint";
import type { DestinySourceDefinition } from "utility/endpoint/fvm/endpoint/GetDestinySourceDefinition";
import GetDestinySourceDefinition from "utility/endpoint/fvm/endpoint/GetDestinySourceDefinition";

export interface AllCustomManifestComponents {
	DestinySourceDefinition: Record<number, DestinySourceDefinition>;
}

export default (new class extends Endpoint<AllCustomManifestComponents> {
	public constructor () {
		super("");
	}

	public override async query (): Promise<AllCustomManifestComponents> {
		return {
			DestinySourceDefinition: await this.getSources(),
		};
	}

	private async getSources () {
		const sources = await GetDestinySourceDefinition.query();
		for (const [hash, source] of Object.entries(sources))
			source.hash = +hash;
		return sources;
	}
})
