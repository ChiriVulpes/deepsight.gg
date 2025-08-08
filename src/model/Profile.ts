import type { Profile as ProfileIn } from 'conduit.deepsight.gg/Profile'
import { State } from 'kitsui'
import Relic from 'Relic'
import Store from 'utility/Store'

declare module 'utility/Store' {
	interface ILocalStorage {
		selectedProfile?: string
	}
}

interface ProfileState {
	readonly selected: Profile | undefined
	readonly all: readonly Profile[]
}

type Profile = ProfileIn
namespace Profile {
	export const STATE = State<ProfileState>({ selected: undefined, all: [] })

	let inited: Promise<void> | undefined
	export async function init () {
		if (inited)
			return inited

		return inited = refresh()
	}

	export async function refresh () {
		const conduit = await Relic.connected
		conduit.on.profilesUpdated(updateProfiles)
		updateProfiles(await conduit.getProfiles())
	}

	function updateProfiles (profiles: Profile[]) {
		if (!Store.items.selectedProfile)
			// select the first authed profile by default
			Store.items.selectedProfile = profiles.find(profile => profile.authed)?.id

		const selected = profiles.find(profile => profile.id === Store.items.selectedProfile)
		STATE.value = {
			selected,
			all: profiles,
		}
	}
}

export default Profile
