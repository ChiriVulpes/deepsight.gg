import ansi from "ansicolor";
import dotenv from "dotenv";
import Log from "./Log";
import { TaskFunction } from "./Task";
import { stopwatch } from "./Time";

try {
	dotenv.config();
	// eslint-disable-next-line no-empty
} catch { }

export interface ITaskApi {
	lastError?: Error;
	series (...tasks: TaskFunction<any>[]): Promise<void>;
	parallel (...tasks: TaskFunction<any>[]): Promise<void>;
	run<T> (task: TaskFunction<T>): T;
	debounce<T> (task: TaskFunction<T>): void;
}

interface IDebouncedTask {
	promise: Promise<void>;
	count: number;
}

const debouncedTasks = new Map<TaskFunction<any>, IDebouncedTask>();

const loggedErrors = new Set<Error>();

const taskApi: ITaskApi = {
	lastError: undefined,
	async series (...tasks) {
		for (const task of tasks)
			await this.run(task);
	},
	async parallel (...tasks) {
		await Promise.all(tasks.map(task => Promise.resolve(this.run(task))));
	},
	/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
	run (task) {
		let result: any;
		const taskName = ansi.cyan(task.name);

		if (task.name)
			Log.info(`Starting ${taskName}...`);
		const watch = stopwatch();

		let err: Error | undefined;
		try {
			result = task(this);
		} catch (caught: any) {
			err = caught;
			this.lastError = caught;
		}

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
			result = result.then(r2 => {
				logResult();
				return r2;
			})
				.catch(caught => {
					this.lastError = caught;
					err = caught;
					logResult();
					throw err;
				});
		} else {
			logResult();
		}

		if (err)
			throw err;

		return result;
	},
	/* eslint-enable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment */
	debounce (task) {
		let debouncedTask = debouncedTasks.get(task);
		if (!debouncedTask) {
			debouncedTask = {
				promise: Promise.resolve(),
				count: 0,
			};
			debouncedTasks.set(task, debouncedTask);
		}

		if (debouncedTask.count <= 1) {
			debouncedTask.count++;
			debouncedTask.promise = debouncedTask.promise.then(async () => {
				await this.run(task);
				debouncedTask!.count--;
			});
		}
	},
};

////////////////////////////////////
// Code
//

const [, , ...tasks] = process.argv;
void (async () => {
	let errors = false;
	for (const task of tasks) {
		try {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
			const taskFunction = require(`../${task}.ts`)?.default;
			if (!taskFunction)
				throw new Error(`No task function found by name "${task}"`);

			await taskApi.run(taskFunction);

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
