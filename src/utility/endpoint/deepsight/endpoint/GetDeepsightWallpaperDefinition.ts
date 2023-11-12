import type { DeepsightWallpaperDefinition } from "@deepsight.gg/interfaces";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export default new DeepsightEndpoint<Record<number, DeepsightWallpaperDefinition>>("DeepsightWallpaperDefinition.json");
