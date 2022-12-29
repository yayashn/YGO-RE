import Roact from "@rbxts/roact";
import { withHooks } from "@rbxts/roact-hooked";
import useYGOPlayer from "gui/hooks/useYGOPlayer";
import Cards from "./Cards";
import { Field } from "./Field";
import { Hand } from "./Hand";
import { Zone } from "./Zone";
import { PlayerValue } from "server/ygo";
import Phases from "./Phases";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const field = game.Workspace.Field3D.Field;

export const App = withHooks(() => {
	const YGOPlayer = useYGOPlayer();
	const YGOOpponent = useYGOPlayer(true);

	if(YGOPlayer && YGOOpponent) {
		return (
			<surfacegui Key="Field">
				<Player playerValue={YGOOpponent}/>
				<Phases/>
				<Player playerValue={YGOPlayer}/>
			</surfacegui>
		)
	} else {
		return (
			<screengui>
				<textlabel Text="Waiting for opponent..."/>
			</screengui>
		)
	}
})

export const Player = withHooks(({playerValue}: {playerValue: PlayerValue}) => {
	const YGOPlayer = useYGOPlayer();
	const playerType = playerValue === YGOPlayer ? "Player" : "Opponent";

	return (
		<surfacegui Key={playerType}>
			<Field playerType={playerType}/>
			<Hand />
			<Zone zone={field[playerType].BZone}/>
			<Zone zone={field[playerType].GZone}/>
			<Zone zone={field[playerType].EZone}/>
			<Zone zone={field[playerType].Deck}/>
			<Cards PlayerValue={playerValue}/>
		</surfacegui>
	)
})

Roact.mount(
	<screengui>
		<App/>
	</screengui>,
	playerGui,
	"DuelGui",
);