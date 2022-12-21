import { PlugType } from "model/models/items/Plugs";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import Button, { ButtonClasses } from "ui/form/Button";
import Drawer from "ui/form/Drawer";
import type { ItemSocket } from "ui/view/item/ItemSockets";
import ItemSockets, { ItemSocketsClasses } from "ui/view/item/ItemSockets";
import type { IItemPerkWishlist } from "utility/Store";
import Store from "utility/Store";

export enum ItemPerksClasses {
	Main = "view-item-perks",
	ButtonWishlistPerks = "view-item-perks-button-wishlist-perks",

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
}

export interface IItemPerksEvents extends ComponentEvents<typeof ItemSockets> {
	showCollections: Event;
}

export default class ItemPerks extends ItemSockets {

	public override event!: ComponentEventManager<this, IItemPerksEvents>;

	public wishlistDrawer!: Drawer;
	public wishlistButtonInput!: Button;
	public wishlistNameInput!: Component;
	private wishlists!: IItemPerkWishlist[];
	private sockets!: ItemSocket[];
	private editingWishlist?: IItemPerkWishlist;

	protected getTitle () {
		return "Weapon Perks";
	}

	protected override initialise () {
		this.classes.add(ItemPerksClasses.Main);
		this.sockets = this.addSocketsByPlugType(PlugType.Perk);

		if (this.item.instance) {
			Button.create()
				.classes.add(ItemSocketsClasses.TitleButton, ItemPerksClasses.ButtonWishlistPerks)
				.text.set("Wishlist Perks")
				.event.subscribe("click", () => this.event.emit("showCollections"))
				.appendTo(this.title);

			return;
		}

		this.wishlists = (Store.items[`item${this.item.definition.hash}PerkWishlists`] ??= [])
			.filter(wishlist => wishlist.name !== "" && wishlist.plugs.length > 0);

		this.saveWishlists();

		for (const socket of this.sockets) {
			for (const plug of socket.plugs) {
				plug.event.subscribe("click", () => {
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
						this.saveWishlists();
					}
				});
			}
		}

		this.wishlistNameInput = Component.create()
			.classes.add(ItemPerksClasses.WishlistNameInput)
			.text.set("WISHLIST")
			.attributes.set("contenteditable", "")
			.event.subscribe("input", () => {
				if (!this.editingWishlist)
					return;

				this.editingWishlist.name = this.wishlistNameInput.text.get()?.trim().slice(0, 20) ?? "";
				this.saveWishlists();
			})
			.event.subscribe("paste", this.onPaste);

		const wishlistContainer = Component.create()
			.classes.add(ItemPerksClasses.WishlistContainer)
			.event.subscribe("mouseenter", () => {
				if (this.editingWishlist)
					return;

				this.wishlistDrawer.open("mouse");
			})
			.event.subscribe("mouseleave", () => this.wishlistDrawer.close("mouse"))
			.appendTo(this.title);

		this.wishlistDrawer = Drawer.create()
			.classes.add(ItemPerksClasses.WishlistDrawer)
			.appendTo(wishlistContainer);

		this.wishlistDrawer.focusOnClick = false;

		this.renderWishlists();

		this.wishlistButtonInput = Button.create("div")
			.classes.add(ItemSocketsClasses.TitleButton, ItemPerksClasses.WishlistButtonAdd)
			.event.subscribe("click", () => {
				if (this.editingWishlist)
					return;

				this.editWishlist({ name: `Wishlist${this.wishlists.length ? ` ${this.wishlists.length + 1}` : ""}`, plugs: [] });
			})
			.append(Component.create()
				.classes.add(ItemPerksClasses.WishlistButtonAddPlusIcon))
			.append(this.wishlistNameInput)
			.append(Button.create()
				.classes.add(ItemPerksClasses.WishlistButtonConfirm)
				.event.subscribe("click", event => this.doneEditingWishlist(event))
				.append(Component.create()
					.classes.add(ItemPerksClasses.WishlistButtonConfirmIcon)))
			.appendTo(wishlistContainer);
	}

	private renderWishlists () {
		this.wishlistDrawer.removeContents();
		for (const wishlist of this.wishlists) {
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

	private editWishlist (wishlist: IItemPerkWishlist) {
		if (this.displayedWishlist)
			this.undisplayWishlist(this.displayedWishlist);

		if (!this.wishlists.includes(wishlist))
			this.wishlists.push(wishlist);

		this.editingWishlist = wishlist;
		this.classes.add(ItemPerksClasses.Wishlisting);
		this.wishlistButtonInput.classes.add(ButtonClasses.Selected);

		for (const socket of this.sockets) {
			for (const plug of socket.plugs) {
				plug.classes.toggle(wishlist.plugs.includes(plug.hash), ItemSocketsClasses.PlugSelected);
			}
		}

		this.wishlistNameInput.text.set(wishlist.name);
		window.getSelection()?.selectAllChildren(this.wishlistNameInput.element);
		this.wishlistDrawer.close(true);

		this.saveWishlists();
		this.renderWishlists();
	}

	private doneEditingWishlist (event: Event) {
		delete this.editingWishlist;
		this.classes.remove(ItemPerksClasses.Wishlisting);
		this.wishlistButtonInput.classes.remove(ButtonClasses.Selected);
		this.wishlistNameInput.text.set("WISHLIST");

		for (const socket of this.sockets)
			for (const plug of socket.plugs)
				plug.classes.remove(ItemSocketsClasses.PlugSelected);

		this.saveWishlists();
		this.renderWishlists();

		event.stopImmediatePropagation();
	}

	private removeWishlist (wishlist: IItemPerkWishlist) {
		if (this.displayedWishlist === wishlist)
			this.undisplayWishlist(wishlist);

		const index = this.wishlists.indexOf(wishlist);
		if (index >= 0)
			this.wishlists.splice(index, 1);

		this.saveWishlists();
		this.renderWishlists();
	}

	private saveWishlists () {
		Store.items[`item${this.item.definition.hash}PerkWishlists`] = this.wishlists;
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
