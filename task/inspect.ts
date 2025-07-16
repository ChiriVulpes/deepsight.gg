import inspector from "inspector";
import { Task } from "task";

export default Task("inspect", () => inspector.open(9234));
