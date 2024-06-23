import { DestinyBreakerType } from "bungie-api-ts/destiny2";
import BreakerTypes from "model/models/enum/BreakerTypes";
import type Item from "model/models/items/Item";
import Filter, { IFilter } from "ui/destiny/filter/Filter";

export default IFilter.async<Item>(async () => {
	return Promise.resolve({
		id: Filter.BreakerType,
		prefix: "stun:",
		colour: 0x620d4c,
		suggestedValues: ["", "overload", "barrier", "unstoppable"],
		or: true,
		apply: (value, item) => {
			const breakerType =
				value === "" ? DestinyBreakerType.None
					: "overload".startsWith(value) || "disruption".startsWith(value) ? DestinyBreakerType.Disruption
						: "unstoppable".startsWith(value) || "stagger".startsWith(value) ? DestinyBreakerType.Stagger
							: "barrier".startsWith(value) || "shield piercing".startsWith(value) ? DestinyBreakerType.ShieldPiercing
								: DestinyBreakerType.None;

			if (!breakerType)
				return !!item.breakerTypes?.length;

			return !!item.breakerTypes?.some(type => type.enumValue === breakerType);
		},
		icon: value => [
			BreakerTypes,
			value === "" ? undefined
				: "overload".startsWith(value) || "disruption".startsWith(value) ? DestinyBreakerType.Disruption
					: "unstoppable".startsWith(value) || "stagger".startsWith(value) ? DestinyBreakerType.Stagger
						: "barrier".startsWith(value) || "shield piercing".startsWith(value) ? DestinyBreakerType.ShieldPiercing
							: undefined,
		],
	});
});
