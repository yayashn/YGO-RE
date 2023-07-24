import { useEffect, useState } from "@rbxts/roact-hooked";
import { Card } from "server/duel/card";

export default (card: Card) => {
    const [controller, setController] = useState<Player>(card.controller.get())
    
    useEffect(() => {
        const connection = card.controller.changed((newController: Player) => {
            setController(newController)
        });

        return () => {
            connection.Disconnect()
        }
    }, [])

    return controller
}