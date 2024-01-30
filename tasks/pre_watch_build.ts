import env from "./env";
import sass from "./sass";
import _static from "./static";
import ts from "./ts";
import Task from "./utility/Task";

export default Task("pre_watch_build", task => task.series(
	task.parallel(sass, _static),
	_ => task.try(ts),
	env,
));
