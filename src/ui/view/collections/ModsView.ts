import Model from "model/Model";
import Manifest from "model/models/Manifest";
import { Plug } from "model/models/items/Plugs";
import Component from "ui/Component";
import Details from "ui/Details";
import Loadable from "ui/Loadable";
import View from "ui/View";
import Paginator from "ui/form/Paginator";
import { CollectionsMomentClasses } from "ui/view/collections/CollectionsMoment";
import { ItemPlug } from "ui/view/item/ItemSockets";

export enum ModsViewClasses {
	PlugList = "view-mods-plug-list",
	PlugListContent = "view-mods-plug-list-content",
	PlugListPage = "view-mods-plug-list-page",
	Plug = "view-mods-plug",
	TypeWrapper = "view-mods-type-wrapper",
}

const capitalisationRegex = /(?<=[a-z])(?=[A-Z])/g;

export default View.create({
	models: [Manifest] as const,
	id: "mods",
	name: "Mods",
	auth: "optional",
	parentViewId: "collections",
	initialise: async (view, Manifest) => {
		view.setTitle(title => title.text.set("Mods"));
		view.setSubtitle("lore", subtitle => subtitle
			.text.set("An exhaustive list of every mod, perk, cosmetic, and more..."));

		let detailsIndex = 0;
		const plugs = await Manifest.DeepsightPlugCategorisation.all();
		const categories = Array.from(new Set(plugs.map(plug => plug.categoryName))).sort();
		for (const category of categories) {
			const categoryDetails = Details.create()
				.classes.add(CollectionsMomentClasses.Moment)
				.style.set("--index", `${detailsIndex++}`)
				.appendTo(view.content);
			categoryDetails.summary.text.set(category.replace(capitalisationRegex, " "));

			const categoryPlugs = plugs.filter(plug => plug.categoryName === category);
			const types = Array.from(new Set(categoryPlugs.map(plug => plug.typeName))).sort();
			for (const type of types) {
				let typeDetails = categoryDetails;
				if (type) {
					typeDetails = Details.create()
						.classes.add(CollectionsMomentClasses.Moment, ModsViewClasses.TypeWrapper)
						.style.set("--index", `${detailsIndex++}`)
						.appendTo(categoryDetails);
					typeDetails.summary.text.set(type?.replace(capitalisationRegex, " "));
				}

				const typePlugs = categoryPlugs.filter(plug => plug.typeName === type);
				Loadable.create(Model.createTemporary(async () => {
					await typeDetails.event.waitFor("toggle");

					const result: Plug[] = [];
					for (const plugCategorisation of typePlugs)
						result.push(await Plug.resolveFromHash(Manifest, plugCategorisation.hash, true));

					return result;
				}))
					.onReady((plugs) => {
						const plugList = Paginator.create()
							.classes.add(ModsViewClasses.PlugList);

						plugList.pageWrapper.classes.add(ModsViewClasses.PlugListContent);

						plugs = plugs.sort((a, b) => (a.definition?.displayProperties?.name ?? "").localeCompare(b.definition?.displayProperties?.name ?? ""));

						const helper = plugList.filler({ desktop: 25, vertical: 15, tablet: 10, mobile: 5 });
						for (const plug of plugs)
							if (plug.definition?.displayProperties?.name)
								ItemPlug.create([plug, undefined, undefined])
									.classes.add(ModsViewClasses.Plug)
									.appendTo(helper.increment(page => page
										.classes.add(ModsViewClasses.PlugListPage)));

						const storage = Component.create();
						typeDetails.event.subscribe("toggle", () =>
							plugList.appendTo(storage.contains(plugList) ? typeDetails : storage)
								.attributes.remove("inert"));

						return plugList;
					})
					.setSimple()
					.appendTo(typeDetails);
			}
		}
	},
});
