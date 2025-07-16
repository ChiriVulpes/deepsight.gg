import fs from "fs-extra";
import { Task } from "task";
import type { DeepsightStats } from "../../static/manifest/Interfaces";
import DestinyProfile from "./utility/endpoint/DestinyProfile";

export default Task("DeepsightStats", async () => {
	const profile = await DestinyProfile.get();

	const chiriSunsetMountaintopInstanceId = "6917530005261965302";
	const powerFloor = profile?.itemComponents?.instances?.data?.[chiriSunsetMountaintopInstanceId]?.primaryStat?.value;
	if (!powerFloor)
		throw new Error("Unable to fetch power floor from Chiri's sunset mountaintop instance");

	const DeepsightStats: DeepsightStats = {
		powerFloor,
	};

	await fs.mkdirp("docs/manifest");
	await fs.writeJson("docs/manifest/DeepsightStats.json", DeepsightStats, { spaces: "\t" });
});
