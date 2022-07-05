
enum Filter {
}

export default Filter;

export interface IFilter {
	id: Filter;
}

export namespace IFilter {
	export function create (filter: IFilter) {
		return filter;
	}
}
