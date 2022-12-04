import WallpaperSources from "model/models/WallpaperSources";
import Card from "ui/Card";
import Component from "ui/Component";
import Button, { ButtonClasses } from "ui/form/Button";
import Checkbox from "ui/form/Checkbox";
import Loadable from "ui/Loadable";
import Store from "utility/Store";

enum SettingsBackgroundClasses {
	BackgroundOptions = "settings-background-options",
	InternalWrapper = "settings-background-options-wrapper",
	Wallpaper = "settings-background-options-wallpaper",
	WallpaperSource = "settings-background-options-wallpaper-source",
	WallpaperSourceWallpapers = "settings-background-options-wallpaper-source-list",
	WallpaperSourceLabel = "settings-background-options-wallpaper-source-label",
}

export default class SettingsBackground extends Card<[]> {
	protected override onMake (): void {
		super.onMake();
		this.title.text.set("Background");

		Loadable.create(WallpaperSources)
			.onReady(sources => Component.create()
				.classes.add(SettingsBackgroundClasses.InternalWrapper)
				.append(...[...sources].reverse().map(source => Component.create()
					.classes.add(SettingsBackgroundClasses.WallpaperSource)
					.append(Component.create()
						.classes.add(SettingsBackgroundClasses.WallpaperSourceLabel)
						.text.set(source.source.displayProperties.name))
					.append(Component.create()
						.classes.add(SettingsBackgroundClasses.WallpaperSourceWallpapers)
						.append(...source.wallpapers.map(wallpaper => Button.create()
							.classes.add(SettingsBackgroundClasses.Wallpaper)
							.classes.toggle(Store.items.settingsBackground === wallpaper, ButtonClasses.Selected)
							.event.subscribe("click", (event) => {
								document.querySelector(`.${SettingsBackgroundClasses.Wallpaper}.${ButtonClasses.Selected}`)
									?.classList.remove(ButtonClasses.Selected);
								if (Store.items.settingsBackground === wallpaper) {
									delete Store.items.settingsBackground;
									return;
								}

								(event.target as HTMLElement).classList.add(ButtonClasses.Selected);
								Store.items.settingsBackground = wallpaper;
							})
							.style.set("--wallpaper", `url("${wallpaper}")`)))))))
			.classes.add(SettingsBackgroundClasses.BackgroundOptions)
			.setSimple()
			.appendTo(this.content);

		Checkbox.create([Store.items.settingsBackgroundBlur])
			.tweak(checkbox => checkbox.label.text.set("Blur Background"))
			.event.subscribe("update", ({ checked }) =>
				Store.items.settingsBackgroundBlur = checked ? true : undefined)
			.appendTo(this.content);
	}
}
