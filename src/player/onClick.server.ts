import { Duel } from "server/ygo/Duel";
import { ServerScriptService } from "@rbxts/services";
import confirm from "server/gui/confirm";
import alert from "server/gui/alert";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const character = player.Character || player.CharacterAdded.Wait()[0];
const clickDetector = character.WaitForChild("ClickDetector") as ClickDetector;
const duels = ServerScriptService.FindFirstChild("instances")!.WaitForChild("duels")!;

const showFieldRe = player.WaitForChild("showField.re") as RemoteEvent;

const duelRequestTimeout = 10; // Timeout in seconds
const lastDuelRequest = new Map<Player, number>();

clickDetector.MouseClick.Connect(async (opponent) => {
    const opponentDecks = (opponent.WaitForChild("getDecks") as BindableFunction).Invoke() as Record<string, string[]>
    const opponentEquippedDeck = (opponent.WaitForChild("getEquippedDeck") as BindableFunction).Invoke().deck as string
    if(opponentDecks[opponentEquippedDeck].size() < 40) {
        await alert(opponent, "You must have a deck with at least 40 cards to duel!");
        return
    }

    for(const duel of duels.GetChildren()) {
        if(string.match(duel.Name, `|${player.Name}`) || string.match(duel.Name, `${player.Name}|`)) {
            print("You are already in a duel!");
            await alert(opponent, "You are already in a duel!");
            return;
        }
    }

    const currentTime = os.time();
    const lastRequestTime = lastDuelRequest.get(player) || 0;

    if (currentTime - lastRequestTime < duelRequestTimeout) {
        await alert(opponent, "You must wait before sending this player another duel request!");
        return;
    }

    lastDuelRequest.set(player, currentTime);

    const confirmDuel = await confirm(player, `${opponent.Name} has challenged you to a duel! Accept?`);

    if(confirmDuel === "YES") {
        (player.WaitForChild("mount") as BindableEvent).Fire();
        (opponent.WaitForChild("mount") as BindableEvent).Fire();
        Duel(player, opponent);
        showFieldRe.FireClient(player, true);
        const showFieldReOpponent = opponent.WaitForChild("showField.re") as RemoteEvent;
        showFieldReOpponent.FireClient(opponent, true);
    }
});
