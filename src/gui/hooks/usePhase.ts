import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel"
import { Phase } from "server/ygo";

export default () => {
    const duel = useDuel();
    const [phase, setPhase] = useState(duel?.phase.Value);

    useEffect(() => {
        duel?.phase.Changed.Connect((newPhase) => {
            setPhase(newPhase as Phase);
        })
    }, [duel])

    return phase;
}