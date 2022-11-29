import get3DLocation from "shared/get3DLocation";
import { remote } from "shared/utils";

const player = game.GetService("Players").LocalPlayer;

const tweenService = game.GetService("TweenService");
const tweenInfo = new TweenInfo(0.25, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, 0, false, 0);

interface TweenGoal {
	CFrame: CFrame;
	Orientation?: Vector3;
}

remote<RemoteEvent>("moveCard3D").OnClientEvent.Connect((card: SurfaceGui) => {
	const card3D = (card.FindFirstChild("card3D") as ObjectValue).Value as Part;
	const [location, vector3] = get3DLocation(card, true) as [BasePart, Vector3];

	const location3D = {
		Player: {
			atk: CFrame.Angles(0, math.rad(-90), math.rad(180)).add(vector3),
			def: CFrame.Angles(0, math.rad(-180), math.rad(180)).add(vector3),
			set: CFrame.Angles(0, math.rad(90), math.rad(0)).add(vector3),
			setDef: CFrame.Angles(0, math.rad(180), math.rad(0)).add(vector3),
			hand: CFrame.Angles(0, math.rad(90), math.rad(0)).add(vector3),
		},
		Opponent: {
			atk: CFrame.Angles(0, math.rad(90), math.rad(180)).add(vector3),
			def: CFrame.Angles(0, math.rad(180), math.rad(180)).add(vector3),
			set: CFrame.Angles(0, math.rad(-90), math.rad(0)).add(vector3),
			setDef: CFrame.Angles(0, math.rad(0), math.rad(0)).add(vector3),
		},
	};

	const tweenGoal: TweenGoal = {
		CFrame: location3D["Player"]["atk"],
	};
	if (!location.Name.match("Hand")[0]) {
		tweenService.Create(card3D, tweenInfo, tweenGoal).Play();
	}

	card3D.Parent = location;
});
