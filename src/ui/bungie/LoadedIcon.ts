import Component from "ui/Component";

export enum LoadedIconClasses {
	Main = "loaded-icon",
	Loading = "loaded-icon-loading",
}

export default class LoadedIcon extends Component<HTMLImageElement, [path?: string]> {

	public static override defaultType = "img";

	protected override onMake (path?: string): void {
		this.classes.add(LoadedIconClasses.Main);
		this.setPath(path);
		this.event.subscribe("load", () => this.classes.remove(LoadedIconClasses.Loading));
	}

	public setPath (path?: string) {
		if (this.attributes.get("src") !== path) {
			this.classes.add(LoadedIconClasses.Loading);
			this.attributes.set("src", path);
		}

		return this;
	}
}