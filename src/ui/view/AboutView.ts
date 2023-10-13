import Component from "ui/Component";
import View from "ui/View";
import DocumentationPage from "ui/view/documentation/DocumentationPage";

export enum AboutViewClasses {
	Details = "view-about-details",
	DetailsSummary = "view-about-details-summary",
}

export default View.create({
	id: "about",
	name: "About",
	noDestinationButton: true,
	initialise: view => view
		.setTitle(title => title.text.set("deepsight.gg"))
		.tweak(view => view.content
			.append(DocumentationPage.create()

				.addSection(section => section
					.setTitle("A New Destiny 2 Item Manager Approaches...")
					.addCard(card => card
						.addParagraph("deepsight.gg is an item manager for Destiny 2, made to look and feel like the in-game UI, providing functionality not before seen in other item managers. Using deepsight.gg, you can sort armour by your own customisable targeted stat distributions, you can easily add any number of wishlists for specific rolls of weapons, and more!")))

				.addSection(section => section
					.setTitle("Features")
					.addCard(card => card
						.setTitle("Slot Views")
						.addParagraph("One view per slot — Kinetic, Energy, Power, Helmet, Arms, Chest, Legs, Class Item. This results in more items being displayable at one time, at a larger size, and allows quickly transferring them between characters and the vault.")
						.addParagraph("All views display the postmaster for each character.")
						.addParagraph("The highest power 1 or 2 item(s) in each slot displays with a special animation. Never dismantle these ones except for infusion, or you'll lower your drop power!")
						.addImage("./image/about/slot-views.png"))
					.addCard(card => card
						.setTitle("Persistent, highly-customisable sort/filter")
						.addParagraph("Views each have a persistent, configurable sort — weapon views share one, armour views share one, and the class item view has one.")
						.addParagraph("You can configure the order that sorts are applied, or if they're applied at all.")
						.addParagraph("Weapon Sorts")
						.addList(list => list
							.addItem(item => item.text.set("Power"))
							.addItem(item => item.text.set("Name"))
							.addItem(item => item.text.set("Ammo Type"))
							.addItem(item => item.text.set("Masterwork"))
							.addItem(item => item.text.set("Rarity"))
							.addItem(item => item.text.set("Shaped"))
							.addItem(item => item.text.set("Source (ie the little watermark icon on all items)"))
							.addItem(item => item.text.set("Gives Pattern Progress")))
						.addImage("./image/about/weapon-sorts.png")
						.addParagraph("Armour Sorts")
						.addList(list => list
							.addItem(item => item.text.set("Power"))
							.addItem(item => item.text.set("Name"))
							.addItem(item => item.text.set("Energy"))
							.addItem(item => item.text.set("Masterwork"))
							.addItem(item => item.text.set("Rarity"))
							.addItem(item => item.text.set("Shaped"))
							.addItem(item => item.text.set("Source"))
							.addItem(item => item.text.set("Stat Total"))
							.addItem(item => item.text.set("Stat Distribution (Customisable, targeted distribution per-class. See below.)")))
						.addImage("./image/about/armour-sorts.png"))
					.addCard(card => card
						.tweak(card => card.heading
							.text.add("Press ")
							.append(Component.create("kbd")
								.text.set("E"))
							.text.add(" to show details on items"))
						.tweak(card => card.content.append(Component.create("p")
							.text.add("Just like in-game, you can hold ")
							.append(Component.create("kbd")
								.text.set("E"))
							.text.add(" to show extra details on items. If you'd like this to be a toggle instead, it can be changed in Settings.")))
						.addParagraph("The details that appear on items is based on the highest active sorts.")
						.addImage("./image/about/extra-details-on-armour-items.png"))
					.addCard(card => card
						.setTitle("Stat Distribution Sort")
						.addParagraph("Ideal armour is a high stat total in specific stats, and it changes based on build and class. When armour has low stat totals, it's easy to see that they should be dismantled. When they're high... it's a bit harder. To more easily determine at a glance which armour is good, deepsight.gg supports the Stat Distribution sort.")
						.addParagraph("To set custom targeted stat distributions, click the gear on the Stat Distribution sort, then the class you want to set a targeted distribution for.")
						.addParagraph("Stats in Destiny are split into two groups — group 1 is Mobility, Resilience, and Recovery, and group 2 is Discipline, Intellect, and Strength.Except for rare exceptions, each group can only roll a stat total of, at maximum, 34. Therefore, the ideal roll is 34 total in each group, distributed as you prefer.")
						.addParagraph("When a stat type is enabled, ie, the checkbox is checked, the quality of an armour roll will be based on how close that stat is to the exact value you select.")
						.addParagraph("When a stat type is disabled, ie, the checkbox is unchecked, the quality of an armour roll will be based on whether that stat, and any other unchecked stats, add up to the maximum roll of 34 for the group.")
						.addImage("./image/about/stat-distribution-1.png"))
					.addCard(card => card
						.setTitle("Examples")
						.addParagraph("I want hunter armour that is mostly in mobility and resilience for PvE. I uncheck mobility and resilience, and check recovery and set it to 2, the minimum value for a stat to be. That means that my Mob/Res/Rec group's distribution quality will be 100% if recovery is 2, and mobility and resilience add up to 32 — a perfect roll.")
						.addImage("./image/about/stat-distribution-2.png")
						.addParagraph("I want warlock armour that is at minimum mobility, and maximum discipline. I uncheck resilience and recovery, and check mobility and set it to 2, the minimum value. I uncheck intellect and strength, and then check the discipline box and set it to the maximum of 30.")
						.addImage("./image/about/stat-distribution-3.png"))
					.addCard(card => card
						.setTitle("Player Overview")
						.addParagraph("Hovering over your bungie display name and code displays a player overview, including all characters' equipped items, and their average power. It also displays all characters' highest power items — this is the average that drops will be based around.")
						.addImage("./image/about/player-overview.png"))
					.addCard(card => card
						.setTitle("Details View")
						.addParagraph("Right clicking on weapons displays the perks and stats of weapons, just like in-game.")
						.addImage("./image/about/details-view.png"))
					.addCard(card => card
						.setTitle("Collections")
						.addParagraph("View a list of all weapons and armour from a particular source — seasons, expansions, events, etc — and the possible rolls of each.")
						.addParagraph("When an event is active, it goes to the top.")
						.addParagraph("The shaped weapon icon means different things depending on the colour. Orange means the pattern is unlocked, but you haven't shaped that weapon yet. White means a pattern exists for the weapon, but you haven't completed it yet. Black means you've shaped the weapon, so it's irrelevant.")
						.addImage("./image/about/collections-view.png"))
					.addCard(card => card
						.setTitle("Details in collections item tooltips")
						.addParagraph("To see a quick preview of the perks that can roll on a weapon, simpy mouse over the item in collections, and it'll list the whole perk pool. Right clicking gives a more detailed view.")
						.addParagraph("The tooltip also displays any pattern progress.")
						.addImage("./image/about/pattern-progress.png"))
					.addCard(card => card
						.setTitle("Perk Wishlisting")
						.addParagraph("When inspecting a weapon in collections, you can add wishlisted rolls. If an item doesn't match your wishlist, it's displayed with a lime border and icon to show that it should be dismantled.")
						.addParagraph("When creating a wishlist, you can select any number of perks in each column.")
						.addList(list => list
							.addItem(item => item.text.set("If no perks are selected in a column, that means a weapon will match your wishlist no matter the perks it has in that column."))
							.addItem(item => item.text.set("If one perk is selected in a column, that means a weapon will match your wishlist only if it has that exact perk in that column."))
							.addItem(item => item.text.set("If more than one perk is selected in a column, that means a weapon will match your wishlist only if it has one or more of the perks you've selected in that column.")))
						.addImage("./image/about/perk-wishlisting.png")))

				.addSection(section => section
					.setTitle("FAQ")
					.addCard(card => card
						.setTitle("Will you ever add a view displaying everything, like DIM?")
						.addParagraph("Probably not, mostly because it's not really possible to display that many items all at one time without a cost to ease of use and aesthetics. I'm not really interested in sacrificing deepsight.gg's quality and performance just so that more items can be displayed in a long list you have to scroll through anyway."))
					.addCard(card => card
						.setTitle("Will you ever add support for loadouts, like DIM?")
						.addParagraph("Coming soon... hopefully."))
					.addCard(card => card
						.setTitle("Why can't I...")
						.addParagraph("deepsight.gg is made by Chiri Vulpes, a hobby project by a single developer, and it was primarily made for her own use cases — sorting her vault in a specific way, and wishlisting weapon rolls. She — or, well, I — would like to help a lot of other people get what they want out of an item manager, too, but it takes a while to do this stuff, so you'll have to be patient!")))

				.addSection(section => section)

				.addSection(section => section
					.setTitle("About")
					.addCard(card => card
						.style.set("margin-right", "0")
						.style.set("align-self", "flex-start")
						.addParagraph("deepsight.gg is a hobby project by a single developer, Chiri Vulpes. The greatest struggle she has is knowing whether she likes UI/UX work more or less than Destiny itself.")
						.tweak(card => card.content.append(Component.create("p")
							.text.add("This is an open source project, which means that the code is available for viewing, using, and contributing on ")
							.append(Component.create("a")
								.attributes.set("href", "https://github.com/ChiriVulpes/deepsight.gg")
								.attributes.set("target", "_blank")
								.text.set("GitHub"))
							.text.add(".")))
						.tweak(card => card.content.append(Component.create("p")
							.text.add("If you'd like to request a feature, report a bug, or even just chat, consider stopping by the ")
							.append(Component.create("a")
								.attributes.set("href", "https://discord.gg/dMFRMXZZnY")
								.attributes.set("target", "_blank")
								.text.set("Discord"))
							.text.add("!"))))
					.addCard(card => card
						.setTitle("Notes & Credits")
						.tweak(card => card.content.append(Component.create("p")
							.text.add("deepsight.gg would not exist without the prior art of other community-made Destiny apps (mainly ")
							.append(Component.create("a")
								.attributes.set("href", "https://app.destinyitemmanager.com/")
								.attributes.set("target", "_blank")
								.text.set("Destiny Item Manager"))
							.text.add(" and ")
							.append(Component.create("a")
								.attributes.set("href", "https://bray.tech/")
								.attributes.set("target", "_blank")
								.text.set("Braytech"))
							.text.add(") and the amazing resources that are: ")))
						.addList(list => list
							.addItem(item => item.append(Component.create("a")
								.attributes.set("href", "https://github.com/DestinyItemManager/bungie-api-ts")
								.attributes.set("target", "_blank")
								.text.set("Bungie API TypeScript support")))
							.addItem(item => item.append(Component.create("a")
								.attributes.set("href", "https://github.com/DestinyItemManager/d2-additional-info")
								.attributes.set("target", "_blank")
								.text.set("d2-additional-info")))
							.addItem(item => item.append(Component.create("a")
								.attributes.set("href", "https://github.com/justrealmilk/destiny-icons")
								.attributes.set("target", "_blank")
								.text.set("Destiny Icons"))))
						.tweak(card => card.content.append(Component.create("p")
							.text.add("Some (rare) parts of deepsight.gg are ported straight from DIM, such as ")
							.append(Component.create("a")
								.attributes.set("href", "https://github.com/ChiriVulpes/deepsight.gg/blob/main/src/ui/inventory/tooltip/stats/RecoilDirection.ts")
								.attributes.set("target", "_blank")
								.text.set("RecoilDirection.ts"))
							.text.add(". There is basically zero chance I would've been smart enough to do that, given that I'm primarily a UI/UX developer.")))
						.addParagraph("deepsight.gg takes heavy hints from both Destiny 2 and Braytech. There is nothing that I love more than making UI look pretty and be easy to use, and the UIs in Braytech especially have been a huge inspiration."))))),
});
