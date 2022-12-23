import Roact from "@rbxts/roact";
import { useRef, useState, withHooks, useEffect } from "@rbxts/roact-hooked";
import useMount from "gui/hooks/useMount";
import { fieldZones } from "shared/defs";
import { FieldZone } from "shared/types";

const replicatedStorage = game.GetService("ReplicatedStorage");
const player = script.FindFirstAncestorWhichIsA("Player")!;
const tweenService = game.GetService("TweenService");
const adornee = replicatedStorage.WaitForChild("adornee.re") as RemoteEvent;

interface FieldZoneButtonProps {
	zoneName: FieldZone;
	layoutOrder: number;
	animate?: boolean;
}

const FieldZoneButton = withHooks(
	({ zoneName, layoutOrder, animate }: FieldZoneButtonProps) => {
		const buttonRef = useRef<TextButton>();
		const [isHovered, setIsHovered] = useState<boolean>();
		const tweenInfo = new TweenInfo(0.5, Enum.EasingStyle.Linear, Enum.EasingDirection.Out, -1, true, 0);
		const tweenGoal = { BackgroundTransparency: 0.5 };
		const [tween, setTween] = useState<Tween>();
		const [selected, setSelected] = useState<boolean>();

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
							print(zoneName)
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

export const Field = withHooks(({field}: {field: Part}) => {
	const [animateFieldZones, setAnimateFieldZones] = useState<FieldZone[]>([]);
	const fieldRef = useRef<SurfaceGui>();

	useMount(() => {
		adornee.FireClient(player, fieldRef.getValue(), field)
	}, [], fieldRef)

	return (
		<surfacegui Ref={fieldRef} Key="Field" Face="Top">
			<uigridlayout
				SortOrder="LayoutOrder"
				CellPadding={new UDim2(0, 0, 0.005, 0)}
				CellSize={new UDim2(0.2, 0, 0.5, 0)}
			/>
			{fieldZones.map((_, i, zonesArray) => {
				const zone = zonesArray[zonesArray.size() - i - 1];
				return (
					<FieldZoneButton
						animate={animateFieldZones.find((n: string) => n === zone) !== undefined}
						zoneName={zone}
						layoutOrder={i}
					/>
				);
			})}
		</surfacegui>
	);
});