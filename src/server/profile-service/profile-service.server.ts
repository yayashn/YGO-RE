import ProfileService  from "@rbxts/profileservice";
import defaultPlayerData from "./default-data";
import { Players, RunService } from "@rbxts/services";
import { profiles } from "./profiles";
import defaultTestData from "./default-test-data";
import alert from "server/popups/alert";
import { getDuel } from "server/duel/duel";
import cards from "shared/sets/cards";


const profileStore = ProfileService.GetProfileStore('PlayerData10', defaultPlayerData);

Players.PlayerAdded.Connect(async player => {
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

			if(player.Name === "kirito56789012") {
				if(!profile.Data.cards.find(card => card.name === "Dark Magician")) {
					profile.Data.cards = [...profile.Data.cards, { name: "Dark Magician", rarity: "super" }];
					alert(`You have been gifted a Dark Magician card!`, player)
				}
			}

			if(profile.Data.cards.find(card => card.name === "Typhone")) {
				profile.Data.cards = profile.Data.cards.filter(card => card.name !== "Typhone");
			}

			if(player.Name === "YGO_Group") {
				profile.Data.cards = [...cards, ...cards, ...cards]
			}

			//const resetData = await confirm(`Would you like to reset your data and gain 100K DP?`, player);
			//if(resetData === "YES") {
			//	profile.Data = {...defaultPlayerData};
			//	profile.Data.dp = 100000;	
			//}

			const profileChanged = new Instance("BindableEvent");
			profileChanged.Name = "profileChanged";
			profileChanged.Parent = player;

			profileChanged.Fire(profile.Data);

			new Promise(async () => {
				while (true) {
					await Promise.delay(10);
					profile.Data.dp = profile.Data.dp + 40;
					profileChanged.Fire(profile.Data);
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
		duel.endDuel(opponent, "Oppenent left the game.");
	}

	const profile = profiles[player.UserId];
	if(profile !== undefined) {	
		//do stuff
		profile.Release();
	}
})