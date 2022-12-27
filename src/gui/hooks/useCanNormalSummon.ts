import { useEffect, useState } from "@rbxts/roact-hooked";
import { ControllerValue } from "server/ygo";

export default (controllerValue: ControllerValue) => {
    const [canNormalSummon, setCanNormalSummon] = useState(controllerValue.Value.canNormalSummon.Value);

    useEffect(() => {
        let canNormalSummonConnection = controllerValue.Value.canNormalSummon.Changed.Connect((newValue) => {
            setCanNormalSummon(newValue);
        });
        controllerValue.Changed.Connect(() => {
            canNormalSummonConnection.Disconnect();
            canNormalSummonConnection = controllerValue.Value.canNormalSummon.Changed.Connect((newValue) => {
                setCanNormalSummon(newValue);
            })
        })
    }, [])

    return canNormalSummon
}