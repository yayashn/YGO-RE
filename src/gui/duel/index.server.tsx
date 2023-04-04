import Roact from "@rbxts/roact";
import { useEffect, withHooks } from "@rbxts/roact-hooked";
import useYGOPlayer from "gui/hooks/useYGOPlayer";
import Cards from "./Cards/Cards";
import { Field } from "./Field";
import { Hand } from "./Hand";
import { Zone } from "./Zone";
import type { PlayerValue } from "server/types";
import Phases from "./Phases";
import Prompt from "./Prompt";
import CardInfo from "./CardInfo";
import useDuel from "gui/hooks/useDuel";
import { createInstance, includes } from "shared/utils";
import CardPopup from "./CardPopup";
import useTargettables from "gui/hooks/useTargettables";
import PositionPopup from "./PositionPopup";

const player = script.FindFirstAncestorWhichIsA("Player")!;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const field = game.Workspace.Field3D.Field;

const App = withHooks(() => {
	const duel = useDuel();
	const YGOPlayer = useYGOPlayer();
	const YGOOpponent = useYGOPlayer(true);
	const targettables = useTargettables();
	const showCardPopup = targettables.size() > 0 && !targettables.every((card) => {
		const location = card.location.Value;
		return ["FZone", "MZone", "SZone", "Hand"].some((zone) => includes(location, zone));
	})

	useEffect(() => {
		if(!duel) return;
		const connection = duel.Destroying.Connect(() => {
			Roact.unmount(mounted);
			connection.Disconnect();
		})

		return () => {
			connection.Disconnect();
		}
	}, [duel])

	if(YGOPlayer && YGOOpponent) {
		return (
			<Roact.Fragment>
				<surfacegui Key="Field">
					<Player playerValue={YGOOpponent}/>
					<Phases/>
					<Player playerValue={YGOPlayer}/>
				</surfacegui>
				<Prompt/>
				<CardInfo/>
				{showCardPopup && <CardPopup/>}
				<PositionPopup/>
			</Roact.Fragment>
		)
	} else {
		return (
			<screengui>
				<textlabel Text="Waiting for opponent..."/>
			</screengui>
		)
	}
})

const Player = withHooks(({playerValue}: {playerValue: PlayerValue}) => {
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

let mounted: Roact.Tree;
const mount = createInstance("BindableEvent", "mount", player)
mount.Event.Connect(() => {
	mounted = Roact.mount(
		<screengui IgnoreGuiInset={true}>
			<App/>
		</screengui>,
		playerGui,
		"DuelGui",
	);
})
