import type { DeepsightDropTableDefinition } from "@deepsight.gg/interfaces";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export default new DeepsightEndpoint<Record<number, DeepsightDropTableDefinition>>("DeepsightDropTableDefinition.json");
