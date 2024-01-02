import del from "del";
import Task from "./utility/Task";

export default Task("clean", () => del("docs"));
export const cleanWatch = Task("cleanWatch", () => del(["docs/**", "!docs"]));
