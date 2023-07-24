import ProfileService  from "@rbxts/profileservice";
import defaultPlayerData from "./default-data";
import { Players } from "@rbxts/services";
import { profiles } from "./profiles";

const profileStore = ProfileService.GetProfileStore('PlayerData4', defaultPlayerData);

Players.PlayerAdded.Connect(player => {
    const profile = profileStore.LoadProfileAsync(`player_${player.UserId}`);
	if(profile !== undefined) {
		profile.AddUserId(player.UserId);
		profile.Reconcile();
		profile.ListenToRelease(() => {
			profiles[player.UserId] = undefined;
			player.Kick();
		})
		if(player.IsDescendantOf(Players)) {
			profiles[player.UserId] = profile;
			//do stuff
			const profileChanged = new Instance("BindableEvent");
			profileChanged.Name = "profileChanged";
			profileChanged.Parent = player;
		} else {
			profile.Release();
		}
	} else {
		player.Kick();
	}
})

Players.PlayerRemoving.Connect((player) => {
	const profile = profiles[player.UserId];
	if(profile !== undefined) {	
		//do stuff
		profile.Release();
	}
})