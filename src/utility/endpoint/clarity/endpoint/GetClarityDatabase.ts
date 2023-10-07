import Endpoint from "utility/endpoint/Endpoint";
import type { ClarityDescription } from "utility/endpoint/clarity/endpoint/GetClarityDescriptions";
import GetClarityDescriptions from "utility/endpoint/clarity/endpoint/GetClarityDescriptions";

export interface AllClarityDatabaseComponents {
	ClarityDescriptions: Record<number, ClarityDescription>;
}

export default (new class extends Endpoint<AllClarityDatabaseComponents> {
	public constructor () {
		super("");
	}

	public override async query (): Promise<AllClarityDatabaseComponents> {
		return {
			ClarityDescriptions: await GetClarityDescriptions.query(),
		};
	}
})
