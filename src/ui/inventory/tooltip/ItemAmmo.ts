import { DestinyAmmunitionType } from "bungie-api-ts/destiny2";
import type Item from "model/models/items/Item";
import { Classes } from "ui/Classes";
import Component from "ui/Component";

export enum ItemAmmoClasses {
	Main = "item-ammo-type",
	Primary = "item-ammo-type-primary",
	Special = "item-ammo-type-special",
	Heavy = "item-ammo-type-heavy",
}

export default class ItemAmmo extends Component {
	protected override onMake (): void {
		this.classes.add(ItemAmmoClasses.Main);
	}

	public setItem (item: Item) {
		const ammoType = item.definition.equippingBlock?.ammoType;
		this.classes.toggle(!ammoType, Classes.Hidden);
		if (ammoType)
			this.classes.remove(ItemAmmoClasses.Primary, ItemAmmoClasses.Special, ItemAmmoClasses.Heavy)
				.classes.add(ammoType === DestinyAmmunitionType.Primary ? ItemAmmoClasses.Primary
					: ammoType === DestinyAmmunitionType.Special ? ItemAmmoClasses.Special
						: ammoType === DestinyAmmunitionType.Heavy ? ItemAmmoClasses.Heavy
							: ItemAmmoClasses.Main)
				.text.set(ammoType === DestinyAmmunitionType.Primary ? "Primary"
					: ammoType === DestinyAmmunitionType.Special ? "Special"
						: ammoType === DestinyAmmunitionType.Heavy ? "Heavy"
							: "");

		return this;
	}
}
