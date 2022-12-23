const workspace = game.GetService("Workspace");
const player = game.GetService("Players").LocalPlayer;
const character = player.Character || player.CharacterAdded.Wait()[0];
const fieldCamera = workspace.Field3D.FieldCam;
let showField: RBXScriptConnection;


(player.WaitForChild("showField.re") as RemoteEvent).OnClientEvent.Connect((bool) => {
	const camera = workspace.CurrentCamera!;
	if (bool) {
		camera.CameraSubject = fieldCamera;
		showField = game.GetService("RunService").RenderStepped.Connect(() => {
			camera.CFrame = fieldCamera.CFrame;
		});
	} else {
		camera.CameraSubject = character.FindFirstChild("Head") as Part;
		showField.Disconnect();
	}
});