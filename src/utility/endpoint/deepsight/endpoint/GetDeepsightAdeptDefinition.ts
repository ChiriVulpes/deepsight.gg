import type { DeepsightAdeptDefinition } from "@deepsight.gg/interfaces";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export default new DeepsightEndpoint<Record<number, DeepsightAdeptDefinition>>("DeepsightAdeptDefinition.json");
