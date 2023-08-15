import { Players } from "@rbxts/services";

const player = script.FindFirstAncestorWhichIsA("Player")!;

const character = player.Character || player.CharacterAdded.Wait()[0];
const humanoid = character.FindFirstChildWhichIsA("Humanoid")!;
const humanoidDescription = character.FindFirstChildWhichIsA("HumanoidDescription")!;

const appearanceInfo = Players.GetCharacterAppearanceInfoAsync(player.UserId);
    
let hats = '';

for (const asset of appearanceInfo.assets) {
    if (asset.assetType.name === "Hat") {
        hats += asset.id + ',';
    } else if(asset.assetType.name === "HairAccessory") {
        hats += asset.id + ',';
    }
}

humanoidDescription.HatAccessory = hats;
humanoid.ApplyDescription(humanoidDescription);