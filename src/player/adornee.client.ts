const replicatedStorage = game.GetService("ReplicatedStorage");
const adornee = replicatedStorage.WaitForChild("adornee.re") as RemoteEvent;

adornee.OnClientEvent.Connect((gui: SurfaceGui, part: Part) => {
    gui.Adornee = part;
    print(gui.Adornee)
})
