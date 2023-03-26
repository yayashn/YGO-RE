import { useEffect, useState } from "@rbxts/roact-hooked"
import type { CardFolder } from "server/types"
import useYGOPlayer from "./useYGOPlayer"

export default (card: CardFolder) => {
    const YGOPlayer = useYGOPlayer()
    const [isTargettable, setIsTargettable] = useState(false)

    useEffect(() => {
        if(!YGOPlayer) return

        const connection = YGOPlayer.targettableCards.Changed.Connect((newTargettableCards) => {
            const targettableCards = newTargettableCards.split(",")
            setIsTargettable(targettableCards.includes(card.uid.Value))
        })

        return () => connection.Disconnect()
    }, [YGOPlayer])

    useEffect(() => {
        if(!isTargettable) return
        print(`${card.Name} targettable: ${isTargettable}`)
    }, [isTargettable])

    return isTargettable
}