import { Bindable, Remote } from "./types";

const replicatedStorage = game.GetService("ReplicatedStorage");
const serverStorage = game.GetService("ServerStorage");
const workspace = game.GetService("Workspace");

export const remote = <T>(name: Remote) => {
    return replicatedStorage.FindFirstChild("remotes")!.FindFirstChild(name) as T;
}

export const bindable = (name: Bindable) => {
    return serverStorage.FindFirstChild("bindables")!.FindFirstChild(name) as BindableEvent;
}

export const getLocation = (player: Player, location: string) => {
    return player.FindFirstChild("PlayerGui")!.WaitForChild("DuelGui").FindFirstChild(location, true)!;
}

export const get3DLocation = (card: Instance) => {
    const field3D = workspace.FindFirstChild("Field3D")!.FindFirstChild("Field")!;
    const location = card.Parent!;
    if(location.Parent!.Name === "FieldPlayer" || location.Parent!.Name === "FieldOpponent") {
        return field3D.FindFirstChild(location.Parent!.Name)!.FindFirstChild(location.Name, true)!;
    }
    return field3D.FindFirstChild(location.Name, true)!;
}

export const getPlayer = (source: Instance) => {
    return source.FindFirstAncestorWhichIsA("Player")!;
}