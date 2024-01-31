import type { DeepsightVendorDefinition } from "@deepsight.gg/interfaces";
import Component from "ui/Component";

export enum VendorDisplayClasses {
	Main = "vendor-display",
	Title = "vendor-display-title",
	TitleBox = "vendor-display-title-box",
	TitleHasDescription = "vendor-display-title--has-description",
	Subtitle = "vendor-display-subtitle",
	Description = "vendor-display-description",
	DescriptionText = "vendor-display-description-text",
}

export default class VendorDisplay extends Component<HTMLElement, [def: DeepsightVendorDefinition, description?: false]> {
	protected override onMake (vendor: DeepsightVendorDefinition, description = true): void {
		this.classes.add(VendorDisplayClasses.Main);

		Component.create()
			.classes.add(VendorDisplayClasses.Subtitle)
			.text.set(vendor.displayProperties.subtitle)
			.appendTo(this);

		const hasDescription = description && !!vendor.displayProperties.description && vendor.displayProperties.description !== vendor.displayProperties.subtitle;
		Component.create()
			.classes.add(VendorDisplayClasses.Title)
			.classes.toggle(hasDescription, VendorDisplayClasses.TitleHasDescription)
			.text.set(vendor.displayProperties.name)
			.append(Component.create()
				.classes.add(VendorDisplayClasses.TitleBox))
			.appendTo(this);

		if (hasDescription)
			Component.create()
				.classes.add(VendorDisplayClasses.Description)
				.append(Component.create()
					.classes.add(VendorDisplayClasses.DescriptionText)
					.text.set(vendor.displayProperties.description))
				.appendTo(this);
	}
}
