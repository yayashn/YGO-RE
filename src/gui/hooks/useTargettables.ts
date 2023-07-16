import { useEffect, useState } from "@rbxts/roact-hooked"
import useYGOPlayer from "./useYGOPlayer"
import { Card } from "server/ygo/Card"

export default () => {
    const YGOPlayer = useYGOPlayer()
    const [targettables, setTargettables] = useState<Card[]>([])

    useEffect(() => {
        if(!YGOPlayer) return

        const connection = YGOPlayer.targettableCards.event.Connect((newTargettables) => {
            setTargettables(newTargettables as unknown as Card[])
        })

        return () => connection.Disconnect()
    }, [YGOPlayer])

    return targettables
}