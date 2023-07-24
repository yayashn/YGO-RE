import Roact from "@rbxts/roact";
import App from "./App";
import useInitProfile from "./hooks/useInitPlayerData";
import { withHooks } from "@rbxts/roact-hooked";

const player = script.FindFirstAncestorWhichIsA("Player")

const DataApp = withHooks(() => {
    useInitProfile()

    return (
        <App/>
    )
})

Roact.mount(
    <screengui 
    Key="App"
    IgnoreGuiInset>
        <DataApp/>
    </screengui>,
    player?.FindFirstChildWhichIsA("PlayerGui"),
    'UI'
)
