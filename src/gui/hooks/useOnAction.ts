import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardFolder } from "server/types";
import useController from "./useController";
import { Card } from "server/ygo/Card";

export default (card: Card) => {
    const [actionCounter, setActionCounter] = useState(0);
    const controller = useController(card)

    useEffect(() => {
        const connection = controller.action.event.Connect(() => {
            setActionCounter(state => state + 1);
        });

        return () => connection.Disconnect();
    }, [])

    return actionCounter;
}