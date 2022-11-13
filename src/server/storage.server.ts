const players = game.GetService("Players");
const serverStorage = game.GetService("ServerStorage");

players.PlayerAdded.Connect((player) => {
    const playerFolder = new Instance("Folder");
    playerFolder.Name = player.Name;
    playerFolder.Parent = serverStorage;

    const sleeve = new Instance("StringValue");
    sleeve.Name = "sleeve";
    sleeve.Value = "rbxassetid://3955072236";
    sleeve.Parent = player;
});