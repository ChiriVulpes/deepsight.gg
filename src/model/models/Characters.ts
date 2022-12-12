import type { DestinyCharacterComponent, DestinyClassDefinition, DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import Objects from "utility/Objects";
import Time from "utility/Time";

interface Character extends DestinyCharacterComponent {
	class: DestinyClassDefinition;
	emblem?: DestinyInventoryItemDefinition;
}

class Character {

	public static async get (characterComponent: DestinyCharacterComponent, manifest: Manifest) {
		const character = Objects.inherit(characterComponent, Character);

		const { DestinyClassDefinition, DestinyInventoryItemDefinition } = manifest;
		character.class = await DestinyClassDefinition.get(character.classHash)!;
		character.emblem = await DestinyInventoryItemDefinition.get(character.emblemHash);

		return character;
	}
}

export default Character;

export const ProfileCharacters = Model.createDynamic(Time.seconds(30), async progress => {
	progress.emitProgress(0 / 2, "Fetching characters");
	const profile = await Profile(DestinyComponentType.Characters).await();

	const manifest = await progress.subscribeProgressAndWait(Manifest, 1 / 2, 1 / 2);

	return Objects.mapAsync(profile.characters?.data ?? {}, async ([key, character]) =>
		[key, await Character.get(character, manifest)]);
});
