import { Classes } from "ui/Classes";
import Component from "ui/Component";
import Button from "ui/form/Button";
import Drawer from "ui/form/Drawer";
import Loadable from "ui/Loadable";
import LoadingManager from "ui/LoadingManager";
import TextLogo from "ui/TextLogo";
import AboutView from "ui/view/AboutView";
import Env from "utility/Env";

export enum AppInfoClasses {
	Container = "app-info-container",
	Drawer = "app-info-drawer",
	LogoContainer = "app-info-logo-container",
	Logo = "app-info-logo",
	Title = "app-info-title",
	Versions = "app-info-versions",
	ApiDownWarning = "app-info-api-down-warning",
	Links = "app-info-links",
	Row = "app-info-row",
}

export default class AppInfo extends Component {
	protected override onMake (): void {
		this.classes.add(AppInfoClasses.Container);

		Loadable.create(LoadingManager.model)
			.onReady(() => Component.create()
				.classes.add(AppInfoClasses.Logo, Classes.Logo))
			.classes.add(AppInfoClasses.LogoContainer)
			.setSimple()
			.setPersistent()
			.prependTo(this);

		TextLogo.create()
			.classes.add(AppInfoClasses.Title)
			.appendTo(this);

		const appInfoDrawer = Drawer.create()
			.classes.add(AppInfoClasses.Drawer)
			.appendTo(this);

		appInfoDrawer.createPanel()
			.append(Component.create()
				.classes.add(Classes.ShowIfAPIDown, AppInfoClasses.ApiDownWarning)
				.append(Component.create("h3")
					.classes.add(Classes.WarningText)
					.text.set("Bungie API Error"))
				.append(Component.create("p")
					.text.set("I promise it's not my fault! Probably!"))
				.append(Component.create("p")
					.text.set("Consider checking ")
					.append(Component.create("a")
						.attributes.set("href", "https://twitter.com/BungieHelp")
						.attributes.set("target", "_blank")
						.text.set("Bungie Help"))
					.text.add(" on Twitter.")))
			.append(Component.create()
				.classes.add(AppInfoClasses.Row)
				.append(Component.create("label")
					.text.set("A fresh take on vault management..."))
				.append(Button.create()
					.text.set("About / FAQ")
					.event.subscribe("click", () => AboutView.show())))
			.append(Component.create()
				.classes.add(AppInfoClasses.Links)
				.append(Component.create("h3")
					.text.set("Feature requests? Bug reports?"))
				.append(Component.create("p")
					.text.add("Come chat on the ")
					.append(Component.create("a")
						.attributes.set("href", "https://discord.gg/dMFRMXZZnY")
						.attributes.set("target", "_blank")
						.text.set("Discord"))
					.text.add("!"))
				.append(Component.create("h3")
					.text.set("Open source!"))
				.append(Component.create("p")
					.text.add("Check out the project's ")
					.append(Component.create("a")
						.attributes.set("href", "https://github.com/ChiriVulpes/deepsight.gg")
						.attributes.set("target", "_blank")
						.text.set("GitHub"))
					.text.add("!")))
			.append(Component.create()
				.classes.add(Classes.SmallText, AppInfoClasses.Versions)
				.text.set("deepsight.gg /// ")
				.text.add(Env.DEEPSIGHT_BUILD_NUMBER ? `build #${Env.DEEPSIGHT_BUILD_NUMBER} // ${Env.DEEPSIGHT_BUILD_SHA?.slice(0, 7) ?? ""}` : "unknown build"));

		this.event.subscribe("click", () => appInfoDrawer.open("click"))
			.event.subscribe("mouseenter", () => appInfoDrawer.open("mouse"))
			.event.subscribe("mouseleave", () => appInfoDrawer.close("mouse"));

		document.body.addEventListener("click", event => {
			const element = event.target as HTMLElement | null;
			if (!element?.closest(`.${AppInfoClasses.Container}`))
				appInfoDrawer.close("click");
		});

	}
}
