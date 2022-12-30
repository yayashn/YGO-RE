import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardFolder, ControllerValue } from "server/ygo";

export default (card: CardFolder) => {
    const [controller, setController] = useState<ControllerValue>(card.controller);

    useEffect(() => {
        const connection = card.controller.Changed.Connect((newValue) => {
            setController(newValue as ControllerValue);
        })

        return () => {
            connection.Disconnect();
        }
    }, [])

    return controller;
}