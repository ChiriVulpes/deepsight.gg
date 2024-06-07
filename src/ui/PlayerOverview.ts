import Characters from "model/models/Characters";
import EnumModel from "model/models/enum/EnumModel";
import Inventory from "model/models/Inventory";
import type { CharacterId } from "model/models/items/Item";
import { Classes } from "ui/Classes";
import BaseComponent from "ui/Component";
import type Dialog from "ui/Dialog";
import ClassPicker from "ui/form/ClassPicker";
import Drawer from "ui/form/Drawer";
import InfoBlock from "ui/InfoBlock";
import PlayerOverviewCharacterPanel, { PlayerOverviewCharacterPanelClasses } from "ui/inventory/playeroverview/PlayerOverviewCharacterPanel";
import PlayerOverviewIdentity from "ui/inventory/playeroverview/PlayerOverviewIdentity";
import SortManager from "ui/inventory/sort/SortManager";
import SwitchProfile from "ui/SwitchProfile";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import Async from "utility/Async";
import Bound from "utility/decorator/Bound";
import ProfileManager from "utility/ProfileManager";

export enum PlayerOverviewClasses {
	Main = "player-overview",
	Container = "player-overview-container",
	Drawer = "player-overview-drawer",
	ClassSelection = "player-overview-class-selection",
	CharacterPicker = "player-overview-character-picker",
	CharacterPickerButton = "player-overview-character-picker-button",
	WIP = "player-overview-wip",
	_LoadoutsVisible = "player-overview--loadouts-visible",
}

export enum SwitchProfileClasses {
	Main = "player-overview",
	Container = "player-overview-container",
	Drawer = "player-overview-drawer",
	ClassSelection = "player-overview-class-selection",
	CharacterPicker = "player-overview-character-picker",
	CharacterPickerButton = "player-overview-character-picker-button",
	WIP = "player-overview-wip",
	_LoadoutsVisible = "player-overview--loadouts-visible",
	SwitchProfile = "switch-profile",
	SwitchProfileList = "switch-profile-list",
}

export default class PlayerOverview extends BaseComponent {

	public identity!: PlayerOverviewIdentity;
	public drawer!: Drawer;
	private inventory?: Inventory;
	public currencyOverview!: InfoBlock;
	public classSelection!: BaseComponent;
	public characterPicker!: ClassPicker<CharacterId>;
	public loadoutsButton!: BaseComponent;
	private panels!: Record<CharacterId, PlayerOverviewCharacterPanel>;
	public dialog!: Dialog;

	protected override async onMake () {
		this.classes.add(PlayerOverviewClasses.Main);

		this.dialog = SwitchProfile.create()
			.appendTo(document.body);

		this.identity = PlayerOverviewIdentity.create()
			.event.subscribe("click", () => {
				this.dialog.open();
				this.drawer.close(true);
			})
			.appendTo(this);

		this.drawer = Drawer.create()
			.classes.add(PlayerOverviewClasses.Drawer)
			.event.subscribe("closeDrawer", _ => this.toggleLoadoutsVisible({ visible: false }))
			.appendTo(this);

		this.currencyOverview = InfoBlock.create()
			.append(BaseComponent.create()
				.classes.add(PlayerOverviewClasses.WIP))
			.appendTo(this.drawer);

		this.classSelection = BaseComponent.create()
			.classes.add(PlayerOverviewClasses.ClassSelection)
			.appendTo(this.drawer);

		this.characterPicker = (ClassPicker.create([]) as ClassPicker<CharacterId>)
			.classes.add(PlayerOverviewClasses.CharacterPicker)
			.event.subscribe("selectClass", event => {
				const panel = this.panels[event.option];
				if (!panel) {
					console.error(`Selected unknown option '${event.option}'`);
					return;
				}

				this.drawer.showPanel(this.panels[event.option]);
			})
			.appendTo(this.classSelection);

		this.panels = {};

		await EnumModel.awaitAll();
		await SortManager.init();

		this.event.subscribe("mouseenter", this.onMouseEnter);
		this.event.subscribe("mouseleave", event => {
			if (this.contains(document.elementFromPoint(event.clientX, event.clientY)))
				return;

			this.drawer.close("mouseenter");
		});

		document.body.addEventListener("click", this.onClick);

		UiEventBus.subscribe("keydown", this.onKeydown);
		UiEventBus.subscribe("keyup", this.onKeyup);

		viewManager.event.subscribe("show", () =>
			Async.schedule(10, this.showIfHash));

		viewManager.event.subscribe("initialise", this.showIfHash);

		this.drawer.event.subscribe("openDrawer", () => {
			const currentCharacterId = Characters.getCurrent()?.characterId;
			if (currentCharacterId)
				void this.characterPicker.setCurrent(currentCharacterId, true);
		});

		this.inventory = await Inventory.await();
		this.inventory.event.subscribe("update", this.update);
		this.inventory.event.subscribe("itemUpdate", this.update);
		this.update();
	}

	@Bound
	public update () {
		this.updateCharacters();
		this.drawer.enable();
	}

	private updateCharacters () {
		const characters = Characters.getSorted()
			.slice()
			// sort characters by active option so that the active option stays the visible panel
			.sort((a, b) => a.characterId === this.characterPicker.currentOption ? -1 : b.characterId === this.characterPicker.currentOption ? 1 : 0);

		if (!characters.length) {
			console.warn("No characters found");
			this.drawer.removePanels();
			this.panels = {};
			this.drawer.disable();
			return;
		}

		for (const character of characters) {
			const bucket = this.inventory?.getCharacterBuckets(character.characterId);

			if (!bucket) {
				console.warn(`No bucket found for the character ${character.characterId}`);
				this.drawer.removePanel(this.panels[character.characterId]);
				continue;
			}

			const panel = this.panels[character.characterId] ??= this.drawer.createPanel().make(PlayerOverviewCharacterPanel)
				.event.subscribe("toggleLoadouts", this.toggleLoadoutsVisible);
			panel.set(this.inventory!, character, bucket);

			const className = character.class?.displayProperties.name ?? "Unknown";
			const background = character.emblem?.secondarySpecial ?? character.emblemBackgroundPath;
			this.characterPicker.addOption({
				id: character.characterId,
				background: background && `https://www.bungie.net${background}`,
				icon: `https://raw.githubusercontent.com/justrealmilk/destiny-icons/master/general/class_${className.toLowerCase()}.svg`,
			});
		}

		// remove deleted characters
		for (const option of [...this.characterPicker.options])
			if (!characters.some(character => character.characterId === option.id))
				this.characterPicker.removeOption(option.id);
	}

	@Bound
	private onMouseEnter () {
		if (!ProfileManager.get())
			return;

		this.drawer.open("mouseenter");
	}

	@Bound
	private onClick (event: Event): void {
		if (!this.exists())
			return document.body.removeEventListener("click", this.onClick);

		if ((event.target as HTMLElement).closest(`.${PlayerOverviewClasses.Main}`))
			return;

		this.drawer.close(true);
	}

	@Bound
	private onKeydown (event: IKeyEvent) {
		if (!document.contains(this.element)) {
			UiEventBus.unsubscribe("keydown", this.onKeydown);
			return;
		}

		if ((event.use("c") || event.use("p") || event.use("o") || event.use("F1")) && ProfileManager.get() && this.drawer.toggle("key"))
			this.drawer.element.focus();

		if (this.drawer.isOpen() && event.useOverInput("Escape"))
			this.drawer.close(true);
	}

	@Bound
	private onKeyup (event: IKeyEvent) {
		if (!document.contains(this.element)) {
			UiEventBus.unsubscribe("keyup", this.onKeyup);
			return;
		}

		if (!this.element.contains(document.activeElement) && !event.matches("e"))
			this.drawer.close(true);
	}

	@Bound private showIfHash () {
		if (!ProfileManager.get())
			return;

		if (location.hash === "#overview")
			this.drawer.open("hash");
		else
			this.drawer.close(true);
	}

	@Bound
	private toggleLoadoutsVisible ({ visible }: { visible: boolean }) {
		for (const panel of Object.values(this.panels)) {
			this.classes.toggle(visible, PlayerOverviewClasses._LoadoutsVisible);
			panel.classes.toggle(visible, PlayerOverviewCharacterPanelClasses._LoadoutsVisible);
			panel.loadouts.classes.toggle(!visible, Classes.Hidden);
			panel.loadoutsCheckboxInternal.element.checked = visible;
		}
	}
}
