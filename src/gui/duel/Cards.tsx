import Roact from "@rbxts/roact";
import { withHooks, useRef, useState, useEffect } from "@rbxts/roact-hooked";
import useCanNormalSummon from "gui/hooks/useCanNormalSummon";
import useCards from "gui/hooks/useCards";
import useDuel from "gui/hooks/useDuel";
import useMount from "gui/hooks/useMount";
import usePhase from "gui/hooks/usePhase";
import useShowArt from "gui/hooks/useShowArt";
import useMonstersInMZone from "gui/hooks/useMonstersInMZone";
import useYGOPlayer from "gui/hooks/useYGOPlayer";
import { getCardInfo } from "server/utils";
import { PlayerValue, CardFolder } from "server/ygo";
import { instance } from "shared/utils";
import useTargets from "gui/hooks/useTargets";
import useAllCards from "gui/hooks/useAllCards";

const replicatedStorage = game.GetService("ReplicatedStorage");
const player = script.FindFirstAncestorWhichIsA("Player")!;
const playerGui = player.WaitForChild("PlayerGui") as PlayerGui;
const createCard3D = replicatedStorage.WaitForChild("createCard3D.re") as RemoteEvent;
const moveCard3D = replicatedStorage.WaitForChild("moveCard3D.re") as RemoteEvent;
const tweenService = game.GetService("TweenService");
const httpService = game.GetService("HttpService");

export default withHooks(({PlayerValue}: {PlayerValue: PlayerValue}) => {
    const cards = useCards(PlayerValue.Value);

    return (
        <surfacegui Key="Cards">
            {cards?.map((card, i) => {
                return <CardButton Key={i} 
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
}

export interface DuelGuiPlayerField extends SurfaceGui {
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
export interface DuelGuiPlayer extends SurfaceGui {
    BZone: SurfaceGui;
    GZone: SurfaceGui;
    EZone: SurfaceGui;
    Deck: SurfaceGui;
    Field: DuelGuiPlayerField;
    Hand: SurfaceGui;
}
export interface DuelGui extends ScreenGui {
    Field: {
        Player: DuelGuiPlayer;
        Opponent: DuelGuiPlayer;
    }
}

export const CardButton = withHooks(({card}: CardButton) => {
    const duelGui = playerGui.WaitForChild("DuelGui") as DuelGui;
    const cardRef = useRef<SurfaceGui>();
    const showArt = useShowArt(card);
    const [hover, setHover] = useState(false);
    const artRef = useRef<ImageButton>();
    const sleeveRef = useRef<ImageButton>();
    const [showMenu, setShowMenu] = useState(false);
    const { checkValidTarget, handleTarget, isTargetted } = useTargets(card);

    useMount(() => {
        const tweenInfo = new TweenInfo(0.1, Enum.EasingStyle.Quad, Enum.EasingDirection.Out, -1, true);
        const tween = tweenService.Create(artRef.getValue()!, tweenInfo, {
            ImageTransparency: 0.5
        } as Partial<ExtractMembers<ImageButton, Tweenable>>)
        const handleTween = () => {
            if(checkValidTarget() && !isTargetted()) {
                tween.Play();
            } else if(isTargetted()) {
                tween.Pause();
                artRef.getValue()!.ImageTransparency = 0.5;
            } else {
                tween.Pause();
                artRef.getValue()!.ImageTransparency = 0;
            }
        }
        const connections = [
            card.controller.Value.targets.Changed.Connect(handleTween),
            card.controller.Value.targettableCards.Changed.Connect(handleTween),
        ]

        return () => {
            connections.forEach((connection) => {
                connection.Disconnect();
            })
        }
    }, [], artRef)

    useMount(() => {
        if(sleeveRef.getValue()?.FindFirstAncestorWhichIsA("PlayerGui") === undefined) {
            while(sleeveRef.getValue()?.FindFirstAncestorWhichIsA("PlayerGui") === undefined) {
                wait();
            }
        };
        const connection = card.location.Changed.Connect((value) => {
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

        return () => {
            connection.Disconnect();
        }
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
            <CardMenu card={card} show={showMenu}/>
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
                        if(checkValidTarget()) {
                            handleTarget();
                            setShowMenu(false);
                        } else {
                            setShowMenu(state => !state);
                        }
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
                        if(checkValidTarget()) {
                            handleTarget()
                        } else {
                            setShowMenu(state => !state);
                        }
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
    const { getCardsIn } = useAllCards();
    const duel = useDuel();
    const phase = usePhase();
    const [enabledActions, setEnabledActions] = useState<CardAction[]>([]);
    const YGOPlayer = useYGOPlayer()!;
    const YGOOpponent = useYGOPlayer(true)!;
    const canNormalSummon = useCanNormalSummon(card.controller);
    const { getTargets } = useTargets(card);

    if(!YGOPlayer || !YGOOpponent) return <Roact.Fragment></Roact.Fragment>;

    const removeCardAction = (action?: CardAction) => {
        if(!action) return setEnabledActions([]);
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
            YGOPlayer.canNormalSummon.Value = false;
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
            YGOPlayer.targettableCards.Value = `
                {
                    "location": "MZone",
                    "controller": "${player.Name}"
                }
            `
            const tributesRequired = card.level.Value <= 6 ? 1 : 2;
            const targetsConnection = YGOPlayer.targets.Changed.Connect(() => {
                if(getTargets().size() === tributesRequired) {
                    targetsConnection.Disconnect();
                    getTargets().forEach((target) => {
                        target.tribute.Fire();
                    })
                    YGOPlayer.targettableCards.Value = "{}";
                    YGOPlayer.targets.Value = "[]";
                    wait()
                    YGOPlayer.canNormalSummon.Value = false;
                    YGOPlayer.selectableZones.Value = getEmptyFieldZones("MZone");
                    const selectZone = YGOPlayer.selectedZone.Changed.Connect((zone) => {
                        card.tributeSummon.Fire(zone);
                        selectZone.Disconnect();
                        YGOPlayer.selectedZone.Value = "";
                        YGOPlayer.selectableZones.Value = "[]";
                    })
                }
            })
        }
    }

    useEffect(() => {
        const isMonster = card.type.Value.match("Monster").size() > 0;
        const isSpellTrap = !isMonster
        const inHand = card.location.Value === "Hand";
        const isMainPhase = phase === "MP1" || phase === "MP2";
        const isTurnPlayer = duel?.turnPlayer.Value.Value === player;
        const actionAlreadyOccuring = YGOPlayer.selectableZones.Value !== "[]";

        if(!actionAlreadyOccuring) {
            //Hand Logic
            if (inHand && isTurnPlayer && isMainPhase) {
                if (isMonster) {
                if (canNormalSummon) {
                    if (card.level.Value <= 4) {
                    addCardAction("Normal Summon");
                    addCardAction("Set");
                    } else if (card.level.Value === 5 || card.level.Value === 6) {
                    if (getCardsIn("MZone").size() >= 1) {
                        addCardAction("Tribute Summon");
                        addCardAction("Set");
                    }
                    } else if (card.level.Value >= 7) {
                    if (getCardsIn("MZone").size() >= 2) {
                        addCardAction("Tribute Summon");
                        addCardAction("Set");
                    }
                    }
                } else {
                    removeCardAction("Normal Summon");
                    removeCardAction("Tribute Summon");
                    removeCardAction("Set");
                    }
                } else if (isSpellTrap) {
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
        } else {
            removeCardAction();
        }
    }, [canNormalSummon, phase, card.location.Value, YGOPlayer.selectableZones.Value])

    useEffect(() => {
        if(!show) {
            removeCardAction();
        }
    }, [show])
 
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
                            removeCardAction();
                            cardActions[button]();
                        }
                    }}
                    Size={new UDim2(1,0, 0, 17)}
                    Text={button}></textbutton>
                )
            })}
        </billboardgui>
    )
})