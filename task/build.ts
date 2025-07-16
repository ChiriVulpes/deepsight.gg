import { Task } from "task";
import env from "./env";
import sass from "./sass";
import _static from "./static";
import ts from "./ts";

export default Task("build", task => task.series(
	task.parallel(sass, _static),
	ts,
	env,
));
