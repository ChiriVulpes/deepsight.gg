import type { DeepsightDropTableDefinition as DeepsightDropTableDefinitionBase } from "../../../static/manifest/Interfaces";
import type DestinyManifestReference from "../DestinyManifestReference";
import type { ActivityHashes } from "../Enums";
import CrotasEnd from "./CrotasEnd";
import GhostsOfTheDeep from "./GhostsOfTheDeep";
import KingsFall from "./KingsFall";
import LastWish from "./LastWish";
import Prophecy from "./Prophecy";
import RootOfNightmares from "./RootOfNightmares";
import SpireOfTheWatcher from "./SpireOfTheWatcher";
import WarlordsRuin from "./WarlordsRuin";

export interface DeepsightDropTableDefinition extends Omit<DeepsightDropTableDefinitionBase, "displayProperties"> {
	displayProperties?: {
		name?: string | DestinyManifestReference;
		description?: string | DestinyManifestReference;
		icon?: string | DestinyManifestReference;
	};
}

export default {
	[WarlordsRuin.hash]: WarlordsRuin,
	[GhostsOfTheDeep.hash]: GhostsOfTheDeep,
	[SpireOfTheWatcher.hash]: SpireOfTheWatcher,
	// [Duality.hash]: Duality,
	// [GraspOfAvarice.hash]: GraspOfAvarice,
	[Prophecy.hash]: Prophecy,
	// [PitOfHeresy.hash]: PitOfHeresy,
	// [TheShatteredThrone.hash]: TheShatteredThrone,

	[CrotasEnd.hash]: CrotasEnd,
	[RootOfNightmares.hash]: RootOfNightmares,
	[KingsFall.hash]: KingsFall,
	// [VowOfTheDisciple.hash]: VowOfTheDisciple,
	// [VaultOfGlass.hash]: VaultOfGlass,
	// [DeepStoneCrypt.hash]: DeepStoneCrypt,
	// [GardenOfSalvataion.hash]: GardenOfSalvataion,
	[LastWish.hash]: LastWish,
} as Partial<Record<ActivityHashes | "trials" | "nightfall" | "lostSector", DeepsightDropTableDefinition>>;
