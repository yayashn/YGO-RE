import Roact from "@rbxts/roact";
import { withHooks } from "@rbxts/roact-hooked";
import { useGlobalState } from "gui/hooks/useGlobalState";
import YGOCard from "shared/ygo/card";
import { cardsState } from "./State/cardState";

export default withHooks(() => {
	const [cards, setCards] = useGlobalState<YGOCard[]>(cardsState);

	return (
		<frame Size={new UDim2(0.3, 0, 0.3, 0)} BackgroundTransparency={1} Position={new UDim2(0, 0, 0.7, 0)}>
			<uigridlayout FillDirection="Vertical" />
			<textbutton
				Event={{
					MouseButton1Click: () => {
						cards[0].location = "MZone3";
						setCards([...cards]);
					},
				}}
				Text="card to location"
			/>
			<textbutton
				Event={{
					MouseButton1Click: () => {
						cards[0].location = "Hand";
						setCards([...cards]);
					},
				}}
				Text="card to hand"
			/>
		</frame>
	);
});
