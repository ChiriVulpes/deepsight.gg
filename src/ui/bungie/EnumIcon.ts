import type EnumModel from "model/models/EnumModel";
import Component from "ui/Component";
import type { DisplayPropertied } from "ui/bungie/DisplayProperties";

export enum EnumIconClasses {
	Main = "enum-icon",
}

export default class EnumIcon extends Component<HTMLElement, readonly [model: EnumModel<any, DisplayPropertied>, id: string | number | undefined]> {

	protected static override defaultType = "img";

	protected override async onMake (model: EnumModel<any, DisplayPropertied>, id: string | number | undefined) {
		this.classes.add(EnumIconClasses.Main, `${EnumIconClasses.Main}-${model.id}`);

		const definition = await model.get(id);
		let iconPath = definition?.displayProperties.icon;
		if (!iconPath)
			return;

		if (iconPath.startsWith("/"))
			iconPath = `https://www.bungie.net${iconPath}`;

		this.attributes.set("src", iconPath);
	}
}
