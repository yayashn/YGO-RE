import Roact from "@rbxts/roact";
import { useRef, useState, withHooks, useEffect } from "@rbxts/roact-hooked";
import useMount from "gui/hooks/useMount";
import useSelectableZones from "gui/hooks/useSelectableZones";
import useYGOPlayer from "gui/hooks/useYGOPlayer";
import FadeZone from "server-storage/animations/FadeZone/FadeZone";
import type { Zone } from "server/types";
import { fieldZones } from "shared/defs";

const tweenService = game.GetService("TweenService");

interface FieldZoneButtonProps {
	zoneName: Zone;
	layoutOrder: number;
	animate?: boolean;
	playerType: "Player" | "Opponent";
}

const FieldZoneButton = withHooks(
	({ zoneName, layoutOrder, playerType }: FieldZoneButtonProps) => {
		const buttonRef = useRef<TextButton>();
		const [isHovered, setIsHovered] = useState<boolean>();
		const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, -1, true, 0);
		const tweenGoal = { BackgroundTransparency: 0.5 };
		const [tween, setTween] = useState<Tween>();
		const [selectableZones, includesZone] = useSelectableZones();
		const YGOPlayer = useYGOPlayer();

		useMount(() => {
			setTween(tweenService.Create(buttonRef.getValue()!, tweenInfo, tweenGoal));
		}, [buttonRef], buttonRef)

		useEffect(() => {
			if(includesZone(zoneName, playerType)) {
				tween?.Play();
			} else {
				tween?.Cancel();
				buttonRef.getValue()!.BackgroundTransparency = 1;
			}
		}, [isHovered, selectableZones]);

		return (
			<textbutton
				Key={zoneName}
				Ref={buttonRef}
				LayoutOrder={layoutOrder*(playerType === "Player" ? -1 : 1)}
				Text=""
				AutoButtonColor={false}
				BorderSizePixel={0}
				Event={{
					MouseButton1Click: () => {
						if(includesZone(zoneName, playerType)) {
							YGOPlayer!.selectedZone.set(zoneName);
						}
					},
					MouseEnter: () => {
						setIsHovered(true);
					},
					MouseLeave: () => {
						setIsHovered(false);
					},
				}}>
					<FadeZone playAnimation={isHovered && !includesZone(zoneName, playerType)}/>
			</textbutton>
		);
	},
);

export const Field = withHooks(({playerType}: {playerType: "Player" | "Opponent"}) => {
	const field = game.Workspace.Field3D.Field.FindFirstChild(playerType)!.FindFirstChild("Field")!.FindFirstChild("Part") as Part;

	return (
		<surfacegui Key="Field" Face="Top" Adornee={field}>
			<uigridlayout
				SortOrder="LayoutOrder"
				CellPadding={new UDim2(0, 0, 0.005, 0)}
				CellSize={new UDim2(0.2, -1, 0.5, 0)}
			/>
			{fieldZones.map((zone, i) => {
				return (
					<FieldZoneButton
						playerType={playerType}
						zoneName={zone}
						layoutOrder={i}
					/>
				);
			})}
		</surfacegui>
	);
});