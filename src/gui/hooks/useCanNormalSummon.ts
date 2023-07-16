import { useEffect, useState } from "@rbxts/roact-hooked";
import type { ControllerValue } from "server/types";
import { YPlayer } from "server/ygo/Player";
import { YEvent } from "server/ygo/Event";

export default (controllerValue: YEvent<YPlayer>) => {
    const [canNormalSummon, setCanNormalSummon] = useState(controllerValue.get().canNormalSummon.get());

    useEffect(() => {
        let canNormalSummonConnection = controllerValue.get().canNormalSummon.event.Connect((newValue) => {
            setCanNormalSummon(newValue);
        });
        const connection = controllerValue.event.Connect(() => {
            canNormalSummonConnection.Disconnect();
            canNormalSummonConnection = controllerValue.get().canNormalSummon.event.Connect((newValue) => {
                setCanNormalSummon(newValue);
            })
        })

        return () => {
            canNormalSummonConnection.Disconnect();
            connection.Disconnect();
        }
    }, [])

    return canNormalSummon
}