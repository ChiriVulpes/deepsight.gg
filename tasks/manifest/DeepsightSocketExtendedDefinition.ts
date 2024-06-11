import { InventoryItemHashes } from "@deepsight.gg/enums";
import type { DeepsightSocketExtendedDefinition } from "@deepsight.gg/interfaces";
import fs from "fs-extra";
import Task from "../utility/Task";

export default Task("DeepsightSocketExtendedDefinition", async () => {
	const DeepsightSocketExtendedDefinition: Partial<Record<InventoryItemHashes, DeepsightSocketExtendedDefinition>> = {
		[InventoryItemHashes.RelativismHunterCloak]: {
			hash: InventoryItemHashes.RelativismHunterCloak,
			sockets: {
				[10]: {
					reusablePlugItems: [
						{ plugItemHash: InventoryItemHashes.SpiritOfTheAssassinIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfInmostLightIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheOphidianIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheDragonIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfGalanorIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheFoetracerIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfCalibanIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfRenewalIntrinsicPlug },
					],
				},
				[11]: {
					reusablePlugItems: [
						{ plugItemHash: InventoryItemHashes.SpiritOfTheStarEaterIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfSynthocepsIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfVerityIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheCyrtarachneIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheGyrfalconIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheLiarIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheWormhuskIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheCoyoteIntrinsicPlug },
					],
				},
			},
		},
		[InventoryItemHashes.StoicismTitanMark]: {
			hash: InventoryItemHashes.StoicismTitanMark,
			sockets: {
				[10]: {
					reusablePlugItems: [
						{ plugItemHash: InventoryItemHashes.SpiritOfTheAssassinIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfInmostLightIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheOphidianIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfSeveranceIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfHoarfrostIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheEternalWarriorIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheAbeyantIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheBearIntrinsicPlug },
					],
				},
				[11]: {
					reusablePlugItems: [
						{ plugItemHash: InventoryItemHashes.SpiritOfTheStarEaterIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfSynthocepsIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfVerityIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfContactIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfScarsIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheHornIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfAlphaLupiIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheArmamentariumIntrinsicPlug },
					],
				},
			},
		},
		[InventoryItemHashes.SolipsismWarlockBond]: {
			hash: InventoryItemHashes.SolipsismWarlockBond,
			sockets: {
				[10]: {
					reusablePlugItems: [
						{ plugItemHash: InventoryItemHashes.SpiritOfTheAssassinIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfInmostLightIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheOphidianIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheStagIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheFilamentsIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheNecroticIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfOsmiomancyIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfApotheosisIntrinsicPlug },
					],
				},
				[11]: {
					reusablePlugItems: [
						{ plugItemHash: InventoryItemHashes.SpiritOfTheStarEaterIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfSynthocepsIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfVerityIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfVesperIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfHarmonyIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfStarfireIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheSwarmIntrinsicPlug },
						{ plugItemHash: InventoryItemHashes.SpiritOfTheClawIntrinsicPlug },
					],
				},
			},
		},
	};

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightSocketExtendedDefinition.json", DeepsightSocketExtendedDefinition, { spaces: "\t" });
});
