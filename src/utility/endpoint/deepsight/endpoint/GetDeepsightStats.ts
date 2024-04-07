import type { DeepsightStats } from "@deepsight.gg/interfaces";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export default new DeepsightEndpoint<DeepsightStats>("DeepsightStats.json");
