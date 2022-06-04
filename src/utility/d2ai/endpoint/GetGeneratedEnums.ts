import d2aiEndpoint from "utility/d2ai/d2aiEndpoint";

export interface DestinyGeneratedEnums {
	PlugCategoryHashes: Record<string, number>;
	StatHashes: Record<string, number>;
	ItemCategoryHashes: Record<string, number>;
	SocketCategoryHashes: Record<string, number>;
	BucketHashes: Record<string, number>;
	BreakerTypeHashes: Record<string, number>;
}

export default new d2aiEndpoint<DestinyGeneratedEnums>("generated-enums.ts");