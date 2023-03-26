import { useEffect, useState } from "@rbxts/roact-hooked"
import type { CardFolder } from "server/types"
import useYGOPlayer from "./useYGOPlayer"

export default (card: CardFolder) => {
    const YGOPlayer = useYGOPlayer()
    const [isTarget, setIsTarget] = useState(false)

    useEffect(() => {
        if(!YGOPlayer) return
        const connection = YGOPlayer.targets.Changed.Connect((newtargets) => {
            const targets = newtargets.split(",")
            setIsTarget(targets.includes(card.uid.Value))
        })

        return () => connection.Disconnect()
    }, [YGOPlayer])

    useEffect(() => {
        if(!isTarget) return
        print(`${card.Name} target: ${isTarget}`)
    }, [isTarget])

    return isTarget
}