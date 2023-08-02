const scrollingFrame = script.FindFirstAncestorWhichIsA("ScrollingFrame")!;
const state = script.Parent as StringValue;

state.Changed.Connect(() => {
    scrollingFrame.CanvasPosition = new Vector2(0, 0);
})