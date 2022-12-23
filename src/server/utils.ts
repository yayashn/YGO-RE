
const serverStorage = game.GetService("ServerStorage");
const duels = serverStorage.WaitForChild("duels")!;
const httpService = game.GetService("HttpService");

export const getDuel = (player: Player) => {
    for(const d of duels.GetChildren()) {
        if(string.match(d.Name, `|${player.Name}`) || string.match(d.Name, `${player.Name}|`)) {
            return d as Folder;
        }
    }
}

export const getCards = (player: Player) => {
    return httpService.JSONDecode((serverStorage.FindFirstChild("players")!.FindFirstChild(player.Name)!.FindFirstChild("deck") as StringValue).Value) as [];
}