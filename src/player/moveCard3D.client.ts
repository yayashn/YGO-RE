import { get3DZone } from "shared/utils";
import type { CardFolder } from "server/ygo";

const replicatedStorage = game.GetService("ReplicatedStorage");
const moveCard3D = replicatedStorage.WaitForChild("moveCard3D.re") as RemoteEvent;

moveCard3D.OnClientEvent.Connect((cardButton: ImageButton, card: { location: string }, isOpponent?: boolean) => {
	const card3D = (cardButton.FindFirstChild("card3D") as ObjectValue).Value!;
    card3D.Parent = get3DZone(card.location, isOpponent);
});
