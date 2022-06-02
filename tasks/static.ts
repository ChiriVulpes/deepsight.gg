import fs from "fs-extra";
import Task from "./utilities/Task";

export default Task("static", () => fs.copy("static", "docs"));
