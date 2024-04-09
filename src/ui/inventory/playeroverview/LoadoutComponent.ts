import type { Loadout } from "model/models/Loadouts";
import Component from "ui/Component";
import LoadedIcon from "ui/bungie/LoadedIcon";
import { ButtonClasses } from "ui/form/Button";
import ItemComponent, { ItemClasses } from "ui/inventory/ItemComponent";

export enum LoadoutClasses {
	Main = "loadout",
	Image = "loadout-image",
	ImageWrapper = "loadout-image-wrapper",
	ImageIcon = "loadout-image-icon",
	ImageBackground = "loadout-image-background",
	Number = "loadout-number",
}

export default class LoadoutComponent extends ItemComponent {

	public loadout!: Loadout;

	public imageWrapper!: Component;
	public override icon!: LoadedIcon;
	public background!: LoadedIcon;
	public number!: Component;

	// eslint-disable-next-line @typescript-eslint/require-await
	protected override async onMake () {
		this.classes.add(ButtonClasses.Main, ItemClasses.Main, LoadoutClasses.Main);
		this.clearTooltip();

		this.imageWrapper = Component.create()
			.classes.add(LoadoutClasses.ImageWrapper)
			.appendTo(this);

		this.background = LoadedIcon.create([])
			.classes.add(ItemClasses.Icon, LoadoutClasses.Image, LoadoutClasses.ImageBackground)
			.appendTo(this.imageWrapper);

		this.icon = LoadedIcon.create([])
			.classes.add(ItemClasses.Icon, LoadoutClasses.Image, LoadoutClasses.ImageIcon)
			.appendTo(this.imageWrapper);

		this.number = Component.create()
			.classes.add(LoadoutClasses.Number)
			.appendTo(this);
	}

	public set (loadout: Loadout) {
		this.loadout = loadout;
		this.background.setPath(this.loadout.colour && `https://www.bungie.net${this.loadout.colour.colorImagePath}`);
		this.icon.setPath(this.loadout.icon && `https://www.bungie.net${this.loadout.icon.iconImagePath}`);
	}

	public setIndex (index: number) {
		this.number.text.set(`${index + 1}`);
		this.style.set("--index", `${index}`);
		return this;
	}
}
