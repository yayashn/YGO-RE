import Roact from "@rbxts/roact";
import { withHooks, useRef } from "@rbxts/roact-hooked";
import useCards from "gui/hooks/useCards";
import useMount from "gui/hooks/useMount";
import { PlayerValue, CardFolder } from "server/ygo";
import { instance } from "shared/utils";

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
                return <CardButton card={card} />
            })}
        </surfacegui>
    )
})

export type CardButton = {
    card: CardFolder
    getPosition?: RemoteFunction
    card3D?: ObjectValue
}

interface DuelGuiPlayerField extends SurfaceGui {
    MZone1: TextButton;
    MZone2: TextButton;
    MZone3: TextButton;
    MZone4: TextButton;
    MZone5: TextButton;
    SZone1: TextButton;
    SZone2: TextButton;
    SZone3: TextButton;
    SZone4: TextButton;
    SZone5: TextButton;
}
interface DuelGuiPlayer extends SurfaceGui {
    BZone: SurfaceGui;
    GZone: SurfaceGui;
    EZone: SurfaceGui;
    Deck: SurfaceGui;
    Field: DuelGuiPlayerField;
    Hand: SurfaceGui;
}
interface DuelGui extends ScreenGui {
    Field: {
        Player: DuelGuiPlayer;
        Opponent: DuelGuiPlayer;
    }
}

export const CardButton = withHooks(({card}: CardButton) => {
    const duelGui = playerGui.WaitForChild("DuelGui") as DuelGui;
    const cardRef = useRef<ImageButton>();

    useMount(() => {
        const card3DValue = new Instance("ObjectValue");
        card3DValue.Value = cardRef.getValue();
        card3DValue.Name = "card3D";
        card3DValue.Parent = cardRef.getValue();
        card.cardButton.Value = cardRef.getValue()!;
        const cardFolderValue = instance("ObjectValue", "cardFolder", cardRef.getValue()) as ObjectValue;

        const isOpponent = card.controller.Value !== player;

        createCard3D.FireClient(player,cardRef.getValue(), {
            location: card.location.Value,
        }, isOpponent);

        const cardLocationChanged = (value: string) => {
            if(!isOpponent) {
                cardRef.getValue()!.Parent = duelGui.Field.Player.FindFirstChild(card.location.Value, true);
            } else {
                cardRef.getValue()!.Parent = duelGui.Field.Opponent.FindFirstChild(card.location.Value, true);
            }
            moveCard3D.FireClient(player, cardRef.getValue(), {
                location: value
            }, isOpponent)
        }
        card.location.Changed.Connect(cardLocationChanged)
        cardLocationChanged(card.location.Value)

        const getPositionFromClient = (instance("RemoteFunction", "getPosition", cardRef.getValue()) as RemoteFunction)
        getPositionFromClient.OnServerInvoke = () => {
            return card.position.Value
        }
    }, [], cardRef)

    return (
        <imagebutton Ref={cardRef} Key="Card">

        </imagebutton>
    )
})