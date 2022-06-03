import BungieEndpoint from "utility/bungie/BungieEndpoint";
import Time from "utility/Time";

export interface IBungieUserMembershipData {
	bungieNetUser: {
		about: string;
		cachedBungieGlobalDisplayName: string;
		cachedBungieGlobalDisplayNameCode: number;
		context: { isFollowing: boolean; ignoreStatus: { isIgnored: boolean; ignoreFlags: number } };
		displayName: string;
		firstAccess: Time.ISO;
		isDeleted: boolean;
		lastUpdate: Time.ISO;
		locale: string;
		localeInheritDefault: boolean;
		membershipId: string;
		profilePicture: number;
		profilePicturePath: `/img/profile/avatars/${string}.jpg`;
		profileTheme: number;
		profileThemeName: string;
		showActivity: boolean;
		showGroupMessaging: boolean;
		statusDate: Time.ISO;
		statusText: string;
		steamDisplayName: string;
		successMessageFlags: string;
		twitchDisplayName: string;
		uniqueName: `${string}#${bigint}`;
		userTitle: number;
		userTitleDisplay: string;
	};
	destinyMemberships: Array<{
		LastSeenDisplayName: string;
		LastSeenDisplayNameType: number;
		applicableMembershipTypes: number[];
		bungieGlobalDisplayName: string;
		bungieGlobalDisplayNameCode: number;
		crossSaveOverride: number;
		displayName: string;
		iconPath: `/img/theme/bungienet/icons/${string}.png`;
		isPublic: boolean;
		membershipId: string;
		membershipType: number;
	}>;
}

export default BungieEndpoint("/User/GetMembershipsForCurrentUser/")
	.returning<IBungieUserMembershipData>();
