import ansi from "ansicolor";
import { timestamp } from "./Time";

type LogFunction = (...what: any[]) => void;

interface ILog {
	info: LogFunction;
	warn: LogFunction;
	error: LogFunction;
	setSources (...sources: string[]): ILog;
}

namespace ILog {
	export function is (value: unknown): value is ILog {
		return typeof value === "object"
			&& value !== null
			&& typeof (value as ILog).info === "function"
			&& typeof (value as ILog).warn === "function"
			&& typeof (value as ILog).error === "function"
			&& typeof (value as ILog).setSources === "function";
	}
}

export interface ILogSource {
	log: ILog;
}

export namespace ILogSource {
	export function is (value: unknown): value is ILogSource {
		return typeof value === "object"
			&& value !== null
			&& ILog.is((value as ILogSource).log);
	}
}

// eslint-disable-next-line prefer-const
let Log: LogImplementation;
class LogImplementation implements ILog {
	private source: string | undefined;

	public info (...what: any[]) {
		if (this.source !== undefined)
			console.log(timestamp(), this.source, ...what);
		else
			console.log(timestamp(), ...what);
	}

	public warn (...what: any[]) {
		if (this.source !== undefined)
			console.log(timestamp("yellow"), this.source, ...what);
		else
			console.warn(timestamp("yellow"), ...what);
	}

	public error (...what: any[]) {
		if (this.source !== undefined)
			console.log(timestamp("red"), this.source, ...what);
		else
			console.error(timestamp("red"), ...what);
	}

	public setSources (...sources: string[]) {
		this.source = ansi.darkGray("- ") + sources.join(ansi.darkGray(" / ")) + ansi.darkGray(" -");
		return this;
	}

	public get (source: unknown): ILog;
	public get (...sources: string[]): ILog;
	public get (source: unknown, ...sources: string[]) {
		if (typeof source !== "string") {
			if (ILog.is(source))
				return source;

			if (ILogSource.is(source))
				return source.log;

			return Log;
		}

		return this.new(source, ...sources);
	}

	public new (...sources: string[]): ILog {
		return new LogImplementation()
			.setSources(...sources);
	}
}

Log = new LogImplementation();

export default Log;
