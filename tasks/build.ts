import env from "./env";
import sass from "./sass";
import _static from "./static";
import ts from "./ts";
import Task from "./utility/Task";

export default Task("build", task => task.series(
	task.parallel(sass, _static),
	ts,
	env,
));
