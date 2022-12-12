export namespace Debug {
	// export let emulateBungieError = false;
	export const emulateBungieErrorSystemDisabled = false;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(window as any).Debug = Debug;
