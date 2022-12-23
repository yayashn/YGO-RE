import Roact from "@rbxts/roact";
import { withHooks, useRef } from "@rbxts/roact-hooked";
import useCards from "gui/hooks/useCards";
import useMount from "gui/hooks/useMount";
import { PlayerValue, CardFolder } from "server/ygo";

const replicatedStorage = game.GetService("ReplicatedStorage");
const player = script.FindFirstAncestorWhichIsA("Player")!;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const createCard3D = replicatedStorage.WaitForChild("createCard3D.re") as RemoteEvent;
const moveCard3D = replicatedStorage.WaitForChild("moveCard3D.re") as RemoteEvent;

export default withHooks(({PlayerValue}: {PlayerValue: PlayerValue}) => {
    const cards = useCards(PlayerValue.Value);

    return (
        <surfacegui Key="Cards">
            {cards?.map((card) => {
                return <CardButton card={card as CardFolder} />
            })}
        </surfacegui>
    )
})

type CardButton = {
    card: CardFolder
}

export const CardButton = withHooks(({card}: CardButton) => {
    const duelGui = playerGui.WaitForChild("DuelGui") as ScreenGui;
    const cardRef = useRef<ImageButton>();

    useMount(() => {
        const card3DValue = new Instance("ObjectValue");
        card3DValue.Value = cardRef.getValue();
        card3DValue.Name = "card3D";
        card3DValue.Parent = cardRef.getValue();

        const isOpponent = card.controller.Value !== player;

        createCard3D.FireClient(player,cardRef.getValue(), {
            location: card.location.Value,
        }, isOpponent);

        card.location.Changed.Connect((value) => {
            if(!isOpponent) {
                cardRef.getValue()!.Parent = duelGui.FindFirstChild("Player")!.FindFirstChild(card.location.Value, true);
            } else {
                cardRef.getValue()!.Parent = duelGui.FindFirstChild("Opponent")!.FindFirstChild(card.location.Value, true);
            }
            moveCard3D.FireClient(player, cardRef.getValue(), {
                location: value
            }, isOpponent)
        })
    }, [], cardRef)

    return (
        <imagebutton Ref={cardRef} Key="Card">

        </imagebutton>
    )
})