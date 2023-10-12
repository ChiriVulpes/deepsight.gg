import type EnumModel from "model/models/enum/EnumModel";
import Component from "ui/Component";
import type { DisplayPropertied } from "ui/bungie/DisplayProperties";
import type Arrays from "utility/Arrays";

export enum EnumIconClasses {
	Main = "enum-icon",
}

export type EnumModelIconPath = [model: EnumModel<any, DisplayPropertied>, id: Arrays.Or<string | number> | undefined];

export default class EnumIcon extends Component<HTMLElement, readonly [model: EnumModel<any, DisplayPropertied>, id: string | number | undefined]> {

	public static async applyIconVar (component: Component, model: EnumModel<any, DisplayPropertied>, id: Arrays.Or<string | number> | undefined, varName = "--icon", onApply?: (applied: boolean) => any) {
		const applied = await EnumIcon.applyIcon(model, id, iconPath => component.style.set(varName, `url(${iconPath})`));
		onApply?.(applied);
		return applied;
	}

	public static async applyIcon (model: EnumModel<any, DisplayPropertied>, id: Arrays.Or<string | number> | undefined, applicator: (path: string) => any) {
		const iconPath = await this.getIconPath(model, id);
		if (!iconPath)
			return false;

		applicator(iconPath);
		return true;
	}

	private static async getIconPath (model: EnumModel<any, DisplayPropertied>, id: Arrays.Or<string | number> | undefined) {
		const definition = await model.get(id);
		let iconPath = definition?.displayProperties.icon;
		if (!iconPath)
			return undefined;

		if (iconPath.startsWith("/"))
			iconPath = `https://www.bungie.net${iconPath}`;

		return iconPath;

	}

	protected static override defaultType = "img";

	protected override async onMake (model: EnumModel<any, DisplayPropertied>, id: string | number | undefined) {
		this.classes.add(EnumIconClasses.Main, `${EnumIconClasses.Main}-${model.id}`);

		const iconPath = await EnumIcon.getIconPath(model, id);
		if (iconPath)
			this.attributes.set("src", iconPath);
	}
}
