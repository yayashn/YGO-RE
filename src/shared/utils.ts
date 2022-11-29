import { Bindable, Remote } from "./types";

const replicatedStorage = game.GetService("ReplicatedStorage");
const serverStorage = game.GetService("ServerStorage");
const workspace = game.GetService("Workspace");
const players = game.GetService("Players");

export const remote = <T>(name: Remote) => {
	return replicatedStorage.FindFirstChild("remotes")!.FindFirstChild(name) as T;
};

export const bindable = <T>(name: Bindable, fromClient?: boolean) => {
	try {
		return (fromClient ? replicatedStorage : serverStorage).FindFirstChild("bindables")!.FindFirstChild(name) as T;
	} catch (error) {
		print(error);
		return new Instance("BindableEvent") as T;
	}
};

export const getPlayer = (source: Instance) => {
	return source.FindFirstAncestorWhichIsA("Player")!;
};

export const getOpponent = (source: Instance) => {
	const player = getPlayer(source);
	return (player.FindFirstChild("opponent") as ObjectValue).Value as Player;
};
