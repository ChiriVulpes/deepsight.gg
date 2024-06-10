import { DestinyComponentType } from "bungie-api-ts/destiny2";
import Memberships from "model/models/Memberships";
import Component from "ui/Component";
import Dialog from "ui/Dialog";
import Loadable from "ui/Loadable";
import ProfileButton from "ui/ProfileButton";
import Button from "ui/form/Button";
import Paginator from "ui/form/Paginator";
import TextInput from "ui/form/TextInput";
import BungieID from "utility/BungieID";
import ProfileManager from "utility/ProfileManager";
import type { IProfileStorage } from "utility/Store";
import Store from "utility/Store";
import URL from "utility/URL";
import Bound from "utility/decorator/Bound";
import Bungie from "utility/endpoint/bungie/Bungie";
import GetProfile from "utility/endpoint/bungie/endpoint/destiny2/GetProfile";
import SearchDestinyPlayerByBungieName from "utility/endpoint/bungie/endpoint/destiny2/SearchDestinyPlayerByBungieName";
import GetUserClan from "utility/endpoint/bungie/endpoint/groupv2/GetUserClan";

export enum SwitchProfileClasses {
	Main = "switch-profile",
	Paginator = "switch-profile-list-paginator",
	ListWrapper = "switch-profile-list-wrapper",
	List = "switch-profile-list",
	AuthButton = "switch-profile-auth-button",
	SearchRow = "switch-profile-search-row",
	SearchBox = "switch-profile-search-box",
	SearchBox_Invalid = "switch-profile-search-box--invalid",
	SearchResult = "switch-profile-search-result",
	SearchResultInvalid = "switch-profile-search-result-invalid",
	SearchResultProfile = "switch-profile-search-result-profile",
}

export default class SwitchProfile extends Dialog {

	private searchBox!: TextInput;
	private searchResult!: Component;
	private recentPaginator?: Paginator;
	private searchResultLoading!: Loadable.Component;

	protected override onMake (): void {
		super.onMake();
		this.classes.add(SwitchProfileClasses.Main);
		this.title.text.set("Switch Profile");

		const searchRow = Component.create()
			.classes.add(SwitchProfileClasses.SearchRow)
			.appendTo(this.body);

		Button.create()
			.classes.add(SwitchProfileClasses.AuthButton)
			.text.set("Authenticate")
			.event.subscribe("click", () => void Bungie.authenticate("start").catch(err => console.error(err)))
			.appendTo(searchRow);

		this.searchBox = TextInput.create()
			.classes.add(SwitchProfileClasses.SearchBox)
			.setPlaceholder("Search by Bungie ID...")
			.event.subscribe("input", this.queueLookupProfile)
			.appendTo(searchRow);

		this.searchResultLoading = Loadable.create()
			.onReady(() => this.searchResult = Component.create()
				.classes.add(SwitchProfileClasses.SearchResult))
			.setSimple()
			.appendTo(searchRow);

		this.refresh();
		Store.event.subscribe(["setProfiles", "deleteProfiles"], this.refresh);
	}

	private refreshing = false;
	private queuedRefresh = false;
	@Bound private refresh () {
		if (this.refreshing) {
			this.queuedRefresh = true;
			return;
		}

		this.refreshing = true;

		do {
			this.queuedRefresh = false;
			this.recentPaginator?.remove();

			this.recentPaginator = Paginator.create()
				.classes.add(SwitchProfileClasses.Paginator)
				.tweak(paginator => paginator.pageWrapper.classes.add(SwitchProfileClasses.ListWrapper))
				.appendTo(this.body);

			const filler = this.recentPaginator.filler(18, page => page.classes.add(SwitchProfileClasses.List));

			const profiles = Object.entries(Store.items.profiles ?? {})
				.sort(([, a], [, b]) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

			for (const [bungieId, profile] of profiles) {
				const id = BungieID.parse(bungieId);
				if (!id)
					continue;

				const button = ProfileButton.create([id, profile])
					.event.subscribe("click", () => this.switchProfile(id, profile))
					.event.subscribe("contextmenu", event => {
						event.preventDefault();
						ProfileManager.remove(id);
						button.remove();

						if (Store.items.selectedProfile === BungieID.stringify(id)) {
							const newProfile = ProfileManager.get();

							const url = URL.path;

							if (!newProfile)
								delete Store.items.selectedProfile;
							else
								Store.items.selectedProfile = BungieID.stringify(newProfile.id);

							URL.path = url;
							location.reload();
						}
					})
					.appendTo(filler.increment());
			}

			filler.fillRemainder(page => page.append(ProfileButton.Placeholder.create()));
		} while (this.queuedRefresh);

		this.refreshing = false;
	}

	private switchProfile (bungieId: BungieID, profile: IProfileStorage) {
		const path = URL.path;
		Store.items.selectedProfile = BungieID.stringify(bungieId);
		URL.path = path;
		location.reload();
	}

	private queued = false;
	private currentLookupPromise?: Promise<void>;
	@Bound private async queueLookupProfile () {
		if (this.currentLookupPromise) {
			this.queued = true;
			return;
		}

		this.queued = true;
		while (this.queued) {
			this.queued = false;
			this.currentLookupPromise = this.lookupProfile();
			await this.currentLookupPromise;
		}

		this.queued = false;
		delete this.currentLookupPromise;
	}

	private async lookupProfile () {
		this.searchResult.removeContents();

		let searchString = this.searchBox.inputText;
		if (!searchString.length) {
			this.searchBox.classes.remove(SwitchProfileClasses.SearchBox_Invalid);
			return;
		}

		const searchCode = searchString[searchString.length - 5] !== "#" ? NaN : +searchString.slice(-4);
		searchString = searchString.slice(0, -5);
		const bungieId = BungieID.stringify({ name: searchString, code: searchCode });
		const id = BungieID.parse(bungieId);
		if (isNaN(searchCode) || !id) {
			this.searchBox.classes.add(SwitchProfileClasses.SearchBox_Invalid);
			Component.create()
				.classes.add(SwitchProfileClasses.SearchResultInvalid)
				.text.set("Please enter a valid Bungie ID.")
				.appendTo(this.searchResult);
			return;
		}

		const existingProfile = Store.items.profiles?.[bungieId];
		if (existingProfile) {
			ProfileButton.create([id, existingProfile])
				.classes.add(SwitchProfileClasses.SearchResultProfile)
				.event.subscribe("click", () => this.switchProfile(id, existingProfile))
				.appendTo(this.searchResult);
			return;
		}

		this.searchResultLoading.setLoading(true);

		const destinyMembership = await SearchDestinyPlayerByBungieName.query(searchString, searchCode)
			.then(memberships => Memberships.getPrimaryDestinyMembership(memberships));
		if (!destinyMembership) {
			this.searchBox.classes.add(SwitchProfileClasses.SearchBox_Invalid);
			Component.create()
				.classes.add(SwitchProfileClasses.SearchResultInvalid)
				.text.set("Unable to find a user by this Bungie ID.")
				.appendTo(this.searchResult);
			this.searchResultLoading.setLoading(false);
			return;
		}

		const profile = await GetProfile
			.setOptionalAuth(true)
			.query(destinyMembership.membershipType, destinyMembership.membershipId, [DestinyComponentType.Profiles, DestinyComponentType.Characters]);

		const currentCharacter = Object.values(profile.characters.data ?? {})
			?.sort(({ dateLastPlayed: dateLastPlayedA }, { dateLastPlayed: dateLastPlayedB }) =>
				new Date(dateLastPlayedB).getTime() - new Date(dateLastPlayedA).getTime())
			?.[0];

		const clan = await GetUserClan.query(destinyMembership.membershipType, destinyMembership.membershipId);

		const storeProfile = ProfileManager.update(id, {
			membershipType: destinyMembership.membershipType,
			membershipId: destinyMembership.membershipId,
			emblemHash: currentCharacter?.emblemHash,
			class: currentCharacter?.classType,
			callsign: clan?.results?.[0]?.group?.clanInfo?.clanCallsign ?? "",
			callsignLastModified: new Date().toISOString(),
		});

		ProfileButton.create([id, storeProfile])
			.classes.add(SwitchProfileClasses.SearchResultProfile)
			.event.subscribe("click", () => this.switchProfile(id, storeProfile))
			.appendTo(this.searchResult);

		this.searchResultLoading.setLoading(false);
		this.searchBox.inputText = "";

		this.queued = false;
	}
}

