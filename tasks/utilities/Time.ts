import ansi, { AnsicolorMethods } from "ansicolor";
import { performance } from "perf_hooks";

export type Stopwatch = ReturnType<typeof stopwatch>;

export function stopwatch () {
	const start = performance.now();
	let elapsedTime: number | undefined;

	function stop () {
		if (elapsedTime === undefined)
			elapsedTime = performance.now() - start;
	}

	return {
		get elapsed () {
			return elapsedTime ?? performance.now() - start;
		},
		stop,
		time: () => (stop(), elapsed(elapsedTime!)),
	};
}

export function elapsed (elapsed: number) {
	return ansi.magenta(elapsedRaw(elapsed));
}

function elapsedRaw (elapsed: number) {
	if (elapsed < 1)
		return `${Math.floor(elapsed * 1_000)} μs`

	if (elapsed < 1_000)
		return `${Math.floor(elapsed)} ms`;

	if (elapsed < 60_000)
		return `${+(elapsed / 1_000).toFixed(2)} s`;

	return `${+(elapsed / 60_000).toFixed(2)} m`;
}

const format = new Intl.DateTimeFormat("en-GB", { hour: "numeric", minute: "numeric", second: "numeric", hour12: false, timeZone: "Australia/Melbourne" });
export function timestamp (color: keyof AnsicolorMethods = "darkGray") {
	return ansi[color](format.format(new Date()));
}
