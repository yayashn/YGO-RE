import { useEffect, useState } from "@rbxts/roact-hooked"
import useDuel from "./useDuel"
import { CardFolder } from "server/types"

export default (card: CardFolder) => {
    const duel = useDuel()
    const [canActivate, setCanActivate] = useState(false)

    useEffect(() => {
        if (duel) {
            const connection = card.canActivate.Changed.Connect((value) => {
                setCanActivate(value)
            })
            return () => {
                connection.Disconnect()
            }
        }
    }, [duel])

    return canActivate
}