import Roact from "@rbxts/roact";
import { useEffect, useState, withHooks } from "@rbxts/roact-hooked";
import useCardStat from "gui/hooks/useCardStat";
import useDuelStat from "gui/hooks/useDuelStat";
import usePlayerStat from "gui/hooks/usePlayerStat";
import type { Card } from "server/duel/card";
import { getDuel } from "server/duel/duel";
import { YPlayer } from "server/duel/player";
import { CardFloodgate, Location, Phase, Position } from "server/duel/types";
import { useGlobalState } from "shared/useGlobalState";
import { includes } from "shared/utils";
import { showMenuStore } from "./showMenuStore";
import { getFilteredCards } from "server/duel/utils";

type CardAction =
    | 'Activate'
    | 'Attack'
    | 'Normal Summon'
    | 'Tribute Summon'
    | 'Special Summon'
    | 'Set'
    | 'Flip Summon'
    | 'Change Position'

const player = script.FindFirstAncestorWhichIsA("Player")!;

export default withHooks(({ card }: { card: Card }) => {
    const [showMenu, setShowMenu] = useGlobalState(showMenuStore)
    const [enabledActions, setEnabledActions] = useState<CardAction[]>([]);
    const duel = getDuel(player)!;
    const yPlayer = duel.getPlayer(player);
    const yOpponent = duel.getOpponent(player);
    const position = useCardStat<"position", Position>(card, "position");
    const chainLink = useCardStat<"chainLink", number>(card, "chainLink");
    const location = useCardStat<"location", Location>(card, "location");
    const atk = useCardStat<"atk", number>(card, "atk");
    const def = useCardStat<"def", number>(card, "def");
    const actor = useDuelStat<"actor", YPlayer>(duel, "actor");
    const chainResolving = useDuelStat<"chainResolving", boolean>(duel, "chainResolving");
    const gameState = useDuelStat<"gameState", string>(duel, "gameState");
    const type_ = useCardStat<"type", string>(card, 'type');
    const phase = useDuelStat<"phase", Phase>(duel, 'phase');
    const duelChanged = useDuelStat<"changed", number>(duel, 'changed');
    const playerChanged = usePlayerStat<"changed", number>(yPlayer, 'changed');
    const cardChanged = useCardStat<"changed", number>(card, 'changed');

    const removeCardAction = (action?: CardAction) => {
        if (!action) return setEnabledActions([])
        setEnabledActions((actions) => actions.filter((a) => action !== a))
    }

    const addCardAction = (action: CardAction) => {
        if (enabledActions.includes(action)) return
        setEnabledActions((actions) => [...actions, action])
    }

    const isCardActionEnabled = (action: CardAction) => {
        return enabledActions.includes(action)
    }

    const cardActions = {
        Activate: () => {
            const cost = card.getCost()
            const target_ = card.getTarget()
            if(cost) {
               cost()
            }
            if(target_) {
                target_()
            }
            duel.action.set({
                action: 'Activated Card',
                player: card.getController(),
                cards: [card],
            })
            card.activateEffect()
        },
        'Normal Summon': () => {
            const turn = duel.turn.get()
            yPlayer.addFloodgate("CANNOT_NORMAL_SUMMON", () => {
                return duel.turn.get() !== turn;
            })
            const zone = yPlayer.pickZone(duel.getEmptyFieldZones('MZone', yPlayer.player, 'Player'));
            card.normalSummon(zone)

            duel.action.set({
                action: 'Normal Summon',
                player: card.getController(),
                cards: [card],
            })
            duel.handleResponses(duel.getOpponent(card.getController().player))
        },
        'Special Summon': async () => {},
        Set: async () => {
            const turn = duel.turn.get()
            const level = card.level.get()

            if(level !== undefined) {
                yPlayer.addFloodgate("CANNOT_NORMAL_SUMMON", () => {
                    return duel.turn.get() !== turn;
                })
                if(level <= 4) {
                    const zone = yPlayer.pickZone(duel.getEmptyFieldZones('MZone', yPlayer.player, 'Player'));
                    card.set(zone)


                    duel.action.set({
                        action: 'Normal Set',
                        player: card.getController(),
                        cards: [card],
                    })
                } else if(level >= 5) {
                    const tributes = yPlayer.pickTargets(level <= 6 ? 1 : 2, getFilteredCards(duel!, {
                        location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                        controller: [yPlayer.player]
                    }))
                    tributes.forEach((card) => {
                        card.tribute()
                    })
                    const zone = yPlayer.pickZone(duel.getEmptyFieldZones('MZone', yPlayer.player, 'Player'));
                    card.tributeSet(zone)  
                    

                    duel.action.set({
                        action: 'Tribute Set',
                        player: card.getController(),
                        cards: [card],
                    })
                }
            } else {
                const zone = yPlayer.pickZone(duel.getEmptyFieldZones('SZone', yPlayer.player, 'Player'));
                card.set(zone)


                duel.action.set({
                    action: 'Set',
                    player: card.getController(),
                    cards: [card],
                })
            }

            duel.handleResponses(duel.getOpponent(card.getController().player))
        },
        'Flip Summon': () => {
            card.flipSummon();

            duel.action.set({
                action: 'Flip Summon',
                player: card.getController(),
                cards: [card],
            })
            duel.handleResponses(duel.getOpponent(card.getController().player))
        },
        Attack: () => {
            const monstersOnOpponentField = getFilteredCards(duel!, {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                controller: [yOpponent.player]
            })
            if (monstersOnOpponentField.size() > 0) {
                const targets = yPlayer.pickTargets(
                    1,
                    getFilteredCards(duel!, {
                        location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                        controller: [yOpponent.player]
                    })
                )
                
                duel!.attackingCard.set(card)
                duel!.defendingCard.set(targets[0])
                
                duel.handleResponses(duel.getOpponent(card.getController().player))
            } else {
                duel!.attackingCard.set(card)
                duel.handleResponses(duel.getOpponent(card.getController().player))
            }
        },
        'Tribute Summon': () => {
            const turn = duel.turn.get()

            const tributesRequired = card.level.get()! <= 6 ? 1 : 2
            yPlayer.targets.set(yPlayer.pickTargets(tributesRequired, 
                getFilteredCards(duel!, {
                    location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                    controller: [player]
                })
            ))
            yPlayer.targets.get().forEach((target) => {
                target.tribute()
            })

            yPlayer.addFloodgate("CANNOT_NORMAL_SUMMON", () => {
                return duel.turn.get() !== turn;
            })

            const zone = yPlayer.pickZone(duel.getEmptyFieldZones('MZone', player, 'Player'))


            duel.action.set({
                action: 'Tribute Summon',
                player: card.getController(),
                cards: [card],
            })

            card.tributeSummon(zone)
            duel.handleResponses(duel.getOpponent(card.getController().player))
        },
        "Change Position": () => {
            card.changePosition()


            duel.action.set({
                action: 'Change Position',
                player: card.getController(),
                cards: [card],
            })

            duel.handleResponses(duel.getOpponent(card.getController().player))
        }
    }

    useEffect(() => {
        duel.handleCardFloodgates();

        const inHand = location === 'Hand'
        const inMonsterZone = includes(location, "MZone");
        const isMonster = includes(type_, "Monster");
        const isSpellTrap = !isMonster;
        const isActor = actor === yPlayer;
        const isSelecting = yPlayer.selectableZones.get().size() !== 0;
        const conditionMet = card.checkEffectConditions()
        const isController = card.getController() === yPlayer
        const mzoneAvailable = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [yPlayer.player]
        }).size() < 5
        const szoneAvailable = getFilteredCards(duel, {
            location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
            controller: [yPlayer.player]
        }).size() < 5

        if(chainResolving || isSelecting || !isActor || !isController) {
            removeCardAction()
            return;
        }

        // Normal Summon & Set
        if (inHand && isMonster && includes(phase, "MP") && !yPlayer.getFloodgates("CANNOT_NORMAL_SUMMON") 
        && gameState === "OPEN" && mzoneAvailable) {
            if(card.level.get()! <= 4) {
                addCardAction("Normal Summon")
            } else {
                addCardAction("Tribute Summon")
            }
            addCardAction("Set")
        } 
        // Set
        else if (inHand && isSpellTrap && includes(phase, "MP") && gameState === "OPEN" && szoneAvailable) {
            addCardAction("Set")
        } else {
            removeCardAction("Normal Summon")
            removeCardAction("Set")
            removeCardAction("Tribute Summon")
        }

        // Flip Summon
        if(inMonsterZone && includes(phase, "MP") && gameState === "OPEN" && position === "FaceDownDefense" && !card.hasFloodgate("CANNOT_CHANGE_POSITION")) {
            addCardAction("Flip Summon");
        } 
        // Change Position
        else if(inMonsterZone && includes(phase, "MP") && gameState === "OPEN" && !card.hasFloodgate("CANNOT_CHANGE_POSITION")) {
            addCardAction("Change Position");
        } else {
            removeCardAction("Flip Summon");
            removeCardAction("Change Position");
        }

        // Activate
        if(conditionMet) {
            addCardAction("Activate");
        } else {
            removeCardAction("Activate");
        }

        // Attack
        if(inMonsterZone && phase === "BP" && gameState === "OPEN" && position === "FaceUpAttack" && !yPlayer.getFloodgates("CANNOT_ATTACK") && !card.hasFloodgate("CANNOT_ATTACK")) {
            addCardAction("Attack");
        } else {
            removeCardAction("Attack");
        }
    }, [
        showMenu, duelChanged, playerChanged, cardChanged
    ])

    useEffect(() => {
        if(showMenu === card) {
            setShowMenu(undefined)
        }
    }, [phase])

    return (
        <Roact.Fragment>
            <billboardgui
                Enabled={showMenu === card}
                Active={true}
                Key="CardMenu"
                AlwaysOnTop={true}
                Size={new UDim2(70, 0, 100, 0)}
                ExtentsOffset={new Vector3(0, 0.2, 2)}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
            >
                <uilistlayout Padding={new UDim(0.05, 0)} VerticalAlignment="Center" />
                {enabledActions.map((button: CardAction) => {
                    return (
                        <textbutton
                            Size={new UDim2(1, 0, 0, 30)}
                            Text={button}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            TextSize={14}
                            TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                            TextStrokeTransparency={0}
                            TextXAlignment={Enum.TextXAlignment.Center}
                            TextYAlignment={Enum.TextYAlignment.Center}
                            Font={Enum.Font.ArialBold}
                            BorderSizePixel={1}
                            BackgroundColor3={new Color3(6 / 255, 52 / 255, 63 / 255)}
                            BorderColor3={new Color3(26 / 255, 101 / 255, 110 / 255)}
                            Event={{
                                MouseButton1Click: async (e) => {
                                    setShowMenu(undefined)
                                    if (!isCardActionEnabled(button)) return
                                    removeCardAction()
                                    if (button === "Attack") {
                                        await Promise.delay(.1)
                                    };
                                    (cardActions as unknown as Record<string, Callback>)[button]()
                                }
                            }}
                        />
                    )
                })}
            </billboardgui>
            <billboardgui
                Key="Status"
                AlwaysOnTop={true}
                Size={new UDim2(70, 0, 100, 0)}
                ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
                Active={true}
            >
                {(position === "FaceUpAttack" || position === "FaceUpDefense") && includes(location || "", "MZone") && atk !== undefined && def !== undefined && <textlabel
                    BackgroundTransparency={1}
                    TextColor3={Color3.fromRGB(255, 255, 255)}
                    Size={new UDim2(1, 0, 0, 17)}
                    Position={card.getController() === yPlayer ? new UDim2(0, 0, 1, 0) : new UDim2(0, 0, 0, 0)}
                    AnchorPoint={card.getController() === yPlayer ? new Vector2(0, 1) : new Vector2(0, 0)}
                    Text={`${card.getAtk()}/${card.getDef()}`}
                    TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                    TextStrokeTransparency={0}
                    TextSize={20}
                    Font={Enum.Font.ArialBold} />}
                {chainLink !== 0 &&
                    <imagelabel
                        Size={new UDim2(1, 0, 1, 0)}
                        BackgroundTransparency={1}
                        Image="rbxgameasset://Images/chain"
                        Position={new UDim2(.5, 0, .5, 0)}
                        AnchorPoint={new Vector2(.5, .5)}>
                        <uiaspectratioconstraint AspectRatio={1} />
                        <textlabel
                            BackgroundTransparency={1}
                            TextColor3={Color3.fromRGB(255, 255, 255)}
                            Size={new UDim2(1, 0, 0, 17)}
                            Position={new UDim2(.5, 0, .5, 0)}
                            AnchorPoint={new Vector2(.5, .5)}
                            Text={`${chainLink}`}
                            TextXAlignment="Center"
                            TextYAlignment="Center"
                            TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                            TextStrokeTransparency={0}
                            TextSize={40}
                            Font={Enum.Font.ArialBold}>
                        </textlabel>
                    </imagelabel>
                }
                {card.checkEffectConditions() && card.getController() === yPlayer &&
                    <imagelabel
                        Size={new UDim2(1, 0, 0, 50)}
                        BackgroundTransparency={1}
                        Image="rbxgameasset://Images/activate"
                        Position={new UDim2(.5, 0, .5, 0)}
                        AnchorPoint={new Vector2(.5, .5)}>
                        <uiaspectratioconstraint AspectRatio={1} />
                    </imagelabel>
                }
            </billboardgui>
        </Roact.Fragment>
    )
})