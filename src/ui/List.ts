import Component from "ui/Component";

namespace List {

	class List<TYPE extends HTMLUListElement | HTMLOListElement> extends Component<TYPE> {
		public addItem (initialiser: (item: Component<HTMLLIElement>) => any) {
			Component.create("li")
				.tweak(initialiser)
				.appendTo(this);
			return this;
		}
	}

	export class Unordered extends List<HTMLUListElement> {
		protected static override defaultType = "ul";
	}

	export class Ordered extends List<HTMLOListElement> {
		protected static override defaultType = "ol";
	}
}

export default List;
