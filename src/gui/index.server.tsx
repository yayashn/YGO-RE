import Roact from "@rbxts/roact";
import { bindable, getPlayer } from "shared/utils";

const player = getPlayer(script);
const playerGui = player.FindFirstChild("PlayerGui")!;

Roact.mount((
    <screengui>
        <textbutton 
        Event={{
            MouseButton1Click: () => bindable("startDuel").Fire(player)
        }}
        Text="Show Field" Size={new UDim2(0, 100, 0, 100)}/>
    </screengui>
), playerGui, "GUI");
