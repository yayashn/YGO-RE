import { useEffect, useState } from "@rbxts/roact-hooked";
import { Card } from "server/ygo/Card";

export default (card: Card) => {
    const [race, setRace] = useState<string>(undefined);

    useEffect(() => {
        if(!card) return;

        setRace(card.race.get());

        const connection = card.race.event.Connect((newPosition: string) => setRace(newPosition));

        return () => {
            connection.Disconnect();
        };
    }, [])

    return race
}