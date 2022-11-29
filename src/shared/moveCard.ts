import { remote } from "shared/utils";
import get2DLocation from "./get2DLocation";
import YGOCard from "shared/ygo/card";

interface Card extends SurfaceGui {
	Key: "card";
}

export default (player: Player, card: Card) => {
	const { location }: YGOCard = (
		card.FindFirstChild("getCardInfo") as BindableFunction
	).Invoke();
	card.Parent = get2DLocation(card, location)!;
	if (!location.match("Hand")[0]) {
		remote<RemoteEvent>("moveCard3D").FireClient(player, card);
	}
};