namespace Objects {

	export enum DifferenceType {
		Presence,
		Type,
		Value,
	}

	export interface Difference {
		path: string;
		type: DifferenceType;
		unique: Set<string>;
	}

	export function findDifferences (...objs: any[]): Difference[] {
		if (objs.length === 0)
			return [];

		const differences: Difference[] = [];
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		for (const key of new Set(objs.flatMap(obj => Object.keys(obj ?? {})))) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			const values = objs.map(obj => obj?.[key]);
			if (values.every(value => value === values[0]))
				continue;

			if (!values.every(value => typeof value === typeof values[0])) {
				differences.push({
					path: key,
					type: DifferenceType.Type,
					unique: new Set(values.map(value => typeof value)),
				});
				continue;
			}

			if (values.every(value => Array.isArray(value))) {
				const arrays = values as any[][];
				if (arrays.every(arr => arr.length === 0))
					continue;

				if (!arrays.some(arr => arrays.some(arr2 => arr !== arr2 && arr.length === arr2.length))) {
					// all arrays have different lengths
					differences.push({
						path: `${key}.length`,
						type: DifferenceType.Value,
						unique: new Set(arrays.map(arr => `${arr.length}`)),
					});
					continue;
				}

				if (typeof arrays[0][0] === "object") {
					const maxLength = Math.max(...arrays.map(arr => arr.length));
					for (let i = 0; i < maxLength; i++)
						// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
						differences.push(...findDifferences(...arrays.map(arr => arr[i]))
							.map(diff => ({ ...diff, path: `${key}.${i}.${diff.path}` })));
					continue;
				}

				if (!arrays.every(arr => arr.length === arrays[0].length) || arrays.some((arr, i) => i && arr.every((value, i) => arrays[0][i] === value)))
					differences.push({
						path: key,
						type: DifferenceType.Value,
						unique: new Set(arrays.map(arr => arr.join("$$"))),
					});
				continue;
			}

			if (typeof values[0] === "object") {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				differences.push(...findDifferences(...values).map(diff => ({ ...diff, path: `${key}.${diff.path}` })));
				continue;
			}

			differences.push({
				path: key,
				type: DifferenceType.Value,
				unique: new Set(values.map(value => `${value}`)),
			});
			continue;
		}

		return differences;
	}

	export function path (obj: any, path: string) {
		const keys = path.split(/\./g);
		for (const key of keys)
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			obj = obj?.[key];

		return obj;
	}
}

export default Objects;
