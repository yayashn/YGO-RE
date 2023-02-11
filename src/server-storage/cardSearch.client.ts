import { ReplicatedStorage } from "@rbxts/services";

const cardSearchInput = ReplicatedStorage.FindFirstChild("remotes")!.FindFirstChild("cardSearchInput") as RemoteEvent;
const input = script.FindFirstAncestorWhichIsA("TextBox")!

input.GetPropertyChangedSignal("Text").Connect(() => {
    cardSearchInput.FireServer(input.Text);
})