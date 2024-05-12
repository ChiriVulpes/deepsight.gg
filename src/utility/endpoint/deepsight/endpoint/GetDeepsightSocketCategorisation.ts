import type { DeepsightSocketCategorisationDefinition } from "@deepsight.gg/plugs";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export default new DeepsightEndpoint<Record<number, DeepsightSocketCategorisationDefinition>>("DeepsightSocketCategorisation.json");
