import Roact from "@rbxts/roact";
import { bindable, getPlayer } from "shared/utils";
import createDuel from "storage/ygo/createDuel";
import DevPanel from "./duelgui/DevPanel";


const player = getPlayer(script);
const playerGui = player.FindFirstChildWhichIsA("PlayerGui");

Roact.mount(
	<screengui>
		<textbutton
			Event={{
				MouseButton1Click: () => createDuel(player),
			}}
			Text="Show Field"
			Size={new UDim2(0, 100, 0, 100)}
		/>
		<DevPanel />
	</screengui>,
	playerGui,
	"GUI",
);
