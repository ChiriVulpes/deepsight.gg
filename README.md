# [deepsight.gg](https://deepsight.gg)
### Another Destiny 2 Item Manager

Yes, yes, I know. Retreading ground that's already been tread. To be fair, though, the whole reason I did this is because there's stuff that I needed that DIM didn't handle — namely, sorting armour by stat distribution, and wishlisting specific rolls of weapons.

No, deepsight.gg is definitely not at the same level of development as Destiny Item Manager, but I'd like to think it handles the basics well! If you give it a try, thanks!

## Slot Views
One view per slot — Kinetic, Energy, Power, Helmet, Arms, Chest, Legs, Class Item. This results in more items being displayable at one time, at a larger size, and allows quickly transferring them between characters and the vault. I know it's not like DIM — it's not supposed to be!

All views display the postmaster for each character.

The highest power 1 or 2 item(s) in each slot displays with a special animation. Never dismantle these ones except for infusion, or you'll lower your drop power!

![image](https://user-images.githubusercontent.com/6081834/209422574-9c48fc61-18ae-4fc6-83fc-0596dc85b836.png)

## Details View
Right clicking on weapons displays the perks and stats of weapons, just like in-game.

![image](https://user-images.githubusercontent.com/6081834/211501897-bf3a5ad2-d8c0-44cb-827d-48a5759de14d.png)

## Persistent, highly-customisable sort/filter
### Weapon Sorts 
- Power
- Name
- Ammo Type
- Masterwork
- Rarity
- Shaped
- Source (ie the little watermark icon on all items)
- Gives Pattern Progress

![image](https://user-images.githubusercontent.com/6081834/209422608-cc25fb7f-fe12-4ee2-9ef7-3e1aa53d7443.png)

### Armour Sorts
- Power
- Name
- Energy
- Masterwork
- Rarity
- Shaped
- Source
- Stat Total
- Stat Distribution (Customisable, targeted distribution per-class. See below.)

![image](https://user-images.githubusercontent.com/6081834/209422617-e2c972e6-088f-42df-b4a4-6c4f30a0d11f.png)

### Press E to show details on items 
Which details display on them depends on what they're being sorted by.
 
![image](https://user-images.githubusercontent.com/6081834/209422626-5980de0d-c582-44be-8b88-6585877f0e50.png)
 
### Stat Distribution Sort
Ideal armour is a high stat total in specific stats, and it changes based on build and class. When armour has low stat totals, it's easy to see that they should be dismantled. When they're high... it's a bit harder. To more easily determine at a glance which armour is good, deepsight.gg supports the Stat Distribution sort.

![image](https://user-images.githubusercontent.com/6081834/209422656-7160e483-a4f9-4d4a-8792-95c7db2e7576.png)

To set custom targeted stat distributions, click the gear on the Stat Distribution sort, then the class you want to set a targeted distribution for. 

Stats in Destiny are split into two groups — group 1 is Mobility, Resilience, and Recovery, and group 2 is Discipline, Intellect, and Strength. Except for rare exceptions, each group can only roll a stat total of, at maximum, 34. Therefore, the ideal roll is 34 total in each group, distributed as you prefer.

When a stat type is *enabled*, ie, the checkbox is checked, the quality of an armour roll will be based on how close that stat is to the exact value you select.

When a stat type is *disabled*, ie, the checkbox is *un*checked, the quality of an armour roll will be based on whether that stat, and any other unchecked stats, add up to the maximum roll of 34 for the group.

#### Examples
I want hunter armour that is mostly in mobility and resilience for PvE. I *uncheck* mobility and resilience, and check recovery and set it to *2*, the minimum value for a stat to be. That means that my Mob/Res/Rec group's distribution quality will be 100% if recovery is 2, and mobility and resilience add up to 32 — a perfect roll.

![image](https://user-images.githubusercontent.com/6081834/209422662-427e122b-7f28-4231-8399-50ebec10ffb4.png)

I want warlock armour that is at minimum mobility, and maximum discipline. I *uncheck* resilience and recovery, and check mobility and set it to *2*, the minimum value. I uncheck intellect and strength, and then check the discipline box and set it to the maximum of *30*.

![image](https://user-images.githubusercontent.com/6081834/209422665-6296f929-a8bf-4bca-baab-aa62eabf379c.png)

## Collections
View a list of all weapons and armour from a particular source — seasons, expansions, events, etc — and the possible rolls of each. 

![image](https://user-images.githubusercontent.com/6081834/209422841-14113e21-dafc-47c4-97f5-8c3b39fb9428.png)

Your pattern progress is displayed on each weapon.

![image](https://user-images.githubusercontent.com/6081834/209422695-3e8102f1-a0f7-4e86-aa8a-cc607f614c2a.png)

### Perk Wishlisting
When inspecting a weapon in collections, you can add wishlisted rolls. If an item doesn't match your wishlist, it's displayed with a lime border and icon to show that it should be dismantled.

When creating a wishlist, you can select any number of perks in each column. 
- If no perks are selected in a column, that means a weapon will match your wishlist no matter the perks it has in that column.
- If one perk is selected in a column, that means a weapon will match your wishlist only if it has that exact perk in that column.
- If more than one perk is selected in a column, that means a weapon will match your wishlist only if it has one or more of the perks you've selected in that column.

![image](https://user-images.githubusercontent.com/6081834/211508234-b3e24069-f7c2-4e0d-a85f-2d6a9630ace0.png)
![image](https://user-images.githubusercontent.com/6081834/209422767-4de63ccf-fe5c-4319-96bd-e34182504aa3.png)

## Player Overview
Hovering over your bungie display name and code displays a player overview, including all characters' equipped items, and their average power. It also displays all characters' highest power items — this is the average that drops will be based around.

![image](https://user-images.githubusercontent.com/6081834/209422787-568c23c2-2217-452b-a4ea-4dee06c08ed6.png)

## Notes & Credits
deepsight.gg would not exist without the prior art of other community-made Destiny apps (mainly [Destiny Item Manager](https://app.destinyitemmanager.com/) and [Braytech](https://bray.tech/)) and the amazing resources that are:
- [Bungie API TypeScript support](https://github.com/DestinyItemManager/bungie-api-ts)
- [d2-additional-info](https://github.com/DestinyItemManager/d2-additional-info)
- [Destiny Icons](https://github.com/justrealmilk/destiny-icons)

Some (rare) parts of deepsight.gg are ported straight from DIM, such as [RecoilDirection.ts](src/ui/inventory/tooltip/stats/RecoilDirection.ts). There is basically zero chance I would've been smart enough to do that, given that I'm primarily a UI/UX developer.

deepsight.gg takes heavy hints from both Destiny 2 and Braytech. There is nothing that I love more than making UI look pretty and be easy to use, and the UIs in Braytech especially have been a huge inspiration.
