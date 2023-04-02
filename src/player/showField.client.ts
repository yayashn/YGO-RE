import { ReplicatedStorage, Lighting } from "@rbxts/services";

const workspace = game.GetService("Workspace");
const player = game.GetService("Players").LocalPlayer;
const character = player.Character || player.CharacterAdded.Wait()[0];
const fieldCamera = workspace.Field3D.FieldCam;
let showField: RBXScriptConnection;

const skyCurrent = Lighting.WaitForChild("Sky") as Sky;
const skyDuel = ReplicatedStorage.WaitForChild("SkyDuel") as Sky;
const sky = ReplicatedStorage.WaitForChild("Sky") as Sky;

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
		skyCurrent.SkyboxBk = sky.SkyboxBk;
		skyCurrent.SkyboxDn = sky.SkyboxDn;
		skyCurrent.SkyboxFt = sky.SkyboxFt;
		skyCurrent.SkyboxLf = sky.SkyboxLf;
		skyCurrent.SkyboxRt = sky.SkyboxRt;
		skyCurrent.SkyboxUp = sky.SkyboxUp;
		camera.CameraSubject = character.FindFirstChild("Head") as Part;
		showField.Disconnect();
	}
});