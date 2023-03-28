import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardFolder } from "server/types";
import useController from "./useController";

export default (card: CardFolder) => {
    const [actionCounter, setActionCounter] = useState(0);
    const controller = useController(card)

    useEffect(() => {
        const connection = controller.Value.action.Event.Connect(() => {
            setActionCounter(state => state + 1);
        });

        return () => connection.Disconnect();
    }, [])

    return actionCounter;
}