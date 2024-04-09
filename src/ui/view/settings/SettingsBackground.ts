import WallpaperMoments from "model/models/WallpaperMoments";
import Card from "ui/Card";
import Component from "ui/Component";
import Button, { ButtonClasses } from "ui/form/Button";
import Checkbox from "ui/form/Checkbox";
import Loadable from "ui/Loadable";
import Env from "utility/Env";
import Store from "utility/Store";

enum SettingsBackgroundClasses {
	BackgroundOptions = "settings-background-options",
	InternalWrapper = "settings-background-options-wrapper",
	Wallpaper = "settings-background-options-wallpaper",
	WallpaperLoadingThumbnail = "settings-background-options-wallpaper-loading-thumbnail",
	WallpaperMoment = "settings-background-options-wallpaper-moment",
	WallpaperMomentWallpapers = "settings-background-options-wallpaper-moment-list",
	WallpaperMomentLabel = "settings-background-options-wallpaper-moment-label",
	WallpaperImage = "settings-background-options-wallpaper-image",
}

export default class SettingsBackground extends Card<[]> {
	protected override onMake (): void {
		super.onMake();
		this.title.text.set("Background");

		const remotepath = "https://deepsight.gg/";
		let scrollLeft = 0;
		const momentsWrapper = Loadable.create(WallpaperMoments)
			.onReady(moments => Component.create()
				.classes.add(SettingsBackgroundClasses.InternalWrapper)
				.append(...[...moments].reverse().map(moment => Component.create()
					.classes.add(SettingsBackgroundClasses.WallpaperMoment)
					.append(Component.create()
						.classes.add(SettingsBackgroundClasses.WallpaperMomentLabel)
						.text.set(moment.moment.displayProperties.name))
					.append(Component.create()
						.classes.add(SettingsBackgroundClasses.WallpaperMomentWallpapers)
						.append(...moment.wallpapers.map(wallpaper => Button.create()
							.classes.add(SettingsBackgroundClasses.Wallpaper)
							.classes.toggle(Store.items.settingsBackground === wallpaper, ButtonClasses.Selected)
							.event.subscribe("click", (event) => {
								document.querySelector(`.${SettingsBackgroundClasses.Wallpaper}.${ButtonClasses.Selected}`)
									?.classList.remove(ButtonClasses.Selected);
								if (Store.items.settingsBackground === wallpaper) {
									delete Store.items.settingsBackground;
									Store.items.settingsBackgroundNoUseDefault = true;
									return;
								}

								(event.target as HTMLElement).classList.add(ButtonClasses.Selected);
								Store.items.settingsBackground = wallpaper;
								Store.items.settingsBackgroundNoUseDefault = true;
							})
							.append(Component.create("img")
								.classes.add(SettingsBackgroundClasses.WallpaperImage)
								.attributes.set("loading", "lazy")
								.attributes.set("src", wallpaper.startsWith(remotepath) ? `${Env.DEEPSIGHT_PATH}${wallpaper.slice(remotepath.length)}` : wallpaper))
							.tweak(button => button.attributes.set("data-wallpaper", wallpaper))))))))
			.classes.add(SettingsBackgroundClasses.BackgroundOptions)
			.setSimple()
			.event.subscribe("wheel", event => {
				if (event.shiftKey)
					return;

				if (Math.sign(event.deltaY) !== Math.sign(scrollLeft - momentsWrapper.element.scrollLeft))
					scrollLeft = momentsWrapper.element.scrollLeft;

				scrollLeft += event.deltaY;
				if (scrollLeft + momentsWrapper.element.clientWidth > momentsWrapper.element.scrollWidth)
					scrollLeft = momentsWrapper.element.scrollWidth - momentsWrapper.element.clientWidth;
				if (scrollLeft < 0)
					scrollLeft = 0;

				momentsWrapper.element.scrollLeft = scrollLeft;
			})
			.appendTo(this.content);

		// async function renderThumbnails () {
		// 	let hasUnloadedThumbnail = false;
		// 	let i = -1;
		// 	for (const button of sourcesWrapper.element.getElementsByClassName(SettingsBackgroundClasses.Wallpaper)) {
		// 		i++;
		// 		if (button.classList.contains(SettingsBackgroundClasses.WallpaperLoadingThumbnail))
		// 			continue;

		// 		if (sourcesWrapper.element.scrollLeft + 500 > i * 144) {
		// 			button.classList.add(SettingsBackgroundClasses.WallpaperLoadingThumbnail);
		// 			button.append(await createWallpaperThumbnail((button as HTMLElement).dataset.wallpaper!));
		// 			continue;
		// 		}

		// 		hasUnloadedThumbnail = true;
		// 	}

		// 	if (hasUnloadedThumbnail)
		// 		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		// 		setTimeout(renderThumbnails, 1);
		// }

		// void Async.sleep(500).then(renderThumbnails);

		const randomiseCheckbox = Checkbox.create([!Store.items.settingsBackground && !Store.items.settingsBackgroundNoUseDefault])
			.tweak(checkbox => checkbox.label.text.set("Randomise"))
			.event.subscribe("update", ({ checked }) => {
				Store.items.settingsBackgroundNoUseDefault = checked ? undefined : true;
				if (!Store.items.settingsBackgroundNoUseDefault) {
					delete Store.items.settingsBackground;
					document.querySelector(`.${SettingsBackgroundClasses.Wallpaper}.${ButtonClasses.Selected}`)
						?.classList.remove(ButtonClasses.Selected);
				}
			})
			.appendTo(this.content);

		Store.subscribeBackgroundChange(() =>
			randomiseCheckbox.checkbox.element.checked = !Store.items.settingsBackground && !Store.items.settingsBackgroundNoUseDefault);

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
