import { useEffect, useState } from "@rbxts/roact-hooked";
import type { ControllerValue } from "server/types";

export default (controllerValue: ControllerValue) => {
    const [canNormalSummon, setCanNormalSummon] = useState(controllerValue.Value.canNormalSummon.Value);

    useEffect(() => {
        let canNormalSummonConnection = controllerValue.Value.canNormalSummon.Changed.Connect((newValue) => {
            setCanNormalSummon(newValue);
        });
        const connection = controllerValue.Changed.Connect(() => {
            canNormalSummonConnection.Disconnect();
            canNormalSummonConnection = controllerValue.Value.canNormalSummon.Changed.Connect((newValue) => {
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