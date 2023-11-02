import fs from "fs-extra";
import * as path from "path";
import type { AllDestinyManifestComponents } from "../../src/node_modules/bungie-api-ts/destiny2";
import Log from "../utilities/Log";

type PromiseOr<T> = T | Promise<T>;

interface DestinyManifestItem<COMPONENT_NAME extends keyof AllDestinyManifestComponents> {
	get (hash?: number | string): PromiseOr<AllDestinyManifestComponents[COMPONENT_NAME][number] | undefined>;
	all (): PromiseOr<AllDestinyManifestComponents[COMPONENT_NAME]>;
}
type DestinyManifest = { [COMPONENT_NAME in keyof AllDestinyManifestComponents]: DestinyManifestItem<COMPONENT_NAME> }
	& { ALL: PromiseOr<(keyof AllDestinyManifestComponents)[]> };

export type DestinyManifestComponentValue = AllDestinyManifestComponents[keyof AllDestinyManifestComponents][number];

const DestinyManifest = new Proxy({} as Partial<DestinyManifest>, {
	get: (target, componentName: keyof AllDestinyManifestComponents) => {
		if (!target[componentName]) {
			if (componentName as string === "ALL")
				// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
				return target.ALL = fs.readdir("static/testiny")
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					.then(componentFiles => target.ALL = componentFiles
						.filter(file => file !== ".v")
						.map(file => path.basename(file, ".json") as keyof AllDestinyManifestComponents));

			let manifestItem: PromiseOr<Record<number, DestinyManifestComponentValue>> = fs.readJson(`static/testiny/${componentName}.json`)
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				.then(result => manifestItem = result)
				.catch(err => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
					if (err.code === "ENOENT")
						Log.error(`There is no Destiny Manifest component "${componentName}"`);
					else
						Log.error(`Unable to read Destiny Manifest component "${componentName}":`, err);
					process.exit(1);
				});

			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			target[componentName] = {
				get: (hash?: number): PromiseOr<DestinyManifestComponentValue | undefined> => hash === undefined ? undefined : manifestItem instanceof Promise ? manifestItem.then(result => result[hash]) : manifestItem[hash],
				all: () => manifestItem,
			} as DestinyManifestItem<keyof AllDestinyManifestComponents> as any;
		}

		return target[componentName];
	},
});

export default DestinyManifest as DestinyManifest;

export const DESTINY_MANIFEST_MISSING_ICON_PATH = "/img/misc/missing_icon_d2.png";
