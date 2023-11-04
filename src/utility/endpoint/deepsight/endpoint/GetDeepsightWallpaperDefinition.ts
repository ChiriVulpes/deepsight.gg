import type { DeepsightWallpaperDefinition } from "manifest.deepsight.gg";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export default new DeepsightEndpoint<Record<number, DeepsightWallpaperDefinition>>("DeepsightWallpaperDefinition.json");
