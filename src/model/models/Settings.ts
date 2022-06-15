import Model from "model/Model";
import GetCoreSettings from "utility/endpoint/bungie/endpoint/GetCoreSettings";

export default Model.create("settings", {
	cache: "Global",
	resetTime: "Daily",
	generate: _ => GetCoreSettings.query(),
});
