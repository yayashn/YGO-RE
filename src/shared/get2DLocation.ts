import YGOCard from "./ygo/card";


const players = game.GetService("Players");

export default (card: SurfaceGui, location: string) => {
	const getCardInfo = card.FindFirstChild("getCardInfo") as BindableFunction;
	const { ownerName, controllerName } = getCardInfo.Invoke() as YGOCard;
	const player = players.FindFirstChild(ownerName) as Player;
	let location2D: SurfaceGui | TextButton;
	if (location.match("Hand")[0]) {
		location2D = player
			.FindFirstChild("PlayerGui")!
			.FindFirstChild("DuelGui")!
			.FindFirstChild(`HandPlayer`) as SurfaceGui;
	} else if (location.match("MZone")[0] || location.match("SZone")) {
		location2D = player
			.FindFirstChild("PlayerGui")!
			.FindFirstChild("DuelGui")!
			.FindFirstChild(`Field${ownerName === controllerName ? "Player" : "Opponent"}`)!
			.FindFirstChild(location) as TextButton;
	} else {
		location2D = player
			.FindFirstChild("PlayerGui")!
			.FindFirstChild("DuelGui")!
			.FindFirstChild(location, true) as SurfaceGui;
	}
	return location2D;
};
