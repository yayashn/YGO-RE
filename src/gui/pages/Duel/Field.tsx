import Roact from "@rbxts/roact";
import { useEffect, useRef, useState, withHooks } from "@rbxts/roact-hooked";
import { TweenService } from "@rbxts/services";
import useDuelStat from "gui/hooks/useDuelStat";
import useMount from "gui/hooks/useMount";
import usePlayerStat from "gui/hooks/usePlayerStat";
import useSelectableZones from "gui/hooks/useSelectableZones";
import FadeZone from "server-storage/animations/FadeZone/FadeZone";
import { getDuel } from "server/duel/duel";
import { Location } from "server/duel/types";
import { getFilteredCards } from "server/duel/utils";
import { useGlobalState } from "shared/useGlobalState";
import { shownCardsStore } from "./shownCardsStore";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
	const field = game.Workspace.Field3D.Field.Player
	const fieldOpponent = game.Workspace.Field3D.Field.Opponent
	const [shownCards, setShownCards] = useGlobalState(shownCardsStore)
	const duel = getDuel(player)!;

	return (
		<Roact.Fragment>
			{[field, fieldOpponent].map((f) => {
				return (
					<Roact.Fragment>
						<surfacegui AlwaysOnTop Key="Field" Face="Top" Adornee={f.Field.Part}>
							<uigridlayout
								SortOrder="LayoutOrder"
								CellPadding={new UDim2(0, 0, 0.005, 0)}
								CellSize={new UDim2(0.2, -1, 0.5, 0)}
							/>
							{["MZone1", "MZone2", "MZone3", "MZone4", "MZone5", "SZone1", "SZone2", "SZone3", "SZone4", "SZone5"].map((zone, i) => {
								return (
									<FieldZoneButton
										playerType={f.Parent!.Parent!.Name as "Player" | "Opponent"}
										zoneName={zone}
										layoutOrder={i}
									/>
								);
							})}
						</surfacegui>
						{["EZone", "GZone", "BZone"].map((zone, i) => {
							return <surfacegui AlwaysOnTop Key={zone} Face="Top" Adornee={f[zone as "EZone"]}>
								<textbutton
									BackgroundTransparency={1}
									Size={new UDim2(1,0,1,0)}
									Event={{
										MouseButton1Click: () => {
											setShownCards(getFilteredCards(duel, {
												location: [zone as Location]
											}))
										}
									}}
								/>
							</surfacegui>
						})}
					</Roact.Fragment>
				)
			})}
		</Roact.Fragment>
	)
})

interface FieldZoneButtonProps {
	zoneName: string;
	layoutOrder: number;
	animate?: boolean;
	playerType: "Player" | "Opponent";
}

const FieldZoneButton = withHooks(
	({ zoneName, layoutOrder, playerType }: FieldZoneButtonProps) => {
		const buttonRef = useRef<TextButton>();
		const [isHovered, setIsHovered] = useState<boolean>(false);
		const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, -1, true, 0);
		const tweenGoal = { BackgroundTransparency: 0.5 };
		const [tween, setTween] = useState<Tween>();
		const [selectableZones, includesZone] = useSelectableZones();
		const duel = getDuel(player)!;
		const yPlayer = duel.getPlayer(player);
		const yOpponent = duel.getOpponent(player);
		const [zoneOccupied, setZoneOccupied] = useState<boolean>(false);
		const duelChanged = useDuelStat(duel, "changed");
		const playerChanged = usePlayerStat(yPlayer, "changed");

		useMount(() => {
			setTween(TweenService.Create(buttonRef.getValue()!, tweenInfo, tweenGoal));
		}, [buttonRef], buttonRef)

		useEffect(() => {
			if (includesZone(zoneName as Location, playerType)) {
				tween?.Play();
			} else {
				tween?.Cancel();
				if(buttonRef.getValue()) {
					buttonRef.getValue()!.BackgroundTransparency = 1;
				}
			}
		}, [isHovered, selectableZones]);

		useEffect(() => {
			setZoneOccupied(getFilteredCards(duel, {
				location: [zoneName as Location],
				controller: [playerType === "Player" ? player : yOpponent.player],
			}).size() !== 0)
		}, [duelChanged, playerChanged])

		return (
			<textbutton
				BackgroundTransparency={1}
				Text=""
				BorderSizePixel={0}
				LayoutOrder={layoutOrder * (playerType === "Player" ? -1 : 1)}
				Key={zoneName}
				Ref={buttonRef}
				AutoButtonColor={false}
				Event={{
					MouseButton1Click: () => {
						if (includesZone(zoneName as Location, playerType)) {
							yPlayer!.selectedZone.set(zoneName as Location);
						}
					},
					MouseEnter: () => {
						setIsHovered(true);
					},
					MouseLeave: () => {
						setIsHovered(false);
					},
				}}>
				<FadeZone playAnimation={isHovered} />
			</textbutton>
		);
	},
);
