const serverStorage = game.GetService("ServerStorage");
const duels = serverStorage.FindFirstChild("Duels")!;

export const getDuel = (player: Player) => {
	for (const duel of duels.GetChildren()) {
		const [player1, player2] = duel.Name.split("|");
		if (player.Name === player1 || player.Name === player2) {
			return (duel as BindableFunction).Invoke();
		}
	}
};
