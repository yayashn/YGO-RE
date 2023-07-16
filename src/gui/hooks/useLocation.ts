import { useEffect, useState } from "@rbxts/roact-hooked";
import { Card } from "server/ygo/Card";
import { Location } from "shared/types";

export default (card: Card) => {
    const [location, setLocation] = useState<Location>(undefined);

    useEffect(() => {
        if(!card) return;

        setLocation(card.location.get());

        const locationConn = card.location.event.Connect((newLocation) => setLocation(newLocation as unknown as Location));

        return () => {
            locationConn.Disconnect();
        };
    }, [])

    return location
}