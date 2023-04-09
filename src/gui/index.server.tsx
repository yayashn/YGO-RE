import Roact from "@rbxts/roact";
import App from "./App";

const player = script.FindFirstAncestorWhichIsA("Player")

Roact.mount(
    <screengui
        IgnoreGuiInset
    >
        <App/>
    </screengui>,
    player?.FindFirstChildWhichIsA("PlayerGui"),
    'UI'
)