import Roact from "@rbxts/roact";
import App from "./App";
import { withHooks } from "@rbxts/roact-hooked";
import type { PlayerData } from "server/types";
import waiting from "server/popups/waiting";

const player = script.FindFirstAncestorWhichIsA("Player")!
const profileChanged = player.WaitForChild("profileChanged") as BindableEvent;
const cancelWaiting = waiting(`Loading data...`, player)

const DataApp = withHooks(() => {
    return (
        <screengui
            Key="App"
            IgnoreGuiInset>
            <App />
        </screengui>
    )
})

let tree: Roact.Tree;

const connection = profileChanged.Event.Connect((playerData: PlayerData) => {
    if(playerData === undefined) return;
    if (tree !== undefined) return;
    connection.Disconnect();
    Roact.mount(
        <DataApp />,
        player.FindFirstChildWhichIsA("PlayerGui")!,
        'UI'
    )
    cancelWaiting()
})