import type { ISOString } from "../../../static/manifest/Interfaces";
import Time from "../../utility/Time";

export interface Rotation {
	/**
	 * A datetime string in the ISO format, yyyy-mm-ddThh:mm:ssZ, representing the time the rotations start from.
	 */
	anchor: ISOString;
	/**
	 * Whether this rotation is daily or weekly. Defaults to weekly.
	 */
	interval?: "daily" | "weekly";
}

namespace Rotation {
	export function get (rotation: Rotation): number {
		const interval = rotation.interval === "daily" ? Time.days(1) : Time.weeks(1);

		const anchorTime = new Date(rotation.anchor).getTime();
		return Math.floor((Date.now() - anchorTime) / interval);
	}

	export function resolve<T> (rotation: Rotation, over: T[]): T {
		return over[get(rotation) % over.length];
	}
}

export default Rotation;
