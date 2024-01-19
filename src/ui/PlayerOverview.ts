import type { UserMembershipData } from "bungie-api-ts/user";
import Characters from "model/models/Characters";
import Inventory from "model/models/Inventory";
import type { CharacterId } from "model/models/items/Item";
import Memberships from "model/models/Memberships";
import BaseComponent from "ui/Component";
import ClassPicker from "ui/form/ClassPicker";
import Drawer from "ui/form/Drawer";
import InfoBlock from "ui/InfoBlock";
import PlayerOverviewCharacterPanel from "ui/inventory/playeroverview/PlayerOverviewCharacterPanel";
import SortManager from "ui/inventory/sort/SortManager";
import Loadable from "ui/Loadable";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import Async from "utility/Async";
import Bound from "utility/decorator/Bound";

export enum PlayerOverviewClasses {
	Main = "player-overview",
	Container = "player-overview-container",
	Identity = "player-overview-identity",
	IdentityUsername = "player-overview-identity-username",
	IdentityCode = "player-overview-identity-code",
	Drawer = "player-overview-drawer",
	ClassSelection = "player-overview-class-selection",
	CharacterPicker = "player-overview-character-picker",
	CharacterPickerButton = "player-overview-character-picker-button",
	WIP = "player-overview-wip",
}

namespace PlayerOverview {

	export class Component extends BaseComponent<HTMLElement, [UserMembershipData, Inventory]> {
		public drawer!: Drawer;
		private inventory!: Inventory;
		public currencyOverview!: InfoBlock;
		public classSelection!: BaseComponent;
		public characterPicker!: ClassPicker<CharacterId>;
		private panels!: Record<CharacterId, PlayerOverviewCharacterPanel>;

		public displayName!: string;
		public code!: string;

		protected override async onMake (memberships: UserMembershipData, inventory: Inventory) {
			this.classes.add(PlayerOverviewClasses.Main);
			this.inventory = inventory;
			this.displayName = memberships.bungieNetUser.cachedBungieGlobalDisplayName;
			this.code = `${memberships.bungieNetUser.cachedBungieGlobalDisplayNameCode ?? "????"}`.padStart(4, "0");

			BaseComponent.create()
				.classes.add(PlayerOverviewClasses.Identity)
				.append(BaseComponent.create()
					.classes.add(PlayerOverviewClasses.IdentityUsername)
					.text.set(memberships.bungieNetUser.cachedBungieGlobalDisplayName))
				.append(BaseComponent.create()
					.classes.add(PlayerOverviewClasses.IdentityCode)
					.text.set(`#${this.code}`))
				.event.subscribe("click", () => this.drawer.open("click"))
				.appendTo(this);

			this.drawer = Drawer.create()
				.classes.add(PlayerOverviewClasses.Drawer)
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

			await SortManager.init();

			inventory.event.subscribe("update", this.update);
			inventory.event.subscribe("itemUpdate", this.update);
			this.update();

			this.event.subscribe("mouseenter", () => this.drawer.open("mouseenter"));
			this.event.subscribe("mouseleave", () => this.drawer.close("mouseenter"));

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
				const bucket = this.inventory.getCharacterBuckets(character.characterId);

				if (!bucket) {
					console.warn(`No bucket found for the character ${character.characterId}`);
					this.drawer.removePanel(this.panels[character.characterId]);
					continue;
				}

				const panel = this.panels[character.characterId] ??= this.drawer.createPanel().make(PlayerOverviewCharacterPanel);
				panel.set(this.inventory, character, bucket);

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

			if ((event.use("c") || event.use("p") || event.use("o") || event.use("F1")) && this.drawer.toggle("key"))
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
			if (location.hash === "#overview")
				this.drawer.open("hash");
			else
				this.drawer.close(true);
		}
	}


	export function create (): Loadable.Component {
		return Loadable.create(Memberships, Inventory.await())
			.onReady((memberships, inventory) => Component.create([memberships, inventory]))
			.setSimple()
			.classes.add(PlayerOverviewClasses.Container);
	}
}

export default PlayerOverview;
