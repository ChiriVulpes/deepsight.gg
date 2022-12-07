import WallpaperSources, { createWallpaperThumbnail } from "model/models/WallpaperSources";
import Card from "ui/Card";
import Component from "ui/Component";
import Button, { ButtonClasses } from "ui/form/Button";
import Checkbox from "ui/form/Checkbox";
import Loadable from "ui/Loadable";
import Async from "utility/Async";
import Store from "utility/Store";

enum SettingsBackgroundClasses {
	BackgroundOptions = "settings-background-options",
	InternalWrapper = "settings-background-options-wrapper",
	Wallpaper = "settings-background-options-wallpaper",
	WallpaperLoadingThumbnail = "settings-background-options-wallpaper-loading-thumbnail",
	WallpaperSource = "settings-background-options-wallpaper-source",
	WallpaperSourceWallpapers = "settings-background-options-wallpaper-source-list",
	WallpaperSourceLabel = "settings-background-options-wallpaper-source-label",
}

export default class SettingsBackground extends Card<[]> {
	protected override onMake (): void {
		super.onMake();
		this.title.text.set("Background");

		let scrollLeft = 0;
		const sourcesWrapper = Loadable.create(WallpaperSources)
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
							.tweak(button => button.attributes.set("data-wallpaper", wallpaper))))))))
			.classes.add(SettingsBackgroundClasses.BackgroundOptions)
			.setSimple()
			.event.subscribe("wheel", event => {
				if (event.shiftKey)
					return;

				if (Math.sign(event.deltaY) !== Math.sign(scrollLeft - sourcesWrapper.element.scrollLeft))
					scrollLeft = sourcesWrapper.element.scrollLeft;

				scrollLeft += event.deltaY;
				if (scrollLeft + sourcesWrapper.element.clientWidth > sourcesWrapper.element.scrollWidth)
					scrollLeft = sourcesWrapper.element.scrollWidth - sourcesWrapper.element.clientWidth;
				if (scrollLeft < 0)
					scrollLeft = 0;

				sourcesWrapper.element.scrollLeft = scrollLeft;
			})
			.appendTo(this.content);

		async function renderThumbnails () {
			let hasUnloadedThumbnail = false;
			let i = -1;
			for (const button of sourcesWrapper.element.getElementsByClassName(SettingsBackgroundClasses.Wallpaper)) {
				i++;
				if (button.classList.contains(SettingsBackgroundClasses.WallpaperLoadingThumbnail))
					continue;

				if (sourcesWrapper.element.scrollLeft + 500 > i * 144) {
					button.classList.add(SettingsBackgroundClasses.WallpaperLoadingThumbnail);
					button.append(await createWallpaperThumbnail((button as HTMLElement).dataset.wallpaper!));
					continue;
				}

				hasUnloadedThumbnail = true;
			}

			if (hasUnloadedThumbnail)
				// eslint-disable-next-line @typescript-eslint/no-misused-promises
				setTimeout(renderThumbnails, 1);
		}

		void Async.sleep(500).then(renderThumbnails);

		Checkbox.create([Store.items.settingsBackgroundBlur])
			.tweak(checkbox => checkbox.label.text.set("Blur Background"))
			.event.subscribe("update", ({ checked }) =>
				Store.items.settingsBackgroundBlur = checked ? true : undefined)
			.appendTo(this.content);

		Checkbox.create([Store.items.settingsBackgroundFollowMouse])
			.tweak(checkbox => checkbox.label.text.set("Follow Mouse"))
			.event.subscribe("update", ({ checked }) =>
				Store.items.settingsBackgroundFollowMouse = checked ? true : undefined)
			.appendTo(this.content);
	}
}
