import { useEffect, useState } from "@rbxts/roact-hooked"
import useDuel from "./useDuel"

export default () => {
    const duel = useDuel()
    const [battleStep, setBattleStep] = useState("NONE")

    useEffect(() => {
        if (duel) {
            const connection = duel.battleStep.event.Connect((value) => {
                setBattleStep(value)
            })
            return () => {
                connection.Disconnect()
            }
        }
    }, [duel])

    return battleStep
}