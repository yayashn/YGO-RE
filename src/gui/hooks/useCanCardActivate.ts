import { useEffect, useState } from "@rbxts/roact-hooked"
import useDuel from "./useDuel"
import { Card } from "server/ygo/Card"

export default (card: Card) => {
    const duel = useDuel()
    const [canActivate, setCanActivate] = useState(false)

    useEffect(() => {
        if (duel) {
            const connection = card.canActivate.event.Connect((value) => {
                setCanActivate(value)
            })
            return () => {
                connection.Disconnect()
            }
        }
    }, [duel])

    return canActivate
}