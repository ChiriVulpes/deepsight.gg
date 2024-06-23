import type { DeepsightVendorDefinition } from "@deepsight.gg/interfaces";
import BaseButton from "ui/component/Button";
import Component from "ui/component/Component";

export enum VendorDisplayClasses {
	Main = "vendor-display",
	Title = "vendor-display-title",
	TitleText = "vendor-display-title-text",
	TitleBox = "vendor-display-title-box",
	TitleHasDescription = "vendor-display-title--has-description",
	Subtitle = "vendor-display-subtitle",
	Description = "vendor-display-description",
	DescriptionText = "vendor-display-description-text",
	Button = "vendor-display-button",
}

class VendorDisplay extends Component<HTMLElement, [def: DeepsightVendorDefinition, description?: false]> {
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
			.append(Component.create()
				.classes.add(VendorDisplayClasses.TitleText)
				.text.set(vendor.displayProperties.name))
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

namespace VendorDisplay {
	export class Button extends BaseButton<[DeepsightVendorDefinition]> {

		public display!: VendorDisplay;

		protected override onMake (vendor: DeepsightVendorDefinition): void {
			super.onMake(vendor);
			this.classes.add(VendorDisplayClasses.Button);

			this.display = VendorDisplay.create([vendor])
				.appendTo(this);
		}
	}
}

export default VendorDisplay;
