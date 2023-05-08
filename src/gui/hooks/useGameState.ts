import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel";

export default function useGameState() {
    const duel = useDuel()
    const [gameState, setGameState] = useState<"CLOSED" | "OPEN">("CLOSED")

    useEffect(() => {
        if (duel === undefined) return

        setGameState(duel.gameStateValue.Value)

        const connection = duel.gameStateValue.Changed.Connect((newState) => {
            setGameState(newState as "CLOSED" | "OPEN")
        })

        return () => connection.Disconnect()
    }, [duel])

    return gameState
}