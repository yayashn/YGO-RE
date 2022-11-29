import Roact from "@rbxts/roact";
import { getPlayer } from "shared/utils";
import DevPanel from "./DevPanel";
import Player from "./Player";

const player = getPlayer(script);
const playerGui = player.FindFirstChild("PlayerGui");

Roact.mount(
	<screengui>
		<Player />
	</screengui>,
	playerGui,
	"DuelGui",
);
