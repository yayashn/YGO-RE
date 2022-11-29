import Roact from "@rbxts/roact";
import { useRef, useState, withHooks, useEffect, SetStateAction, Dispatch } from "@rbxts/roact-hooked";
import { FieldZone } from "shared/types";

const tweenService = game.GetService("TweenService");

interface FieldZoneButtonProps {
	zoneName: FieldZone;
	layoutOrder: number;
	animate?: boolean;
	useSelected: [FieldZone | undefined, Dispatch<SetStateAction<FieldZone | undefined>>];
}

const FieldZoneButton = withHooks(
	({ zoneName, layoutOrder, animate, useSelected: [selected, setSelected] }: FieldZoneButtonProps) => {
		const buttonRef = useRef<TextButton>();
		const [isHovered, setIsHovered] = useState<boolean>();
		const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, -1, true, 0);
		const tweenGoal = { BackgroundTransparency: 0.5 };
		const [tween, setTween] = useState<Tween>();

		useEffect(() => {
			if (buttonRef.getValue()) {
				setTween(tweenService.Create(buttonRef.getValue()!, tweenInfo, tweenGoal));
			}
		}, [buttonRef]);

		useEffect(() => {
			if (animate) {
				tween?.Play();
			}
		}, [tween]);

		useEffect(() => {
			if (isHovered) {
				tween?.Play();
			} else {
				tween?.Cancel();
				buttonRef.getValue()!.BackgroundTransparency = 1;
			}
		}, [isHovered]);

		return (
			<textbutton
				Key={zoneName}
				Ref={buttonRef}
				LayoutOrder={layoutOrder}
				Text=""
				AutoButtonColor={false}
				BorderSizePixel={0}
				Event={{
					MouseButton1Click: () => {
						if (selected === undefined) {
							setSelected(zoneName);
						}
					},
					MouseEnter: () => {
						if (!animate) {
							setIsHovered(true);
						}
					},
					MouseLeave: () => {
						if (!animate) {
							setIsHovered(false);
						}
					},
				}}
			/>
		);
	},
);

export const FieldPlayer = withHooks(() => {
	const FieldPlayer = game.Workspace.Field3D.Field.FieldPlayer.Part;
	const fieldZones: FieldZone[] = [
		"MZone1",
		"MZone2",
		"MZone3",
		"MZone4",
		"MZone5",
		"SZone1",
		"SZone2",
		"SZone3",
		"SZone4",
		"SZone5",
	];
	const [selected, setSelected] = useState<FieldZone>();
	const [animateFieldZones, setAnimateFieldZones] = useState<FieldZone[]>([]);

	return (
		<surfacegui Key="FieldPlayer" Face="Top" Adornee={FieldPlayer}>
			<uigridlayout
				SortOrder="LayoutOrder"
				CellPadding={new UDim2(0, 0, 0.005, 0)}
				CellSize={new UDim2(0.2, 0, 0.5, 0)}
			/>
			{fieldZones.map((_, i, zonesArray) => {
				const zone = zonesArray[zonesArray.size() - i - 1];
				return (
					<FieldZoneButton
						useSelected={[selected, setSelected]}
						animate={animateFieldZones.find((n: string) => n === zone) !== undefined}
						zoneName={zone}
						layoutOrder={i}
					/>
				);
			})}
		</surfacegui>
	);
});

export const FieldOpponent = withHooks(() => {
	const FieldOpponent = game.Workspace.Field3D.Field.FieldOpponent.Part;
	const fieldZones: FieldZone[] = [
		"MZone1",
		"MZone2",
		"MZone3",
		"MZone4",
		"MZone5",
		"SZone1",
		"SZone2",
		"SZone3",
		"SZone4",
		"SZone5",
	];
	const [selected, setSelected] = useState<FieldZone>();
	const [animateFieldZones, setAnimateFieldZones] = useState<FieldZone[]>([]);

	return (
		<surfacegui Key="FieldOpponent" Face="Top" Adornee={FieldOpponent}>
			<uigridlayout
				SortOrder="LayoutOrder"
				CellPadding={new UDim2(0, 0, 0.005, 0)}
				CellSize={new UDim2(0.2, 0, 0.5, 0)}
			/>
			{fieldZones.map((_, i, zonesArray) => {
				const zone = zonesArray[zonesArray.size() - i - 1];
				return (
					<FieldZoneButton
						useSelected={[selected, setSelected]}
						animate={animateFieldZones.find((n: string) => n === zone) !== undefined}
						zoneName={zone}
						layoutOrder={i}
					/>
				);
			})}
		</surfacegui>
	);
});
