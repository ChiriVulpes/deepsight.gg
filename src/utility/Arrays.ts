namespace Arrays {
	export function remove (array: any[], value: any) {
		const index = array.indexOf(value);
		if (index === -1)
			return false;

		array.splice(index, 1);
		return true;
	}
}

export default Arrays;
