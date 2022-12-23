import { Duel } from "server/ygo";
import { remoteEvent } from "shared/utils";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const character = player.Character || player.CharacterAdded.Wait()[0];
const clickDetector = character.WaitForChild("ClickDetector") as ClickDetector;
const serverStorage = game.GetService("ServerStorage");
const duels = serverStorage.WaitForChild("duels")!;

const showFieldRe = remoteEvent("showField.re", player)

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