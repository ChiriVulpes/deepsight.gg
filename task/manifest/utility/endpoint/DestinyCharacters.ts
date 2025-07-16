import Model from "../../../utility/Model";
import DestinyProfile from "./DestinyProfile";

export default Model(async () => {
	const profile = await DestinyProfile.get();
	return Object.values(profile?.characters.data ?? {});
});
