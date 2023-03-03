import { Classes } from "ui/Classes";
import type { ComponentEventManager, ComponentEvents } from "ui/Component";
import Component from "ui/Component";
import Button, { ButtonClasses } from "ui/form/Button";
import Drawer from "ui/form/Drawer";
import Filter, { IFilter } from "ui/inventory/filter/Filter";
import type FilterManager from "ui/inventory/filter/FilterManager";
import type { IKeyEvent } from "ui/UiEventBus";
import UiEventBus from "ui/UiEventBus";
import Async from "utility/Async";
import Store from "utility/Store";
import Strings from "utility/Strings";

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
	FilterChipButtonSelected = "item-filter-chip-button-selected",
}

export interface IItemFilterEvents extends ComponentEvents<typeof Component> {
	filter: Event;
}

class FilterChipButton extends Button<[filter: IFilter, value: string, icon?: string, isHint?: true]> {

	public prefix!: string;
	public value!: string;
	public searchableValue!: string;
	public id!: string;
	public isHint!: boolean;
	public shouldHideByDefault!: boolean;

	protected override onMake (filter: IFilter, value: string, icon?: string, isHint?: true): void {
		super.onMake(filter, value, icon, isHint);
		this.isHint = isHint ?? false;
		this.shouldHideByDefault = !isHint && !!filter.suggestedValueHint && !!filter.suggestedValues?.length && filter.suggestedValues.length > 5;

		icon ??= IFilter.icon(value, filter.icon);
		const maskIcon = IFilter.icon(value, filter.maskIcon);

		this.prefix = filter.prefix;
		this.value = value;
		this.searchableValue = ` ${value.toLowerCase()}`;
		this.id = `${filter.prefix}${value.toLowerCase()}`;

		this.classes.add(ItemFilterClasses.FilterChipButton)
			.classes.toggle(this.shouldHideByDefault, Classes.Hidden)
			.classes.add(`${ItemFilterClasses.FilterChipButton}-${Filter[filter.id]}`)
			.attributes.set("data-id", this.id)
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

	public visible = true;
	public show () {
		this.classes.remove(Classes.Hidden);
		this.visible = true;
		return this;
	}

	public hide () {
		this.classes.add(Classes.Hidden);
		this.visible = false;
		return this;
	}

	public toggle (visible: boolean) {
		this.classes.toggle(!visible, Classes.Hidden);
		this.visible = visible;
		return this;
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
	public suggestedChips!: FilterChipButton[];

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
			.text.set(Store.items.settingsClearItemFilterOnSwitchingViews ? "" : Store.items.itemFilter ?? "")
			.event.subscribe("paste", this.onPaste)
			.event.subscribe("input", this.onInput)
			.event.subscribe("focus", () => {
				this.button.attributes.set("tabindex", "-1");
				void this.openDrawer();
			})
			.event.subscribe("blur", () => {
				this.button.attributes.remove("tabindex");
			})
			.appendTo(this.button);

		this.reset = this.reset.bind(this);
		this.resetButton = Button.create()
			.classes.add(ItemFilterClasses.Reset, Classes.Hidden)
			.event.subscribe("click", () => this.reset(true))
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

		this.suggestedChips = [];
		for (const filter of filterer.getApplicable()) {
			if (!filter.suggestedValues?.length && !filter.suggestedValueHint)
				continue;

			if (filter.suggestedValueHint)
				this.suggestedChips.push(FilterChipButton.create([filter, filter.suggestedValueHint, undefined, true])
					.event.subscribe("click", () => this.toggleChip(filter))
					.appendTo(suggestedFilters));

			for (const value of filter.suggestedValues ?? [])
				this.suggestedChips.push(FilterChipButton.create([filter, typeof value === "string" ? value : value.name, typeof value === "string" ? undefined : value.icon])
					.event.subscribe("click", () => this.toggleChip(filter, typeof value === "string" ? value : value.name))
					.appendTo(suggestedFilters));
		}

		this.onFocusOut = this.onFocusOut.bind(this);
		this.onGlobalKeydown = this.onGlobalKeydown.bind(this);
		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
		this.cleanup();

		this.onSelectionChange = this.onSelectionChange.bind(this);
		document.addEventListener("selectionchange", this.onSelectionChange);
	}

	public isFiltered () {
		return this.input.hasContents();
	}

	public reset (focus = false) {
		this.input.removeContents();
		this.cleanup(focus);
		this.filterChips();
	}

	private async openDrawer () {
		if (!this.drawer.classes.has(Classes.Hidden))
			return this.input.element.focus();

		this.drawer.open();

		await Async.sleep(0); // next tick
		this.input.element.focus();
		const selection = window.getSelection();
		if (!this.input.element.contains(selection?.focusNode ?? null) || !this.input.element.contains(selection?.anchorNode ?? null))
			selection?.selectAllChildren(this.input.element);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		document.addEventListener("focusout", this.onFocusOut);
	}

	private closeDrawer () {
		this.drawer.close();
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		document.removeEventListener("focusout", this.onFocusOut);
	}

	private async onFocusOut () {
		await Async.sleep(0); // next tick

		if (this.element.contains(document.activeElement))
			return;

		this.closeDrawer();
	}

	private onSelectionChange () {
		if (!document.contains(this.element)) {
			document.removeEventListener("selectionchange", this.onSelectionChange);
			return;
		}

		const selection = window.getSelection();
		if (selection?.isCollapsed && this.input.contains(selection.anchorNode) && this.input.contains(selection.focusNode))
			this.filterChips();
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

		if (this.input.isFocused()) {
			if (event.useOverInput("Escape")) {
				this.closeDrawer();
				this.reset(true);
			}

			if (event.useOverInput("ArrowUp")) {
				this.selectUp();
			}

			if (event.useOverInput("ArrowDown")) {
				this.selectDown();
			}

			if (this.currentSelection) {
				if (event.useOverInput("ArrowLeft")) {
					this.selectLeft();
				}

				if (event.useOverInput("ArrowRight")) {
					this.selectRight();
				}

				if (event.useOverInput(" ") || event.useOverInput("Enter")) {
					this.currentSelection.event.emit(new MouseEvent("click"));
					return;
				}
			}
		}

		if (this.drawer.isOpen() && event.useOverInput("Enter")) {
			this.closeDrawer();
			this.event.emit(new SubmitEvent("submit"));
		}

		// cancel keybinds
		event.useOverInput("b", "ctrl");
		event.useOverInput("i", "ctrl");
		event.useOverInput("u", "ctrl");
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

		void this.openDrawer();
		this.cleanup();
		this.filterChips();
	}

	private _visibleChips?: FilterChipButton[];
	private get visibleChips () {
		return this._visibleChips ??= this.suggestedChips.filter(chip => !chip.classes.has(Classes.Hidden));
	}

	private currentSelection?: FilterChipButton;
	private getCurrentSelection (from: "front" | "end") {
		return this.currentSelection ??= this.getSelectionFrom(from === "front" ? "end" : "front");
	}

	private getSelectionFrom (from: "front" | "end") {
		return from === "front" ? this.visibleChips[0] : this.visibleChips[this.visibleChips.length - 1];
	}

	private findSelection (getSortIndex: (rect: DOMRect, currentBox: DOMRect) => number, currentBox: DOMRect) {
		for (const filter of this.visibleChips)
			filter.getRect(true);

		const sorted = this.visibleChips.sort((a, b) => getSortIndex(b.getRect(), currentBox) - getSortIndex(a.getRect(), currentBox));
		return getSortIndex(sorted[0].getRect(), currentBox) < 0 ? undefined : sorted[0];
	}

	private select (from: "front" | "end", getSortIndex: (rect: DOMRect, currentBox: DOMRect) => number, defaultToFrom = true) {
		delete this._visibleChips;
		const currentSelection = this.getCurrentSelection("end");
		const currentBox = currentSelection.getRect(true);
		const selection = this.findSelection(getSortIndex, currentBox)
			?? (defaultToFrom ? this.getSelectionFrom(from) : undefined);

		if (selection) {
			this.currentSelection?.classes.remove(ItemFilterClasses.FilterChipButtonSelected, ButtonClasses.Selected);
			this.currentSelection = selection;
			this.currentSelection?.classes.add(ItemFilterClasses.FilterChipButtonSelected, ButtonClasses.Selected);
			this.currentSelection?.element.scrollIntoView({ block: "center" });
		}
	}

	private selectUp () {
		this.select("end", (rect, currentBox) => currentBox.top < rect.bottom ? -1000000 : (100000 - Math.abs(rect.bottom - currentBox.top)) * 10000 - Math.abs(rect.centerX - currentBox.centerX));
	}

	private selectDown () {
		this.select("front", (rect, currentBox) => currentBox.bottom > rect.top ? -1000000 : (100000 - Math.abs(rect.top - currentBox.bottom)) * 10000 - Math.abs(rect.centerX - currentBox.centerX));
	}

	private selectLeft () {
		this.select("end", (rect, currentBox) => currentBox.centerY !== rect.centerY ? -10000000 : currentBox.left < rect.right ? -1000000 : 10000 - (Math.abs(rect.centerX - currentBox.centerX)), false);
	}

	private selectRight () {
		this.select("front", (rect, currentBox) => currentBox.centerY !== rect.centerY ? -10000000 : currentBox.right > rect.left ? -1000000 : 10000 - (Math.abs(currentBox.centerX - rect.centerX)), false);
	}

	private toggleChip (filter: IFilter, value?: string) {
		const chipText = `${filter.prefix}${!value ? "" : value.includes(" ") ? `"${value}"` : value}`;

		const editingChip = this.getEditingChip();
		const textContent = this.input.element.textContent ?? "";

		let removed = false
		if (!editingChip) {
			const chipRegex = new RegExp(`(?<=^| |\xa0)${chipText}(?= |\xa0|$)`);
			removed = chipRegex.test(textContent);
			if (removed)
				this.input.element.textContent = textContent.replace(chipRegex, "");
			else
				this.input.element.appendChild(document.createTextNode(chipText));

		} else {
			editingChip.value?.remove();
			editingChip.prefix.replaceWith(document.createTextNode(chipText));
		}

		this.cleanup();

		if (removed || value)
			this.setCursorAtEnd();
		else
			this.setCursorAtLastChipValue();

		this.filterChips();
	}

	private onInput (event: Event) {
		void this.openDrawer();
		this.cleanup();
		this.filterChips();
	}

	private cleanup (focus = true) {
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
						rangeElements[i][ri === 0 ? "setStart" : "setEnd"](this.input.element.lastChild ?? this.input.element, this.input.element.lastChild ? 1 : 0);
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

			const valueRaw = token.text.slice(filter.prefix.length);
			const value = Strings.extractFromQuotes(valueRaw).toLowerCase();
			const forceAddQuotes = valueRaw.length > value.length;

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
				.classes.add(`${ItemFilterClasses.FilterChip}-${Filter[filter.id]}`)
				.classes.toggle(filter.id === Filter.Raw, ItemFilterClasses.FilterChipRaw)
				.classes.toggle(icon !== undefined, ItemFilterClasses.FilterChipValueHasIcon)
				.classes.toggle(maskIcon !== undefined, ItemFilterClasses.FilterChipValueHasMaskIcon)
				.style.set("--colour", IFilter.colour(value, filter.colour))
				.style.set("--icon", icon ?? maskIcon)
				.append(textNode = document.createTextNode(forceAddQuotes || value.includes(" ") ? `"${value}"` : value))
				.appendTo(this.input);

			// handle range being in value
			for (let i = 0; i < ranges.length; i++) {
				const range = ranges[i];
				for (let ri = 0; ri < 2; ri++) {
					if (range[ri] >= token.start + filter.prefix.length && range[ri] <= token.end) {
						rangeElements[i][ri === 0 ? "setStart" : "setEnd"](textNode, Math.min(range[ri] - (token.start + filter.prefix.length), textNode.length));
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

		if (focus) {
			if (!tokens.length)
				selection.collapse(this.input.element);

			else
				for (const range of rangeElements) {
					if (range.startContainer === document || range.endContainer === document)
						continue;

					selection.addRange(range);
				}
		}

		this.resetButton.classes.toggle(!tokens.length, Classes.Hidden);

		Store.items.itemFilter = this.input.element.textContent ?? "";

		if (this.filterer.hasChanged())
			this.event.emit("filter");
	}

	private getEditingChip () {
		const selection = window.getSelection()!;
		const currentInputChip = !selection.isCollapsed ? undefined
			: (selection.anchorNode?.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection.anchorNode as Element)
				?.closest(`.${ItemFilterClasses.FilterChip}`);

		const prefix = currentInputChip?.classList.contains(ItemFilterClasses.FilterChipPrefix) ? currentInputChip : currentInputChip?.previousElementSibling;
		const value = currentInputChip?.classList.contains(ItemFilterClasses.FilterChipValue) ? currentInputChip : currentInputChip?.nextElementSibling;
		return prefix ? {
			prefix,
			value,
		} : undefined;
	}

	private filterChips () {
		this.currentSelection?.classes.remove(ItemFilterClasses.FilterChipButtonSelected, ButtonClasses.Selected);
		delete this.currentSelection;

		const editingChip = this.getEditingChip();
		const currentChips = this.filterer.getFilterIds();

		const prefix = editingChip?.prefix.textContent ?? "";
		const value = Strings.extractFromQuotes(editingChip?.value?.textContent);
		const id = `${prefix}${value}`;
		const words = !value ? [] : value.toLowerCase().split(/\s+/g);
		for (const chip of this.suggestedChips) {
			if (currentChips.includes(chip.id)) {
				chip.hide();
				continue;
			}

			if (chip.isHint) {
				chip.toggle(!id || chip.id.startsWith(id) && id.length < chip.prefix.length)
				continue;
			}

			const wordsInChip = () => words.every(word => chip.searchableValue.includes(` ${word}`));

			if (chip.shouldHideByDefault)
				chip.toggle(!!id && (!prefix && !!words.length && (wordsInChip() || chip.prefix.startsWith(id)) || id.startsWith(chip.prefix) && wordsInChip()));
			else
				chip.toggle(!id || (!prefix && !!words.length && (wordsInChip() || chip.prefix.startsWith(id)) || id.startsWith(chip.prefix) && wordsInChip()));
		}
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
