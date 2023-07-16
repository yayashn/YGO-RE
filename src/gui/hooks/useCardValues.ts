import { useEffect, useState } from "@rbxts/roact-hooked";
import { Card } from "server/ygo/Card";

type CardValue = "location" | "controller"

export default (card: Card, values: CardValue[]) => {
    const [cardValues, setCardValues] = useState<Record<CardValue, unknown>>({} as Record<CardValue, unknown>);

    useEffect(() => {
        const connections = values.map((v) => {
            return card[v].event.Connect((newValue) => {
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