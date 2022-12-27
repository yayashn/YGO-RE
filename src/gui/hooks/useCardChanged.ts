import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardFolder } from "server/ygo";

export default (card: CardFolder) => {
    const [changed, setChanged] = useState<unknown>()

    useEffect(() => {
        [card.location, card.position, card.controller].forEach((value) => {
            value.Changed.Connect(() => {
                setChanged(value)
            })
        })
    }, [])

    useEffect(() => {
        if(changed !== undefined) {
            setChanged(undefined)
        }
    }, [changed])

    return changed
}