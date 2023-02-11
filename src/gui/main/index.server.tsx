import Roact from "@rbxts/roact";
import { withHookDetection } from "@rbxts/roact-hooked";
import DeckBuilder from "./pages/DeckBuilder/DeckBuilder";
import { Div } from "gui/rowindcss";

const player = script.FindFirstAncestorWhichIsA("Player")!
const playerGui = player.FindFirstChildWhichIsA("PlayerGui")

const Main = () => {
    return (
        <screengui IgnoreGuiInset={true}>
            <DeckBuilder/>
        </screengui>
    )
}

Roact.mount(<Main/>, playerGui, "MainGui")

