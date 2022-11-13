import { remote } from "shared/utils";

const field = game.Workspace.Field3D.Field
const handPlayer = field.HandPlayer;
const handPlayerCenter = handPlayer.Center

const tweenService = game.GetService("TweenService");
const tweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);

const margin = 40;

remote<RemoteFunction>("handLayout").OnClientInvoke = (card: SurfaceGui, event: "added" | "removed") => {
    const card3D = (card.FindFirstChild("card3D") as ObjectValue).Value as Part;
    const cardsInHand = handPlayerCenter.GetChildren().filter((child) => child.IsA("Part") && child !== card3D) as Part[];

    if (event === "added") {
        cardsInHand.forEach((cardInHand) => {
            const tweenGoal = {
                Position: new Vector3(cardInHand.Position.X - margin, cardInHand.Position.Y, cardInHand.Position.Z)
            }
            tweenService.Create(cardInHand, tweenInfo, tweenGoal).Play();
        });
        const tweenGoal = {
            Position: new Vector3(card3D.Position.X - margin, card3D.Position.Y, card3D.Position.Z)
        };
        (card3D.FindFirstChild("LayoutOrder") as IntValue).Value = cardsInHand.size() - 1;
        card3D.Orientation = handPlayerCenter.Orientation;
        tweenService.Create(card3D, tweenInfo, tweenGoal).Play();
    } else if (event === "removed") {
        cardsInHand.forEach((cardInHand) => {
            const cardInHandLayoutOrder = (cardInHand.FindFirstChild("LayoutOrder") as IntValue).Value;
            const cardAddedLayoutOrder = (card3D.FindFirstChild("LayoutOrder") as IntValue).Value;
            let tweenGoal = {}
            if(cardInHandLayoutOrder > cardAddedLayoutOrder) {
                tweenGoal = {
                    Position: new Vector3(cardInHand.Position.X - margin, cardInHand.Position.Y, cardInHand.Position.Z)
                }
            } else {
                tweenGoal = {
                    Position: new Vector3(cardInHand.Position.X + margin, cardInHand.Position.Y, cardInHand.Position.Z)
                }
            }
            tweenService.Create(cardInHand, tweenInfo, tweenGoal).Play();
        });
    }
}