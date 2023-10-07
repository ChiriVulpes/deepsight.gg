namespace Maths {
	/**
	 * Note: This implementation matches DIM's to ensure consistency between apps.  
	 * See: https://github.com/DestinyItemManager/DIM/blob/83ec236416fae879c09f4aa93be7d3be4843510d/src/app/inventory/store/stats.ts#L582-L585
	 * Also see: https://github.com/Bungie-net/api/issues/1029#issuecomment-531849137
	 */
	export function bankersRound (x: number) {
		const r = Math.round(x);
		return (x > 0 ? x : -x) % 1 === 0.5 ? (0 === r % 2 ? r : r - 1) : r;
	}

	export function sum (...nums: number[]) {
		let result = 0;
		for (const num of nums)
			result += num;
		return result;
	}

	export function average (...nums: number[]) {
		let result = 0;
		for (const num of nums)
			result += num;
		return result / nums.length;
	}

	export function bits<FLAG_TYPE extends number> (number: FLAG_TYPE) {
		const result = new BitsSet<FLAG_TYPE>();
		for (let i = 52; i >= 0; i--) {
			const v = 1 << i;
			if (number & v) result.add(v as FLAG_TYPE);
		}
		return result;
	}

	export class BitsSet<FLAG_TYPE extends number> extends Set<FLAG_TYPE> {
		public everyIn (type?: FLAG_TYPE) {
			const t = type ?? 0;
			for (const bit of this)
				if (!(t & bit))
					return false;

			return true;
		}

		public someIn (type?: FLAG_TYPE) {
			const t = type ?? 0;
			for (const bit of this)
				if (t & bit)
					return true;

			return false;
		}

		public every (predicate: (type: FLAG_TYPE) => any) {
			for (const bit of this)
				if (!predicate(bit))
					return false;

			return true;
		}

		public some (predicate: (type: FLAG_TYPE) => any) {
			for (const bit of this)
				if (predicate(bit))
					return true;

			return false;
		}
	}
}

export default Maths;
