import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardFolder, ControllerValue } from "server/ygo";

export default (card: CardFolder) => {
    const [controller, setController] = useState<ControllerValue>(card.controller);

    useEffect(() => {
        card.controller.Changed.Connect((newValue) => {
            setController(newValue as ControllerValue);
        })
    }, [])

    return controller;
}