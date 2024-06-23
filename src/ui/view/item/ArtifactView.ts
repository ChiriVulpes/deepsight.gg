import { InventoryBucketHashes } from "@deepsight.gg/enums";
import type { IModelGenerationApi } from "model/Model";
import Model from "model/Model";
import Characters from "model/models/Characters";
import Inventory from "model/models/Inventory";
import Manifest from "model/models/Manifest";
import type Item from "model/models/items/Item";
import type { CharacterId } from "model/models/items/Item";
import Button from "ui/component/Button";
import Component from "ui/component/Component";
import ItemComponent from "ui/destiny/component/ItemComponent";
import Display from "ui/utility/DisplayProperties";
import LoadingManager from "ui/utility/LoadingManager";
import View from "ui/view/View";
import { ItemViewClasses } from "ui/view/item/ItemView";
import Objects from "utility/Objects";
import Strings from "utility/Strings";

export async function resolveArtifactURL (url: string | undefined, api: IModelGenerationApi) {
	const inventory = await api.subscribeProgressAndWait(Inventory.createModel(), 1 / 4, 2 / 4);
	url = !url ? url : Strings.sliceTo(url, "/");
	return inventory.getBucket(InventoryBucketHashes.SeasonalArtifact, (url ?? Characters.getCurrent()?.characterId) as CharacterId | undefined)?.equippedItem;
}

enum ArtifactViewClasses {
	Item = "view-artifact-header-item",
	ItemDefinition = "view-artifact-definition",
	FlavourText = "view-artifact-flavour-text",
}

const artifactViewBase = View.create({
	models: (itemOrCharacterId?: Item | string) =>
		[Manifest, Inventory.createModel(), Model.createTemporary(async api => typeof itemOrCharacterId === "object" ? itemOrCharacterId : resolveArtifactURL(itemOrCharacterId, api), "resolveArtifactURL")] as const,
	id: "artifact",
	name: (itemOrCharacterId?: Item | string) => (typeof itemOrCharacterId !== "string" ? itemOrCharacterId?.definition.displayProperties.name : undefined) ?? "Artifact Details",
	hash: (itemOrCharacterId?: Item | string) => typeof itemOrCharacterId === "string" ? `artifact/${itemOrCharacterId}` : itemOrCharacterId?.bucket.characterId ? `artifact/${itemOrCharacterId.bucket.characterId}` : "artifact",
	noDestinationButton: true,
	subView: true,
	initialise: async (view, manifest, inventory, itemResult) => {
		LoadingManager.end(view.definition.id);

		const item = itemResult;
		if (!item) {
			view.setTitle(title => title.text.set("No Artifact Was Found..."));
			view.setSubtitle("small", subtitle => subtitle.text.set("Your ghost continues its search..."));

			// const content = Component.create()
			// 	.appendTo(view.content);

			// Button.create()
			// 	.text.set("View Collections")
			// 	.setPrimary()
			// 	.setAttention()
			// 	.event.subscribe("click", () => viewManager.showCollections())
			// 	.appendTo(content);
			return;
		}

		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).$i = (window as any).item = item;
		console.log(Display.name(item.definition), item);

		view.updateHash(item);

		view.header.classes.add("view-item-header");
		view.classes.toggle(!item.instance, ArtifactViewClasses.ItemDefinition)
			.setTitle(title => title.text.set(item.definition.displayProperties.name)
				.classes.add("view-item-title"))
			.setSubtitle("caps", subtitle => subtitle.text.set(item.definition.itemTypeDisplayName));

		if (item.definition.screenshot)
			view.setBackground(`https://www.bungie.net${item.definition.screenshot}`);

		if (!item.bucket.isCollections()) {
			const lockButton = Button.create()
				.classes.add(ItemViewClasses.LockButton)
				.classes.toggle(item.isLocked(), ItemViewClasses.LockButtonLocked)
				.event.subscribe("click", async () => {
					lockButton.classes.toggle(ItemViewClasses.LockButtonLocked);
					const locked = await item.setLocked(lockButton.classes.has(ItemViewClasses.LockButtonLocked));
					lockButton.classes.toggle(locked, ItemViewClasses.LockButtonLocked);
				})
				.appendTo(view.title);
		}

		ItemComponent.create([item])
			.classes.add(ItemViewClasses.Item)
			.clearTooltip()
			.setDisableInteractions()
			.event.subscribe("mouseenter", () => {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				(window as any).$i = (window as any).item = item;
				console.log(Display.name(item.definition), item);
			})
			.prependTo(view.header);

		Component.create("p")
			.classes.add(ArtifactViewClasses.FlavourText)
			.text.set(item.definition.flavorText)
			.appendTo(view.header);

	},
});

type ArtifactViewBase = typeof artifactViewBase;
interface ArtifactViewClass extends ArtifactViewBase { }
class ArtifactViewClass extends View.Handler<readonly [typeof Manifest, Model.Impl<Inventory>, Model.Impl<Item | undefined>], [itemOrCharacterId?: string | Item]> {
}

const ArtifactView = Objects.inherit(artifactViewBase, ArtifactViewClass);
export default ArtifactView;
