import ansi from "ansicolor";
import { spawn } from "child_process";
import dotenv from "dotenv";
import * as tsconfigpaths from "tsconfig-paths";
import Log from "./Log";
import type { TaskFunction, TaskFunctionDef } from "./Task";
import Task from "./Task";
import { stopwatch } from "./Time";

try {
	dotenv.config();
} catch { }

tsconfigpaths.register();

export interface ITaskApi {
	lastError?: Error;
	series (...tasks: TaskFunctionDef<any>[]): TaskFunction<any>;
	parallel (...tasks: TaskFunctionDef<any>[]): TaskFunction<any>;
	run<T, ARGS extends any[]> (task: TaskFunctionDef<T, ARGS>, ...args: ARGS): T | Promise<T>;
	debounce<T, ARGS extends any[]> (task: TaskFunctionDef<T, ARGS>, ...args: ARGS): void;
}

interface IDebouncedTask {
	promise: Promise<void>;
	count: number;
}

const debouncedTasks = new Map<TaskFunctionDef<any, any[]>, IDebouncedTask>();

const loggedErrors = new Set<Error>();

const taskApi: ITaskApi = {
	lastError: undefined,
	series (...tasks): TaskFunction<Promise<void>> {
		return Task(null, async api => {
			for (const task of tasks)
				await api.run(task);
		});
	},
	parallel (...tasks): TaskFunction<Promise<void>> {
		return Task(null, async api => {
			await Promise.all(tasks.map(task => Promise.resolve(api.run(task))));
		});
	},
	/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
	run (task, ...args: any[]) {
		let result: any;
		const taskName = ansi.cyan(task.name);

		if (task.name)
			Log.info(`Starting ${taskName}...`);
		const watch = stopwatch();

		let err: Error | undefined;
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			result = (task as TaskFunctionDef<any, any[]>)(this, ...args);
		} catch (caught: any) {
			err = caught;
			this.lastError = caught;
		}

		if (err)
			throw err;

		function logResult () {
			const time = watch.time();
			if (err) {
				if (!loggedErrors.has(err)) {
					loggedErrors.add(err);
					Log.error(`Task ${taskName ?? ansi.cyan("<anonymous>")} errored after ${time}:`, err);
				}
			} else if (task.name)
				Log.info(`Finished ${taskName} in ${time}`);
		}

		if (result instanceof Promise) {
			result = result
				.then(result => {
					logResult();
					if (Task.is(result))
						return this.run(result);

					return result;
				})
				.catch(caught => {
					this.lastError = caught;
					err = caught;
					logResult();
					throw err;
				});

			return result;
		}

		logResult();
		if (Task.is(result))
			return this.run(result);

		return result;
	},
	/* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
	debounce (task, ...args) {
		let debouncedTask = debouncedTasks.get(task as TaskFunctionDef<any, any[]>);
		if (!debouncedTask) {
			debouncedTask = {
				promise: Promise.resolve(),
				count: 0,
			};
			debouncedTasks.set(task as TaskFunctionDef<any, any[]>, debouncedTask);
		}

		if (debouncedTask.count <= 1) {
			debouncedTask.count++;
			debouncedTask.promise = debouncedTask.promise.then(async () => {
				try {
					await this.run(task as TaskFunctionDef<any, any[]>, ...args);
				} catch { }
				debouncedTask!.count--;
			});
		}
	},
};

////////////////////////////////////
// Code
//

function onError (err: Error) {
	Log.error(err.stack ?? err);
}

process.on("uncaughtException", onError);
process.on("unhandledRejection", onError);

const [, , ...tasks] = process.argv;
void (async () => {
	let errors = false;
	for (const task of tasks) {
		try {
			if (tasks.length === 1) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
				const taskFunction = require(`../${task}.ts`)?.default;
				if (!taskFunction)
					throw new Error(`No task function found by name "${task}"`);

				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				await taskApi.run(taskFunction);
				continue;
			}

			await new Promise((resolve, reject) => {
				const p = spawn("npx", ["ts-node", __filename, task], { shell: true, stdio: "inherit" });
				p.on("error", reject);
				p.on("close", resolve);
			});

		} catch (err) {
			if (!loggedErrors.has(err as Error))
				Log.error(err);
			errors = true;
			break;
		}
	}

	if (errors || taskApi.lastError)
		process.exit(1);
})();
