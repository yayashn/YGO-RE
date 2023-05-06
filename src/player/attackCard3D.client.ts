import { ReplicatedStorage, TweenService } from "@rbxts/services";
import { MZone } from "shared/types";
import { createInstance } from "shared/utils";

const attackCard3D = ReplicatedStorage.FindFirstChild("remotes")!.FindFirstChild("attackCard3D.re") as RemoteEvent
const field = game.Workspace.Field3D.Field;

(field.Player.Attack.GetChildren() as Part[]).forEach((zone) => {
    createInstance("Vector3Value", "OriginalPosition", zone).Value = zone.Position
});
(field.Opponent.Attack.GetChildren() as Part[]).forEach((zone) => {
    createInstance("Vector3Value", "OriginalPosition", zone).Value = zone.Position
});

attackCard3D.OnClientEvent.Connect((opponent: boolean, zone1: MZone, zone2?: MZone, cleanup: boolean = false) => {
    const attacker = opponent ? "Opponent" : "Player"
    const pointer = field[attacker].Attack[zone1]
    const pointerGui = pointer.Gui
    const pointerOriginalPosition = pointer.FindFirstChild("OriginalPosition") as Vector3Value

    if(cleanup) {
        pointerGui.Enabled = false
        pointer.Position = pointerOriginalPosition.Value
        return
    }

    const isDirectAttack = !zone2;

    pointerGui.Enabled = true
    if(isDirectAttack) {
        const tween = TweenService.Create(pointer, new TweenInfo(0.5), {
            Position: field[attacker].Hand.Center.Position
        })
        tween.Play()
    } else {
        const pointer2 = field[attacker].Attack[zone2]
        const tween = TweenService.Create(pointer, new TweenInfo(0.5), {
            Position: pointer2.Position
        })
        tween.Play()
    }
})