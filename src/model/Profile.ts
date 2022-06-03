import Model from "model/Model";

export default new Model<void>("profile", {
	resetTime: "Daily",
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	generate: () => new Promise(resolve => { }),
});
