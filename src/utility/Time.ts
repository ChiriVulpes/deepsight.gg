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
	export function months (months: number) { return months * 1000 * 60 * 60 * 24 * (365.2422 / 12); }
	export function years (months: number) { return months * 1000 * 60 * 60 * 24 * 365.2422; }
}

export default Time;
