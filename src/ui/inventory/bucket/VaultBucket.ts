import type Character from "model/models/Characters";
import BucketComponent from "ui/inventory/bucket/Bucket";

export enum VaultBucketClasses {
	Main = "view-inventory-slot-vault-bucket",
}

export default class VaultBucket extends BucketComponent<[Character?]> {

	public character?: Character;

	protected override onMake (character?: Character): void {
		super.onMake(character);
		this.character = character;
		this.classes.add(VaultBucketClasses.Main);
		this.icon.style.set("--icon", "url(\"https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/vault2.svg\")");
		this.title.text.add("Vault");
		const className = character?.class?.displayProperties.name;
		if (className)
			this.title.text.add(` (${className})`);
	}
}