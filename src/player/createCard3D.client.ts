import { CardButton } from "gui/duel/Cards";
import { get3DZone, instance } from "shared/utils";

const replicatedStorage = game.GetService("ReplicatedStorage");
const card3DTemplate = game.Workspace.Field3D.Card;
const createCard3D = replicatedStorage.WaitForChild("createCard3D.re") as RemoteEvent;

export interface Card2DValue {
    Value: CardButton
}

export type Card3D = Part & {
    Menu: ClickDetector;
    card2D: Card2DValue;
}

createCard3D.OnClientEvent.Connect((cardButton: ImageButton, card: { location: string }, isOpponent?: boolean) => {
	const card3D = card3DTemplate.Clone() as Card3D;
    card3D.Parent = get3DZone(card.location, isOpponent);
    const card3DValue = (cardButton.FindFirstChild("card3D") as ObjectValue);
    card3DValue.Value = card3D;
    const card2DValue = instance("ObjectValue", "card2D", card3D) as ObjectValue;
    card2DValue.Value = cardButton;
});
