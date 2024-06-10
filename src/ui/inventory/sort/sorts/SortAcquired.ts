import type { IEmblem } from "model/models/Emblems";
import ProfileBatch from "model/models/ProfileBatch";
import Collectibles from "model/models/items/Collectibles";
import Item from "model/models/items/Item";
import Sort, { ISort } from "ui/inventory/sort/Sort";

export default ISort.create<Item | IEmblem>({
	id: Sort.Acquired,
	name: "Acquired",
	sort: (a, b) => Number(!!isAcquired(b)) - Number(!!isAcquired(a)),
	renderSortable: sortable => sortable.icon,
});

function isAcquired (item: Item | IEmblem) {
	return Collectibles.isAcquired(ProfileBatch.latest, item.definition.collectibleHash)
		|| (item instanceof Item && !item.isNotAcquired());
}
