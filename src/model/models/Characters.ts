import { DestinyClass, type DestinyCharacterComponent, type DestinyClassDefinition, type DestinyInventoryItemDefinition, type DestinyProfileProgressionComponent, type SingleComponentResponse } from "bungie-api-ts/destiny2";
import type { ILoadoutsProfile, Loadout } from "model/models/Loadouts";
import Loadouts from "model/models/Loadouts";
import Manifest from "model/models/Manifest";
import ProfileBatch from "model/models/ProfileBatch";
import type { CharacterId } from "model/models/items/Item";
import { EventManager } from "utility/EventManager";
import Objects from "utility/Objects";

export interface Character extends Omit<DestinyCharacterComponent, "characterId"> {
	characterId: CharacterId;
	class: DestinyClassDefinition;
	emblem?: DestinyInventoryItemDefinition;
	/**
	 * The average power level of your equipped gear. 
	 * 
	 * To get the average power level of your equipped gear *plus* your seasonal artefact bonus, see the `light` property.
	 */
	power: number;
	loadouts: Loadout[];
}

interface IProfileProgression {
	profileProgression?: SingleComponentResponse<DestinyProfileProgressionComponent>;
}

export class Character {

	public static async get (characterComponent: DestinyCharacterComponent, manifest: Manifest, profile: IProfileProgression & ILoadoutsProfile) {
		const character = new Character();
		Object.assign(character, characterComponent);

		const { DestinyClassDefinition, DestinyInventoryItemDefinition } = manifest;
		character.class = await DestinyClassDefinition.get(character.classHash)!;
		character.emblem = await DestinyInventoryItemDefinition.get(character.emblemHash);
		character.power = (character.light ?? 0) - (profile.profileProgression?.data?.seasonalArtifact.powerBonus ?? 0);
		await Loadouts.apply(character, profile);
		// character.stat = await DestinyStatDefinition.get(CLASSES[character.classType]);

		return character;
	}
}

type Characters = Record<CharacterId, Character>;

let charactersReadyPromise: Promise<void> | undefined;
let characters: Characters = {};
let charactersSorted: Character[] = [];
ProfileBatch.event.subscribe("loaded", ({ value: profile }) => {
	charactersReadyPromise = (async () => {
		const manifest = await Manifest.await();
		characters = await Objects.mapAsync(profile.characters?.data ?? {}, async ([key, character]) =>
			[key, await Character.get(character, manifest, profile)]);
		charactersSorted = Object.values(characters)
			.sort(({ dateLastPlayed: dateLastPlayedA }, { dateLastPlayed: dateLastPlayedB }) =>
				new Date(dateLastPlayedB).getTime() - new Date(dateLastPlayedA).getTime());
		Characters.event.emit("loaded", { characters, sorted: charactersSorted });
	})();
});

namespace Characters {
	export interface ICharactersEvents {
		loaded: { characters: Characters, sorted: Character[] };
	}

	export const event = new EventManager<{}, ICharactersEvents>({});

	export async function awaitReady () {
		return await charactersReadyPromise;
	}

	/**
	 * @returns Whether deepsight.gg has any characters available
	 */
	export function hasAny () {
		return !!charactersSorted.length;
	}

	/**
	 * @returns A record of character IDs to Character class
	 */
	export function all () {
		return characters;
	}

	/**
	 * @returns The Character of a given character ID, if available
	 */
	export function get (id?: CharacterId): Character | undefined {
		return characters[id!];
	}

	/**
	 * @returns Characters sorted most recently active first
	 */
	export function getSorted () {
		return charactersSorted;
	}

	/**
	 * @returns Characters of the given DestinyClass, sorted most recently active first
	 */
	export function byClassType (classType: DestinyClass) {
		return charactersSorted
			.filter(character => character.classType === classType);
	}

	/**
	 * @returns Distinct character class types sorted most recently active first
	 */
	export function getSortedClasses () {
		return getSorted()
			.map(character => character.classType)
			.distinct();
	}

	/**
	 * @returns The most recently active character
	 */
	export function getCurrent (): Character | undefined {
		return charactersSorted[0];
	}

	/**
	 * @returns The Character class of a given character ID, if available. Otherwise, the most recently active character
	 */
	export function getOrCurrent (id?: CharacterId): Character | undefined {
		return characters?.[id!] ?? charactersSorted[0];
	}
}

export default Characters;
