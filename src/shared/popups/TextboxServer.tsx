import Roact from "@rbxts/roact";
import { Dispatch, SetStateAction, useEffect, useRef, withHooks } from "@rbxts/roact-hooked";
import { ServerStorage } from "@rbxts/services";

const cardSearchScript = ServerStorage.FindFirstChild('cardSearch') as LocalScript;

interface Props {
    setTextboxState: Dispatch<SetStateAction<string>>
}

export default withHooks((props: Props) => {
    const ref = useRef<RemoteEvent>();

    useEffect(() => {
        if(!ref.getValue()) return;
        const connection = ref.getValue()!.OnServerEvent.Connect((player, text) => {
            props.setTextboxState(text as string);
        })

        const textboxScript = cardSearchScript.Clone();
        textboxScript.Parent = ref.getValue()!;

        return () => {
            connection.Disconnect();
            textboxScript.Destroy();
        }
    }, [ref])

    return (
        <remoteevent Ref={ref} />
    )
})