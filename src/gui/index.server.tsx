import Roact from "@rbxts/roact";
import App from "./App";
import useInitProfile from "./hooks/useInitPlayerData";
import { useEffect, withHooks } from "@rbxts/roact-hooked";

const player = script.FindFirstAncestorWhichIsA("Player")

const DataApp = withHooks(() => {
    useInitProfile()

    return (
        <screengui
            Key="App"
            IgnoreGuiInset>
            <bindableevent
                Event={{
                    Event: () => {
                        Roact.unmount(mount)
                        wait(1)
                        mount = Roact.mount(
                            <DataApp />,
                            player?.FindFirstChildWhichIsA("PlayerGui"),
                            'UI'
                        )
                    }
                }}
                Key="endDuel" />
            <App />
        </screengui>
    )
})

let mount = Roact.mount(
    <DataApp />,
    player?.FindFirstChildWhichIsA("PlayerGui"),
    'UI'
)
