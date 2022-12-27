import { PlayerFolder } from "shared/types";
import { DuelFolder, PlayerValue } from "./ygo";

const serverStorage = game.GetService("ServerStorage");
const duels = serverStorage.WaitForChild("duels")!;
const httpService = game.GetService("HttpService");
const replicatedStorage = game.GetService("ReplicatedStorage");
const cards = replicatedStorage.WaitForChild("cards") as Folder;


export const getDuel = (player: Player) => {
    for(const d of duels.GetChildren()) {
        if(string.match(d.Name, `|${player.Name}`) || string.match(d.Name, `${player.Name}|`)) {
            const players = [(d.FindFirstChild("player1") as PlayerValue), (d.FindFirstChild("player2") as PlayerValue)];
            const p = players.find((p) => (p as unknown as {Value: Player}).Value === player);
            return [d, p] as [DuelFolder, PlayerValue];
        }
    }
}

export const getCards = (player: Player) => {
    return httpService.JSONDecode((serverStorage.FindFirstChild("players")!.FindFirstChild(player.Name)!.FindFirstChild("deck") as StringValue).Value) as [];
}

export const getCardInfo = (name: string) => {
    return cards.FindFirstChild(name, true) as Folder;
}