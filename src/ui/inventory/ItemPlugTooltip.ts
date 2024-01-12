import { ItemTierTypeHashes } from "@deepsight.gg/enums";
import { DeepsightPlugCategory } from "@deepsight.gg/plugs";
import type { DestinyTraitDefinition } from "bungie-api-ts/destiny2";
import { ItemPerkVisibility } from "bungie-api-ts/destiny2";
import DamageTypes from "model/models/enum/DamageTypes";
import type Item from "model/models/items/Item";
import type { Perk, Plug } from "model/models/items/Plugs";
import Display from "ui/bungie/DisplayProperties";
import EnumIcon from "ui/bungie/EnumIcon";
import LoadedIcon from "ui/bungie/LoadedIcon";
import { Classes } from "ui/Classes";
import Component from "ui/Component";
import { Hint, IInput } from "ui/Hints";
import ItemClarity, { ItemClarityDefinitions } from "ui/inventory/tooltip/ItemClarity";
import TooltipManager, { Tooltip } from "ui/TooltipManager";
import type { IKeyUpEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import Bound from "utility/decorator/Bound";
import Strings from "utility/Strings";
import type { PromiseOr } from "utility/Type";

enum ItemPlugTooltipClasses {
	Main = "item-plug-tooltip",
	Content = "item-plug-tooltip-content",
	Image = "item-plug-tooltip-image",
	Description = "item-plug-tooltip-description",
	IsPerk = "item-plug-tooltip--perk",
	IsEnhanced = "item-plug-tooltip--enhanced",
	IsExotic = "item-plug-tooltip--exotic",
	IsDamageType = "item-plug-tooltip--damage-type",
	Perks = "item-plug-tooltip-perks",
	Perk = "item-plug-tooltip-perk",
	PerkIsDisabled = "item-plug-tooltip-perk--disabled",
	PerkIcon = "item-plug-tooltip-perk-icon",
	PerkIconIsStat = "item-plug-tooltip-perk-icon--stat",
	PerkDescription = "item-plug-tooltip-perk-description",
	Keyword = "item-plug-tooltip-keyword",
	Keywords = "item-plug-tooltip-keywords",
	KeywordIcon = "item-plug-tooltip-keyword-icon",
	KeywordName = "item-plug-tooltip-keyword-name",
	KeywordDescription = "item-plug-tooltip-keyword-description",
	ClarityURL = "item-plug-tooltip-clarity-url",
	Extra = "item-plug-tooltip-extra",
	ExtraHeader = "item-plug-tooltip-extra-header",
	ExtraContent = "item-plug-tooltip-extra-content",
}

class ItemPlugTooltip extends Tooltip {

	public plug?: Plug;
	public perk?: Perk;
	public item?: Item;

	public image!: LoadedIcon;
	public description!: Component;
	public perks!: Component;
	public clarity!: ItemClarity;
	public keywords!: ItemPlugKeywords;
	public clarityDefinitions!: ItemClarityDefinitions;
	public hintShowDefinitions!: Hint;

	protected override onMake () {
		this.classes.add(ItemPlugTooltipClasses.Main);
		this.content.classes.add(ItemPlugTooltipClasses.Content);

		this.image = LoadedIcon.create([])
			.classes.add(ItemPlugTooltipClasses.Image)
			.appendTo(this.content);

		this.description = Component.create()
			.classes.add(ItemPlugTooltipClasses.Description)
			.appendTo(this.content);

		this.perks = Component.create()
			.classes.add(ItemPlugTooltipClasses.Perks)
			.appendTo(this.content);

		this.clarity = ItemClarity.create()
			.insertToAfter(this, this.content);

		this.hintShowDefinitions = Hint.create([IInput.get("KeyE")])
			.classes.add(Classes.ShowIfNotExtraInfo)
			.tweak(hint => hint.label.text.set("Show Definitions"))
			.appendTo(this.hints);

		Hint.create([IInput.get("MouseMiddle")])
			.tweak(hint => hint.label.text.add("Visit ")
				.append(Component.create("span")
					.classes.add(ItemPlugTooltipClasses.ClarityURL)
					.text.set("d2clarity.com")))
			.appendTo(this.hints);

		this.extra.classes.add(ItemPlugTooltipClasses.Extra);
		this.extra.header.classes.add(ItemPlugTooltipClasses.ExtraHeader);
		this.extra.content.classes.add(ItemPlugTooltipClasses.ExtraContent);

		this.keywords = ItemPlugKeywords.create()
			.appendTo(this.extra.content);

		this.clarityDefinitions = ItemClarityDefinitions.create()
			.appendTo(this.extra.content);

		UiEventBus.subscribe("keyup", this.onGlobalKeyup);
	}

	public set (plug: Plug, perk?: Perk, item?: Item) {
		this.plug = plug;
		this.perk = perk;
		this.item = item;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).plug = plug;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
		(window as any).perk = perk;
		console.log(Display.name(perk?.definition) ?? Display.name(plug.definition), plug, perk);

		const damageType = plug.getCategorisationAs(DeepsightPlugCategory.Subclass)?.damageType;
		this.classes.removeWhere(cls => cls.startsWith(ItemPlugTooltipClasses.IsDamageType))
			.classes.add(damageType && `${ItemPlugTooltipClasses.IsDamageType}-${DamageTypes.nameOf(damageType)}`);

		this.title.text.set(Display.name(perk?.definition) ?? Display.name(plug.definition));
		this.subtitle.removeContents();

		const keywords: PromiseOr<DestinyTraitDefinition[]>[] = [];
		const description: Display.DescriptionOptions = {
			character: item?.owner,
		};

		this.subtitle.text.set(plug.is("=Masterwork/ExoticCatalyst") ? "Catalyst" : plug.definition?.itemTypeDisplayName ?? "Unknown");
		this.description.tweak(Display.applyDescription, Display.description(perk?.definition) ?? Display.description(plug.definition), description);
		if (description.keywords)
			keywords.push(description.keywords);

		this.header.classes.toggle(plug.is("Perk"), ItemPlugTooltipClasses.IsPerk);
		this.header.classes.toggle(plug.is("Perk/TraitEnhanced", "Intrinsic/FrameEnhanced", "=Masterwork/ExoticCatalyst"), ItemPlugTooltipClasses.IsEnhanced);
		this.header.classes.toggle((plug.is("Intrinsic") || plug.is("=Masterwork/ExoticCatalyst")) && item?.definition.inventory?.tierTypeHash === ItemTierTypeHashes.Exotic, ItemPlugTooltipClasses.IsExotic);

		this.image.classes.toggle(!plug.definition?.secondaryIcon, Classes.Hidden)
			.setPath(plug.definition?.secondaryIcon && `https://www.bungie.net${plug.definition.secondaryIcon}`);

		this.perks.removeContents();
		if (!perk) {
			for (const perk of plug.perks) {
				if (perk.perkVisibility === ItemPerkVisibility.Hidden || !perk.definition.displayProperties.description)
					continue;

				if (plug.definition?.displayProperties.description && (perk.definition.displayProperties.description === plug.definition.displayProperties.description || Strings.fuzzyMatches(perk.definition.displayProperties.description, plug.definition.displayProperties.description)))
					continue;

				const subclassCategorisation = (perk.definition.displayProperties.name === plug.definition?.displayProperties.name || perk.definition.displayProperties.icon === plug.definition?.displayProperties.icon)
					&& plug.getCategorisationAs(DeepsightPlugCategory.Subclass);
				const icon = subclassCategorisation && subclassCategorisation.damageType
					? EnumIcon.create([DamageTypes, subclassCategorisation.damageType])
					: !perk.definition.displayProperties.icon ? undefined
						: LoadedIcon.create([`https://www.bungie.net${perk.definition.displayProperties.icon}`])
							.classes.toggle(perk.definition.displayProperties.name === "Stat Penalty" || perk.definition.displayProperties.name === "Stat Increase", ItemPlugTooltipClasses.PerkIconIsStat);

				const description: Display.DescriptionOptions = {};
				Component.create()
					.classes.add(ItemPlugTooltipClasses.Perk)
					.classes.toggle(perk.perkVisibility === ItemPerkVisibility.Disabled, ItemPlugTooltipClasses.PerkIsDisabled)
					.append(icon?.classes.add(ItemPlugTooltipClasses.PerkIcon))
					.append(Component.create()
						.classes.add(ItemPlugTooltipClasses.PerkDescription)
						.tweak(Display.applyDescription, Display.description(perk.definition), description))
					.appendTo(this.perks);

				if (description.keywords)
					keywords.push(description.keywords);
			}
		}

		this.clarity.set(plug.clarity);
		this.clarityDefinitions.set(plug.clarity);
		this.footer.classes.toggle(!this.clarity.isPresent, Classes.Hidden);
		this.extra.classes.toggle(!this.clarityDefinitions.isPresent, Classes.Hidden);
		this.hintShowDefinitions.classes.toggle(!this.clarityDefinitions.isPresent, Classes.Hidden);

		void this.keywords.set(Promise.all(keywords).then(keywords => keywords.flat()).then(keywords => {
			if (this.plug === plug) {
				const hasDefs = this.clarityDefinitions.isPresent || !!keywords.length;
				this.footer.classes.toggle(!this.clarity.isPresent && !hasDefs, Classes.Hidden);
				this.extra.classes.toggle(!hasDefs, Classes.Hidden);
				this.hintShowDefinitions.classes.toggle(!hasDefs, Classes.Hidden);
			}

			return keywords;
		}));
	}

	@Bound
	protected onGlobalKeyup (event: IKeyUpEvent) {
		if (this.clarity.isPresent && event.hovering(".view-item-socket-plug") && event.use("MouseMiddle")) {
			window.open("https://www.d2clarity.com", "_blank");
		}
	}
}

let set = 0;
class ItemPlugKeywords extends Component {
	protected override onMake (): void {
		this.classes.add(ItemPlugTooltipClasses.Keywords);
	}

	private setTime = 0;
	public async set (keywords: PromiseOr<DestinyTraitDefinition[]>) {
		this.removeContents();

		const time = this.setTime = set++;
		keywords = await keywords;
		if (this.setTime !== time)
			return;

		for (const keyword of new Set(keywords)) {
			Component.create()
				.classes.add(ItemPlugTooltipClasses.Keyword)
				.append(!keyword.displayProperties.icon ? undefined
					: LoadedIcon.create([`https://www.bungie.net${keyword.displayProperties.icon}`])
						.classes.add(ItemPlugTooltipClasses.KeywordIcon))
				.append(Component.create()
					.classes.add(ItemPlugTooltipClasses.KeywordName)
					.text.set(Display.name(keyword)))
				.append(Component.create()
					.classes.add(ItemPlugTooltipClasses.KeywordDescription)
					.tweak(Display.applyDescription, Display.description(keyword)))
				.appendTo(this);
		}
	}
}

export default TooltipManager.create(tooltip => tooltip
	.make(ItemPlugTooltip));
