const cardSearchInput = script.FindFirstAncestorWhichIsA("RemoteEvent")!
const input = script.FindFirstAncestorWhichIsA("TextBox")!

input.GetPropertyChangedSignal("Text").Connect(() => {
    cardSearchInput.FireServer(input.Text);
})