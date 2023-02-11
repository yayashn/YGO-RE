import { ReplicatedStorage, HttpService, ServerScriptService } from "@rbxts/services";
import { instance } from "shared/utils";

const playersFolder = ServerScriptService.FindFirstChild("instances")!.FindFirstChild("players") as Folder;
const lob = ReplicatedStorage.FindFirstChild("cards")!.FindFirstChild("legend of blue eyes white dragon") as Folder;

export default (player: Player) => {
	const playerFolder = instance("Folder", player.Name, playersFolder);

	const sleeve = instance("StringValue", "sleeve", player) as StringValue
	sleeve.Value = "rbxassetid://3955072236";

	const deck = new Instance("StringValue");
	deck.Name = "deck";
	const deckInventory = [];
	for (let i = 0; i < 40; i++) {
		const name = lob.GetChildren()[math.random(0, lob.GetChildren().size() - 1)].Name;
		deckInventory.push({ name: name })
	}
	deck.Parent = playerFolder;
	deck.Value = HttpService.JSONEncode(deckInventory);

    instance("RemoteEvent", "showField.re", player) as RemoteEvent;
}