import Component from "ui/Component";
import Details from "ui/Details";
import View from "ui/View";

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
			.append(Details.create()
				.classes.add(AboutViewClasses.Details)
				.open()
				.tweak(details => details.summary.classes.add(AboutViewClasses.DetailsSummary).text.set("FAQ — Will you ever add a view displaying everything, like DIM?"))
				.tweak(details => details.append(Component.create("p")
					.text.set("Probably not, mostly because it's not really possible to display that many items all at one time while keeping everything running smoothly. I'm not really interested in sacrificing deepsight.gg's quality and performance just so that more items can be displayed in a long list you have to scroll through anyway. The closest you're going to get is the opt-in Equipment view, which you can enable from the Settings tab."))))
			.append(Details.create()
				.classes.add(AboutViewClasses.Details)
				.open()
				.tweak(details => details.summary.classes.add(AboutViewClasses.DetailsSummary).text.set("FAQ — Will you ever add support for loadouts, like DIM?"))
				.tweak(details => details.append(Component.create("p")
					.text.set("Initially, I planned to at some point implement a similar system in deepsight.gg, but after Bungie announced their own loadout system coming in Lightfall, I've decided to put that on hold. Later down the line, if there's a need, potentially. Don't count on it, though."))))
			.append(Details.create()
				.classes.add(AboutViewClasses.Details)
				.open()
				.tweak(details => details.summary.classes.add(AboutViewClasses.DetailsSummary).text.set("FAQ — Why can't I..."))
				.tweak(details => details.append(Component.create("p")
					.text.set("deepsight.gg is made as a hobby project by a single developer — Chiri Vulpes — and it was primarily made for her own use cases — sorting her vault in a specific way, and wishlisting weapon rolls. I'd like to help a lot of other people get what they want out of a vault manager, too, but it takes a while to do this stuff, so you'll have to be patient!"))))),
});
