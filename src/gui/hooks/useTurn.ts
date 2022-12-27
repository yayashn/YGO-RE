import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel"

export default () => {
    const duel = useDuel();
    const [turn, setTurn] = useState(duel?.turn.Value);

    useEffect(() => {
        duel?.turn.Changed.Connect((newTurn) => {
            setTurn(newTurn as number);
        })
    }, [duel])

    return turn;
}