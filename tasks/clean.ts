import del from "del";
import Task from "./utilities/Task";

export default Task("clean", () => del("docs"));
export const cleanWatch = Task("cleanWatch", () => del(["docs/**", "!docs"]));
