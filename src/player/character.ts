import { Lighting } from "@rbxts/services";

const defaultShirt = Lighting.FindFirstChild("Char")!.FindFirstChildWhichIsA("Shirt")!;
const defaultPants = Lighting.FindFirstChild("Char")!.FindFirstChildWhichIsA("Pants")!;

const player = script.FindFirstAncestorWhichIsA("Player")!;
const character = player.Character || player.CharacterAdded.Wait()[0];
const humanoid = character.WaitForChild("Humanoid") as Humanoid;
const humanoidDescription = humanoid.GetAppliedDescription();

let shirt = character.WaitForChild("Shirt") as Shirt;
let pants = character.WaitForChild("Pants") as Pants;


if(shirt === undefined) {
    shirt = defaultShirt.Clone();
    shirt.Parent = character;
} else {
    shirt.ShirtTemplate = defaultShirt.ShirtTemplate;
}
if(pants === undefined) {
    pants = defaultPants.Clone();
    pants.Parent = character;
} else {
    pants.PantsTemplate = defaultPants.PantsTemplate;
}

humanoidDescription.Head = 0
humanoidDescription.Torso = 0
humanoidDescription.RightLeg = 0
humanoidDescription.LeftLeg = 0
humanoidDescription.RightArm = 0
humanoidDescription.LeftArm = 0
humanoid.ApplyDescription(humanoidDescription);