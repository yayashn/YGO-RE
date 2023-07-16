import { useEffect, useState } from "@rbxts/roact-hooked";
import { Card } from "server/ygo/Card";

export default (card: Card) => {
    const [controller, setController] = useState(card.controller.get());

    useEffect(() => {
        const connection = card.controller.event.Connect((newValue) => {
            setController(newValue);
        })

        return () => {
            connection.Disconnect();
        }
    }, [])

    return controller;
}