import type { DeepsightBreakerTypeDefinition } from "@deepsight.gg/interfaces";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export default new DeepsightEndpoint<Record<number, DeepsightBreakerTypeDefinition>>("DeepsightBreakerTypeDefinition.json");
