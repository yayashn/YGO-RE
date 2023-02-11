import { PlayerFolder } from "shared/types";
import { CardFolder, DuelFolder, PlayerValue } from "./ygo";
import { ServerScriptService } from "@rbxts/services";

const duels = ServerScriptService.WaitForChild("instances").WaitForChild("duels") as Folder;
const httpService = game.GetService("HttpService");
const replicatedStorage = game.GetService("ReplicatedStorage");
const cards = replicatedStorage.WaitForChild("cards") as Folder;
const playersFolder = ServerScriptService.WaitForChild("instances").WaitForChild("players") as Folder;

export const getDuel = (player: Player) => {
    for(const d of duels.GetChildren()) {
        if(string.match(d.Name, `|${player.Name}`) || string.match(d.Name, `${player.Name}|`)) {
            const players = [(d.FindFirstChild("player1") as PlayerValue), (d.FindFirstChild("player2") as PlayerValue)];
            const p = players.find((p) => (p as unknown as {Value: Player}).Value === player);
            const o = players.find((p) => (p as unknown as {Value: Player}).Value !== player);
            return [d, p, o] as [DuelFolder, PlayerValue, PlayerValue];
        }
    }
}

export const getCards = (player: Player) => {
    return httpService.JSONDecode((playersFolder.FindFirstChild(player.Name)!.FindFirstChild("deck") as StringValue).Value) as [];
}

export const getCard = (duel: DuelFolder, uid: string) => {
    const cards1 = duel.player1.cards.GetChildren() as CardFolder[];
    const cards2 = duel.player2.cards.GetChildren() as CardFolder[];
    const cards = [...cards1, ...cards2];

    return cards.find((c) => c.uid.Value === uid);
}

export const getCardInfo = (name: string) => {
    return cards.FindFirstChild(name, true) as Folder;
}