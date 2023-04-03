/* eslint-disable no-control-regex */
import ansicolor from "ansicolor";
import Log from "./utilities/Log";
import Task from "./utilities/Task";
import type { Stopwatch } from "./utilities/Time";
import { elapsed, stopwatch } from "./utilities/Time";

const options = process.env.DEEPSIGHT_ENVIRONMENT === "dev"
	? ["--inlineSourceMap", "--inlineSources", "--incremental"]
	: ["--pretty"];

class Reformatter {
	private lastStart?: Stopwatch;

	public out = (data: string | Buffer) => {
		data = data.toString("utf8");

		data = data
			.replace(/\[\x1b\[90m\d{1,2}:\d{2}:\d{2}[ \xa0\u202f][AP]M\x1b\[0m\][ \xa0\u202f]/gi, "") // remove time
			.replace(/(\x1b\[96m)(.*?\x1b\[0m:\x1b\[93m)/g, "$1src/$2"); // longer file paths

		const lines = data.split("\n");
		for (let line of lines) {
			if (line.trim().length === 0) {
				// ignore boring lines
				continue;
			}

			if (line.startsWith("> ")) {
				// ignore "> tsc --build --watch --pretty --preserveWatchOutput" line
				continue;
			}

			if (line.includes("Starting compilation in watch mode...")) {
				this.lastStart = stopwatch();
			} else if (line.includes("Starting incremental compilation...")) {
				if (this.lastStart) {
					// ignore duplicate "starting incremental compilation" line
					continue;
				}

				this.lastStart = stopwatch();
			}

			if (!process.env.WAYWARD_NO_COLOURIZE_ERRORS) {
				line = line
					.replace(/(?<!\d)0 errors/, ansicolor.lightGreen("0 errors"))
					.replace(/(?<!\d)(?!0)(\d+) errors/, ansicolor.lightRed("$1 errors"));
			}

			if (!process.env.WAYWARD_NO_LOG_TSC_DURATION && line.includes(". Watching for file changes.")) {
				line = line.replace(". Watching for file changes.", ` after ${ansicolor.magenta(elapsed(this.lastStart!.elapsed))}`);
				delete this.lastStart;
			}

			Log.info(line);
		}

	}
}

export default Task("ts", () =>
	Task.cli({ cwd: "src", stdout: new Reformatter().out }, "tsc",
		...options));

export const tsWatch = Task("ts (watch)", () =>
	Task.cli({ cwd: "src", stdout: new Reformatter().out }, "tsc", "--watch", "--preserveWatchOutput", "--pretty",
		...options));
