import { useEffect, useState } from "@rbxts/roact-hooked";
import YGOCard from "shared/ygo/card";

import useOpponent from "./useOpponent";

const httpService = game.GetService("HttpService");
const serverStorage = game.GetService("ServerStorage");
const playersFolder = serverStorage.FindFirstChild("players") as Folder;

export default () => {
	const opponent = useOpponent();
	const [opponentCards, setOpponentCards] = useState<string>("[]");

	useEffect(() => {
		if (opponent) {
			const opponentFolder = playersFolder.WaitForChild(opponent.Name) as Folder;
			setOpponentCards((opponentFolder.WaitForChild("GlobalStore").WaitForChild("cards") as StringValue).Value);
		} else {
			setOpponentCards("[]");
		}
	}, [opponent]);

	return httpService.JSONDecode(opponentCards) as YGOCard[];
};
