import Roact from "@rbxts/roact";
import { withHooks } from "@rbxts/roact-hooked";
import useYGOPlayer from "gui/hooks/useYGOPlayer";
import Cards from "./Cards";
import { Field } from "./Field";
import { Hand } from "./Hand";
import { Zone } from "./Zone";
import { Phase, PlayerValue } from "server/ygo";
import useDuel from "gui/hooks/useDuel";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const field = game.Workspace.Field3D.Field;
const phases = game.Workspace.Field3D.Phases;

export const App = withHooks(() => {
	const duel = useDuel();
	const YGOPlayer = useYGOPlayer();
	const YGOOpponent = useYGOPlayer(true);

	if(YGOPlayer && YGOOpponent) {
		return (
			<surfacegui Key="Field">
				<Player playerValue={YGOOpponent}/>
				<billboardgui 
				Active={true}
				Size={new UDim2(1000,0,20,0)}
				Adornee={phases}>
					<uilistlayout Padding={new UDim(0,5)} HorizontalAlignment="Center" FillDirection="Horizontal"/>
					{(["DP", "SP", "MP1", "BP", "MP2", "EP"] as Phase[]).map((phaseName, i) => {
						return (
							<textbutton 
							BackgroundColor3={duel!.phase.Value === phaseName ? Color3.fromRGB(0, 255, 0) : Color3.fromRGB(255, 0, 0)}
							Size={new UDim2(0, 50, 1, 0)}
							LayoutOrder={i}
							Event={{
								MouseButton1Click: () => {
									if(duel!.phase.Value === "MP1") {
										if(phaseName === "BP") {
											duel!.handlePhases.Fire("BP")
										} else if(phaseName === "EP") {
											duel!.handlePhases.Fire("EP")
										}
									} else if(duel!.phase.Value === "MP2") {
										if(phaseName === "EP") {
											duel!.handlePhases.Fire("EP")
										}
									}
								}
							}}
							Text={phaseName} />
						)
					})}
				</billboardgui>
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