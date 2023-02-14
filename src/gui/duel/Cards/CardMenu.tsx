import Roact from "@rbxts/roact";
import { withHooks, useState, useEffect, useRef, Dispatch, SetStateAction } from "@rbxts/roact-hooked";
import getTargets from "gui/functions/getTargets";
import setTargets from "gui/functions/setTargets";
import useAllCards from "gui/hooks/useAllCards";
import useCanNormalSummon from "gui/hooks/useCanNormalSummon";
import useDuel from "gui/hooks/useDuel";
import usePhase from "gui/hooks/usePhase";
import useYGOPlayer from "gui/hooks/useYGOPlayer";
import { CardFolder } from "server/ygo";
import { HttpService } from "@rbxts/services";
import {Button, Text} from "gui/rowindcss/index";
import { getFilteredCards } from "server/utils";

const player = script.FindFirstAncestorWhichIsA("Player")!

type CardAction =
    | 'Activate'
    | 'Attack'
    | 'Normal Summon'
    | 'Tribute Summon'
    | 'Special Summon'
    | 'Set'
    | 'Flip Summon'
    | 'Change Position'

export default withHooks(({ card, useShowMenu }: { 
    card: CardFolder; 
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

    const getEmptyFieldZones = (zoneType: 'MZone' | 'SZone' | 'Both') => {
        const MZones = ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'].map((zone) => ({
            [zone]: { opponent: false, player: true },
        }))
        const SZones = ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'].map((zone) => ({
            [zone]: { opponent: false, player: true },
        }))
        const zones =
            zoneType === 'MZone' ? MZones : zoneType === 'SZone' ? SZones : [...MZones, ...SZones]
        const selectableZones = HttpService.JSONEncode(
            zones.filter((zone) => {
                for (const [name] of pairs(zone)) {
                    const isZoneTaken1 = (YGOPlayer.cards.GetChildren() as CardFolder[]).every(
                        (card) =>
                            card.controller.Value.Value !== player || card.location.Value !== name,
                    )
                    const isZoneTaken2 = (YGOOpponent.cards.GetChildren() as CardFolder[]).every(
                        (card) =>
                            card.controller.Value.Value !== player || card.location.Value !== name,
                    )
                    if (isZoneTaken1 && isZoneTaken2) {
                        return true
                    }
                }
                return false
            }),
        )
        return selectableZones
    }

    const cardActions = {
        'Normal Summon': () => {
            YGOPlayer.canNormalSummon.Value = false
            YGOPlayer.selectableZones.Value = getEmptyFieldZones('MZone')
            const selectZone = YGOPlayer.selectedZone.Changed.Connect((zone) => {
                card.normalSummon.Fire(zone)
                selectZone.Disconnect()
                YGOPlayer.selectedZone.Value = ''
                YGOPlayer.selectableZones.Value = '[]'
            })
        },
        'Special Summon': () => {},
        Set: () => {
            if (card.type.Value.match('Monster').size() > 0) {
                YGOPlayer.canNormalSummon.Value = false
                if (card.level.Value <= 4) {
                    YGOPlayer.selectableZones.Value = getEmptyFieldZones('MZone')
                } else {
                    YGOPlayer.targettableCards.Value = `
                        {
                            "location": "MZone",
                            "controller": "${player.Name}"
                        }
                    `
                    const tributesRequired = card.level.Value <= 6 ? 1 : 2
                    const targetsConnection = YGOPlayer.targets.Changed.Connect(() => {
                        if (getTargets(YGOPlayer).size() === tributesRequired) {
                            targetsConnection.Disconnect()
                            getTargets(YGOPlayer).forEach((target) => {
                                target.tribute.Fire()
                            })
                            YGOPlayer.targettableCards.Value = '{}'
                            YGOPlayer.targets.Value = '[]'
                            wait()
                            YGOPlayer.selectableZones.Value = getEmptyFieldZones('MZone')
                        }
                    })
                }
            } else {
                YGOPlayer.selectableZones.Value = getEmptyFieldZones('SZone')
            }
            const selectZone = YGOPlayer.selectedZone.Changed.Connect((zone) => {
                card.set.Fire(zone)
                selectZone.Disconnect()
                YGOPlayer.selectedZone.Value = ''
                YGOPlayer.selectableZones.Value = '[]'
            })
        },
        'Flip Summon': () => {
            card.flipSummon.Fire()
        },
        Attack: async () => {
            const monstersOnOpponentField = getFilteredCards(duel!, {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                controller: [YGOOpponent],
            })
            if(monstersOnOpponentField.size() > 0) {
                const targets = await setTargets(
                    YGOPlayer,
                    {
                        location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                        controller: [YGOOpponent],
                    },
                    1,
                )
                targets.forEach((target) => {
                    card.attack.Fire(target)
                })
                setTargets(YGOPlayer, {}, 0)
            } else {
                card.attack.Fire(YGOOpponent)
            }
        },
        Activate: () => {},
        'Tribute Summon': async () => {
            const tributesRequired = card.level.Value <= 6 ? 1 : 2
            const targets = await setTargets(
                YGOPlayer,
                {
                    location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                    controller: [YGOPlayer],
                },
                tributesRequired,
            )
            targets.forEach((target) => {
                target.tribute.Fire()
            })
            setTargets(YGOPlayer, {}, 0)

            YGOPlayer.canNormalSummon.Value = false
            YGOPlayer.selectableZones.Value = getEmptyFieldZones('MZone')
            const selectZone = YGOPlayer.selectedZone.Changed.Connect((zone) => {
                card.tributeSummon.Fire(zone)
                selectZone.Disconnect()
                YGOPlayer.selectedZone.Value = ''
                YGOPlayer.selectableZones.Value = '[]'
            })
        },
        'Change Position': () => {
            card.changePosition.Fire()
        },
    }

    useEffect(() => {
        const isMonster = card.type.Value.match('Monster').size() > 0
        const isSpellTrap = !isMonster
        const inHand = card.location.Value === 'Hand'
        const isMainPhase = phase === 'MP1' || phase === 'MP2'
        const isTurnPlayer = duel?.turnPlayer.Value.Value === player
        const actionAlreadyOccuring = YGOPlayer.selectableZones.Value !== '[]'

        if (!actionAlreadyOccuring && card.controller.Value.Value === player) {
            //Hand Logic
            if (inHand && isTurnPlayer && isMainPhase) {
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
            const canChangePosition = card.canChangePosition.Value === true
            const isFacedownDefense = card.position.Value === 'FaceDownDefense'
            // Monster Zone Logic
            if (inMZone && isTurnPlayer && isMainPhase) {
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
                inMZone &&
                inAttackPosition &&
                phase === 'BP' &&
                isTurnPlayer &&
                card.canAttack.Value === true
            ) {
                addCardAction('Attack')
            } else {
                removeCardAction('Attack')
            }
        } else {
            removeCardAction()
        }
    }, [canNormalSummon, phase, card.location.Value, YGOPlayer.selectableZones.Value])

    return (
        <billboardgui
            Enabled={showMenu}
            Active={true}
            Key="CardMenu"
            AlwaysOnTop={true}
            Size={new UDim2(70, 0, 100, 0)}
            ExtentsOffset={new Vector3(0, 0.2, 2)}
            ZIndexBehavior={Enum.ZIndexBehavior.Sibling}
        >
            <uilistlayout 
            Padding={new UDim(.05, 0)} 
            VerticalAlignment="Center" />
            {enabledActions.map((button: CardAction) => {
                return (
                    <Button className="w-full h-[17px] bg-gray-500 border-white text-white text-center rounded-md font-bold"
                    Event={{
                        MouseButton1Click: () => {
                            setShowMenu(false)
                            if (!isCardActionEnabled(button)) return
                            removeCardAction()
                            cardActions[button]()
                        },
                    }}
                    Text={button}/>
                )
            })}
        </billboardgui>
    )
})
