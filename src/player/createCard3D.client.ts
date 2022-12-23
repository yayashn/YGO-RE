import { get3DZone } from "shared/utils";

const replicatedStorage = game.GetService("ReplicatedStorage");
const card3DTemplate = game.Workspace.Field3D.Card;
const createCard3D = replicatedStorage.WaitForChild("createCard3D.re") as RemoteEvent;

createCard3D.OnClientEvent.Connect((cardButton: ImageButton, card: { location: string }, isOpponent?: boolean) => {
	const card3D = card3DTemplate.Clone();
    card3D.Parent = get3DZone(card.location, isOpponent);
    const card3DValue = (cardButton.FindFirstChild("card3D") as ObjectValue);
    card3DValue.Value = card3D;
});
