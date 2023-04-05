import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardFolder } from "server/types";

export default (card: CardFolder) => {
    const [race, setRace] = useState<string>(undefined);

    useEffect(() => {
        if(!card) return;

        setRace(card.race.Value);

        const connection = card.race.Changed.Connect((newPosition: string) => setRace(newPosition));

        return () => {
            connection.Disconnect();
        };
    }, [])

    return race
}