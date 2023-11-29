import type { SupplierOr } from "utility/Type";

namespace Functions {
	export function resolve<ARGS extends any[], RETURN> (fn: SupplierOr<RETURN, ARGS>, ...args: ARGS): RETURN {
		return typeof fn === "function" ? (fn as (...args: ARGS) => RETURN)(...args) : fn;
	}
}

export default Functions;
