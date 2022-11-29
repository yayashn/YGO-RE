import { useEffect, useState } from "@rbxts/roact-hooked";
import { getPlayer } from "shared/utils";

const player = getPlayer(script);

export default () => {
	const opponentObjectValue = player.WaitForChild("opponent") as ObjectValue;
	const [opponent, setOpponent] = useState<Player>(opponentObjectValue.Value as Player);

	useEffect(() => {
		opponentObjectValue.Changed.Connect(() => {
			setOpponent(opponentObjectValue.Value as Player);
		});
	}, []);

	return opponent;
};
