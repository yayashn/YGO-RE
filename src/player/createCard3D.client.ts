import { CardButton } from "gui/duel/Cards/Cards";
import { get3DZone, instance } from "shared/utils";

const replicatedStorage = game.GetService("ReplicatedStorage");
const card3DTemplate = game.Workspace.Field3D.Card;
const createCard3D = replicatedStorage.FindFirstChild("createCard3D.re", true) as RemoteEvent;

export interface Card2DValue {
    Value: CardButton
}

export type Card3D = Part & {
    Menu: ClickDetector;
    card2D: Card2DValue;
    order: IntValue;
}

createCard3D.OnClientEvent.Connect((cardButton: SurfaceGui, card: { location: string }, isOpponent?: boolean) => {
    const card3D = card3DTemplate.Clone() as Card3D;
    card3D.Parent = get3DZone(card.location, isOpponent);
    const card3DValue = (cardButton.FindFirstChild("card3D") as ObjectValue);
    card3DValue.Value = card3D;
    const card2DValue = instance("ObjectValue", "card2D", card3D) as ObjectValue;
    card2DValue.Value = cardButton;
    const orderValue = instance("IntValue", "order", card3D) as IntValue;
    orderValue.Value = 0;
    const art = cardButton.WaitForChild("Art") as SurfaceGui;
    art.Adornee = card3D;
    const sleeve = cardButton.WaitForChild("Sleeve") as SurfaceGui;
    sleeve.Adornee = card3D;
    const cardMenu = cardButton.WaitForChild("CardMenu") as BillboardGui;
    cardMenu.Adornee = card3D;
    const status = cardButton.WaitForChild("Status") as BillboardGui;
    status.Adornee = card3D;

    const cardClickDetector = card3D.WaitForChild("Menu") as ClickDetector;
    cardClickDetector.MouseClick.Connect(() => {
        const onCardClick = cardButton.FindFirstChild("onCardClick") as RemoteEvent;
        onCardClick.FireServer();
    })
});
