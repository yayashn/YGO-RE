import Roact, { Dispatch, SetStateAction, useEffect, useRef } from "@rbxts/roact";
import { ServerStorage } from "@rbxts/services";

const cardSearchScript = ServerStorage.FindFirstChild('cardSearch') as LocalScript;

interface Props {
    setTextboxState: Dispatch<SetStateAction<string>>
}

export default (props: Props) => {
    const ref = useRef<RemoteEvent>();

    useEffect(() => {
        if(!ref.current) return;
        const connection = ref.current!.OnServerEvent.Connect((player, text) => {
            props.setTextboxState(text as string);
        })

        const textboxScript = cardSearchScript.Clone();
        textboxScript.Parent = ref.current!;

        return () => {
            connection.Disconnect();
            textboxScript.Destroy();
        }
    }, [ref])

    return (
        <remoteevent Ref={ref} />
    )
}