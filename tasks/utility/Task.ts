import { spawn } from "child_process";
import path from "path";
import type { ITaskApi } from "./TaskRunner";

const SYMBOL_IS_TASK_FUNCTION = Symbol("IS_TASK_FUNCTION");

export type TaskFunctionDef<T, ARGS extends any[] = []> = (api: ITaskApi, ...args: ARGS) => T;
export interface TaskFunction<T, ARGS extends any[] = []> extends TaskFunctionDef<T, ARGS> {
	[SYMBOL_IS_TASK_FUNCTION]: true;
}

function Task<T, ARGS extends any[] = []> (name: string | null, task: TaskFunctionDef<T, ARGS>) {
	Object.defineProperty(task, "name", { value: name });
	Object.defineProperty(task, SYMBOL_IS_TASK_FUNCTION, { value: true });
	return task as TaskFunction<T, ARGS>;
}

namespace Task {

	export function is (value: unknown): value is TaskFunction<unknown> {
		return typeof value === "function" && (value as TaskFunction<unknown>)[SYMBOL_IS_TASK_FUNCTION];
	}

	export interface ITaskCLIOptions {
		cwd?: string;
		stdout?(data: string): any;
	}

	export function cli (command: string, ...args: string[]): Promise<void>;
	export function cli (options: ITaskCLIOptions, command: string, ...args: string[]): Promise<void>;
	export function cli (options: ITaskCLIOptions | string, command?: string, ...args: string[]) {
		return new Promise<void>((resolve, reject) => {
			const ext = process.platform === "win32" ? ".cmd" : "";

			if (typeof options === "string") {
				args.unshift(command!);
				command = options;
				options = {};
			}

			command = command!;
			command = command.startsWith("PATH:") ? command.slice(5) : path.resolve(`node_modules/.bin/${command}`);
			const childProcess = spawn(command + ext, [...args],
				{ stdio: [process.stdin, options.stdout ? "pipe" : process.stdout, process.stderr], cwd: options.cwd });

			if (options.stdout)
				childProcess.stdout?.on("data", options.stdout);

			childProcess.on("error", reject);
			childProcess.on("exit", code => {
				if (code) reject(`Error code ${code}`);
				else resolve();
			});
		});
	}
}

export default Task;
