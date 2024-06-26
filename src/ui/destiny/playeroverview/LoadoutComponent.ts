import type { Loadout } from "model/models/Loadouts";
import { ButtonClasses } from "ui/component/Button";
import Component from "ui/component/Component";
import LoadedIcon from "ui/component/LoadedIcon";
import { ItemClasses } from "ui/destiny/component/IItemComponent";
import LoadoutTooltip from "ui/destiny/playeroverview/LoadoutTooltip";

export enum LoadoutClasses {
	Main = "loadout",
	Image = "loadout-image",
	ImageWrapper = "loadout-image-wrapper",
	ImageIcon = "loadout-image-icon",
	ImageBackground = "loadout-image-background",
	Number = "loadout-number",
	_Empty = "loadout--empty",
	_Unknown = "loadout--unknown",
}

export default class LoadoutComponent extends Component {

	public loadout?: Loadout;

	public imageWrapper!: Component;
	public icon!: LoadedIcon;
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

		this.setTooltip(LoadoutTooltip, {
			initialise: tooltip => tooltip.set(this.loadout),
			differs: tooltip => tooltip.loadout !== this.loadout,
		});
	}

	public set (index: number, loadout?: Loadout) {
		this.loadout = loadout;
		this.number.text.set(`${index + 1}`);
		this.style.set("--index", `${index}`);
		this.background.setPath(this.loadout?.colour && `https://www.bungie.net${this.loadout.colour.colorImagePath}`);
		this.icon.setPath(this.loadout?.icon && `https://www.bungie.net${this.loadout.icon.iconImagePath}`);
		this.classes.toggle(loadout?.isEmpty() ?? false, LoadoutClasses._Empty);
		this.classes.toggle(!loadout, LoadoutClasses._Unknown);
		return this;
	}
}
