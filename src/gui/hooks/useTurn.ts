import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel"

export default () => {
    const duel = useDuel();
    const [turn, setTurn] = useState(duel?.turn.get());

    useEffect(() => {
        const connection = duel?.turn.event.Connect((newTurn) => {
            setTurn(newTurn as number);
        })

        return () => {
            connection?.Disconnect();
        }
    }, [duel])

    return turn;
}