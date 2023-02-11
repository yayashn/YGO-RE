import { instance } from "shared/utils";
import { Players, ServerScriptService, ReplicatedStorage, HttpService } from "@rbxts/services"
import ProfileService from "@rbxts/profileservice";
import profileTemplate from "./profileTemplate";
import initPlayer from "./functions/initPlayer";

const playersFolder = ServerScriptService.FindFirstChild("instances")!.FindFirstChild("players") as Folder;

const profileStore = ProfileService.GetProfileStore("playerProfile", profileTemplate);
const profiles = {}

Players.PlayerAdded.Connect((player) => {
	initPlayer(player);
});

Players.PlayerRemoving.Connect((player) => {
	playersFolder.FindFirstChild(player.Name)!.Destroy();
})