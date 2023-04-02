import { ReplicatedStorage, Lighting } from "@rbxts/services";

const workspace = game.GetService("Workspace");
const player = game.GetService("Players").LocalPlayer;
const character = player.Character || player.CharacterAdded.Wait()[0];
const fieldCamera = workspace.Field3D.FieldCam;
let showField: RBXScriptConnection;

const skyDefault = {
	SkyboxBk: "http://www.roblox.com/asset/?id=144933338",
	SkyboxDn: "http://www.roblox.com/asset/?id=144931530",
	SkyboxFt: "http://www.roblox.com/asset/?id=144933262",
	SkyboxLf: "http://www.roblox.com/asset/?id=144933244",
	SkyboxRt: "http://www.roblox.com/asset/?id=144933299",
	SkyboxUp: "http://www.roblox.com/asset/?id=144931564",
}

const skyDuel = {
	SkyboxBk: "rbxassetid://12977698621",
	SkyboxDn: "rbxassetid://12977698172",
	SkyboxFt: "rbxassetid://12977697591",
	SkyboxLf: "rbxassetid://12977696961",
	SkyboxRt: "rbxassetid://12977696456",
	SkyboxUp: "rbxassetid://12977695748",
}

const skyCurrent = Lighting.WaitForChild("Sky") as Sky;

(player.WaitForChild("showField.re") as RemoteEvent).OnClientEvent.Connect((bool) => {
	const camera = workspace.CurrentCamera!;
	if (bool) {
		skyCurrent.SkyboxBk = skyDuel.SkyboxBk;
		skyCurrent.SkyboxDn = skyDuel.SkyboxDn;
		skyCurrent.SkyboxFt = skyDuel.SkyboxFt;
		skyCurrent.SkyboxLf = skyDuel.SkyboxLf;
		skyCurrent.SkyboxRt = skyDuel.SkyboxRt;
		skyCurrent.SkyboxUp = skyDuel.SkyboxUp;
		camera.CameraSubject = fieldCamera;
		showField = game.GetService("RunService").RenderStepped.Connect(() => {
			camera.CFrame = fieldCamera.CFrame;
		});
	} else {
		skyCurrent.SkyboxBk = skyDefault.SkyboxBk;
		skyCurrent.SkyboxDn = skyDefault.SkyboxDn;
		skyCurrent.SkyboxFt = skyDefault.SkyboxFt;
		skyCurrent.SkyboxLf = skyDefault.SkyboxLf;
		skyCurrent.SkyboxRt = skyDefault.SkyboxRt;
		skyCurrent.SkyboxUp = skyDefault.SkyboxUp;
		camera.CameraSubject = character.FindFirstChild("Head") as Part;
		showField.Disconnect();
	}
});