import Model from "model/Model";
import GetDeepsightStats from "utility/endpoint/deepsight/endpoint/GetDeepsightStats";

export default Model.createDynamic("Daily", () => GetDeepsightStats.query());
