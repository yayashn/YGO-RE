import { remote, get3DLocation } from "shared/utils";

const tweenService = game.GetService("TweenService");
const tweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);

remote<RemoteEvent>("moveCard3D").OnClientEvent.Connect((card: ImageButton) => {
    const card3D = (card.FindFirstChild("card3D") as ObjectValue).Value! as Part;
    const location = get3DLocation(card) as Vector3Value;
    card3D.Parent = location;

    const location3D = {
        Player: {
            atk: CFrame.Angles(0, math.rad(-90), math.rad(180)).add(location.Value),
            def: CFrame.Angles(0, math.rad(-180), math.rad(180)).add(location.Value),
            set: CFrame.Angles(0, math.rad(90), math.rad(0)).add(location.Value),
            setDef: CFrame.Angles(0, math.rad(180), math.rad(0)).add(location.Value),
        },
        Opponent: {
            atk: CFrame.Angles(0, math.rad(90), math.rad(180)).add(location.Value),
            def: CFrame.Angles(0, math.rad(180), math.rad(180)).add(location.Value),
            set: CFrame.Angles(0, math.rad(-90), math.rad(0)).add(location.Value),
            setDef: CFrame.Angles(0, math.rad(0), math.rad(0)).add(location.Value),
        },
    }

    const tweenGoal = { CFrame: location3D['Player']['atk'] }

    tweenService.Create(card3D, tweenInfo, tweenGoal).Play();
});