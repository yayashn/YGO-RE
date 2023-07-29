import Roact from "@rbxts/roact";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState, withHooks } from "@rbxts/roact-hooked";
import useController from "gui/hooks/useController";
import useMount from "gui/hooks/useMount";
import useShowArt from "gui/hooks/useShowArt";
import { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { getEquippedSleeve } from "server/profile-service/profiles";
import Remotes from "shared/net";
import CardMenu from "./CardMenu";
import { CardFloodgate, Location, Position } from "server/duel/types";
import HoverCard from "server-storage/animations/HoverCard/HoverCard";
import useCardStat from "gui/hooks/useCardStat";
import { useGlobalState } from "shared/useGlobalState";
import { showMenuStore } from "./showMenuStore";
import useIsTarget from "gui/hooks/useIsTarget";
import useIsTargettable from "gui/hooks/useIsTargettable";
import { hoveredCardStore } from "./CardInfo";
import { includes } from "shared/utils";
import useDuelStat from "gui/hooks/useDuelStat";

interface Props {
    card: Card,
}

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(({ card }: Props) => {
    const [showMenu, setShowMenu] = useGlobalState(showMenuStore)
    const duel = getDuel(player)!;
    const card2DRef = useRef<SurfaceGui>();
    const opponent = duel.getOpponent(player);
    const controller = useController(card);
    const yPlayer = duel.getPlayer(player);
    const showArt = useShowArt(card)
    const sleeve = getEquippedSleeve(controller);
    const isOpponent = () => card.controller.get() !== player;
    const positionChangedRef = useRef<RemoteEvent>();
    const onClickRef = useRef<RemoteEvent>();
    const [hover, setHover] = useState(false);
    const location = useCardStat<"location", Location>(card, "location");
    const isTarget = useIsTarget(card);
    const isTargettable = useIsTargettable(card);
    const [hoveredCard, setHoveredCard] = useGlobalState(hoveredCardStore)

    useMount(() => {
        if(card2DRef.getValue() === undefined) return;

        Remotes.Server.Get("createCard3D").SendToPlayer(player, card2DRef.getValue()!, card.location.get(), isOpponent());

        const connections = [
            card.position.changed((position: Position) => {
                positionChangedRef.getValue()!.FireClient(player, position);
            }),
            card.location.changed((location: Location) => {
                Remotes.Server.Get("moveCard3D").SendToPlayer(player, card2DRef.getValue()!, location, isOpponent());
            })
        ]

        return () => {
            connections.forEach(connection => connection.Disconnect());
        }
    }, [], card2DRef)

    useEffect(() => {
        if(showMenu === card) {
            setShowMenu(undefined);
        }
    }, [isTargettable])

    const onClick = useCallback((_: unknown, __: unknown, eventName: string) => {
        if(eventName === "click") {
            print(duel.cardFloodgates.get())
            print(card.atkModifier.get())
            print(card.defModifier.get())
            if(isTargettable) {
                yPlayer.handleTarget(card);
            } else {
                setShowMenu(showMenu === card ? undefined : card);
            }
        } else if(eventName === "hover") {
            setHover(card.location.get() === "Hand");
            if(showArt) {
                setHoveredCard(card)
            } else {
                setHoveredCard(undefined)
            }
        } else {
            setHover(false);
        }
    }, [isTarget, isTargettable, showArt])

    return (
        <surfacegui Ref={card2DRef}>
            <surfacegui 
            ZOffset={-1}
            AlwaysOnTop Key="Art" Face="Bottom">
                <imagebutton 
                Event={{
                    MouseButton1Click: () => onClick(undefined, undefined, "click"),
                    MouseEnter: () => onClick(undefined, undefined, "hover"),
                    MouseLeave: () => onClick(undefined, undefined, "unhover")
                }}
                ImageTransparency={0}
                    Size={location !== "Hand" ? new UDim2(1, 0, 1, 0) : new UDim2(.8,0,.8,0)}
                    BackgroundTransparency={1}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Image={showArt ? card.art : ''}
                    Position={new UDim2(0.5, 0, 0.5, 0)}>
                        {location === "Hand" && <HoverCard playAnimation={hover}/>}
                        {isTargettable && <uistroke Color={Color3.fromRGB(255, 165, 0)} Thickness={30}/>}
                        {isTarget && <uistroke Color={Color3.fromRGB(0, 255, 0)} Thickness={30}/>}
                </imagebutton>
            </surfacegui>

            <surfacegui AlwaysOnTop Key="Sleeve" Face="Top">
                <imagebutton 
                Event={{
                    MouseButton1Click: () => onClick(undefined, undefined, "click"),
                    MouseEnter: () => onClick(undefined, undefined, "hover"),
                    MouseLeave: () => onClick(undefined, undefined, "unhover")
                }}
                ImageTransparency={0}
                    Size={location !== "Hand" ? new UDim2(1, 0, 1, 0) : new UDim2(.8,0,.8,0)}
                    BackgroundTransparency={1}
                    AnchorPoint={new Vector2(0.5, 0.5)}
                    Image={sleeve}
                    Position={new UDim2(0.5, 0, 0.5, 0)}>
                        {location === "Hand" && <HoverCard playAnimation={hover}/>}
                        {isTargettable && <uistroke Color={Color3.fromRGB(255, 165, 0)} Thickness={30}/>}
                        {isTarget && <uistroke Color={Color3.fromRGB(0, 255, 0)} Thickness={30}/>}
                </imagebutton>
            </surfacegui>
            <CardMenu card={card} />
            <objectvalue Key="card3D"/>
            <remotefunction Key="getPosition" OnServerInvoke={() => {
                return card.position.get();
            }}/>
            <remotefunction Key="getLocation" OnServerInvoke={() => {
                return card.location.get();
            }}/>
             <remotefunction Key="getOrder" OnServerInvoke={() => {
                return card.order.get();
            }}/>
            <remotefunction Key="getUid" OnServerInvoke={() => {
                return card.uid;
            }}/>
            <remoteevent Key="positionChanged" Ref={positionChangedRef}/>
        </surfacegui>
    )
})