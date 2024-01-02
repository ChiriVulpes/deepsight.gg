import Env from "./utility/Env";
import Task from "./utility/Task";

export default Task("sass", () =>
	Task.cli("sass", "style/index.scss", "docs/index.css",
		...Env.DEEPSIGHT_ENVIRONMENT === "dev"
			? ["--embed-source-map", "--embed-sources"]
			: ["--style=compressed", "--no-source-map"]));
