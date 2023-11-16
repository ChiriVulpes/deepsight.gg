import type Item from "model/models/items/Item";
import Manifest from "model/models/Manifest";
import Display from "ui/bungie/DisplayProperties";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import type { Hint } from "ui/Hints";
import TooltipManager, { Tooltip } from "ui/TooltipManager";

enum ItemSubclassTooltipClasses {
	Main = "item-subclass-tooltip",
	Header = "item-subclass-tooltip-header",
	DamageTypeIcon = "item-subclass-tooltip-damage-type-icon",
	DamageType_ = "item-subclass-tooltip-damage-type-",
	Title = "item-subclass-tooltip-title",
	Subtitle = "item-subclass-tooltip-subtitle",
	Content = "item-subclass-tooltip-content",
	Super = "item-subclass-tooltip-super",
	SuperImage = "item-subclass-tooltip-super-image",
	SuperName = "item-subclass-tooltip-super-name",
	Flavour = "item-subclass-tooltip-flavour",
}

class ItemSubclassTooltip extends Tooltip {

	public item?: Item;

	public damageTypeIcon!: Component;
	public superWrapper!: Component;
	public superImage!: Component<HTMLImageElement>;
	public superName!: Component;
	public flavour!: Component;
	public hintShowDefinitions!: Hint;

	protected override onMake () {
		this.classes.add(ItemSubclassTooltipClasses.Main);
		this.header.classes.add(ItemSubclassTooltipClasses.Header);
		this.title.classes.add(ItemSubclassTooltipClasses.Title);
		this.subtitle.classes.add(ItemSubclassTooltipClasses.Subtitle);
		this.content.classes.add(ItemSubclassTooltipClasses.Content);

		this.damageTypeIcon = Component.create()
			.classes.add(ItemSubclassTooltipClasses.DamageTypeIcon)
			.prependTo(this.header);

		this.superWrapper = Component.create()
			.classes.add(ItemSubclassTooltipClasses.Super)
			.appendTo(this.content);

		this.superImage = Component.create("img")
			.classes.add(ItemSubclassTooltipClasses.SuperImage)
			.appendTo(this.superWrapper);

		this.superName = Component.create()
			.classes.add(ItemSubclassTooltipClasses.SuperName)
			.appendTo(this.superWrapper);

		this.flavour = Component.create()
			.classes.add(ItemSubclassTooltipClasses.Flavour)
			.appendTo(this.content);
	}

	public async set (item: Item) {
		this.item = item;
		console.log(Display.name(item.definition), item);

		const { DestinyDamageTypeDefinition } = await Manifest.await();

		const damageType = await DestinyDamageTypeDefinition.get(item.getDamageType());
		this.classes.removeWhere(cls => cls.startsWith(ItemSubclassTooltipClasses.DamageType_))
			.classes.add(`${ItemSubclassTooltipClasses.DamageType_}${(damageType?.displayProperties.name ?? "Unknown")?.toLowerCase()}`);

		this.damageTypeIcon.classes.toggle(!damageType?.displayProperties.icon, Classes.Hidden)
			.style.set("--icon", Display.icon(damageType));

		this.title.text.set(Display.name(item.definition));
		this.subtitle.text.set(item.definition.itemTypeDisplayName);

		const superAbility = item.getSocketedPlug("=Subclass/Super");
		const superName = Display.name(superAbility?.definition);
		this.superWrapper.classes.toggle(!superName, Classes.Hidden);
		if (superName) {
			this.superName.text.set(superName);
			const highResIcon = superAbility?.definition?.displayProperties.highResIcon;
			this.superImage.classes.toggle(!highResIcon, Classes.Hidden)
				.attributes.set("src", highResIcon && `https://www.bungie.net${highResIcon}`);
		}

		this.flavour.text.set(item.definition.flavorText);
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(ItemSubclassTooltip));
