import Roact from "@rbxts/roact";
import { withHooks, useRef, useState, useEffect, Dispatch, SetStateAction } from "@rbxts/roact-hooked";
import useCanNormalSummon from "gui/hooks/useCanNormalSummon";
import useCardChanged from "gui/hooks/useCardChanged";
import useCards from "gui/hooks/useCards";
import useController from "gui/hooks/useController";
import useDuel from "gui/hooks/useDuel";
import useMount from "gui/hooks/useMount";
import usePhase from "gui/hooks/usePhase";
import useSelectableZones from "gui/hooks/useSelectableZones";
import useShowArt from "gui/hooks/useShowArt";
import useYGOPlayer from "gui/hooks/useYGOPlayer";
import { getCardInfo, getDuel } from "server/utils";
import { PlayerValue, CardFolder, MZone } from "server/ygo";
import { instance } from "shared/utils";

const replicatedStorage = game.GetService("ReplicatedStorage");
const player = script.FindFirstAncestorWhichIsA("Player")!;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const createCard3D = replicatedStorage.WaitForChild("createCard3D.re") as RemoteEvent;
const moveCard3D = replicatedStorage.WaitForChild("moveCard3D.re") as RemoteEvent;
const tweenService = game.GetService("TweenService");
const httpService = game.GetService("HttpService");

export default withHooks(({PlayerValue}: {PlayerValue: PlayerValue}) => {
    const cards = useCards(PlayerValue.Value);
    const [clicked, setClicked] = useState<number>();

    useEffect(() => {
        const clickRemote = (player.FindFirstChild("click") || instance("RemoteEvent", "click", player)) as RemoteEvent;

        clickRemote.OnServerEvent.Connect(() => {
            setClicked(undefined)
        })
    }, [])

    return (
        <surfacegui Key="Cards">
            {cards?.map((card, i) => {
                return <CardButton Key={i} 
                useClicked={[i === clicked, () => {
                    if(i === clicked) {
                        setClicked(undefined)
                    } else {
                        setClicked(i)
                    }
                }]} 
                card={card} />
            })}
        </surfacegui>
    )
})

export type CardButton = {
    card: CardFolder
    getPosition?: RemoteFunction
    card3D?: ObjectValue
    getOrder?: RemoteFunction
    Parent?: Instance
    useClicked: [boolean, Callback]
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

export const CardButton = withHooks(({card, useClicked}: CardButton) => {
    const duelGui = playerGui.WaitForChild("DuelGui") as DuelGui;
    const cardRef = useRef<SurfaceGui>();
    const showArt = useShowArt(card);
    const [hover, setHover] = useState(false);
    const artRef = useRef<ImageButton>();
    const sleeveRef = useRef<ImageButton>();
    const [clicked, setClicked] = useClicked;

    useMount(() => {
        if(sleeveRef.getValue()?.FindFirstAncestorWhichIsA("PlayerGui") === undefined) {
            while(sleeveRef.getValue()?.FindFirstAncestorWhichIsA("PlayerGui") === undefined) {
                wait();
            }
        };
        card.location.Changed.Connect((value) => {
            if(value === "Hand") {
                artRef.getValue()!.Size = new UDim2(0.8,0,0.8,0);
            } else {
                artRef.getValue()!.Size = new UDim2(1,0,1,0);
            }
        })
        if(card.location.Value !== "Hand") return;
        [sleeveRef.getValue()!, artRef.getValue()!].forEach((button) => {            
            const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
            const tween = tweenService.Create(button, tweenInfo, {
                Size: hover ? new UDim2(1,0,1,0) : new UDim2(0.8,0,0.8,0)
            } as Partial<ExtractMembers<SurfaceGui, Tweenable>>)
            tween.Play();
        })
    }, [hover], artRef)

    useMount(() => {
        const card3DValue = new Instance("ObjectValue");
        card3DValue.Value = cardRef.getValue();
        card3DValue.Name = "card3D";
        card3DValue.Parent = cardRef.getValue();
        card.cardButton.Value = cardRef.getValue()!;

        const isOpponent = () => card.controller.Value.Value !== player;

        createCard3D.FireClient(player,cardRef.getValue(), {
            location: card.location.Value,
        }, isOpponent());

        const cardLocationChanged = (value: string) => {
            if(!isOpponent()) {
                cardRef.getValue()!.Parent = duelGui.Field.Player.FindFirstChild(card.location.Value, true);
            } else {
                cardRef.getValue()!.Parent = duelGui.Field.Opponent.FindFirstChild(card.location.Value, true);
            }
            moveCard3D.FireClient(player, cardRef.getValue(), {
                location: value
            }, isOpponent())
        }
        card.location.Changed.Connect(cardLocationChanged)
        cardLocationChanged(card.location.Value)

        const getPositionFromClient = (instance("RemoteFunction", "getPosition", cardRef.getValue()) as RemoteFunction)
        getPositionFromClient.OnServerInvoke = () => {
            return card.position.Value
        }

        const getOrderFromClient = (instance("RemoteFunction", "getOrder", cardRef.getValue()) as RemoteFunction)
        getOrderFromClient.OnServerInvoke = () => {
            return card.order.Value
        }
        
    }, [], cardRef)

    return (
        <surfacegui Ref={cardRef} Key="Card">
            <CardMenu card={card} show={clicked}/>
            <surfacegui Key="Art" Face="Bottom">
                <imagebutton
                Ref={artRef} 
                Size={new UDim2(1,0,1,0)}
                BackgroundTransparency={1} 
                ImageTransparency={showArt ? 0 : 1}
                AnchorPoint={new Vector2(0.5,0.5)}
                Position={new UDim2(0.5,0,0.5,0)}
                Image={(getCardInfo(card.Name).FindFirstChild("art") as ImageButton).Image}
                Event={{
                    MouseEnter: () => {
                        setHover(true)
                    },
                    MouseLeave: () => {
                        setHover(false)
                    },
                    MouseButton1Click: () => {
                        setClicked();
                    }
                }}
                >
                </imagebutton>
            </surfacegui>
 
            <surfacegui Key="Sleeve" Face="Top">
                <imagebutton 
                Ref={sleeveRef}
                Size={new UDim2(1,0,1,0)}
                BackgroundTransparency={1} 
                Image={(card.controller.Value.Value.FindFirstChild("sleeve") as StringValue).Value}
                AnchorPoint={new Vector2(0.5,0.5)}
                Position={new UDim2(0.5,0,0.5,0)}
                Event={{
                    MouseEnter: () => {
                        setHover(true)
                    },
                    MouseLeave: () => {
                        setHover(false)
                    },
                    MouseButton1Click: () => {
                        setClicked();
                    }
                }}
                >
                </imagebutton>
            </surfacegui>
        </surfacegui>
    )
})

type CardAction = "Activate" | "Attack" | "Normal Summon" | "Tribute Summon" | "Special Summon" | "Set" | "Flip";

const CardMenu = withHooks(({card, show}: {card: CardFolder, show: boolean}) => {
    const cardChanged = useCardChanged(card);
    const phase = usePhase();
    const [enabledActions, setEnabledActions] = useState<CardAction[]>([]);
    const YGOPlayer = useYGOPlayer()!;
    const YGOOpponent = useYGOPlayer(true)!;
    const canNormalSummon = useCanNormalSummon(card.controller);

    const removeCardAction = (action: CardAction) => {
        setEnabledActions(actions => actions.filter(a => action !== a));
    }

    const addCardAction = (action: CardAction) => {
        if(enabledActions.includes(action)) return;
        setEnabledActions(actions => [...actions, action]);
    }

    const isCardActionEnabled = (action: CardAction) => {
        return enabledActions.includes(action);
    }

    const getEmptyFieldZones = (zoneType: "MZone" | "SZone" | "Both") => {
        const MZones = ["MZone1", "MZone2", "MZone3", "MZone4", "MZone5"].map(zone => ({[zone]: {opponent: false, player: true}}));
        const SZones = ["SZone1", "SZone2", "SZone3", "SZone4", "SZone5"].map(zone => ({[zone]: {opponent: false, player: true}}));
        const zones = zoneType === "MZone" ? MZones : zoneType === "SZone" ? SZones : [...MZones, ...SZones];
        const selectableZones = httpService.JSONEncode(zones.filter((zone) => {
            for (const [name] of pairs(zone)) {
              const isZoneTaken1 = (YGOPlayer.cards.GetChildren() as CardFolder[]).every(card => (card.controller.Value.Value !== player || card.location.Value !== name));
              const isZoneTaken2 = (YGOOpponent.cards.GetChildren() as CardFolder[]).every(card => (card.controller.Value.Value !== player || card.location.Value !== name));
              if (isZoneTaken1 && isZoneTaken2) {
                return true;
              }
            }
            return false;
        }))
        return selectableZones;
    }

    const cardActions = {
        "Normal Summon": () => {
            YGOPlayer.selectableZones.Value = getEmptyFieldZones("MZone");
            const selectZone = YGOPlayer.selectedZone.Changed.Connect((zone) => {
                card.normalSummon.Fire(zone);
                selectZone.Disconnect();
                YGOPlayer.selectedZone.Value = "";
                YGOPlayer.selectableZones.Value = "[]";
            })
        },
        "Special Summon": () => {

        },
        "Set": () => {
            if(card.type.Value.match("Monster").size() > 0) {
                YGOPlayer.selectableZones.Value = getEmptyFieldZones("MZone");
            } else {
                YGOPlayer.selectableZones.Value = getEmptyFieldZones("SZone");
            }
            const selectZone = YGOPlayer.selectedZone.Changed.Connect((zone) => {
                card.set.Fire(zone);
                selectZone.Disconnect();
                YGOPlayer.selectedZone.Value = "";
                YGOPlayer.selectableZones.Value = "[]";
            })
        },
        "Flip": () => {

        },
        "Attack": () => {

        },
        "Activate": () => {

        },
        "Tribute Summon": () => {

        }
    }

    useEffect(() => {
        const isMonster = card.type.Value.match("Monster").size() > 0;
        const isSpellTrap = !isMonster
        const inHand = card.location.Value === "Hand";
        const isMainPhase = phase === "MP1" || phase === "MP2";

        //Hand Logic
        if(inHand && isMainPhase) {
            if(isMonster) {
                if(canNormalSummon) {
                    if(card.level.Value <= 4) {
                        addCardAction("Normal Summon");
                        addCardAction("Set")
                    } else if(card.level.Value > 4) {
                        addCardAction("Tribute Summon");
                        addCardAction("Set")
                    }
                } else {
                    removeCardAction("Normal Summon");
                    removeCardAction("Tribute Summon");
                    removeCardAction("Set");
                }
            } else if(isSpellTrap) {
                addCardAction("Set");
            }
        } else {
            removeCardAction("Normal Summon");
            removeCardAction("Set");
        }

        // Battle Phase Logic
        const inMZone = card.location.Value.match("MZone").size() > 0;
        const inAttackPosition = card.position.Value === "FaceUpAttack";
        if(isMonster
            && inMZone
            && inAttackPosition
            && phase === "BP") {
            addCardAction("Attack");
        } else {
            removeCardAction("Attack");
        }
    }, [canNormalSummon, phase, card.location.Value])

    return (
        <billboardgui
            Enabled={show}
            Active={true}
            Key="CardMenu"
            AlwaysOnTop={true}
            Size={new UDim2(70, 0, 100, 0)}
            ExtentsOffset={new Vector3(0, 0.2, 2)}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <uilistlayout VerticalAlignment="Center" />
            {enabledActions.map((button: CardAction) => {
                return (
                    <textbutton
                    Event={{
                        MouseButton1Click: () => {
                            if(!isCardActionEnabled(button)) return;
                            cardActions[button]();
                            removeCardAction(button);
                        }
                    }}
                    Size={new UDim2(1,0, 0, 17)}
                    Text={button}></textbutton>
                )
            })}
        </billboardgui>
    )
})