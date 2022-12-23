import Roact from "@rbxts/roact";
import { useEffect, withHooks } from "@rbxts/roact-hooked";
import useYGOPlayer from "gui/hooks/useYGOPlayer";
import Cards from "./Cards";
import { Field } from "./Field";
import { Hand } from "./Hand";
import { Zone } from "./Zone";
import { CardFolder, PlayerValue } from "server/ygo";
import useDuel from "gui/hooks/useDuel";

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
			<Field field={field[playerType].Part}/>
			<Hand />
			<Zone zone={field[playerType].BZone}/>
			<Zone zone={field[playerType].GZone}/>
			<Zone zone={field[playerType].EZone}/>
			<Zone zone={field[playerType].Deck}/>
			<Cards PlayerValue={playerValue}/>
		</surfacegui>
	)
})

const DevTools = withHooks(() => {
	const player = useYGOPlayer();

	return (
		<frame Size={new UDim2(.2,0,.2,0)} BackgroundTransparency={1}>
			<textbutton Text="MZone1" Size={new UDim2(1,0,1,0)} Event={{
				MouseButton1Click: () => {
					(player!.cards.GetChildren()[0] as CardFolder).location.Value = "MZone1"
				}
			}}/>
		</frame>
	)
})

Roact.mount(
	<screengui>
		<App/>
		<DevTools/>
	</screengui>,
	playerGui,
	"DuelGui",
);