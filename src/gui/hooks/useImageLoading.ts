import Roact from "@rbxts/roact";
import { useState } from "@rbxts/roact-hooked"
import useMount from "./useMount";

export default (image: Roact.Ref<ImageButton>) => {
    const [loading, setLoading] = useState(true);

    useMount(() => {
        const connection = image.getValue()!.GetPropertyChangedSignal("IsLoaded").Connect(() => {
            setLoading(!image.getValue()!.IsLoaded)
        })

        return () => {
            connection.Disconnect();
        }
    }, [], image)

    return loading;
}