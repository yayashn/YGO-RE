import { Location } from "server/duel/types";
import Remotes from "shared/net";
import { get3DZone } from "shared/utils";

const card3DTemplate = game.Workspace.Field3D.Card;

Remotes.Client.OnEvent("createCard3D", (card2D: SurfaceGui, location: Location, isOpponent) => {
    const card3D = card3DTemplate.Clone();
    card3D.Parent = get3DZone(location, isOpponent);
    const card3DValue = card2D.WaitForChild("card3D") as ObjectValue;
    card3DValue.Value = card3D;
    const card2DValue = card3D.WaitForChild("card2D") as ObjectValue;
    card2DValue.Value = card2D;
    const art = card2D.WaitForChild("Art") as SurfaceGui;
    art.Adornee = card3D;
    const sleeve = card2D.WaitForChild("Sleeve") as SurfaceGui;
    sleeve.Adornee = card3D;
    const cardMenu = card2D.WaitForChild("CardMenu") as BillboardGui;
    cardMenu.Adornee = card3D;
    const status = card2D.WaitForChild("Status") as BillboardGui;
    status.Adornee = card3D;

    card2D.Destroying.Connect(() => {
        card3D.Destroy();
    })
});