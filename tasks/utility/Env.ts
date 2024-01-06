export default process.env as {
	DEEPSIGHT_ENVIRONMENT?: "dev" | "beta" | "prod";
	DEEPSIGHT_MANIFEST_API_KEY?: string;
	DEEPSIGHT_MANIFEST_CLIENT_ID?: string;
	DEEPSIGHT_MANIFEST_CLIENT_SECRET?: string;
	DEEPSIGHT_MANIFEST_USER_ACCESS_TOKEN?: string;
	DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_ID?: string;
	DEEPSIGHT_MANIFEST_USER_MEMBERSHIP_TYPE?: string;
	DEEPSIGHT_MANIFEST_USER_REFRESH_TOKEN?: string;
	DEEPSIGHT_USE_EXISTING_MANIFEST?: "true";
	PORT?: `${bigint}`;
	HOSTNAME?: string;
	NO_COLOURIZE_ERRORS?: string;
	NO_LOG_TSC_DURATION?: string;

	/**
	 * Modified in memory by tasks, used to track whether generate_enums task should be run
	 */
	ENUMS_NEED_UPDATE?: "true";
};
