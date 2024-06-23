import type { Character } from "model/models/Characters";
import type Inventory from "model/models/Inventory";
import Component from "ui/component/Component";
import LoadoutComponent from "ui/destiny/playeroverview/LoadoutComponent";
import { Classes } from "ui/utility/Classes";

export enum LoadoutsClasses {
	Main = "loadouts",
}

export default class LoadoutsComponent extends Component {

	public loadouts!: LoadoutComponent[];

	protected override onMake (): void {
		this.classes.add(LoadoutsClasses.Main, Classes.Hidden);

		this.loadouts = [];
		for (let i = 0; i < 10; i++)
			this.loadouts.push(LoadoutComponent.create([])
				.appendTo(this));
	}

	public set (inventory: Inventory, character: Character) {
		for (let i = 0; i < 10; i++) {
			const loadout = character.loadouts[i];
			this.loadouts[i].set(i, loadout);
		}
	}
}
