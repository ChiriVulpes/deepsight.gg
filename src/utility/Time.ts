import Strings from "utility/Strings";

namespace Time {
	export type ISO = `${bigint}-${bigint}-${bigint}T${bigint}:${bigint}:${number}Z`;

	export function floor (interval: number) {
		return Math.floor(Date.now() / interval) * interval;
	}

	export function ms (ms: number) { return ms; }
	export function seconds (seconds: number) { return seconds * 1000; }
	export function minutes (minutes: number) { return minutes * 1000 * 60; }
	export function hours (hours: number) { return hours * 1000 * 60 * 60; }
	export function days (days: number) { return days * 1000 * 60 * 60 * 24; }
	export function weeks (weeks: number) { return weeks * 1000 * 60 * 60 * 24 * 7; }
	export function months (months: number) { return Math.floor(months * 1000 * 60 * 60 * 24 * (365.2422 / 12)); }
	export function years (years: number) { return Math.floor(years * 1000 * 60 * 60 * 24 * 365.2422); }
	export function decades (decades: number) { return Math.floor(decades * 1000 * 60 * 60 * 24 * 365.2422 * 10); }
	export function centuries (centuries: number) { return Math.floor(centuries * 1000 * 60 * 60 * 24 * 365.2422 * 10 * 10); }
	export function millenia (millenia: number) { return Math.floor(millenia * 1000 * 60 * 60 * 24 * 365.2422 * 10 * 10 * 10); }

	export interface RelativeOptions extends Intl.RelativeTimeFormatOptions {
		components?: number;
		label?: boolean;
	}

	export function relative (ms: number, options: RelativeOptions = { style: "short" }) {
		ms -= Date.now();
		const locale = navigator.language || "en-NZ";
		if (!locale.startsWith("en"))
			return relativeIntl(ms, locale, options);

		if (Math.abs(ms) < seconds(1))
			return "now";

		const ago = ms < 0;
		if (ago)
			ms = Math.abs(ms);

		let limit = options.components ?? Infinity;

		let value = ms;
		let result = ms > 0 && options.label !== false ? "in " : "";

		value = Math.floor(ms / years(1));
		ms -= value * years(1);
		if (value && limit-- > 0) result += `${value} year${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;

		value = Math.floor(ms / months(1));
		ms -= value * months(1);
		if (value && limit-- > 0) result += `${value} month${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;

		value = Math.floor(ms / weeks(1));
		ms -= value * weeks(1);
		if (value && limit-- > 0) result += `${value} week${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;

		value = Math.floor(ms / days(1));
		ms -= value * days(1);
		if (value && limit-- > 0) result += `${value} day${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;

		value = Math.floor(ms / hours(1));
		ms -= value * hours(1);
		if (value && limit-- > 0) result += `${value} hour${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;

		value = Math.floor(ms / minutes(1));
		ms -= value * minutes(1);
		if (value && limit-- > 0) result += `${value} minute${value === 1 ? "" : "s"}${limit > 0 ? ", " : ""}`;

		value = Math.floor(ms / seconds(1));
		if (value && limit-- > 0) result += `${value} second${value === 1 ? "" : "s"}`;

		result = Strings.trimTextMatchingFromEnd(result, ", ");
		return `${result}${ago && options.label !== false ? " ago" : ""}`;
	}

	function relativeIntl (ms: number, locale: string, options: Intl.RelativeTimeFormatOptions) {
		const rtf = new Intl.RelativeTimeFormat(locale, options);

		let value = ms;

		value = Math.floor(ms / years(1));
		if (value) return rtf.format(value, "year");

		value = Math.floor(ms / months(1));
		if (value) return rtf.format(value, "month");

		value = Math.floor(ms / weeks(1));
		if (value) return rtf.format(value, "week");

		value = Math.floor(ms / days(1));
		if (value) return rtf.format(value, "day");

		value = Math.floor(ms / hours(1));
		if (value) return rtf.format(value, "hour");

		value = Math.floor(ms / minutes(1));
		if (value) return rtf.format(value, "minute");

		value = Math.floor(ms / seconds(1));
		return rtf.format(value, "second");
	}

	export function absolute (ms: number, options: Intl.DateTimeFormatOptions = { dateStyle: "full", timeStyle: "medium" }) {
		const locale = navigator.language || "en-NZ";
		const rtf = new Intl.DateTimeFormat(locale, options);
		return rtf.format(ms);
	}
}

Object.assign(window, { Time });
export default Time;
