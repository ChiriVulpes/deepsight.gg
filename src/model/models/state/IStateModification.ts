import type ProfileBatch from "model/models/ProfileBatch";
import { EventManager } from "utility/EventManager";
import ProfileManager from "utility/ProfileManager";
import Time from "utility/Time";

const BUNGIE_UNTRUSTWORTHINESS = Time.minutes(1);

interface IStateModification {
	type: string;
	time: number;
}

interface IStateModificationImplementation<M extends IStateModification = IStateModification> {
	type: string;
	apply (profile: ProfileBatch, modification: M): any;
}

namespace IStateModification {
	interface IStateModificationImplementationRegistered<M extends IStateModification = IStateModification> extends IStateModificationImplementation<M> {
		add (modification: M): void;
	}

	const REGISTRY: Record<string, IStateModificationImplementationRegistered> = {};
	declare let profile: ProfileBatch;

	export interface IStateModificationEvents {
		apply: Event;
	}

	export const event = new EventManager<{}, IStateModificationEvents>({});

	export function register<M extends IStateModification> (implementation: IStateModificationImplementation<M>) {
		return REGISTRY[implementation.type] = {
			...implementation,
			add (modification: M) {
				const profileStore = ProfileManager.get();
				if (!profileStore || !profile)
					return;

				ProfileManager.update(profileStore.id, {
					stateModifications: [
						...profileStore.data.stateModifications ?? [],
						modification,
					],
				});

				try {
					implementation.apply(profile, modification);
				} catch (err) {
					console.warn(`Failed to apply ${implementation.type}:`, err, modification);
				}

				event.emit("apply");
			},
		};
	}

	export function apply (profile: ProfileBatch) {

		// grab modifications
		const profileStore = ProfileManager.get();
		let modifications = profileStore?.data.stateModifications;
		if (!profileStore || !modifications?.length)
			return;

		// discard old/outdated modifications
		const profileTime = profile.lastModified.getTime();
		console.log("Profile time:", new Date(profileTime).toLocaleString());
		modifications = modifications.filter(modification => {
			if (modification.time < profileTime - BUNGIE_UNTRUSTWORTHINESS) {
				console.log("Discarding old modification from", new Date(modification.time).toLocaleString(), modification);
				return false;
			}

			return true;
		});

		// save what remains
		ProfileManager.update(profileStore.id, {
			stateModifications: modifications,
		});

		// apply what remains
		for (const modification of modifications) {
			const implementation = REGISTRY[modification.type];
			if (!implementation) {
				console.warn(`Unknown profile state modification type '${modification.type}'`, modification);
				continue;
			}

			try {
				implementation.apply(profile, modification);
			} catch (err) {
				console.warn(`Failed to apply ${implementation.type}:`, err, modification);
			}
		}

		event.emit("apply");
	}
}

export default IStateModification;

Object.assign(window, { IStateModification });
