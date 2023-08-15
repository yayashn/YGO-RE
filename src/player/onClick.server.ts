import { Duel, duels, getDuel } from "server/duel/duel";
import alert from "server/popups/alert";
import confirm from "server/popups/confirm";
import waitingOptional from "server/popups/waitingOptional";
import { YPlayer } from "server/duel/player";
import { HttpService, RunService } from "@rbxts/services";
import { getEquippedDeck } from "server/profile-service/functions/getEquippedDeck";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const character = player.Character || player.CharacterAdded.Wait()[0];
const clickDetector = character.FindFirstChildWhichIsA("ClickDetector")!;
const onClickBusy = new Instance("BoolValue");
onClickBusy.Name = "onClickBusy";
onClickBusy.Parent = player;


clickDetector.MouseClick.Connect(async (opponent) => {
    const opponentOnClickBusy = opponent.FindFirstChild("onClickBusy") as BoolValue;
    if(opponentOnClickBusy.Value === true) {
        return;
    }

    if(onClickBusy.Value === true) {
        await alert("Cannot currently send this player a duel request.", opponent);
        return;
    }

    if(getDuel(player)) {
        await alert("Player is already in a duel!", opponent);
        return;
    }
    const opponentDeck = getEquippedDeck(opponent);
    if(!RunService.IsStudio() && opponentDeck.deck.size() < 40) {
        await alert("You need a minimum of 40 cards in your deck to start a duel.", opponent);
        return;
    }

    const playerDeck = getEquippedDeck(player);
    if(!RunService.IsStudio() && playerDeck.deck.size() < 40) {
        await alert("Opponent has an invalid deck.", opponent);
        return;
    }

    opponentOnClickBusy.Value = true;
    onClickBusy.Value = true;
    const [stopWaiting, stillWaiting] = waitingOptional("Waiting for opponent to accept...", opponent);
    const accept = await confirm(`${opponent.Name} has challenged you to a duel! Do you accept?`, player);

    if(stillWaiting() === undefined) {
        await alert("Request has expired.", player);
        opponentOnClickBusy.Value = false;
        onClickBusy.Value = false;
        return;
    }
    if(accept === "NO") {
        stopWaiting();
        opponentOnClickBusy.Value = false;
        onClickBusy.Value = false;
        return;
    }
    stopWaiting();
    opponentOnClickBusy.Value = false;
    onClickBusy.Value = false;

    const random = new Random()
    const player1 = random.NextInteger(1, 2) === 1 ? player : opponent;
    const player2 = player1 === player ? opponent : player;

    const yPlayer1 = new YPlayer(player1);
    print(yPlayer1)
    const yPlayer2 = new YPlayer(player2);
    print(yPlayer2)
    const duel = new Duel(yPlayer1, yPlayer2);
})