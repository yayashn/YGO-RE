import ProfileService  from "@rbxts/profileservice";
import defaultPlayerData from "./default-data";
import { Players, RunService } from "@rbxts/services";
import defaultTestData from "./default-test-data";
import alert from "server/popups/alert";
import { getDuel } from "server/duel/duel";
import cards from "shared/sets/cards";
import Remotes from "shared/net/remotes";
import { profiles } from "./profiles";
import { createInstance } from "shared/utils";

const profileStore = ProfileService.GetProfileStore('PlayerData10', defaultPlayerData);
const profileChanged = Remotes.Server.Get("profileChanged");
const getProfile = Remotes.Server.Get("getProfile");

getProfile.SetCallback(plr => {
	return profiles[plr.UserId]?.Data!;
})

Players.PlayerAdded.Connect(async player => {
	createInstance("StringValue", "duel", player);
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
			if(RunService.IsStudio()) {
				profile.Data = {...defaultTestData}
			}

			if(player.Name === "YGO_Group") {
				profile.Data.cards = [...cards, ...cards, ...cards]
			}

			profileChanged.SendToPlayer(player, profile.Data);

			const dpGain = 40;
			new Promise(async () => {
				while (true) {
					let todaysDP = profile.Data.afkDailyDp[DateTime.now().FormatLocalTime("L", "en-us") as `${number}/${number}/${number}`];
					if(!todaysDP) {
						profile.Data.afkDailyDp = {
							[DateTime.now().FormatLocalTime("L", "en-us")]: {
								earnt: 0,
								max: 50000
							}
						};
					} else if(todaysDP.earnt < todaysDP.max) {
						profile.Data.dp = profile.Data.dp + dpGain;
						profile.Data.afkDailyDp[DateTime.now().FormatLocalTime("L", "en-us") as `${number}/${number}/${number}`].earnt = todaysDP.earnt + dpGain;
						profileChanged.SendToPlayer(player, profile.Data);
					}
					const delay = player.Name === "YGO_Group" ? .01 : 10;
					await Promise.delay(delay);
				}
			})
		} else {
			profile.Release();
		}
	} else {
		player.Kick();
	}
})

Players.PlayerRemoving.Connect((player) => {
	const duel = getDuel(player);
	if(duel) {
		const opponent = duel.getOpponent(player);
		duel.endDuel(opponent, "Opponent left the game.");
	}

	const profile = profiles[player.UserId];
	if(profile !== undefined) {	
		//do stuff
		profile.Release();
	}
})