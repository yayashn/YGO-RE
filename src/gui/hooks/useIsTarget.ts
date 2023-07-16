import { useEffect, useState } from "@rbxts/roact-hooked"
import useYGOPlayer from "./useYGOPlayer"
import { Card } from "server/ygo/Card"
import { includes } from "@rbxts/sift/out/Array"

export default (card: Card) => {
    const YGOPlayer = useYGOPlayer()
    const [isTarget, setIsTarget] = useState(false)

    useEffect(() => {
        if(!YGOPlayer) return
        const connection = YGOPlayer.targets.event.Connect((newTargets) => {
            setIsTarget((newTargets as unknown as Card[]).includes(card))
        })

        return () => connection.Disconnect()
    }, [YGOPlayer])

    useEffect(() => {
        if(!isTarget) return
    }, [isTarget])

    return isTarget
}