import Strings from "utility/Strings";

enum ExportType {
	None,
	ConstEnum = "const enum",
}

type ValidExportType = Exclude<ExportType, ExportType.None>;

export default class TypeScriptParser {

	public static parse (ts: string) {
		return new TypeScriptParser(ts).parse();
	}

	private readonly result: Record<string, any> = {};
	private i = 0;

	private get char () {
		return this.ts[this.i];
	}

	private constructor (private readonly ts: string) { }

	private parse () {
		try {
			while (this.i < this.ts.length) {
				this.consumeWhitespace();
				this.parseStatement();
			}
		} catch (err) {
			const error = err as Error;
			const lastIndex = this.ts.lastIndexOf("\n", this.i) + 1;
			const nextIndex = Math.max(this.ts.indexOf("\n", this.i), 0) || Infinity;
			const line = this.ts.slice(lastIndex, nextIndex);
			const message = `TypeScript error: ${error.message}\n        ${line}\n        ${" ".repeat(this.i - lastIndex)}^`;
			error.message = message;
			// error.stack = `${message}${error.stack?.slice(error.stack.indexOf("\n") ?? 0) ?? ""}`;
			throw Object.assign(new Error(message), { stack: error.stack });
		}

		return this.result;
	}

	private parseStatement () {
		this.consumeWhitespace();
		for (; this.i < this.ts.length; this.i++) {
			const char = this.char;
			switch (char) {
				case " ": case "\t": case "\r": case "\n":
					continue;
			}

			if (this.consume("export")) {
				this.consumeWhitespace();
				const { name, value } = this.parseExport();
				this.result[name] = value;
			}
		}
	}

	private parseExport () {
		let type: ExportType = ExportType.None;
		for (const exportType of Object.values(ExportType) as ExportType[])
			if (exportType)
				if (this.consume(exportType))
					type = exportType;

		if (type === ExportType.None)
			throw new Error(`Unknown export type ${this.consumeWord() ?? "undefined"}`);

		this.consumeWhitespace();
		const name = this.consumeWord();
		if (!name)
			throw new Error(`Name expected for ${type}`);

		const value = this.parseExportValue(type);
		return { name, value };
	}

	private parseExportValue (type: ValidExportType) {
		switch (type) {
			case ExportType.ConstEnum: return this.parseEnum();
		}
	}

	private parseEnum () {
		const result: Record<string, string | number> = {};

		this.consumeWhitespace();
		this.consume("{");
		this.consumeWhitespace();

		let lastValue: number | undefined = -1;
		while (!this.consume("}")) {
			// eslint-disable-next-line prefer-const
			let { name, value } = this.parseEnumProperty();
			if (value === undefined) {
				if (lastValue === undefined)
					throw new Error(`Enum value ${name} missing initialiser`);
				value = lastValue + 1;
			}

			lastValue = typeof value === "string" ? undefined : value;
			result[name] = value;
			this.consumeWhitespace();
			this.consume(",");
			this.consumeWhitespace();
		}

		return result;
	}

	private parseEnumProperty () {
		const name = this.consumeWord();
		if (!name)
			throw new Error("Invalid characters inside enum");

		this.consumeWhitespace();
		if (this.has(",", "}"))
			return { name };

		if (!this.consume("="))
			throw new Error(`Enum value ${name} missing initialiser`);

		this.consumeWhitespace();

		const value = this.consumeNumber() ?? this.consumeString();
		return { name, value };
	}

	private consumeString () {
		const start = this.i;
		if (this.consume("\"")) {
			let ignoreNext = true;
			for (; this.i < this.ts.length; this.i++) {
				if (ignoreNext) {
					ignoreNext = false;
					continue;
				}

				if (this.char === "\\")
					ignoreNext = true;

				else if (this.char === "\"")
					return JSON.parse(this.ts.slice(start, this.i)) as string;
			}
		}
		// no current support for ' or `
		return undefined;
	}

	private consumeNumber (options: { noNegative?: true; noDecimals?: true; noExponents?: true; noNegativeWhitespace?: true; base?: number } = {}): number | undefined {
		const start = this.i;
		const base = options.base ?? 10;

		let negative = false;
		if (!options.noNegative) {
			negative = this.consume("-");
			if (negative && !options.noNegativeWhitespace)
				this.consumeWhitespace();
		}

		const numberStart = this.i;
		const firstCharCode = this.ts.charCodeAt(this.i);
		if (!inBase(firstCharCode, base))
			return this.restore(start);

		if (firstCharCode === 48) { // 0 (we might be using a different format)
			switch (this.ts[this.i + 1]) {
				case "b": case "B": {
					Object.assign(options, { base: 2, noNegative: true, noExponents: true, noDecimals: true });
					break;
				}
				case "x": case "X": {
					// technically exponents aren't supported in base 16, 
					// but it doesn't matter cuz the check for the exponent "e" would already match as a numeric character
					Object.assign(options, { base: 16, noNegative: true, noDecimals: true });
					break;
				}
				case "o": case "O": {
					Object.assign(options, { base: 8, noNegative: true, noExponents: true, noDecimals: true });
					break;
				}
			}
		}

		for (this.i++; this.i < this.ts.length; this.i++) {
			const charCode = this.ts.charCodeAt(this.i);
			const isNumeric = inBase(charCode, base);
			if (isNumeric)
				continue;

			if (charCode === 95) { // _
				if (this.ts[this.i + 1] === "_")
					return this.restore(start); // invalid separator after separator
				continue;
			}

			if (charCode === 101) { // e (exponent)
				if (options.noExponents)
					return this.restore(start);

				this.i++;
				this.consumeNumber({ noDecimals: true, noExponents: true, noNegativeWhitespace: true });
				break; // no more number after exponent ends
			}

			if (charCode === 46) { // . (decimal)
				if (options.noDecimals)
					return this.restore(start);

				this.i++;
				this.consumeNumber({ noDecimals: true, noExponents: true, noNegative: true });
				options.noDecimals = true;
				continue; // decimals can have exponents
			}

			if (this.consumeWhitespace() || this.has(",", ";", ")", "|", "}", "-", "+", "*", "/", "%", "!", "?", "=", "&", "|", "<", ">"))
				break; // no more number!!!!!!!!!!
		}

		return +this.ts.slice(numberStart, this.i) * (negative ? -1 : 1);
	}

	private consumeWord () {
		const firstCharCode = this.ts.charCodeAt(this.i);
		if (firstCharCode >= 48 && firstCharCode <= 57)
			return undefined;

		const start = this.i;
		for (; this.i < this.ts.length; this.i++) {
			const charCode = this.ts.charCodeAt(this.i);
			const isWordChar = (charCode >= 48 && charCode <= 57) // 0-9
				|| (charCode >= 65 && charCode <= 90) // A-Z
				|| (charCode >= 97 && charCode <= 122) // a-z
				|| charCode === 36 // $
				|| charCode === 95 // _

			if (!isWordChar)
				break;
		}

		return this.ts.slice(start, this.i);
	}

	private consumeWhitespace () {
		const start = this.i;
		for (; this.i < this.ts.length; this.i++) {
			const char = this.char;
			switch (char) {
				case " ": case "\t": case "\r": case "\n":
					break;
				case "/":
					this.consumeComment();
					break;
				default:
					return this.i > start;
			}
		}
		return this.i > start;
	}

	private consumeComment () {
		switch (this.ts[this.i + 1]) {
			case "/": return this.consumeLineComment();
			case "*": return this.consumeBlockComment();
		}
	}

	private consumeLineComment () {
		for (this.i += 2; this.i < this.ts.length; this.i++) {
			if (this.char === "\n") {
				this.i++;
				break;
			}
		}
	}

	private consumeBlockComment () {
		for (this.i += 2; this.i < this.ts.length; this.i++) {
			if (this.char === "*" && this.ts[this.i + 1] === "/") {
				this.i += 2;
				break;
			}
		}
	}

	private consume (...strings: string[]) {
		for (const string of strings) {
			if (Strings.includesAt(this.ts, string, this.i)) {
				this.i += string.length;
				return true;
			}
		}

		return false;
	}

	private has (...strings: string[]) {
		for (const string of strings)
			if (Strings.includesAt(this.ts, string, this.i))
				return true;
		return false;
	}

	private restore (index: number) {
		this.i = index;
		return undefined;
	}
}

function inBase (charCode: number, base: number) {
	switch (base) {
		case 2: return charCode === 48 || charCode === 49; // 0-1
		case 8: return charCode >= 48 && charCode <= 55; // 0-7
		case 10: return charCode >= 48 && charCode <= 57; // 0-9
		case 16:
			return (charCode >= 48 && charCode <= 57) // 0-9
				|| (charCode >= 97 && charCode <= 102) // a-f
				|| (charCode >= 65 && charCode <= 70) // A-F
	}
}
