import { get3DZone } from "shared/utils";
import { Card3D } from "./createCard3D.client";
import type { Position } from "server/ygo";

const replicatedStorage = game.GetService("ReplicatedStorage");
const drawCardFromClient = replicatedStorage.FindFirstChild("remotes")!.FindFirstChild("drawCard") as RemoteFunction;
const moveCard3D = replicatedStorage.WaitForChild("moveCard3D.re") as RemoteEvent;

moveCard3D.OnClientEvent.Connect((cardButton: ImageButton, card: { location: string }, isOpponent?: boolean) => {
	const card3D = (cardButton.FindFirstChild("card3D") as ObjectValue).Value!;
    card3D.Parent = get3DZone(card.location, isOpponent);
});


const tweenService = game.GetService("TweenService");
const tweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);

const field = game.Workspace.Field3D.Field;

[field.Player, field.Opponent].forEach((playerField) => {
    // Hand animations
    playerField.Hand.ChildAdded.Connect((card3D) => {
        const hand = playerField.Hand;
        const margin = 40;
    
        const handCards = () => hand.GetChildren().filter((card3D) => card3D.Name === "Card");
        handCards().forEach((card3D) => {
            const tweenGoal = {Position: new Vector3()};
            const position = (card3D as Card3D).Position;
            tweenGoal.Position = new Vector3(position.X + (handCards().size()) * margin, position.Y, position.Z);
            const tween = tweenService.Create(card3D, tweenInfo, tweenGoal as Partial<ExtractMembers<Instance, Tweenable>>);
            tween.Play();
            tween.Completed.Wait();
        });
        const tweenGoal = {Position: new Vector3()};
        const position = (card3D as Card3D).Position;
        tweenGoal.Position = new Vector3(position.X + (handCards().size()) * margin, position.Y, position.Z);
        const tween = tweenService.Create(card3D, tweenInfo, tweenGoal as Partial<ExtractMembers<Instance, Tweenable>>);
        tween.Play();
        tween.Completed.Wait();    
    })

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