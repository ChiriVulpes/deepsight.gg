import type { DestinyProfileResponse } from "bungie-api-ts/destiny2";
import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Model from "model/Model";
import BungieID from "utility/BungieID";
import ProfileManager from "utility/ProfileManager";
import Store from "utility/Store";
import Time from "utility/Time";
import GetProfile from "utility/endpoint/bungie/endpoint/destiny2/GetProfile";
import GetUserClan from "utility/endpoint/bungie/endpoint/groupv2/GetUserClan";

type DestinyComponentName = Exclude<keyof DestinyProfileResponse, "responseMintedTimestamp" | "secondaryComponentsMintedTimestamp">;

function makeProfileResponseComponentMap<MAP extends { [KEY in DestinyComponentName]: DestinyComponentType | readonly DestinyComponentType[] | undefined }> (map: MAP) {
	return map;
}

const profileResponseComponentMap = makeProfileResponseComponentMap({
	vendorReceipts: DestinyComponentType.VendorReceipts as const,
	profileInventory: DestinyComponentType.ProfileInventories as const,
	profileCurrencies: DestinyComponentType.ProfileCurrencies as const,
	profile: DestinyComponentType.Profiles as const,
	platformSilver: DestinyComponentType.PlatformSilver as const,
	profileKiosks: DestinyComponentType.Kiosks as const,
	profilePlugSets: DestinyComponentType.ItemSockets as const,
	profileProgression: DestinyComponentType.ProfileProgression as const,
	profilePresentationNodes: DestinyComponentType.PresentationNodes as const,
	profileRecords: DestinyComponentType.Records as const,
	profileCollectibles: DestinyComponentType.Collectibles as const,
	profileTransitoryData: DestinyComponentType.Transitory as const,
	metrics: DestinyComponentType.Metrics as const,
	profileStringVariables: DestinyComponentType.StringVariables as const,
	characters: DestinyComponentType.Characters as const,
	characterInventories: DestinyComponentType.CharacterInventories as const,
	characterProgressions: DestinyComponentType.CharacterProgressions as const,
	characterRenderData: DestinyComponentType.CharacterRenderData as const,
	characterActivities: DestinyComponentType.CharacterActivities as const,
	characterEquipment: DestinyComponentType.CharacterEquipment as const,
	characterKiosks: DestinyComponentType.Kiosks as const,
	characterPlugSets: DestinyComponentType.ItemSockets as const,
	characterUninstancedItemComponents: undefined,
	characterPresentationNodes: DestinyComponentType.PresentationNodes as const,
	characterRecords: DestinyComponentType.Records as const,
	characterCollectibles: DestinyComponentType.Collectibles as const,
	characterStringVariables: DestinyComponentType.StringVariables as const,
	characterCraftables: DestinyComponentType.Craftables as const,
	itemComponents: [
		DestinyComponentType.ItemInstances,
		DestinyComponentType.ItemRenderData,
		DestinyComponentType.ItemStats,
		DestinyComponentType.ItemSockets,
		DestinyComponentType.ItemReusablePlugs,
		DestinyComponentType.ItemPlugObjectives,
		DestinyComponentType.ItemTalentGrids,
		DestinyComponentType.ItemPlugStates,
		DestinyComponentType.ItemObjectives,
		DestinyComponentType.ItemPerks,
	] as const,
	characterCurrencyLookups: DestinyComponentType.CurrencyLookups as const,
	profileCommendations: DestinyComponentType.SocialCommendations as const,
	characterLoadouts: DestinyComponentType.CharacterLoadouts as const,
});

type Writable<T> = { -readonly [P in keyof T]: T[P] };

class ComponentModel extends Model.Impl<DestinyProfileResponse> {
	public readonly applicableKeys: (keyof DestinyProfileResponse)[];

	public constructor (public readonly type: DestinyComponentType, public readonly bungieId: BungieID) {
		const applicableKeys: (keyof DestinyProfileResponse)[] = [];
		for (const [key, applicableComponents] of Object.entries(profileResponseComponentMap)) {
			if (applicableComponents === undefined)
				continue;

			const applicable = typeof applicableComponents === "number" ? applicableComponents === type
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
				: (applicableComponents as readonly DestinyComponentType[]).includes(type);

			if (applicable)
				applicableKeys.push(key as keyof DestinyProfileResponse);
		}

		super(`profile ${BungieID.stringify(bungieId)} component ${type} [${applicableKeys.join(",")}]`, {
			cache: "Session",
			resetTime: Time.seconds(20),
			useCacheOnInitial: Time.days(1),
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			generate: undefined as any,
			// resetOnDestinyMembershipChange: true,
		});

		this.applicableKeys = applicableKeys;
	}

	public async update (response: DestinyProfileResponse) {
		const newData = {} as Writable<DestinyProfileResponse>;
		let hasNewData = false;
		for (const key of this.applicableKeys) {
			if (response[key] !== undefined) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				newData[key] = response[key] as any;
				hasNewData = true;
			}
		}

		if (hasNewData)
			await this.set(newData);
	}
}

const models: Record<string, Partial<Record<DestinyComponentType, ComponentModel | undefined>>> = {};
let lastOperation: Promise<void> | undefined;

function mergeProfile (profileInto: DestinyProfileResponse, profileFrom: DestinyProfileResponse) {
	const keys = new Set([...Object.keys(profileInto), ...Object.keys(profileFrom)] as (DestinyComponentName)[]);
	keys.delete("_header" as DestinyComponentName);
	for (const key of keys) {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
		(profileInto as Writable<DestinyProfileResponse>)[key] = mergeProfileKey(key, profileInto[key], profileFrom[key]);
	}
}

function mergeProfileKey (key: DestinyComponentName, value1: any, value2: any): any {
	if (value1 && value2) {
		if (Array.isArray(profileResponseComponentMap[key]))
			return { ...value1, ...value2 };

		// overwrite if this is only a single component
		return value2;
	}

	return value1 ?? value2;
}

let isInitial = true;

function Profile<COMPONENTS extends DestinyComponentType[]> (...components: COMPONENTS): Model<{ [PROFILE_RESPONSE_KEY in DestinyComponentName as (
	((typeof profileResponseComponentMap)[PROFILE_RESPONSE_KEY] extends infer COMPONENTS ?
		COMPONENTS extends readonly DestinyComponentType[] ? COMPONENTS[number] : COMPONENTS
		: never
	) extends infer COMPONENTS_FOR_RESPONSE ?
	[(
		Extract<keyof { [KEY in Exclude<keyof COMPONENTS, "length"> as COMPONENTS[KEY] extends COMPONENTS_FOR_RESPONSE ? KEY : never]: COMPONENTS[KEY] }, string>
	)] extends [never] ? never : PROFILE_RESPONSE_KEY
	: never
)]?: DestinyProfileResponse[PROFILE_RESPONSE_KEY] } & { lastModified: Date }> {
	const initial = isInitial;
	isInitial = false;

	components.sort();

	// const name = `profile [${components.flatMap(component => models[component]!.applicableKeys).join(",")}]`;

	interface Response extends DestinyProfileResponse {
		lastModified: Date;
		bungieID: BungieID;
	}
	return Model.createDynamic<Response>(Time.seconds(30), async api => {
		// only allow one profile query at a time
		while (lastOperation)
			await lastOperation;

		const account = ProfileManager.get();
		if (!account || account.data.membershipType === undefined || account.data.membershipId === undefined)
			return {
				lastModified: new Date(),
				bungieID: { name: "", code: 0 },
				responseMintedTimestamp: new Date().toISOString(),
			} as Response;

		const idString = BungieID.stringify(account.id);

		const result = {} as Response;

		const userModels = models[idString] ??= {};
		for (const component of components)
			userModels[component] ??= new ComponentModel(component, account.id);

		// eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
		lastOperation = (async () => {
			api.emitProgress(0, "Fetching profile");
			const missingComponents: DestinyComponentType[] = [];
			for (const component of components) {
				const cached = await userModels[component]?.resolveCache(initial ? "initial" : undefined);
				if (cached) {
					mergeProfile(result, cached);
				} else
					missingComponents.push(component);
			}

			if (!missingComponents.length)
				// all components cached, no need to make a request to bungie
				return;

			if (missingComponents.some(component => (profileResponseComponentMap.itemComponents as readonly DestinyComponentType[]).includes(component)))
				if (!missingComponents.includes(DestinyComponentType.ProfileInventories) && !missingComponents.includes(DestinyComponentType.CharacterInventories) && !missingComponents.includes(DestinyComponentType.CharacterEquipment)) {
					if (components.includes(DestinyComponentType.CharacterInventories))
						missingComponents.push(DestinyComponentType.CharacterInventories);
					if (components.includes(DestinyComponentType.CharacterEquipment))
						missingComponents.push(DestinyComponentType.CharacterEquipment);
					if (components.includes(DestinyComponentType.ProfileInventories || (!missingComponents.includes(DestinyComponentType.CharacterInventories) && !missingComponents.includes(DestinyComponentType.CharacterEquipment))))
						missingComponents.push(DestinyComponentType.ProfileInventories);
				}

			api.emitProgress(1 / 3, "Fetching profile");

			const newData = await GetProfile
				.setOptionalAuth(!!account.data.accessToken)
				.query(account.data.membershipType!, account.data.membershipId!, missingComponents);
			mergeProfile(result, newData);

			result.bungieID = account.id;
			result.lastModified = new Date(newData._headers.get("Last-Modified") ?? Date.now());

			const currentCharacter = Object.values(result.characters.data ?? {})
				?.sort(({ dateLastPlayed: dateLastPlayedA }, { dateLastPlayed: dateLastPlayedB }) =>
					new Date(dateLastPlayedB).getTime() - new Date(dateLastPlayedA).getTime())
				?.[0];

			let profile = ProfileManager.update(account.id, {
				lastModified: result.lastModified.toISOString(),
				emblemHash: currentCharacter?.emblemHash,
				class: currentCharacter?.classType,
			});

			if (profile.callsign === undefined || !profile.callsignLastModified || Date.now() - new Date(profile.callsignLastModified).getTime() > Time.hours(1)) {
				const clan = await GetUserClan.query(account.data.membershipType!, account.data.membershipId!);
				profile = ProfileManager.update(account.id, {
					callsign: clan?.results?.[0]?.group?.clanInfo?.clanCallsign ?? "",
					callsignLastModified: new Date().toISOString(),
				});
			}

			for (let i = 0; i < components.length; i++) {
				const component = components[i];
				api.emitProgress(2 / 3 + 1 / 3 * (i / components.length), "Storing profile");
				await userModels[component]!.update(newData);
			}
		})().catch(async () => {
			const missingComponents: DestinyComponentType[] = [];
			let hadComponents = false;
			for (const component of components) {
				const cached = await userModels[component]?.resolveCache(true);
				if (cached) {
					hadComponents = true;
					mergeProfile(result, cached);
				} else {
					missingComponents.push(component);
				}
			}

			if (hadComponents && missingComponents.length)
				console.warn("Missing profile components in cache:", ...missingComponents);
		});

		await lastOperation;
		lastOperation = undefined;

		result.lastModified ??= new Date(Store.items.profiles?.[idString]?.lastModified ?? Date.now());
		return result;
	});
}

namespace Profile {
	export async function reset () {
		const promises = [];
		for (const component of Object.values(profileResponseComponentMap).flat()) {
			if (component) {
				for (const bungieId of Object.keys(Store.items.profiles ?? {})) {
					const id = BungieID.parse(bungieId);
					if (!id) continue;

					models[bungieId] ??= {};
					const model = models[bungieId][component] ??= new ComponentModel(component, id);
					promises.push(model.reset());
				}
			}
		}

		await Promise.all(promises);
	}
}

export default Profile;
