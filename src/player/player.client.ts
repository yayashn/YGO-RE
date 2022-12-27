const player = game.GetService("Players").LocalPlayer;

const clickRemote = player.WaitForChild("click") as RemoteEvent;
player.GetMouse().Button1Down.Connect(() => {
    clickRemote.FireServer();
})