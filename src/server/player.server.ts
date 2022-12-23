const players = game.GetService("Players");
const serverStorage = game.GetService("ServerStorage");
const playersFolder = new Instance("Folder");
playersFolder.Name = "players";
playersFolder.Parent = serverStorage;
const replicatedStorage = game.GetService("ReplicatedStorage");
const httpService = game.GetService("HttpService");

const createCard3D = new Instance("RemoteEvent");
createCard3D.Name = "createCard3D.re";
createCard3D.Parent = replicatedStorage;

const moveCard3D = new Instance("RemoteEvent");
moveCard3D.Name = "moveCard3D.re";
moveCard3D.Parent = replicatedStorage;

players.PlayerAdded.Connect((player) => {
	const playerFolder = new Instance("Folder");
	playerFolder.Name = player.Name;
	playerFolder.Parent = playersFolder;

	const deck = new Instance("StringValue");
	deck.Name = "deck";
	const deckData = []
	for(let i = 0; i < 40; i++) {
		deckData.push("Dark Magician");
	}
	deck.Value = httpService.JSONEncode(deckData);
	deck.Parent = playerFolder;

	const sleeve = new Instance("StringValue");
	sleeve.Name = "sleeve";
	sleeve.Value = "rbxassetid://3955072236";
	sleeve.Parent = player;

	const opponent = new Instance("ObjectValue");
	opponent.Name = "opponent";
	opponent.Parent = player;
});
