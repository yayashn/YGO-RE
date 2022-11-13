import { getLocation, remote } from "shared/utils"

interface Card extends SurfaceGui {
    Key: "card"
}

export const moveCard = (player: Player, card: Card) => {
    const { location } = (card.FindFirstChild("getCardInfo") as BindableFunction).Invoke()
    print(location)
    card.Parent = getLocation(player, location)!;
    remote<RemoteEvent>("moveCard3D").FireClient(player, card);
}