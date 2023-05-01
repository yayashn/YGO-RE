import { instance } from "shared/utils";
import { Players, ServerScriptService, ReplicatedStorage, HttpService } from "@rbxts/services"
import ProfileService from "@rbxts/profileservice";
import profileTemplate, { Card, ProfileTemplate } from "./profileTemplate";
import initPlayer from "./functions/initPlayer";
import { Profile } from "@rbxts/profileservice/globals";
import initDataFunctions from "./functions/initDataFunctions";
import Object from "@rbxts/object-utils";

const playersFolder = ServerScriptService.FindFirstChild("instances")!.FindFirstChild("players") as Folder;

const profileStore = ProfileService.GetProfileStore("playerProfile", profileTemplate);
const profiles: Record<string, Profile<typeof profileTemplate> | undefined> = {}

Players.PlayerAdded.Connect((player) => {
	const profile = profileStore.LoadProfileAsync(`Player_${player.UserId}`);
	if(profile !== undefined) {
		profile.AddUserId(player.UserId);
		profile.Reconcile();
		profile.ListenToRelease(() => {
			profiles[player.UserId] = undefined;
			player.Kick();
		})
		if(player.IsDescendantOf(Players)) {
			profiles[player.UserId] = profile;
			initPlayer(player);
			profile.Data = profileTemplate; // RESET DATA
			initDataFunctions(profile, player);
		} else {
			profile.Release();
		}
	} else {
		player.Kick();
	}
});

Players.PlayerRemoving.Connect((player) => {
	const profile = profiles[player.UserId];
	if(profile !== undefined) {	
		playersFolder.FindFirstChild(player.Name)?.Destroy();
		profile.Release();
	}
})