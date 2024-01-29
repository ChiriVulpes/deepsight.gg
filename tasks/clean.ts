import del from "del";
import Task from "./utility/Task";

export default Task("clean", () => del(["docs", "static/manifest/Enums.d.ts", "static/manifest/DeepsightPlugCategorisation.d.ts"]));
export const cleanWatch = Task("cleanWatch", () => del(["docs/**", "!docs"]));
