import { useEffect, useState } from "@rbxts/roact-hooked"
import useYGOPlayer from "./useYGOPlayer"
import { Card } from "server/ygo/Card"

export default (card: Card) => {
    const YGOPlayer = useYGOPlayer()
    const [isTargettable, setIsTargettable] = useState(false)

    useEffect(() => {
        if(!YGOPlayer) return

        const connection = YGOPlayer.targettableCards.event.Connect((newTargettableCards) => {
            setIsTargettable((newTargettableCards as unknown as Card[]).includes(card))
        })

        return () => connection.Disconnect()
    }, [YGOPlayer])

    useEffect(() => {
        if(!isTargettable) return
    }, [isTargettable])

    return isTargettable
}