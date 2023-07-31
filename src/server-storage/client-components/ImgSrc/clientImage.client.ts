const image = (script.FindFirstAncestorWhichIsA("ImageLabel") || script.FindFirstAncestorWhichIsA("ImageButton"))!;
const src = script.Parent as StringValue;
image.Image = src.Value;
src.Changed.Connect(() => {
    image.Image = src.Value;
})
