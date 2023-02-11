import { Duel } from "server/ygo";
import { ServerScriptService } from "@rbxts/services";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const character = player.Character || player.CharacterAdded.Wait()[0];
const clickDetector = character.WaitForChild("ClickDetector") as ClickDetector;
const duels = ServerScriptService.FindFirstChild("instances")!.WaitForChild("duels")!;

const showFieldRe = player.WaitForChild("showField.re") as RemoteEvent;

clickDetector.MouseClick.Connect((opponent) => {
    for(const duel of duels.GetChildren()) {
        if(string.match(duel.Name, `|${player.Name}`) || string.match(duel.Name, `${player.Name}|`)) {
            print("You are already in a duel!")
            return
        }
    }
    Duel(player, opponent);
    showFieldRe.FireClient(player, true);
    const showFieldReOpponent = opponent.WaitForChild("showField.re") as RemoteEvent;
    showFieldReOpponent.FireClient(opponent, true);
})