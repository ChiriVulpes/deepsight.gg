import { Task } from "task";
import Env from "./utility/Env";

export default Task("sass", task =>
	task.exec("sass", "style/index.scss", "docs/index.css",
		...Env.DEEPSIGHT_ENVIRONMENT === "dev"
			? ["--embed-source-map", "--embed-sources"]
			: ["--style=compressed", "--no-source-map"]));
