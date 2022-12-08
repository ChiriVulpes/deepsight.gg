# deepsight.gg
### Destiny 2 Vault Manager

deepsight.gg is definitely not at the same level of development as Destiny Item Manager, but I'd like to think it handles the basics well! 
### Current features include:
- View all weapons and armour on your characters and in vault, separated into pages by slot (this results in displaying more items at one time.)
- Customise the sort/filter of your items in the inventory view. Your sort settings persist.
- Set a preferred distribution for armour drops, and sort by how closely a piece of armour fits that distribution. (Eventually you'll be able to set multiple preferred distributions for each character and switch between them at will, but currently it's just the one setting.)
- Display information on items based on the sorts applied. (For example, if you sort by distribution, power, and energy type, it would display the distribution, power, and energy type on the items.)
- Move items between characters, the vault, and the postmaster.
- Inspect items for more information. (More features coming here soon.)
- View an animation when one or two items is the highest power item in a slot.
- High-performance tooltips.

### Coming (hopefully) soon:
- Better mobile support.
- View an overview of your current power, equipped gear, and highest-power items in each slot.
- View all possible perk rolls on an item and add rolls for each to your wishlist. When an item you have rolls wishlisted for *isn't* one of your wishlisted rolls, it appears with a trash bin icon on it.
- Switch perks and mods in-app.

## Notes & Credits
deepsight.gg would not exist without the prior art of other community-made Destiny apps (mainly [Destiny Item Manager](https://app.destinyitemmanager.com/) and [Braytech](https://bray.tech/)) and the amazing resources that are:
- [Bungie API TypeScript support](https://github.com/DestinyItemManager/bungie-api-ts)
- [d2-additional-info](https://github.com/DestinyItemManager/d2-additional-info)
- [Destiny Icons](https://github.com/justrealmilk/destiny-icons)

Some (rare) parts of deepsight.gg are ported straight from DIM, such as [RecoilDirection.ts](src/ui/inventory/tooltip/stats/RecoilDirection.ts). There is basically zero chance I would've been smart enough to do that, given that I'm primarily a UI/UX developer.

deepsight.gg takes heavy hints from both Destiny 2 and Braytech. There is nothing that I love more than making UI look pretty and be easy to use, and the UIs in Braytech especially have been a huge inspiration.
