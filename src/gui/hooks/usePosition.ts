import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardFolder, Position } from "server/types";
import { Card } from "server/ygo/Card";

export default (card: Card) => {
    const [location, setPosition] = useState<Position>(undefined);

    useEffect(() => {
        if(!card) return;

        setPosition(card.position.get());

        const connection = card.position.event.Connect((newPosition) => setPosition(newPosition as unknown as Position));

        return () => {
            connection.Disconnect();
        };
    }, [])

    return location
}