import { ItemCategoryHashes } from "@deepsight.gg/enums";
import Button, { ButtonClasses } from "ui/component/Button";
import { CardClasses } from "ui/component/Card";
import type { ComponentEventManager, ComponentEvents } from "ui/component/Component";
import Component from "ui/component/Component";
import Drawer from "ui/component/Drawer";
import Checkbox from "ui/component/form/Checkbox";
import { Classes } from "ui/utility/Classes";
import type { IKeyEvent } from "ui/utility/UiEventBus";
import UiEventBus from "ui/utility/UiEventBus";
import type { ItemSocket } from "ui/view/item/ItemSockets";
import ItemSockets, { ItemSocketsClasses } from "ui/view/item/ItemSockets";
import type { IItemPerkWishlist } from "utility/Store";
import Store from "utility/Store";
import Bound from "utility/decorator/Bound";

export enum ItemPerksClasses {
	Main = "view-item-perks",
	ButtonWishlistPerks = "view-item-perks-button-wishlist-perks",
	MarkedAsJunk = "view-item-perks-button-wishlist-perks-marked-as-junk",
	Shaped = "view-item-perks-button-wishlist-perks-shaped",

	ViewingWishlist = "view-item-perks-viewing-wishlist",
	Wishlisting = "view-item-perks-wishlisting",
	WishlistContainer = "view-item-perks-wishlist-container",
	WishlistButtonAdd = "view-item-perks-wishlist-button-add",
	WishlistButtonAddPlusIcon = "view-item-perks-wishlist-button-add-plus-icon",
	WishlistButtonConfirm = "view-item-perks-wishlist-button-confirm",
	WishlistButtonConfirmIcon = "view-item-perks-wishlist-button-confirm-icon",
	WishlistDrawer = "view-item-perks-wishlist-drawer",
	Wishlist = "view-item-perks-wishlist-drawer-wishlist",
	WishlistTitle = "view-item-perks-wishlist-drawer-wishlist-title",
	WishlistRemove = "view-item-perks-wishlist-drawer-wishlist-remove",
	WishlistRemoveIcon = "view-item-perks-wishlist-drawer-wishlist-remove-icon",
	WishlistNameInput = "view-item-perks-wishlist-name-input",
	NoRollsPlease = "view-item-perks-wishlist-no-rolls-please",
}

export interface IItemPerksEvents extends ComponentEvents<typeof ItemSockets> {
	showCollections: Event;
}

export default class ItemPerks extends ItemSockets {

	public override event!: ComponentEventManager<this, IItemPerksEvents>;

	public wishlistContainer!: Component;
	public wishlistDrawer!: Drawer;
	public wishlistButton!: Button;
	public wishlistNameInput!: Component;
	public wishlistConfirmButton!: Button;
	public wishlistNoRollsPlease!: Checkbox;
	private wishlists?: IItemPerkWishlist[];
	private sockets!: ItemSocket[];
	private editingWishlist?: IItemPerkWishlist;
	private backupEditingWishlist?: IItemPerkWishlist;

	protected getTitle () {
		const cats = this.item.definition.itemCategoryHashes;
		const catName = cats?.includes(ItemCategoryHashes.Sparrows) ? "Vehicle"
			: cats?.includes(ItemCategoryHashes.Armor) ? "Armour"
				: "Weapon";
		return `${catName} Perks`;
	}

	protected override initialise () {
		this.classes.add(ItemPerksClasses.Main);

		this.sockets = [];

		const randomIntrinsics = this.item.getCollectionsRandomIntrinsics();
		if (randomIntrinsics?.exotics)
			this.sockets.push(...this.addSocketsByType("Intrinsic/Exotic"));
		if (randomIntrinsics?.frames)
			this.sockets.push(...this.addSocketsByType("Intrinsic/Frame"));

		this.sockets.push(...this.addSocketsByType("Perk"));

		this.wishlists = Store.items[`item${this.item.baseItem?.hash ?? this.item.definition.hash}PerkWishlists`];

		if (this.item.instance) {
			Button.create()
				.classes.add(CardClasses.TitleButton, CardClasses.DisplayModeSectionTitleButton, ItemPerksClasses.ButtonWishlistPerks)
				.classes.toggle(this.wishlists?.length === 0, ItemPerksClasses.MarkedAsJunk)
				.classes.toggle(!!this.item.shaped, ItemPerksClasses.Shaped)
				.text.set(this.item.shaped ? "Weapon Level Perk Unlocks" : this.wishlists?.length === 0 ? "Marked as Junk" : "Wishlist Perks")
				.event.subscribe("click", () => this.event.emit("showCollections"))
				.appendTo(this.title);

			// move socketed plugs first
			for (const socket of this.sockets)
				for (const plug of socket.plugs)
					if (plug.plug?.socketed)
						plug.prependTo(socket);

			return;
		}

		// if (this.inventory.isCrafted(this.item.definition.hash)) {
		// 	delete Store.items[`item${this.item.definition.hash}PerkWishlists`];
		// 	return;
		// }

		this.saveWishlists({ preserveMarkedAsJunk: true });

		for (const socket of this.sockets) {
			for (const plug of socket.plugs) {
				plug.event.subscribe("click", () => {
					if (plug.plug?.is("Perk/TraitEnhanced"))
						return;

					if (!this.editingWishlist)
						this.editNewWishlist();

					plug.classes.toggle(ItemSocketsClasses.PlugSelected);
					if (this.editingWishlist) {
						const plugs = [];
						for (const socket of this.sockets) {
							for (const plug of socket.plugs) {
								if (plug.classes.has(ItemSocketsClasses.PlugSelected)) {
									plugs.push(plug.hash);
								}
							}
						}

						this.editingWishlist.plugs = plugs;
						this.saveWishlists({ preserveEmptyWishlists: true });
					}
				});
			}
		}

		this.wishlistNameInput = Component.create()
			.classes.add(ItemPerksClasses.WishlistNameInput)
			.text.set(this.wishlists?.length === 0 ? "MARKED AS JUNK" : "WISHLIST")
			.attributes.set("contenteditable", "")
			.attributes.add("inert")
			.event.subscribe("input", () => {
				if (!this.editingWishlist)
					return;

				this.editingWishlist.name = this.wishlistNameInput.text.get()?.trim().slice(0, 20) ?? "";
				this.saveWishlists({ preserveEmptyWishlists: true });
			})
			.event.subscribe("paste", this.onPaste);

		this.wishlistContainer = Component.create()
			.classes.add(ItemPerksClasses.WishlistContainer)
			.event.subscribe("mouseenter", () => {
				if (this.editingWishlist)
					return;

				this.wishlistDrawer.open("mouse");
				this.wishlistNameInput.text.set("WISHLIST");
				this.wishlistButton.classes.remove(ItemPerksClasses.MarkedAsJunk);
			})
			.event.subscribe("mouseleave", event => {
				if (this.wishlistContainer.contains(document.elementFromPoint(event.clientX, event.clientY)))
					return;

				this.wishlistDrawer.close("mouse");
				if (!this.editingWishlist) {
					const displayMarkedAsJunk = this.wishlists?.length === 0;
					this.wishlistNameInput.text.set(displayMarkedAsJunk ? "MARKED AS JUNK" : "WISHLIST");
					this.wishlistButton.classes.toggle(displayMarkedAsJunk, ItemPerksClasses.MarkedAsJunk);
				}
			})
			.appendTo(this.title);

		this.wishlistDrawer = Drawer.create()
			.classes.add(ItemPerksClasses.WishlistDrawer)
			.appendTo(this.wishlistContainer);

		this.wishlistDrawer.focusOnClick = false;

		this.renderWishlists();

		this.wishlistConfirmButton = Button.create()
			.classes.add(ItemPerksClasses.WishlistButtonConfirm)
			.attributes.add("inert")
			.event.subscribe("click", event => this.doneEditingWishlist(event))
			.append(Component.create()
				.classes.add(ItemPerksClasses.WishlistButtonConfirmIcon));

		this.wishlistButton = Button.create("div")
			.classes.add(CardClasses.TitleButton, CardClasses.DisplayModeSectionTitleButton, ItemPerksClasses.WishlistButtonAdd)
			.classes.toggle(this.wishlists?.length === 0, ItemPerksClasses.MarkedAsJunk)
			.attributes.set("tabindex", "0")
			.attributes.set("role", "button")
			.event.subscribe("click", () => {
				if (this.editingWishlist)
					return;

				this.editNewWishlist();
			})
			.append(Component.create()
				.classes.add(ItemPerksClasses.WishlistButtonAddPlusIcon))
			.append(this.wishlistNameInput)
			.append(this.wishlistConfirmButton)
			.appendTo(this.wishlistContainer);

		UiEventBus.until(viewManager.event.waitFor("hide"), events => events
			.subscribe("keydown", this.onKeydown));
	}

	private renderWishlists () {
		this.wishlistDrawer.removeContents();
		for (const wishlist of this.wishlists ?? []) {
			Component.create()
				.classes.add(ItemPerksClasses.Wishlist)
				.append(Button.create()
					.classes.add(ItemPerksClasses.WishlistTitle)
					.text.set(wishlist.name)
					.event.subscribe("click", () => this.editWishlist(wishlist)))
				.append(Button.create()
					.classes.add(ItemPerksClasses.WishlistRemove)
					.append(Component.create()
						.classes.add(ItemPerksClasses.WishlistRemoveIcon))
					.event.subscribe("click", () => this.removeWishlist(wishlist)))
				.event.subscribe("mouseenter", () => this.displayWishlist(wishlist))
				.event.subscribe("mouseleave", () => this.undisplayWishlist(wishlist))
				.appendTo(this.wishlistDrawer);
		}

		this.wishlistNoRollsPlease = Checkbox.create([this.wishlists?.length === 0])
			.classes.add(ItemPerksClasses.NoRollsPlease)
			.classes.toggle(!!this.wishlists?.length, Classes.Hidden)
			.attributes.toggle(!!this.wishlists?.length, "inert")
			.tweak(checkbox => checkbox.label.text.set("Mark all rolls as junk"))
			.tweak(checkbox => checkbox.description.text.set("No perk combination satisfies me!"))
			.event.subscribe("update", ({ checked }) => {
				if (!this.wishlists?.length) {
					this.wishlists = checked ? [] : undefined;
					this.saveWishlists({ preserveMarkedAsJunk: true });
				}
			})
			.appendTo(this.wishlistDrawer);
	}

	private displayedWishlist?: IItemPerkWishlist;
	private displayWishlist (wishlist: IItemPerkWishlist) {
		this.classes.add(ItemPerksClasses.ViewingWishlist);
		this.displayedWishlist = wishlist;

		for (const socket of this.sockets) {
			for (const plug of socket.plugs) {
				plug.classes.toggle(wishlist.plugs.includes(plug.hash), ItemSocketsClasses.PlugSelected);
			}
		}
	}

	private undisplayWishlist (wishlist: IItemPerkWishlist) {
		if (this.displayedWishlist !== wishlist)
			return;

		this.classes.remove(ItemPerksClasses.ViewingWishlist);
		for (const socket of this.sockets)
			for (const plug of socket.plugs)
				plug.classes.remove(ItemSocketsClasses.PlugSelected);
	}

	private editNewWishlist () {
		return this.editWishlist({ name: `Wishlist${this.wishlists?.length ? ` ${this.wishlists.length + 1}` : ""}`, plugs: [] });
	}

	private editWishlist (wishlist: IItemPerkWishlist) {
		if (this.displayedWishlist)
			this.undisplayWishlist(this.displayedWishlist);

		this.wishlists ??= [];
		if (!this.wishlists.includes(wishlist))
			this.wishlists.push(wishlist);

		this.backupEditingWishlist = { ...wishlist, plugs: [...wishlist.plugs] };
		this.editingWishlist = wishlist;
		this.classes.add(ItemPerksClasses.Wishlisting);
		this.wishlistButton.classes.add(ButtonClasses.Selected);

		for (const socket of this.sockets) {
			for (const plug of socket.plugs) {
				plug.classes.toggle(wishlist.plugs.includes(plug.hash), ItemSocketsClasses.PlugSelected);
			}
		}

		this.wishlistNameInput.attributes.remove("inert");
		this.wishlistConfirmButton.attributes.remove("inert");
		this.wishlistNameInput.text.set(wishlist.name);
		window.getSelection()?.selectAllChildren(this.wishlistNameInput.element);
		this.wishlistDrawer.close(true);

		this.saveWishlists({ preserveEmptyWishlists: true });
		this.renderWishlists();
	}

	private cancelEditingWishlist () {
		this.editingWishlist = this.backupEditingWishlist;
		this.doneEditingWishlist();
		if (this.wishlistNameInput.isFocused())
			this.wishlistButton.focus();
	}

	private doneEditingWishlist (event?: Event) {
		delete this.editingWishlist;
		this.classes.remove(ItemPerksClasses.Wishlisting);
		this.wishlistButton.classes.remove(ButtonClasses.Selected);

		this.wishlistNameInput.attributes.add("inert");
		this.wishlistConfirmButton.attributes.add("inert");

		for (const socket of this.sockets)
			for (const plug of socket.plugs)
				plug.classes.remove(ItemSocketsClasses.PlugSelected);

		this.saveWishlists();
		this.renderWishlists();

		event?.stopImmediatePropagation();

		const hovered = document.querySelectorAll(":hover");
		if (this.wishlistContainer.contains(hovered[hovered.length - 1]))
			this.wishlistDrawer.open("mouse");
	}

	private removeWishlist (wishlist: IItemPerkWishlist) {
		if (this.displayedWishlist === wishlist)
			this.undisplayWishlist(wishlist);

		const index = this.wishlists?.indexOf(wishlist);
		if (index !== undefined && index >= 0)
			this.wishlists!.splice(index, 1);

		this.saveWishlists();
		this.renderWishlists();
	}

	private cleanupWishlists (options?: { preserveEmptyWishlists?: boolean, preserveMarkedAsJunk?: boolean }) {
		if (!options?.preserveEmptyWishlists)
			this.wishlists = this.wishlists?.filter(wishlist => wishlist.name !== "" && wishlist.plugs.length > 0);

		if (!this.wishlists?.length && !options?.preserveMarkedAsJunk)
			delete this.wishlists;

		if (!this.editingWishlist) {
			const displayMarkedAsJunk = this.wishlists?.length === 0 && !this.wishlistDrawer?.isOpen();
			this.wishlistNameInput?.text.set(displayMarkedAsJunk ? "MARKED AS JUNK" : "WISHLIST");
			this.wishlistButton?.classes.toggle(displayMarkedAsJunk, ItemPerksClasses.MarkedAsJunk);
		}
	}

	private saveWishlists (options?: { preserveEmptyWishlists?: boolean, preserveMarkedAsJunk?: boolean }) {
		this.cleanupWishlists(options);
		Store.items[`item${this.item.baseItem?.hash ?? this.item.definition.hash}PerkWishlists`] = this.wishlists;
	}

	@Bound
	private onKeydown (event: IKeyEvent) {
		if (this.editingWishlist && event.useOverInput("Escape"))
			this.cancelEditingWishlist();

		if (this.wishlistButton.isFocused() && !this.editingWishlist && (event.use(" ") || event.use("Enter")))
			this.editNewWishlist();
	}

	private onPaste (event: ClipboardEvent) {
		event.preventDefault();

		const data = event.clipboardData?.getData("text/plain");
		if (!data)
			return;

		const selection = window.getSelection();
		for (let i = 0; i < (selection?.rangeCount ?? 0); i++) {
			const range = selection?.getRangeAt(i);
			if (!range)
				continue;

			if (!this.wishlistNameInput.element.contains(range.startContainer) || !this.wishlistNameInput.element.contains(range.endContainer))
				continue;

			range.deleteContents();
			range.insertNode(document.createTextNode(data.replace(/\n/g, "")));
			range.collapse();
		}
	}
}
