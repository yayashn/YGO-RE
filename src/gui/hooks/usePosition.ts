import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardFolder, Position } from "server/types";

export default (card: CardFolder) => {
    const [location, setPosition] = useState<Position>(undefined);

    useEffect(() => {
        if(!card) return;

        setPosition(card.position.Value);

        const connection = card.position.Changed.Connect((newPosition) => setPosition(newPosition as unknown as Position));

        return () => {
            connection.Disconnect();
        };
    }, [])

    return location
}