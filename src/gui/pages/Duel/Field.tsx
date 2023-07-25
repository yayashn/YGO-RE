import Roact from "@rbxts/roact";
import { useRef, useState, withHooks } from "@rbxts/roact-hooked";
import { TweenService } from "@rbxts/services";
import useMount from "gui/hooks/useMount";
import FadeZone from "server-storage/animations/FadeZone/FadeZone";
import { getDuel } from "server/duel/duel";

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(() => {
    const field = game.Workspace.Field3D.Field.Player.FindFirstChild("Field")!.FindFirstChild("Part") as Part;
    const fieldOpponent = game.Workspace.Field3D.Field.Opponent.FindFirstChild("Field")!.FindFirstChild("Part") as Part;

    return (
        <Roact.Fragment>
            {[field, fieldOpponent].map((f) => {
                return (
                    <surfacegui Key="Field" Face="Top" Adornee={f}>
                    <uigridlayout
                        SortOrder="LayoutOrder"
                        CellPadding={new UDim2(0, 0, 0.005, 0)}
                        CellSize={new UDim2(0.2, -1, 0.5, 0)}
                    />
                    {["MZone1", "MZone2", "MZone3", "MZone4", "MZone5", "SZone1", "SZone2", "SZone3", "SZone4", "SZone5"].map((zone, i) => {
                        return (
                            <FieldZoneButton
                                playerType={f.FindFirstAncestor("Opponent") ? "Opponent" : "Player"}
                                zoneName={zone}
                                layoutOrder={i}
                            />
                        );
                    })}
                </surfacegui>
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
		//const [selectableZones, includesZone] = useSelectableZones();
		//const YGOPlayer = useYGOPlayer();

		useMount(() => {
			setTween(TweenService.Create(buttonRef.getValue()!, tweenInfo, tweenGoal));
		}, [buttonRef], buttonRef)

		//useEffect(() => {
		//	if(includesZone(zoneName, playerType)) {
		//		tween?.Play();
		//	} else {
		//		tween?.Cancel();
		//		buttonRef.getValue()!.BackgroundTransparency = 1;
		//	}
		//}, [isHovered, selectableZones]);

		return (
			<textbutton
				Key={zoneName}
				Ref={buttonRef}
				LayoutOrder={layoutOrder*(playerType === "Player" ? -1 : 1)}
				Text=""
				AutoButtonColor={false}
				BorderSizePixel={0}
                BackgroundTransparency={1}
				Event={{
					MouseButton1Click: () => {
						//if(includesZone(zoneName, playerType)) {
						//	YGOPlayer!.selectedZone.set(zoneName);
						//}
                        print(0)
                        getDuel(player)!.player1.draw(2)
                        print(1)
					},
					MouseEnter: () => {
						setIsHovered(true);
					},
					MouseLeave: () => {
						setIsHovered(false);
					},
				}}>
					<FadeZone playAnimation={isHovered}/>
			</textbutton>
		);
	},
);
