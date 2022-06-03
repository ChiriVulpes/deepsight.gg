import View, { ViewClasses } from "ui/View";
import Async from "utility/Async";

export default class ViewManager {

	private view?: View;

	public show (view: View) {
		const oldView = this.view;
		if (oldView) {
			oldView.classes.add(ViewClasses.Hidden);
			void Async.sleep(1000).then(() => oldView.remove());
		}

		view.appendTo(document.body);
	}
}
