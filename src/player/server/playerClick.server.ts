import { getPlayer, bindable } from "shared/utils";

const player = getPlayer(script);
const character = (player.Character || player.CharacterAdded.Wait()) as Model;
const detector = character.WaitForChild("ClickDetector") as ClickDetector;
const startDuel = player.WaitForChild("startDuel.be") as BindableEvent;

detector.MouseClick.Connect((opponent) => {
	const startDuelOpponent = opponent.FindFirstChild("startDuel.be") as BindableEvent;
	startDuelOpponent.Fire(player);
	startDuel.Fire(opponent);
});
