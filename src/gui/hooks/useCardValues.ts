import { useEffect, useState } from "@rbxts/roact-hooked";
import type { CardFolder } from "server/types";

type CardValue = "location" | "controller"

export default (card: CardFolder, values: CardValue[]) => {
    const [cardValues, setCardValues] = useState<Record<CardValue, unknown>>({} as Record<CardValue, unknown>);

    useEffect(() => {
        const connections = values.map((v) => {
            return card[v].Changed.Connect((newValue) => {
                cardValues[v] = newValue;
            })
        })

        setCardValues({...cardValues});

        return () => {
            connections.forEach((c) => {
                c.Disconnect();
            })
        }
    }, [])

    return cardValues;
}