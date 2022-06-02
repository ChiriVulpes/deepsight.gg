import Task from "./utilities/Task";

export default Task("sass", () =>
	Task.cli("sass", "style/index.scss", "docs/index.css",
		...process.env.FVM_ENVIRONMENT === "dev"
			? ["--embed-source-map", "--embed-sources"]
			: ["--style=compressed", "--no-source-map"]));
