import { Duel, getDuel } from "server/duel/duel";
import alert from "server/popups/alert";
import confirm from "server/popups/confirm";
import waitingOptional from "server/popups/waitingOptional";
import { getEquippedDeck } from "server/profile-service/profiles";
import { YPlayer } from "server/duel/player";
import { DEV } from "shared/env";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const character = player.Character || player.CharacterAdded.Wait()[0];
const clickDetector = character.FindFirstChildWhichIsA("ClickDetector")!;

clickDetector.MouseClick.Connect(async (opponent) => {
    if(getDuel(player)) {
        await alert("Player is already in a duel!", opponent);
        return;
    }
    const opponentDeck = getEquippedDeck(opponent);
    if(!DEV && opponentDeck.deck.size() < 40) {
        await alert("You need a minimum of 40 cards in your deck to start a duel.", opponent);
        return;
    }

    const playerDeck = getEquippedDeck(player);
    if(!DEV && playerDeck.deck.size() < 40) {
        await alert("Opponent has an invalid deck.", opponent);
        return;
    }

    const [stopWaiting, stillWaiting] = waitingOptional("Waiting for opponent to accept...", opponent);
    const accept = await confirm(`${player.Name} has challenged you to a duel! Do you accept?`, player)
    if(stillWaiting() === undefined) {
        await alert("Request has expired.", player);
        return;
    }
    if(accept === "NO") {
        stopWaiting();
        return;
    }
    stopWaiting();

    const duel = new Duel(new YPlayer(player), new YPlayer(opponent));
})