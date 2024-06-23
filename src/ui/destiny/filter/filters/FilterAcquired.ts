import type { IEmblem } from "model/models/Emblems";
import ProfileBatch from "model/models/ProfileBatch";
import Collectibles from "model/models/items/Collectibles";
import Item from "model/models/items/Item";
import Filter, { IFilter } from "ui/destiny/filter/Filter";

export default IFilter.createBoolean<Item | IEmblem>({
	id: Filter.Acquired,
	colour: 0xAAAAAA,
	suggestedValues: ["acquired"],
	matches: value => "acquired".startsWith(value) || "obtained".startsWith(value),
	apply: (value, item) => value === ""
		|| Collectibles.isAcquired(ProfileBatch.latest, item.definition.collectibleHash)
		|| (item instanceof Item && !item.isNotAcquired()),
});
