import { get3DZone } from "shared/utils";
import { Card3D } from "./createCard3D.client";
import type { Position } from "server/ygo";
import { CardButton } from "gui/duel/Cards";

const replicatedStorage = game.GetService("ReplicatedStorage");
const moveCard3D = replicatedStorage.WaitForChild("moveCard3D.re") as RemoteEvent;

moveCard3D.OnClientEvent.Connect((cardButton: ImageButton, card: { location: string }, isOpponent?: boolean) => {
	const card3D = (cardButton.FindFirstChild("card3D") as ObjectValue).Value!;
    card3D.Parent = get3DZone(card.location, isOpponent);
});

const tweenService = game.GetService("TweenService");
const tweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);

const field = game.Workspace.Field3D.Field;

[field.Player, field.Opponent].forEach((playerField) => {
    // Stackable zone animations
    ["GZone", "BZone", "EZone", "Deck"].forEach((zoneName) => {
        const zone = (playerField[zoneName as keyof typeof playerField] as Vector3Value);
        const position = zone.Value;
    
        const stackCards = () => {
            zone.GetChildren().forEach((card3D) => {
                const cardButton = ((card3D as Card3D).WaitForChild("card2D") as ObjectValue).Value as unknown as CardButton;
                const order = cardButton.getOrder!.InvokeServer() as number;
                const tweenGoal = {Position: new Vector3(position.X, position.Y + order*.5, position.Z)} as Partial<ExtractMembers<Instance, Tweenable>>;
                tweenService.Create(card3D, tweenInfo, tweenGoal).Play();
            })
        }
        zone.ChildAdded.Connect(stackCards);
        zone.ChildRemoved.Connect(() => {
            wait(1.5); 
            stackCards();
        });
    })
    
    // Hand animations
    const center = playerField.Hand.Center.Position;
    const orientation = playerField.Hand.Center.Orientation;
    const margin = playerField === field.Player ? 20 : 10;
    const layoutCards = (child: Instance) => {
        const parentSize = playerField.Hand.Center.Size;
        const childSize = (child as Card3D).Size;
        
        let totalWidth = 0;
        const handCards = playerField.Hand.GetChildren().filter((card3D) => card3D.Name === "Card") as Card3D[];
        
        handCards.forEach((card3D) => {
          totalWidth += card3D.Size.X - margin;
        });
        
        let currentX = parentSize.X / 2 - totalWidth / 2;
        
        handCards.forEach((card3D, index) => {
            // Subtract center's X value from the desired X position
            const tweenGoal = {Position: new Vector3(currentX + index * (childSize.X - margin) + (playerField === field.Player ? center.X/2 : center.X), center.Y, center.Z)};
            (card3D as Card3D).Orientation = orientation;
            tweenService.Create(card3D, tweenInfo, tweenGoal).Play();
        });        
    }
    playerField.Hand.ChildAdded.Connect(layoutCards)
    playerField.Hand.ChildRemoved.Connect(layoutCards)
    

    // Field zone animations
    playerField.Field.GetChildren().filter(zone => zone.IsA("Vector3Value")).forEach((zone) => {
        zone.ChildAdded.Connect((card3D) => { 
            const card2D = (card3D as Card3D).card2D.Value
            const position = card2D.getPosition!.InvokeServer() as Position
            let tweenGoal: {CFrame: CFrame} = {CFrame: new CFrame()};

            if(playerField === field.Player) {
                if(position === "FaceUpAttack" || position === "FaceUp") {
                    tweenGoal.CFrame = CFrame.Angles(0, math.rad(-90), math.rad(180)).add((zone as Vector3Value).Value)
                } else if(position === "FaceUpDefense") {
                    tweenGoal.CFrame = CFrame.Angles(0, math.rad(-180), math.rad(180)).add((zone as Vector3Value).Value)
                } else if(position === "FaceDownDefense") {
                    tweenGoal.CFrame = CFrame.Angles(0, math.rad(180), math.rad(0)).add((zone as Vector3Value).Value)
                } else if(position === "FaceDown") {
                    tweenGoal.CFrame = CFrame.Angles(0, math.rad(90), math.rad(0)).add((zone as Vector3Value).Value)
                }
            } else {
                if(position === "FaceUpAttack" || position === "FaceUp") {
                    tweenGoal.CFrame = CFrame.Angles(0, math.rad(90), math.rad(180)).add((zone as Vector3Value).Value)
                } else if(position === "FaceUpDefense") {
                    tweenGoal.CFrame = CFrame.Angles(0, math.rad(180), math.rad(180)).add((zone as Vector3Value).Value)
                } else if(position === "FaceDownDefense") {
                    tweenGoal.CFrame = CFrame.Angles(0, math.rad(0), math.rad(0)).add((zone as Vector3Value).Value)
                } else if(position === "FaceDown") {
                    tweenGoal.CFrame = CFrame.Angles(0, math.rad(-90), math.rad(0)).add((zone as Vector3Value).Value)
                }    
            }

            tweenService.Create(card3D, tweenInfo, tweenGoal as Partial<ExtractMembers<Instance, Tweenable>>).Play();
        })
    })
})