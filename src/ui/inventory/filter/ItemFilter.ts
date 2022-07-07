import { Classes } from "ui/Classes";
import type { ComponentEventManager } from "ui/Component";
import Component from "ui/Component";
import Button from "ui/form/Button";
import Drawer from "ui/form/Drawer";
import Filter, { IFilter } from "ui/inventory/filter/Filter";
import type FilterManager from "ui/inventory/filter/FilterManager";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import Async from "utility/Async";

interface IToken {
	text: string;
	raw?: string;
	start: number;
	end: number;
}
const QUOTES = {
	"\"": "\"",
	"'": "'",
	"`": "`",
	"(": ")",
	"[": "]",
};

export enum ItemFilterClasses {
	Main = "item-filter",
	Button = "item-filter-button",
	ButtonIcon = "item-filter-button-icon",
	ButtonLabel = "item-filter-button-label",
	Input = "item-filter-input",
	Reset = "item-filter-reset",
	FilterChip = "item-filter-chip",
	FilterChipPrefix = "item-filter-chip-prefix",
	FilterChipValue = "item-filter-chip-value",
	FilterChipValueHasIcon = "item-filter-chip-value-has-icon",
	FilterChipValueHasMaskIcon = "item-filter-chip-value-has-mask-icon",
	FilterChipRaw = "item-filter-chip-raw",
	Drawer = "item-filter-drawer",
	DrawerPanel = "item-filter-drawer-panel",
	FiltersHeading = "item-filter-heading",
	SuggestedFilters = "item-filter-suggested",
	FilterChipButton = "item-filter-chip-button",
	FilterChipButtonPrefix = "item-filter-chip-button-prefix",
	FilterChipButtonValue = "item-filter-chip-button-value",
	FilterChipButtonValueHasIcon = "item-filter-chip-button-value-has-icon",
	FilterChipButtonValueHasMaskIcon = "item-filter-chip-button-value-has-mask-icon",
	FilterChipButtonValueHint = "item-filter-chip-button-value-hint",
}

export interface IItemFilterEvents {
	filter: Event;
}

class FilterChipButton extends Button<[filter: IFilter, value: string, isHint?: true]> {
	protected override onMake (filter: IFilter, value: string, isHint?: true): void {
		super.onMake(filter, value, isHint);

		const icon = IFilter.icon(value, filter.icon);
		const maskIcon = IFilter.icon(value, filter.maskIcon);

		this.classes.add(ItemFilterClasses.FilterChipButton)
			.append(Component.create("span")
				.classes.add(ItemFilterClasses.FilterChipButtonPrefix)
				.text.set(filter.prefix))
			.append(Component.create("span")
				.classes.add(ItemFilterClasses.FilterChipButtonValue)
				.classes.toggle(isHint ?? false, ItemFilterClasses.FilterChipButtonValueHint)
				.classes.toggle(icon !== undefined, ItemFilterClasses.FilterChipButtonValueHasIcon)
				.classes.toggle(maskIcon !== undefined, ItemFilterClasses.FilterChipButtonValueHasMaskIcon)
				.text.set(value)
				.style.set("--icon", icon ?? maskIcon))
			.style.set("--colour", IFilter.colour(value, filter.colour));
	}
}

export default class ItemFilter extends Component<HTMLElement, [FilterManager]> {

	public override readonly event!: ComponentEventManager<this, IItemFilterEvents>;

	public filterer!: FilterManager;
	public button!: Button;
	public label!: Component;
	public input!: Component;
	public resetButton!: Button;
	public drawer!: Drawer;
	public mainPanel!: Component;

	protected override onMake (filterer: FilterManager): void {
		this.filterer = filterer;
		this.classes.add(ItemFilterClasses.Main);

		this.openDrawer = this.openDrawer.bind(this);

		////////////////////////////////////
		// Button
		this.button = Button.create()
			.classes.add(ItemFilterClasses.Button)
			.event.subscribe("click", this.openDrawer)
			.event.subscribe("focus", this.openDrawer)
			.addIcon(icon => icon.classes.add(ItemFilterClasses.ButtonIcon))
			.appendTo(this);

		this.label = Component.create()
			.classes.add(ItemFilterClasses.ButtonLabel)
			.text.set(`Filter ${filterer.name}`)
			.appendTo(this.button);

		this.onPaste = this.onPaste.bind(this);
		this.onInput = this.onInput.bind(this);
		this.input = Component.create()
			.classes.add(ItemFilterClasses.Input)
			.attributes.add("contenteditable")
			.attributes.set("spellcheck", "false")
			.attributes.set("placeholder", "No filter enabled")
			.event.subscribe("paste", this.onPaste)
			.event.subscribe("input", this.onInput)
			.event.subscribe("focus", this.openDrawer)
			.appendTo(this.button);

		this.resetButton = Button.create()
			.classes.add(ItemFilterClasses.Reset, Classes.Hidden)
			.event.subscribe("click", () => { this.input.removeContents(); this.cleanup(); })
			.append(Component.create())
			.appendTo(this.button);

		////////////////////////////////////
		// Drawer
		this.drawer = Drawer.create()
			.classes.add(ItemFilterClasses.Drawer)
			.attributes.set("tabindex", "-1")
			.event.subscribe("click", () => this.input.element.focus())
			.appendTo(this);

		this.mainPanel = this.drawer.createPanel();

		Component.create()
			.classes.add(ItemFilterClasses.FiltersHeading)
			.text.set("Suggested Filters")
			.appendTo(this.mainPanel);

		const suggestedFilters = Component.create()
			.classes.add(ItemFilterClasses.SuggestedFilters)
			.appendTo(this.mainPanel);

		for (const filter of filterer.getApplicable()) {
			if (!filter.suggestedValues?.length && !filter.suggestedValueHint)
				continue;

			if (filter.suggestedValues?.length)
				for (const value of filter.suggestedValues)
					FilterChipButton.create([filter, value])
						.event.subscribe("click", () => this.toggleChip(filter, value))
						.appendTo(suggestedFilters);
			else
				FilterChipButton.create([filter, filter.suggestedValueHint!, true])
					.event.subscribe("click", () => this.toggleChip(filter))
					.appendTo(suggestedFilters);
		}

		this.onFocusOut = this.onFocusOut.bind(this);
		this.onGlobalKeydown = this.onGlobalKeydown.bind(this);
		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
	}

	private async openDrawer () {
		if (!this.drawer.classes.has(Classes.Hidden))
			return this.input.element.focus();

		this.button.attributes.set("tabindex", "-1");
		this.drawer.open();

		await Async.sleep(0); // next tick
		const selection = window.getSelection();
		if (!this.input.element.contains(selection?.focusNode ?? null) || !this.input.element.contains(selection?.anchorNode ?? null))
			selection?.selectAllChildren(this.input.element);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		document.addEventListener("focusout", this.onFocusOut);
	}

	private closeDrawer () {
		this.button.attributes.remove("tabindex");
		this.drawer.classes.add(Classes.Hidden);
		this.drawer.attributes.add("inert");
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		document.removeEventListener("focusout", this.onFocusOut);
	}

	private async onFocusOut () {
		await Async.sleep(0); // next tick

		if (this.element.contains(document.activeElement))
			return;

		this.closeDrawer();
	}

	private onGlobalKeydown (event: IKeyEvent) {
		if (!document.contains(this.element)) {
			UiEventBus.unsubscribe("keydown", this.onGlobalKeydown);
			return;
		}

		if (event.useOverInput("f", "ctrl")) {
			this.input.element.focus();
			void this.openDrawer();
		}

		if (this.drawer.isOpen() && event.useOverInput("Escape"))
			this.closeDrawer();

		// cancel keybinds
		event.useOverInput("b", "ctrl");
		event.useOverInput("i", "ctrl");
		event.useOverInput("u", "ctrl");
		event.useOverInput("Enter");
	}

	private onPaste (event: ClipboardEvent) {
		event.preventDefault();

		const data = event.clipboardData?.getData("text/plain");
		if (!data)
			return;

		const selection = window.getSelection();
		for (let i = 0; i < (selection?.rangeCount ?? 0); i++) {
			const range = selection?.getRangeAt(i);
			if (!range)
				continue;

			if (!this.input.element.contains(range.startContainer) || !this.input.element.contains(range.endContainer))
				continue;

			range.deleteContents();
			range.insertNode(document.createTextNode(data.replace(/\n/g, "")));
			range.collapse();
		}

		this.cleanup();
	}

	private toggleChip (filter: IFilter, value?: string) {
		const chipText = `${filter.prefix}${value ?? ""}`;

		const chipRegex = new RegExp(`(?<=^| |\xa0)${chipText}(?= |\xa0|$)`);
		const removed = chipRegex.test(this.input.element.textContent ?? "");
		if (removed)
			this.input.element.textContent = this.input.element.textContent!.replace(chipRegex, "");
		else
			this.input.element.appendChild(document.createTextNode(chipText));

		this.cleanup();

		if (removed)
			this.setCursorAtEnd();
		else
			this.setCursorAtLastChipValue();
	}

	private onInput (event: Event) {
		this.cleanup();
	}

	private cleanup () {
		const ranges = this.getRanges();
		const tokens = this.getTokens();

		const selection = window.getSelection()!;
		selection.removeAllRanges();
		this.input.removeContents();
		this.filterer.reset();

		const rangeElements = ranges.map(() => new Range());
		let lastEnd = -1;
		for (const token of tokens) {
			if (this.input.element.childNodes.length)
				// space between tokens
				this.input.element.appendChild(document.createTextNode(" "));

			// handle range being in whitespace
			for (let i = 0; i < ranges.length; i++) {
				const range = ranges[i];
				for (let ri = 0; ri < 2; ri++) {
					if (range[ri] <= token.start && range[ri] > lastEnd) {
						rangeElements[i][ri === 0 ? "setStart" : "setEnd"](this.input.element.lastChild!, 1);
					}
				}
			}

			const raw = token.raw ?? token.text;
			if (raw[0] === "-") {
				token.text = `!${token.text.slice(1)}`;
				if (token.raw)
					token.raw = `!${token.raw.slice(1)}`;
			}

			const filter = this.filterer.add(raw) ?? {};

			const value = token.text.slice(filter.prefix.length).toLowerCase();

			let textNode: Text;
			Component.create("span")
				.classes.add(ItemFilterClasses.FilterChip, ItemFilterClasses.FilterChipPrefix)
				.classes.toggle(filter.id === Filter.Raw, ItemFilterClasses.FilterChipRaw)
				.style.set("--colour", IFilter.colour(value, filter.colour))
				.append(textNode = document.createTextNode(filter.prefix))
				.appendTo(this.input);

			// handle range being in prefix
			for (let i = 0; i < ranges.length; i++) {
				const range = ranges[i];
				for (let ri = 0; ri < 2; ri++) {
					if (range[ri] >= token.start && range[ri] <= token.start + filter.prefix.length) {
						rangeElements[i][ri === 0 ? "setStart" : "setEnd"](textNode, range[ri] - token.start);
					}
				}
			}

			const icon = IFilter.icon(value, filter.icon);
			const maskIcon = IFilter.icon(value, filter.maskIcon);
			Component.create("span")
				.classes.add(ItemFilterClasses.FilterChip, ItemFilterClasses.FilterChipValue)
				.classes.toggle(filter.id === Filter.Raw, ItemFilterClasses.FilterChipRaw)
				.classes.toggle(icon !== undefined, ItemFilterClasses.FilterChipValueHasIcon)
				.classes.toggle(maskIcon !== undefined, ItemFilterClasses.FilterChipValueHasMaskIcon)
				.style.set("--colour", IFilter.colour(value, filter.colour))
				.style.set("--icon", icon ?? maskIcon)
				.append(textNode = document.createTextNode(value))
				.appendTo(this.input);

			// handle range being in value
			for (let i = 0; i < ranges.length; i++) {
				const range = ranges[i];
				for (let ri = 0; ri < 2; ri++) {
					if (range[ri] >= token.start + filter.prefix.length && range[ri] <= token.end) {
						rangeElements[i][ri === 0 ? "setStart" : "setEnd"](textNode, range[ri] - (token.start + filter.prefix.length));
					}
				}
			}

			lastEnd = token.end;
		}

		if (this.input.element.textContent?.trim())
			this.input.element.appendChild(document.createTextNode("\xa0"));

		// handle range being in whitespace after all tokens
		if (this.input.element.lastChild)
			for (let i = 0; i < ranges.length; i++) {
				const range = ranges[i];
				for (let ri = 0; ri < 2; ri++) {
					if (range[ri] > lastEnd) {
						rangeElements[i][ri === 0 ? "setStart" : "setEnd"](this.input.element.lastChild, 1);
					}
				}
			}

		if (!tokens.length)
			selection.collapse(this.input.element);

		else
			for (const range of rangeElements) {
				if (range.startContainer === document || range.endContainer === document)
					continue;

				selection.addRange(range);
			}

		this.resetButton.classes.toggle(!tokens.length, Classes.Hidden);

		if (this.filterer.hasChanged())
			this.event.emit("filter");
	}

	private getTokens () {
		const text = `${this.input.element.textContent ?? ""} `; // end text in a space so it ends the last token the same way
		const tokens: IToken[] = [];
		let start = -1;
		for (let i = 0; i < text.length; i++) {
			const isWhitespace = text[i] === " " || text[i] === "\xa0" || text[i] === "\t" || text[i] === "\n" || text[i] === "\r";
			if (start === -1) {
				// not in token
				if (!isWhitespace)
					start = i;

			} else {
				// in token
				if (isWhitespace) {
					const tokenText = text.slice(start, i);
					tokens.push({
						text: tokenText,
						raw: tokenText.replace(/["'`[\]()]/g, "")
							.replace(/[\s\n\r]+/g, " ")
							.trim(),
						start,
						end: i,
					});
					start = -1;
				}
			}

			if (start !== -1 && text[i] in QUOTES) {
				const quote = QUOTES[text[i] as keyof typeof QUOTES];
				// upon entering a quote, continue until reaching the end quote
				const textEndingInQuote = `${this.input.element.textContent ?? ""}${quote}`
				for (i++; i < textEndingInQuote.length; i++)
					if (textEndingInQuote[i] === quote)
						break;

				if (i === textEndingInQuote.length - 1)
					i--;
			}
		}

		return tokens;
	}

	private getRanges () {
		let i = 0;
		const selection = window.getSelection()!;
		const rangePositions: [start: number, end: number][] = [];
		for (const node of this.input.element.childNodes) {
			let length = 0;
			switch (node.nodeType) {
				case Node.TEXT_NODE: {
					length = (node as Text).length;
					break;
				}
				case Node.ELEMENT_NODE: {
					length = (node as HTMLElement).textContent?.length ?? 0;
					break;
				}
			}

			for (let ri = 0; ri < selection.rangeCount; ri++) {
				rangePositions[ri] ??= [-1, -1];
				const range = selection.getRangeAt(ri);
				if (range.startContainer === node || range.startContainer === node.firstChild)
					rangePositions[ri][0] = i + range.startOffset;
				if (range.endContainer === node || range.endContainer === node.firstChild)
					rangePositions[ri][1] = i + range.endOffset;
			}

			i += length;
		}

		return rangePositions.filter(([start, end]) => start !== -1 && end !== -1);
	}

	private setCursorAtEnd (node?: Node | null) {
		const selection = window.getSelection();
		selection?.removeAllRanges();
		const range = new Range();
		range.selectNodeContents(node ?? this.input.element);
		range.collapse();
		selection?.addRange(range);
	}

	private setCursorAtLastChipValue () {
		this.setCursorAtEnd(this.input.element.querySelector(`.${ItemFilterClasses.FilterChipValue}:last-child`));
	}
}
