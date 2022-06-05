import { DestinyComponentType } from "bungie-api-ts/destiny2";
import DestinyEnums from "model/models/DestinyEnums";
import Manifest from "model/models/Manifest";
import Profile from "model/models/Profile";
import Component from "ui/Component";
import Loadable from "ui/Loadable";
import View from "ui/View";

export default class InventoryOverviewView extends View {

	public static readonly id = "overview";
	public static readonly destinationName = "Overview";

	public getName () {
		return InventoryOverviewView.destinationName;
	}

	protected onMakeView (): void {
		Loadable.create(DestinyEnums, Profile(DestinyComponentType.ProfileInventories, DestinyComponentType.CharacterInventories, DestinyComponentType.ItemSockets, DestinyComponentType.ItemStats), Manifest)
			.onReady((enums, profile, manifest) => {
				console.log(enums);
				console.log(profile);
				console.log(manifest);
				for (const item of profile.profileInventory.data?.items ?? []) {
					console.log(enums.BucketHashes.byHash(item.bucketHash));
				}
				return Component.create();
			})
			.appendTo(this.content);
	}
}
