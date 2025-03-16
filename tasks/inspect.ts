import inspector from "inspector";
import Task from "./utility/Task";

export default Task("inspect", () => inspector.open(9234));
