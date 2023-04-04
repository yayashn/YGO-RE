import { useEffect, useState } from "@rbxts/roact-hooked"
import type { CardFolder, DuelFolder } from "server/types"
import useYGOPlayer from "./useYGOPlayer"
import { getTargettables } from "server/utils"

export default () => {
    const YGOPlayer = useYGOPlayer()
    const [targettables, setTargettables] = useState<CardFolder[]>([])

    useEffect(() => {
        if(!YGOPlayer) return

        const connection = YGOPlayer.targettableCards.Changed.Connect((newTargettables) => {
            setTargettables(getTargettables(YGOPlayer, newTargettables))
        })

        return () => connection.Disconnect()
    }, [YGOPlayer])

    return targettables
}