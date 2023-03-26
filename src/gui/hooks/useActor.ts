import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel";
import { ControllerValue, PlayerValue } from "server/types";

export default () => {
    const duel = useDuel();
    const [actor, setActor] = useState<PlayerValue | undefined>(undefined);
    
    useEffect(() => {
        if(!duel) return;

        const connection = duel.actor.Changed.Connect((newActor) => {
            setActor(newActor as PlayerValue);
        })
        setActor(duel.actor.Value as PlayerValue);

        return () => {
            connection.Disconnect();       
        }
    }, [duel])


    return actor
}