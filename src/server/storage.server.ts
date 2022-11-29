const players = game.GetService("Players");
const serverStorage = game.GetService("ServerStorage");
const playersFolder = serverStorage.FindFirstChild("players") as Folder;

players.PlayerAdded.Connect((player) => {
	const playerFolder = new Instance("Folder");
	playerFolder.Name = player.Name;
	playerFolder.Parent = playersFolder;

	const sleeve = new Instance("StringValue");
	sleeve.Name = "sleeve";
	sleeve.Value = "rbxassetid://3955072236";
	sleeve.Parent = player;

	const opponent = new Instance("ObjectValue");
	opponent.Name = "opponent";
	opponent.Parent = player;
});
