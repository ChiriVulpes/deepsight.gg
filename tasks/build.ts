import clean from "./clean";
import env from "./env";
import install from "./install";
import manifest from "./manifest";
import sass from "./sass";
import _static from "./static";
import ts from "./ts";
import Task from "./utilities/Task";

export default Task("build", task => task.series(
	clean,
	() => task.parallel(install, manifest),
	() => task.parallel(sass, ts, _static),
	env,
));
