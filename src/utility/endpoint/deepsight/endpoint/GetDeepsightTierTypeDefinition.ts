import type { DeepsightTierTypeDefinition } from "@deepsight.gg/interfaces";
import type { DestinyInventoryItemDefinition } from "bungie-api-ts/destiny2";
import DeepsightEndpoint from "utility/endpoint/deepsight/DeepsightEndpoint";

export default new DeepsightEndpoint<Record<number, DeepsightTierTypeDefinition & Omit<DestinyInventoryItemDefinition, keyof DeepsightTierTypeDefinition>>>("DeepsightTierTypeDefinition.json");
