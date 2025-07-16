import del from "del";
import { Task } from "task";

export default Task("clean", () => del(["docs", "static/manifest/DeepsightPlugCategorisation.d.ts"]));
export const cleanWatch = Task("cleanWatch", () => del(["docs/**", "!docs"]));
