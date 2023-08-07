import Remotes from "shared/net/remotes";
import { getDuel } from "./duel";
import { getFilteredCards } from "./utils";

export const cardActions = (player: Player, cardUid: string) => {
    const duel = getDuel(player)!;
    const card = getFilteredCards(duel, {
        uid: [cardUid],
    })[0]
    const yPlayer = duel.getPlayer(player);
    const yOpponent = duel.getOpponent(player);

    return {
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
}
