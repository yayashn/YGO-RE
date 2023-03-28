import { useEffect, useState } from "@rbxts/roact-hooked"
import useDuel from "./useDuel"
import useYGOPlayer from "./useYGOPlayer"

export default () => {
    const YGOPlayer = useYGOPlayer()
    const duel = YGOPlayer?.Parent
    const [canAttack, setCanAttack] = useState(false)

    useEffect(() => {
        if (duel) {
            const connection = YGOPlayer.canAttack.Changed.Connect((value) => {
                setCanAttack(value)
            })
            return () => {
                connection.Disconnect()
            }
        }
    }, [YGOPlayer])

    return canAttack
}