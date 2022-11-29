import { Duel } from "storage/ygo";

const serverStorage = game.GetService("ServerStorage");
const duels = serverStorage.FindFirstChild("Duels")!;

export default (player1: Player) => {
	const player2 = (player1.FindFirstChild("opponent") as ObjectValue).Value as Player;

	const showFieldPlayer1 = player1.FindFirstChild("showField.re") as RemoteEvent;
	showFieldPlayer1.FireClient(player1);

    let showFieldPlayer2: RemoteEvent;
    if (player2) {
	    showFieldPlayer2 = player2.FindFirstChild("showField.re") as RemoteEvent;
	    showFieldPlayer2.FireClient(player2);
    }

	const duelFunction = new Instance("BindableFunction");
	duelFunction.Name = `${player1.Name}|${player2 ? player2.Name : ''}`;
	duelFunction.Parent = duels;
	duelFunction.OnInvoke = () => {
		return duel;
	};

	const duel = new Duel(player1, player2, duelFunction);
	return duel;
};
