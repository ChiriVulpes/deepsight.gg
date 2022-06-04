import Task from "./utilities/Task";

export default Task("install", async () => {
	// uncomment when there's more than one dependency
	// await Task.cli({ cwd: "src" }, "PATH:npm", "install");
	await Task.cli({ cwd: "src" }, "PATH:npm", "install", "bungie-api-ts@latest");
});
