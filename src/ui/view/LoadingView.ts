import Model from "model/Model";
import View from "ui/View";

export enum AuthViewClasses {
	Content = "view-auth-content",
	Logo = "view-auth-logo",
	Header = "view-auth-header",
	Title = "view-auth-title",
	State = "view-auth-state",
	AuthButton = "view-auth-button-auth",
}

export default View.create({
	id: "loading",
	name: "Loading",
	noNav: true,
	models: [Model.createTemporary(model => new Promise(_ => model.emitProgress(100, "Clearing cache")))],
});
