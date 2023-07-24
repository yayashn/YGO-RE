import Roact from "@rbxts/roact";
import { useRef, withHooks } from "@rbxts/roact-hooked";
import useController from "gui/hooks/useController";
import useMount from "gui/hooks/useMount";
import useShowArt from "gui/hooks/useShowArt";
import { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getEquippedSleeve } from "server/profile-service/profiles";
import Remotes from "shared/net";
import CardMenu from "./CardMenu";
import { Position } from "server/duel/types";

interface Props {
    card: Card
}

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(({ card }: Props) => {
    const duel = getDuel(player)!;
    const card2DRef = useRef<SurfaceGui>();
    const opponent = duel.getOpponent(player);
    const controller = useController(card);
    const showArt = useShowArt(card)
    const sleeve = getEquippedSleeve(controller);
    const isOpponent = () => card.controller.get() !== player;
    const positionChangedRef = useRef<RemoteEvent>();

    useMount(() => {
        if(card2DRef.getValue() === undefined) return;
        Remotes.Server.Get("createCard3D").SendToPlayer(player, card2DRef.getValue()!, card.location.get(), isOpponent());

        const connections = [
            card.position.changed((position: Position) => {
                positionChangedRef.getValue()!.FireClient(player, position);
            })
        ]

        return () => {
            connections.forEach(connection => connection.Disconnect());
        }
    }, [], card2DRef)

    return (
        <surfacegui Ref={card2DRef}>
            <surfacegui Key="Art" Face="Bottom">
                <imagelabel ImageTransparency={0}
                    Size={new UDim2(1, 0, 1, 0)}
                    BackgroundTransparency={1}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Image={showArt ? card.art : ''}
                    Position={new UDim2(0.5, 0, 0.5, 0)}>
                </imagelabel>
            </surfacegui>

            <surfacegui Key="Sleeve" Face="Top">
                <imagelabel ImageTransparency={0}
                    Size={new UDim2(1, 0, 1, 0)}
                    BackgroundTransparency={1}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Image={sleeve}
                    Position={new UDim2(0.5, 0, 0.5, 0)}>
                </imagelabel>
            </surfacegui>
            <CardMenu/>
            <remotefunction Key="getPosition" OnServerInvoke={() => {
                return card.position.get();
            }}/>
            <remotefunction Key="getLocation" OnServerInvoke={() => {
                return card.location.get();
            }}/>
             <remotefunction Key="getOrder" OnServerInvoke={() => {
                return card.order.get();
            }}/>
            <remoteevent Key="positionChanged" Ref={positionChangedRef}/>
        </surfacegui>
    )
})