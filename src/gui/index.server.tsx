import Roact from "@rbxts/roact";
import App from "./App";
import useInitProfile from "./hooks/useInitPlayerData";
import { withHooks } from "@rbxts/roact-hooked";

const player = script.FindFirstAncestorWhichIsA("Player")

const DataApp = withHooks(() => {
    useInitProfile()

    return (
        <screengui
            Key="App"
            IgnoreGuiInset>
            <App />
        </screengui>
    )
})

Roact.mount(
    <DataApp />,
    player?.FindFirstChildWhichIsA("PlayerGui"),
    'UI'
)
