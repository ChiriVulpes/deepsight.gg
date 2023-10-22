import type { AllDestinyManifestComponents } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import { ClarityManifest } from "model/models/manifest/ClarityManifest";
import { DeepsightManifest } from "model/models/manifest/DeepsightManifest";
import DestinyManifest from "model/models/manifest/DestinyManifest";
import type { ManifestItem } from "model/models/manifest/IManifest";
import type { AllClarityDatabaseComponents } from "utility/endpoint/clarity/endpoint/GetClarityDatabase";
import type { AllDeepsightManifestComponents } from "utility/endpoint/deepsight/endpoint/GetDeepsightManifest";

const Manifest = Model.createTemporary(async api => {
	const destinyManifest = await api.subscribeProgressAndWait(DestinyManifest, 1 / 3);
	const deepsightManifest = await api.subscribeProgressAndWait(DeepsightManifest, 1 / 3, 1 / 3);
	const clarityManifest = await api.subscribeProgressAndWait(ClarityManifest, 1 / 3, 2 / 3);
	return {
		...destinyManifest,
		...deepsightManifest,
		...clarityManifest,
	}
});

type Manifest = {
	[COMPONENT_NAME in keyof AllDestinyManifestComponents | keyof AllDeepsightManifestComponents | keyof AllClarityDatabaseComponents]: ManifestItem<COMPONENT_NAME>;
};

export default Manifest;
