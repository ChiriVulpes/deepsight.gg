import type { DeepsightMomentDefinition } from "manifest.deepsight.gg";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export default new DeepsightEndpoint<Record<number, DeepsightMomentDefinition>>("DeepsightMomentDefinition.json");
