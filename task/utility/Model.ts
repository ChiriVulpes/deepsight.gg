export default function Model<ARGS extends any[], RETURN> (generator: (...args: ARGS) => Promise<RETURN>) {
	const result: Partial<Record<string, RETURN | Promise<RETURN>>> = {};
	return {
		get: (...args: ARGS) => {
			const id = args.map(arg => {
				if (typeof arg === "object" || typeof arg === "function")
					throw new Error("Cannot use model arguments that are not stringify-able");

				return `${arg}`;
			})
				.join(",");

			if (result[id]) return result[id]!;

			const promise = result[id] = generator(...args);
			return promise.then(r => result[id] = r);
		},
	};
}
