import { useEffect, useState } from "@rbxts/roact-hooked";
import useDuel from "./useDuel";
import { ControllerValue, PlayerValue } from "server/types";
import { YPlayer } from "server/ygo/Player";

export default () => {
    const duel = useDuel();
    const [actor, setActor] = useState<YPlayer | undefined>(undefined);
    
    useEffect(() => {
        if(!duel) return;

        const connection = duel.actor.event.Connect((newActor) => {
            setActor(newActor);
        })
        setActor(duel.actor.get());

        return () => {
            connection.Disconnect();       
        }
    }, [duel])


    return actor
}