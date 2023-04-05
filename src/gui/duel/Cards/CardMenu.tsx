import Roact from '@rbxts/roact'
import {
    withHooks,
    useState,
    useEffect,
    useRef,
    Dispatch,
    SetStateAction
} from '@rbxts/roact-hooked'
import getTargets from 'gui/functions/getTargets'
import setTargets from 'gui/functions/setTargets'
import useAllCards from 'gui/hooks/useAllCards'
import useCanNormalSummon from 'gui/hooks/useCanNormalSummon'
import useDuel from 'gui/hooks/useDuel'
import usePhase from 'gui/hooks/usePhase'
import useYGOPlayer from 'gui/hooks/useYGOPlayer'
import type { CardFolder } from 'server/types'
import { HttpService } from '@rbxts/services'
import { Button, Text } from 'shared/rowindcss/index'
import { getEmptyFieldZones, getFilteredCards } from 'server/utils'
import useGameState from 'gui/hooks/useGameState'
import useChainResolving from 'gui/hooks/useChainResolving'
import useActor from 'gui/hooks/useActor'
import usePrompt from 'gui/hooks/usePrompt'
import changedOnce from 'shared/lib/changedOnce'
import useCanCardActivate from 'gui/hooks/useCanCardActivate'
import useBattleStep from 'gui/hooks/useBattleStep'
import useCardStats from 'gui/hooks/useCardStats'
import useLocation from 'gui/hooks/useLocation'
import { includes } from 'shared/utils'
import usePosition from 'gui/hooks/usePosition'
import { hasCardFloodgate, hasFloodgate } from 'server/functions/floodgates'
import useFloodgates from 'gui/hooks/useFloodgates'
import useCardFloodgates from 'gui/hooks/useCardFloodgates.ts'
import useRace from 'gui/hooks/useRace'

const player = script.FindFirstAncestorWhichIsA('Player')!

type CardAction =
    | 'Activate'
    | 'Attack'
    | 'Normal Summon'
    | 'Tribute Summon'
    | 'Special Summon'
    | 'Set'
    | 'Flip Summon'
    | 'Change Position'

export default withHooks(
    ({
        card,
        useShowMenu
    }: {
        card: CardFolder
        useShowMenu: [boolean, Dispatch<SetStateAction<string | false>>]
    }) => {
        const { getCardsIn } = useAllCards()
        const duel = useDuel()
        const phase = usePhase()
        const [enabledActions, setEnabledActions] = useState<CardAction[]>([])
        const YGOPlayer = useYGOPlayer()!
        const YGOOpponent = useYGOPlayer(true)!
        const canNormalSummon = useCanNormalSummon(card.controller)
        const [showMenu, setShowMenu] = useShowMenu
        const gameState = useGameState()
        const chainResolving = useChainResolving()
        const actor = useActor()
        const addToChain = duel?.addToChain
        const prompt = usePrompt(YGOPlayer)
        const canCardActivate = useCanCardActivate(card)
        const battleStep = useBattleStep()
        const { atk, def } = useCardStats(card)
        const location = useLocation(card)
        const position = usePosition(card)
        const floodgates = useFloodgates()
        const cardFloodgates = useCardFloodgates(card)
        const race = useRace(card)

        if (!YGOPlayer || !YGOOpponent) return <Roact.Fragment></Roact.Fragment>

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
                const cost = card.getCost.Invoke()
                const target_ = card.getTarget.Invoke()
                if(cost) {
                   cost()
                }
                if(target_) {
                    target_()
                }
                card.activateEffect.Invoke()
            },
            'Normal Summon': async () => {
                YGOPlayer.canNormalSummon.Value = false
                YGOPlayer.selectableZones.Value = getEmptyFieldZones('MZone', YGOPlayer, 'Player')
                const zone = await changedOnce(YGOPlayer.selectedZone.Changed)
                card.normalSummon.Fire(zone)
                YGOPlayer.selectedZone.Value = ''
                YGOPlayer.selectableZones.Value = '[]'
            },
            'Special Summon': () => {},
            Set: async () => {
                if (card.type.Value.match('Monster').size() > 0) {
                    YGOPlayer.canNormalSummon.Value = false
                    if (card.level.Value <= 4) {
                        YGOPlayer.selectableZones.Value = getEmptyFieldZones(
                            'MZone',
                            YGOPlayer,
                            'Player'
                        )
                    } else {
                        const tributesRequired = card.level.Value <= 6 ? 1 : 2
                        const targets = await setTargets(
                            YGOPlayer,
                            {
                                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                                controller: [YGOPlayer]
                            },
                            tributesRequired
                        )
                        targets.forEach((target) => {
                            target.tribute.Fire()
                        })
                        setTargets(YGOPlayer, {}, 0)

                        YGOPlayer.canNormalSummon.Value = false
                        YGOPlayer.selectableZones.Value = getEmptyFieldZones(
                            'MZone',
                            YGOPlayer,
                            'Player'
                        )
                        const zone = await changedOnce(YGOPlayer.selectedZone.Changed)
                        card.tributeSet.Fire(zone)

                        YGOPlayer.selectedZone.Value = ''
                        YGOPlayer.selectableZones.Value = '[]'
    
                        return
                    }
                } else {
                    YGOPlayer.selectableZones.Value = getEmptyFieldZones(
                        'SZone',
                        YGOPlayer,
                        'Player'
                    )
                }
                const zone = await changedOnce(YGOPlayer.selectedZone.Changed)
                card.set.Fire(zone)
                YGOPlayer.selectedZone.Value = ''
                YGOPlayer.selectableZones.Value = '[]'
                
            },
            'Flip Summon': () => {
                card.flipSummon.Fire()
            },
            Attack: async () => {
                const monstersOnOpponentField = getFilteredCards(duel!, {
                    location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                    controller: [YGOOpponent]
                })
                if (monstersOnOpponentField.size() > 0) {
                    const targets = await setTargets(
                        YGOPlayer,
                        {
                            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                            controller: [YGOOpponent]
                        },
                        1
                    )
                    
                    duel!.attackingCard.Value = card
                    duel!.defendingCard.Value = targets[0]
                    
                    duel!.handleResponses.Invoke(YGOPlayer)
                    setTargets(YGOPlayer, {}, 0)
                } else {
                    duel!.attackingCard.Value = card
                    duel!.handleResponses.Invoke(YGOPlayer)
                }
            },
            'Tribute Summon': async () => {
                const tributesRequired = card.level.Value <= 6 ? 1 : 2
                const targets = await setTargets(
                    YGOPlayer,
                    {
                        location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                        controller: [YGOPlayer]
                    },
                    tributesRequired
                )
                targets.forEach((target) => {
                    target.tribute.Fire()
                })
                setTargets(YGOPlayer, {}, 0)

                YGOPlayer.canNormalSummon.Value = false
                YGOPlayer.selectableZones.Value = getEmptyFieldZones('MZone', YGOPlayer, 'Player')

                const zone = await changedOnce(YGOPlayer.selectedZone.Changed)
                card.tributeSummon.Fire(zone)
                YGOPlayer.selectedZone.Value = ''
                YGOPlayer.selectableZones.Value = '[]'
                
            },
            'Change Position': () => {
                card.changePosition.Fire()
            }
        }

        useEffect(() => {
            card.controller.Value.handleCardResponse.Fire(card)

            const isMonster = card.type.Value.match('Monster').size() > 0
            const isSpellTrap = !isMonster
            const inHand = card.location.Value === 'Hand'
            const isMainPhase = phase === 'MP1' || phase === 'MP2'
            const isTurnPlayer = duel?.turnPlayer.Value.Value === player
            const isSelecting =
                YGOPlayer.selectableZones.Value !== '[]' || YGOPlayer.targettableCards.Value !== ''
            const conditionMet = card.checkEffectConditions.Invoke()
            const promptHidden = prompt === ''

            if (
                !chainResolving &&
                !isSelecting &&
                actor === YGOPlayer &&
                card.controller.Value.Value === player &&
                promptHidden
            ) {
                //Hand Logic
                if (inHand && isTurnPlayer && isMainPhase && gameState === 'OPEN') {
                    if (isMonster) {
                        if (canNormalSummon) {
                            if (card.level.Value <= 4) {
                                addCardAction('Normal Summon')
                                addCardAction('Set')
                            } else if (card.level.Value === 5 || card.level.Value === 6) {
                                if (getCardsIn('MZone').size() >= 1) {
                                    addCardAction('Tribute Summon')
                                    addCardAction('Set')
                                }
                            } else if (card.level.Value >= 7) {
                                if (getCardsIn('MZone').size() >= 2) {
                                    addCardAction('Tribute Summon')
                                    addCardAction('Set')
                                }
                            }
                        } else {
                            removeCardAction('Normal Summon')
                            removeCardAction('Tribute Summon')
                            removeCardAction('Set')
                        }
                    } else if (isSpellTrap) {
                        addCardAction('Set')
                    }
                } else {
                    removeCardAction('Normal Summon')
                    removeCardAction('Set')
                }

                const inMZone = card.location.Value.match('MZone').size() > 0
                const canChangePosition = !hasCardFloodgate(card, "disableChangePosition")
                const isFacedownDefense = card.position.Value === 'FaceDownDefense'
                // Monster Zone Logic
                if (inMZone && isTurnPlayer && isMainPhase && gameState === 'OPEN') {
                    if (isFacedownDefense && canChangePosition) {
                        addCardAction('Flip Summon')
                    } else {
                        removeCardAction('Flip Summon')
                    }
                    if (canChangePosition && !isFacedownDefense) {
                        addCardAction('Change Position')
                    } else {
                        removeCardAction('Change Position')
                    }
                } else {
                    removeCardAction('Flip Summon')
                    removeCardAction('Change Position')
                }

                // Battle Phase Logic
                const inAttackPosition = card.position.Value === 'FaceUpAttack'
                if (
                    !hasFloodgate(YGOPlayer, "disableAttack") &&
                    inMZone &&
                    inAttackPosition &&
                    phase === 'BP' &&
                    isTurnPlayer &&
                    !hasCardFloodgate(card, "disableAttack") &&
                    gameState === 'OPEN'
                ) {
                    addCardAction('Attack')
                } else {
                    removeCardAction('Attack')
                }

                // Effect Activation Logic
                if (conditionMet) {
                    addCardAction('Activate')
                } else {
                    removeCardAction('Activate')
                }
            } else {
                removeCardAction()
            }

            const continuousEffects = () => {
                forceFaceUpDefensePosition()
            }

            const forceFaceUpDefensePosition = () => {
                if(hasCardFloodgate(card, "forceFaceUpDefensePosition")) {
                    card.position.Value = 'FaceUpDefense'
                }
            }

            continuousEffects()

            const connections: RBXScriptConnection[] = [
                addToChain?.Event.Connect(() => {
                    card.controller.Value.handleCardResponse.Fire(card)
                    continuousEffects()
                }),
                YGOPlayer.action.Changed.Connect(() => {
                    card.controller.Value.handleCardResponse.Fire(card)
                    continuousEffects()
                }),
                YGOOpponent.action.Changed.Connect(() => {
                    card.controller.Value.handleCardResponse.Fire(card)
                    continuousEffects()
                })
            ] as RBXScriptConnection[]

            return () => {
                connections.forEach((connection) => {
                    connection.Disconnect()
                })
            }
        }, [
            canNormalSummon,
            phase,
            location,
            YGOPlayer.selectableZones.Value,
            YGOPlayer.targettableCards.Value,
            chainResolving,
            gameState,
            actor,
            prompt,
            canCardActivate,
            battleStep,
            position,
            showMenu,
            floodgates,
            cardFloodgates,
            race
        ])

        return (
            <Roact.Fragment>
                <billboardgui
                    Enabled={showMenu}
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
                                Size={new UDim2(1, 0, 0, 17)}
                                Text={button}
                                TextColor3={Color3.fromRGB(255, 255, 255)}
                                TextScaled={true}
                                TextStrokeColor3={Color3.fromRGB(0, 0, 0)}
                                TextStrokeTransparency={0}
                                TextXAlignment={Enum.TextXAlignment.Center}
                                TextYAlignment={Enum.TextYAlignment.Center}
                                Font={Enum.Font.ArialBold}
                                BorderSizePixel={1}
                                BackgroundColor3={new Color3(6 / 255, 52 / 255, 63 / 255)}
                                BorderColor3={new Color3(26 / 255, 101 / 255, 110 / 255)}
                                Event={{
                                    MouseButton1Click: async () => {
                                        setShowMenu(false)
                                        if (!isCardActionEnabled(button)) return
                                        removeCardAction()
                                        cardActions[button]()
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
                    {(position === "FaceUpAttack" || position === "FaceUpDefense") && includes(location || "", "MZone") && atk !== undefined && <textlabel 
                    BackgroundTransparency={1}
                    TextColor3={Color3.fromRGB(255,255,255)}
                    Size={new UDim2(1,0,0,17)}
                    Position={card.controller.Value === YGOPlayer ? new UDim2(0,0,1,0) : new UDim2(0,0,0,0)}
                    AnchorPoint={card.controller.Value === YGOPlayer ? new Vector2(0,1) : new Vector2(0,0)}
                    Text={`${atk || 0}/${def || 0}`}
                    TextStrokeColor3={Color3.fromRGB(0,0,0)}
                    TextStrokeTransparency={0}
                    TextSize={20}
                    Font={Enum.Font.ArialBold}/>}
                </billboardgui>
            </Roact.Fragment>
        )
    }
)
