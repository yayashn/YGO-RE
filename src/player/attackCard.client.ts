import { TweenService } from "@rbxts/services";
import type { Location } from "server/duel/types";
import Remotes from "shared/net";
import { createInstance } from "shared/utils";

const field = game.Workspace.Field3D.Field;

(field.Player.Attack.GetChildren() as Part[]).forEach((zone) => {
    createInstance("Vector3Value", "OriginalPosition", zone).Value = zone.Position
});
(field.Opponent.Attack.GetChildren() as Part[]).forEach((zone) => {
    createInstance("Vector3Value", "OriginalPosition", zone).Value = zone.Position
});

Remotes.Client.OnEvent("attackCard3D", (opponent: boolean, zone1: Location, zone2?: Location, cleanup: boolean = false) => {
    const attacker = opponent ? "Opponent" : "Player"
    const pointer = field[attacker].Attack[`${zone1 as "MZone1"}P`]
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
        const pointer2 = field[attacker].Attack[`${zone2 as "MZone1"}P`]
        const tween = TweenService.Create(pointer, new TweenInfo(0.5), {
            Position: pointer2.Position
        })
        tween.Play()
    }
})