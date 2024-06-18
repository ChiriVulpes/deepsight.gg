import type { ActivityHashes } from "@deepsight.gg/enums";
import type { DeepsightDropTableDefinition as DeepsightDropTableDefinitionBase, DeepsightDropTableRotationsDefinition as DeepsightDropTableRotationsDefinitionBase, ISOString } from "../../../static/manifest/Interfaces";
import type DestinyManifestReference from "../DestinyManifestReference";
import CrotasEnd from "./CrotasEnd";
import DeepStoneCrypt from "./DeepStoneCrypt";
import Duality from "./Duality";
import GardenOfSalvation from "./GardenOfSalvation";
import GhostsOfTheDeep from "./GhostsOfTheDeep";
import GraspOfAvarice from "./GraspOfAvarice";
import KingsFall from "./KingsFall";
import LastWish from "./LastWish";
import PitOfHeresy from "./PitOfHeresy";
import Prophecy from "./Prophecy";
import RootOfNightmares from "./RootOfNightmares";
import SalvationsEdge from "./SalvationsEdge";
import SpireOfTheWatcher from "./SpireOfTheWatcher";
import TheShatteredThrone from "./TheShatteredThrone";
import VaultOfGlass from "./VaultOfGlass";
import VowOfTheDisciple from "./VowOfTheDisciple";
import WarlordsRuin from "./WarlordsRuin";

export interface DeepsightDropTableDefinition extends Omit<DeepsightDropTableDefinitionBase, "displayProperties" | "rotations" | "type" | "typeDisplayProperties" | "hash"> {
	hash: ActivityHashes;
	displayProperties?: DestinyManifestReference.DisplayPropertiesDefinition;
	rotations?: DeepsightDropTableRotationsDefinition;
	type?: DeepsightDropTableDefinitionBase["type"];
	typeDisplayProperties?: DeepsightDropTableDefinitionBase["typeDisplayProperties"];
}

export interface DeepsightDropTableRotationsDefinition extends Omit<DeepsightDropTableRotationsDefinitionBase, "interval" | "current" | "next"> {
	interval?: "daily";
	current?: number;
	next?: ISOString;
}

export default {
	[WarlordsRuin.hash]: WarlordsRuin,
	[GhostsOfTheDeep.hash]: GhostsOfTheDeep,
	[SpireOfTheWatcher.hash]: SpireOfTheWatcher,
	[Duality.hash]: Duality,
	[GraspOfAvarice.hash]: GraspOfAvarice,
	[Prophecy.hash]: Prophecy,
	[PitOfHeresy.hash]: PitOfHeresy,
	[TheShatteredThrone.hash]: TheShatteredThrone,

	[SalvationsEdge.hash]: SalvationsEdge,
	[CrotasEnd.hash]: CrotasEnd,
	[RootOfNightmares.hash]: RootOfNightmares,
	[KingsFall.hash]: KingsFall,
	[VowOfTheDisciple.hash]: VowOfTheDisciple,
	[VaultOfGlass.hash]: VaultOfGlass,
	[DeepStoneCrypt.hash]: DeepStoneCrypt,
	[GardenOfSalvation.hash]: GardenOfSalvation,
	[LastWish.hash]: LastWish,
} as Partial<Record<ActivityHashes | "trials" | "nightfall" | "lostSector" | "exoticMission", DeepsightDropTableDefinition>>;
