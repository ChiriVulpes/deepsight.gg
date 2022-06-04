import { spawn } from "child_process";
import path from "path";
import { ITaskApi } from "./TaskRunner";

export type TaskFunction<T> = (api: ITaskApi) => T;

function Task<T> (name: string, task: TaskFunction<T>) {
	Object.defineProperty(task, "name", { value: name });
	return task;
}

namespace Task {

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
				if (code === 1) reject("Error code 1");
				else resolve();
			});
		});
	}
}

export default Task;
