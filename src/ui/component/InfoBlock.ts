import Component from "ui/component/Component";

export enum InfoBlockClasses {
	Main = "info-block",
	Borders2 = "info-block-borders2",
}

export default class InfoBlock extends Component {
	protected override onMake (): void {
		this.classes.add(InfoBlockClasses.Main);
		Component.create()
			.classes.add(InfoBlockClasses.Borders2)
			.appendTo(this);
	}
}
