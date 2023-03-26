import { ServerScriptService } from "@rbxts/services";
import { instance } from "shared/utils";

const playersFolder = ServerScriptService.FindFirstChild("instances")!.FindFirstChild("players") as Folder;

export default (player: Player) => {
	instance("Folder", player.Name, playersFolder);

	const sleeve = instance("StringValue", "sleeve", player) as StringValue
	sleeve.Value = "rbxassetid://3955072236";

    instance("RemoteEvent", "showField.re", player) as RemoteEvent;
}