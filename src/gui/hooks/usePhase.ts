import { useEffect, useState } from "@rbxts/roact-hooked";
import { getDuel } from "server/utils";
import { Phase } from "server/types";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default () => {
    const [duel] = getDuel(player)!;
    const [phase, setPhase] = useState(duel.phase.Value);

    useEffect(() => {
        const connection = duel.phase.Changed.Connect((newPhase: unknown) => {
            setPhase(newPhase as Phase);
        });

        return () => {
            connection.Disconnect();
        }
    }, [])

    return phase;
}