import Log from "./Log";

namespace Errors {
	export function create (message: string, error?: unknown): Error {
		if (error === undefined) {
			const result = new Error(message);

			const stackLines = result.stack?.split("\n");
			if ((stackLines?.length ?? 0) > 1) {
				stackLines!.splice(1, 1);
				result.stack = stackLines!.join("\n");
			}

			return result;
		}

		if (!(error instanceof Error)) {
			Log.warn("Passed non-error into Errors.create:", error);
			return Errors.create(message);
		}

		error.message = `${message}${error.message ? `: ${error.message}` : ""}`;
		if (error.stack)
			error.stack = `${message}: ${error.stack}`;

		return error;
	}
}

export default Errors;
