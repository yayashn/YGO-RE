import Remotes from 'shared/net/remotes'
import { getDuel } from '../duel'
import { CardPublic } from '../types'
import { getFilteredCards } from '../utils'
import { includes } from 'shared/utils'
import { CardRemotes } from 'shared/duel/remotes'

export const getAllowedActions = (player: Player, cardPublic: CardPublic) => {
    const duel = getDuel(player)!
    const yPlayer = duel.getPlayer(player)
    duel.handleCardFloodgates()
    const card = getFilteredCards(duel, { uid: [cardPublic.uid] })[0]
    const actor = duel.actor.get()
    const chainResolving = duel.chainResolving.get()
    const phase = duel.phase.get()
    const gameState = duel.gameState.get()
    const position = card.position.get()

    const inHand = card.location.get() === 'Hand'
    const inMonsterZone = includes(card.location.get(), "MZone");
    const isMonster = includes(card.type.get(), "Monster");
    const isSpellTrap = !isMonster;
    const isActor = actor === yPlayer;
    const isSelecting = yPlayer.selectableZones.get().size() !== 0;
    const conditionMet = card.checkEffectConditions()
    const isController = card.getController() === yPlayer
    const szoneAvailable = getFilteredCards(duel, {
        location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
        controller: [yPlayer.player]
    }).size() < 5
    const numberOfMzoneCards = getFilteredCards(duel, {
        location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
        controller: [yPlayer.player]
    }).size();
    const mzoneAvailable = (card.level.get() || 0) <= 4 ? (numberOfMzoneCards < 5) : true

    if(chainResolving || isSelecting || !isActor || !isController) {
        return [];
    }

    const actions: string[] = [];

    // Normal Summon & Set
    if (inHand && isMonster && includes(phase, "MP") && !yPlayer.getFloodgates("CANNOT_NORMAL_SUMMON") 
    && gameState === "OPEN" && mzoneAvailable) {
        if(card.level.get()! <= 4) {
            actions.push("Normal Summon")
            actions.push("Set")
        } else if(card.level.get()! <= 6 && numberOfMzoneCards >= 1) {
            actions.push("Tribute Summon")
            actions.push("Set")
        } else if(card.level.get()! >= 7 && numberOfMzoneCards >= 2) {
            actions.push("Tribute Summon")
            actions.push("Set")
        }
    } 
    // Set
    else if (inHand && isSpellTrap && includes(phase, "MP") && gameState === "OPEN" && szoneAvailable) {
        actions.push("Set")
    }
    

    // Flip Summon
    if(inMonsterZone && includes(phase, "MP") && gameState === "OPEN" && position === "FaceDownDefense" && !card.hasFloodgate("CANNOT_CHANGE_POSITION")) {
        actions.push("Flip Summon")
    } 
    // Change Position
    else if(inMonsterZone && includes(phase, "MP") && gameState === "OPEN" && !card.hasFloodgate("CANNOT_CHANGE_POSITION")) {
        actions.push("Change Position")
    }

    // Activate
    if(conditionMet) {
        actions.push("Activate")
    }

    // Attack
    if(inMonsterZone && phase === "BP" && gameState === "OPEN" && position === "FaceUpAttack" && !yPlayer.getFloodgates("CANNOT_ATTACK") && !card.hasFloodgate("CANNOT_ATTACK")) {
        actions.push("Attack")
    } 

    return actions;
}
CardRemotes.Server.Get("getActions").SetCallback(getAllowedActions)

const cardActions = (player: Player, cardPublic: CardPublic, action: string) => {
    const duel = getDuel(cardPublic.controller)!;
    const yPlayer = duel.getPlayer(cardPublic.controller);
    const yOpponent = duel.getPlayer(duel.getOpponent(cardPublic.controller).player);
    const card = getFilteredCards(duel, { uid: [cardPublic.uid] })[0]

    if(!getAllowedActions(player, cardPublic).includes(action)) return;

    const actions = {
        Activate: () => {
            const cost = card.getCost()
            const target_ = card.getTarget()
            if (cost) {
                cost()
            }
            if (target_) {
                target_()
            }
            card.activateEffect()
        },
        'Normal Summon': () => {
            const turn = duel.turn.get()
            yPlayer.addFloodgate('CANNOT_NORMAL_SUMMON', () => {
                return duel.turn.get() !== turn
            })
            const zone = yPlayer.pickZone(
                duel.getEmptyFieldZones('MZone', yPlayer.player, 'Player')
            )
            card.normalSummon(zone)

            duel.setAction({
                action: 'Normal Summon',
                cards: [card],
                player: yPlayer
            })
            duel.handleResponses(duel.getOpponent(card.getController().player))
        },
        'Special Summon': async () => {},
        Set: async () => {
            const turn = duel.turn.get()
            const level = card.level.get()

            if (level !== undefined) {
                yPlayer.addFloodgate('CANNOT_NORMAL_SUMMON', () => {
                    return duel.turn.get() !== turn
                })
                if (level <= 4) {
                    const zone = yPlayer.pickZone(
                        duel.getEmptyFieldZones('MZone', yPlayer.player, 'Player')
                    )
                    card.set(zone)

                    duel.setAction({
                        action: 'Normal Set',
                        cards: [card],
                        player: yPlayer
                    })
                } else if (level >= 5) {
                    const tributes = yPlayer.pickTargets(
                        level <= 6 ? 1 : 2,
                        getFilteredCards(duel!, {
                            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                            controller: [yPlayer.player]
                        })
                    )
                    tributes.forEach((card) => {
                        card.tribute()
                    })
                    const zone = yPlayer.pickZone(
                        duel.getEmptyFieldZones('MZone', yPlayer.player, 'Player')
                    )
                    card.tributeSet(zone)

                    duel.setAction({
                        action: 'Tribute Set',
                        cards: [card],
                        player: yPlayer
                    })
                }
            } else {
                if (card.race.get() === 'Field') {
                    card.set('FZone')
                } else {
                    const zone = yPlayer.pickZone(
                        duel.getEmptyFieldZones('SZone', yPlayer.player, 'Player')
                    )
                    card.set(zone)
                }

                duel.setAction({
                    action: 'Set',
                    cards: [card],
                    player: yPlayer
                })
            }

            duel.handleResponses(duel.getOpponent(card.getController().player))
        },
        'Flip Summon': () => {
            card.flipSummon()
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

                const defender = targets[0]

                Remotes.Server.Get('attackCard3D').SendToPlayer(
                    yPlayer.player,
                    false,
                    card.location.get(),
                    defender.location.get()
                )
                Remotes.Server.Get('attackCard3D').SendToPlayer(
                    yOpponent.player,
                    true,
                    card.location.get(),
                    defender.location.get()
                )

                duel.handleResponses(duel.getOpponent(card.getController().player))
            } else {
                duel!.attackingCard.set(card)

                Remotes.Server.Get('attackCard3D').SendToPlayer(
                    yPlayer.player,
                    false,
                    card.location.get(),
                    undefined
                )
                Remotes.Server.Get('attackCard3D').SendToPlayer(
                    yOpponent.player,
                    true,
                    card.location.get(),
                    undefined
                )

                duel.handleResponses(duel.getOpponent(card.getController().player))
            }
        },
        'Tribute Summon': () => {
            const turn = duel.turn.get()

            const tributesRequired = card.level.get()! <= 6 ? 1 : 2
            yPlayer.targets.set(
                yPlayer.pickTargets(
                    tributesRequired,
                    getFilteredCards(duel!, {
                        location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                        controller: [player]
                    })
                )
            )
            yPlayer.targets.get().forEach((target) => {
                target.tribute()
            })
            yPlayer.addFloodgate('CANNOT_NORMAL_SUMMON', () => {
                return duel.turn.get() !== turn
            })

            const zone = yPlayer.pickZone(duel.getEmptyFieldZones('MZone', player, 'Player'))
            duel.setAction({
                action: 'Tribute Summon',
                cards: [card],
                player: yPlayer
            })

            card.tributeSummon(zone)
            duel.handleResponses(duel.getOpponent(card.getController().player))
        },
        'Change Position': () => {
            card.changePosition()

            duel.setAction({
                action: 'Change Position',
                cards: [card],
                player: yPlayer
            })

            duel.handleResponses(duel.getOpponent(card.getController().player))
        }
    }

    actions[action as keyof typeof actions]()
}
CardRemotes.Server.Get("doAction").Connect(cardActions)