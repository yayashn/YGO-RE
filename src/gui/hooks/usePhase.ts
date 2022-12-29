import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel"
import { Phase } from "server/ygo";
import { getDuel } from "server/utils";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default () => {
    const [duel] = getDuel(player)!;
    const [phase, setPhase] = useState((duel.WaitForChild("phase") as StringValue).Value);

    useEffect(() => {
        if(!phase) return;
        (duel?.WaitForChild("phase") as StringValue).Changed.Connect((newPhase) => {
            setPhase(newPhase as Phase);
        })
    }, [duel])

    return phase;
}