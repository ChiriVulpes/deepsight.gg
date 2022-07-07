import { Classes } from "ui/Classes";
import type { ComponentEventManager } from "ui/Component";
import Component from "ui/Component";
import Button from "ui/form/Button";
import Drawer from "ui/form/Drawer";
import Filter from "ui/inventory/filter/Filter";
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
	FilterChip = "item-filter-chip",
	FilterChipPrefix = "item-filter-chip-prefix",
	FilterChipValue = "item-filter-chip-value",
	FilterChipRaw = "item-filter-chip-raw",
	Drawer = "item-filter-drawer",
	DrawerPanel = "item-filter-drawer-panel",
	FiltersHeading = "item-filter-heading",
}

export interface IItemFilterEvents {
	filter: Event;
}

export default class ItemFilter extends Component<HTMLElement, [FilterManager]> {

	public override readonly event!: ComponentEventManager<this, IItemFilterEvents>;

	public filterer!: FilterManager;
	public button!: Button;
	public label!: Component;
	public input!: Component;
	public drawer!: Drawer;
	public mainPanel!: Component;

	protected override onMake (filterer: FilterManager): void {
		this.filterer = filterer;
		this.classes.add(ItemFilterClasses.Main);

		////////////////////////////////////
		// Button
		this.button = Button.create()
			.classes.add(ItemFilterClasses.Button)
			.event.subscribe("click", this.openDrawer.bind(this))
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
			.appendTo(this.button);

		////////////////////////////////////
		// Drawer
		this.drawer = Drawer.create()
			.classes.add(ItemFilterClasses.Drawer)
			.event.subscribe("focus", () => this.input.element.focus())
			.appendTo(this);

		this.mainPanel = this.drawer.createPanel();

		Component.create()
			.classes.add(ItemFilterClasses.FiltersHeading)
			.text.set("Suggested Filters")
			.appendTo(this.mainPanel);

		this.onFocusOut = this.onFocusOut.bind(this);
		this.onGlobalKeydown = this.onGlobalKeydown.bind(this);
		UiEventBus.subscribe("keydown", this.onGlobalKeydown);
	}

	private openDrawer () {
		this.input.element.focus();
		if (!this.drawer.classes.has(Classes.Hidden))
			return;

		this.drawer.open();
		const selection = window.getSelection();
		selection?.selectAllChildren(this.input.element);
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		document.addEventListener("focusout", this.onFocusOut);
	}

	private closeDrawer () {
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

		if (event.useOverInput("f", "ctrl"))
			this.openDrawer();

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

	private onInput (event: Event) {
		this.cleanup();
	}

	private cleanup () {
		const ranges = this.getRanges();
		const tokens = this.getTokens();

		const selection = window.getSelection()!;
		selection.removeAllRanges();
		this.input.removeContents();

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

			let textNode: Text;
			Component.create("span")
				.classes.add(ItemFilterClasses.FilterChip, ItemFilterClasses.FilterChipPrefix)
				.classes.toggle(filter.id === Filter.Raw, ItemFilterClasses.FilterChipRaw)
				.style.set("--colour", !filter.colour ? undefined : `#${filter.colour.toString(16)}`)
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

			Component.create("span")
				.classes.add(ItemFilterClasses.FilterChip, ItemFilterClasses.FilterChipValue)
				.classes.toggle(filter.id === Filter.Raw, ItemFilterClasses.FilterChipRaw)
				.style.set("--colour", !filter.colour ? undefined : `#${filter.colour.toString(16)}`)
				.append(textNode = document.createTextNode(token.text.slice(filter.prefix.length)))
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

		this.input.element.appendChild(document.createTextNode("\xa0"));

		// handle range being in whitespace after all tokens
		for (let i = 0; i < ranges.length; i++) {
			const range = ranges[i];
			for (let ri = 0; ri < 2; ri++) {
				if (range[ri] > lastEnd) {
					rangeElements[i][ri === 0 ? "setStart" : "setEnd"](this.input.element.lastChild!, 1);
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
}
