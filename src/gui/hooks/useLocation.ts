import { useEffect, useState } from "@rbxts/roact-hooked";
import { CardFolder } from "server/types";
import { Location } from "shared/types";

export default (card: CardFolder) => {
    const [location, setLocation] = useState<Location>(undefined);

    useEffect(() => {
        if(!card) return;

        setLocation(card.location.Value);

        const locationConn = card.location.Changed.Connect((newLocation) => setLocation(newLocation as unknown as Location));

        return () => {
            locationConn.Disconnect();
        };
    }, [])

    return location
}