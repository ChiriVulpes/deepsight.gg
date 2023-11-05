import type { DeepsightPlugCategorisation } from "manifest.deepsight.gg/plugs";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export default new DeepsightEndpoint<Record<number, DeepsightPlugCategorisation>>("DeepsightPlugCategorisation.json");
