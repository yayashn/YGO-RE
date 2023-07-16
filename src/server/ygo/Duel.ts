import { createInstance, includes } from 'shared/utils'
import { ServerStorage } from '@rbxts/services'
import Object from '@rbxts/object-utils'
import {
    ChainedEffect,
    Phase,
    BattleStep,
    DamageStep,
} from '../types'
import {
    FloodgateCard,
    addCardFloodgate,
    removeCardFloodgate,
} from 'server/functions/floodgates'
import { getFilteredCards } from './utils'
import { YEvent } from './Event'
import { YPlayer } from './Player'
import { Duels } from './Duels'
import { Card } from './Card';

export const duelAdded = createInstance("BindableEvent", "duelAdded", ServerStorage)

export class Duel {
    turn: YEvent<number> = new YEvent(0)
    phase: YEvent<Phase> = new YEvent('DP')
    battleStep: YEvent<BattleStep> = new YEvent('BATTLE')
    damageStep: YEvent<DamageStep> = new YEvent('NONE')
    turnPlayer: YEvent<YPlayer>;
    player1: YPlayer
    player2: YPlayer
    gameState: YEvent<"CLOSED" | "OPEN"> = new YEvent('OPEN')
    chainResolving: YEvent<boolean> = new YEvent(false)
    actor: YEvent<YPlayer>;
    attackingCard: YEvent<Card | undefined>
    defendingCard: YEvent<Card | undefined>
    speedSpell: YEvent<number> = new YEvent(0)
    chain: Record<number, ChainedEffect> = {}
    responses: Record<'player1' | 'player2', Card[]> = {
        player1: [],
        player2: []
    }
    handlingResponses = new YEvent(false)
    floodgates: YEvent<FloodgateCard[]> = new YEvent([])
    addToChain = new YEvent((card: Card, effect: Callback) => {
        this.gameState.set('CLOSED')
        card.activated.set(true)
        const chainLink = Object.keys(this.chain).size() + 1
        card.chainLink.set(chainLink)
        this.chain[chainLink] = {
            card,
            effect,
            negated: false
        }
    })

    constructor(p1: Player, p2: Player) {
        Duels.set(`${p1.Name}|${p2.Name}`, this)
        this.player1 = new YPlayer(p1, "player1")
        this.player2 = new YPlayer(p2, "player2")
        this.turnPlayer = new YEvent(this.player1)
        this.actor = new YEvent(this.player1)
        this.attackingCard = new YEvent(undefined)
        this.defendingCard = new YEvent(undefined)
    }
 
    endDuel(winner: YPlayer) {
        ;(this.player1.player.FindFirstChild('showField.re') as RemoteEvent).FireClient(
            this.player1.player,
            false
        )
        ;(this.player2.player.FindFirstChild('showField.re') as RemoteEvent).FireClient(
            this.player2.player,
            false
        )
        Duels.delete(`${this.player1.player.Name}|${this.player2.player.Name}`)
    }

    opponent(player: YPlayer) {
        return player === this.player1 ? this.player2 : this.player1
    }

    resolveChain() {
        if (this.chainResolving.get() === true) return
        this.chainResolving.set(true)
        //from highest key to lowest key
        for (let chainNumber = Object.keys(this.chain).size() - 1; chainNumber >= 0; chainNumber--) {
            const { card, effect, negated } = this.chain[chainNumber]
            if (!negated && card.effectsNegated.get() === false) {
                effect()
            }
            wait(3)
            card.chainLink.set(0)
            if (!includes(card.race.get(), 'Equip')) {
                card.targets.set([])
            }
        }

        // Remove non-continuous spell/trap cards from SZone, and reset activated
        Object.values(this.chain).forEach(({ card }) => {
            if (
                card.continuous.get() === true ||
                includes(card.race.get(), 'Continuous') ||
                includes(card.race.get(), 'Equip') ||
                includes(card.race.get(), 'Field')
            )
                return
            if (card.location.get().match('SZone').size() > 0) {
                card.ToGraveyard()
            }
            card.activated.set(false)
        })
        this.chain = {}
        this.gameState.set('OPEN')
        this.chainResolving.set(false)
        this.actor.set(this.turnPlayer.get())
        this.speedSpell.set(1)
        this.player1.targets.set([])
        this.player2.targets.set([])

        if (this.battleStep.get() === 'BATTLE' && this.attackingCard.get()) {
            if (this.attackingCard.get()?.attackNegated.get() === false) {
                //this.attackingCard.attack.Fire(this.defendingCard || this.opponent(turnPlayer))
            }
        }
        try {
            addCardFloodgate(this.attackingCard.get()!, {
                floodgateName: 'disableAttack',
                floodgateUid: `disableAttackAfterAttack-${this.attackingCard.get()}`,
                floodgateCause: 'Mechanic',
                floodgateFilter: {
                    uid: [this.attackingCard.get()!.uid]
                }
            })
        } catch {
            print('No attacking card')
        }
        this.attackingCard.set(undefined)
        this.defendingCard.set(undefined)
    }
    
    async prompt(p: YPlayer, msg: string) {
        p.promptMessage.set(msg)
        const res = new Promise<{
            endPrompt: () => void
            response: 'YES' | 'NO'
        }>((resolve) => {
            p.promptResponse.event.Wait()
            resolve({
                endPrompt: () => (p.promptResponse.set('')),
                response: p.promptResponse.get() as 'YES' | 'NO'
            })
        })
        return res
    }

    async handleResponses(p: YPlayer) {
        if (this.handlingResponses.get()) return
        this.speedSpell.set(2)
        this.gameState.set('CLOSED')
        this.handlingResponses.set(true)
        let passes = 0
        this.actor.set(p)

        while (passes < 2) {
            const numberOfResponses = this.responses[this.actor.get().name].size()
            const lastCardInChain = this.chain[Object.keys(this.chain).size() - 1]
            const chainStartMessage = `You have ${numberOfResponses} card/effect${
                numberOfResponses > 1 ? 's' : ''
            } that can be activated. Activate?`
            const chainResponseMessage = `"${
                lastCardInChain ? lastCardInChain.card.name : '?'
            }" is activated. Chain another card or effect?`

            if (numberOfResponses > 0) {
                const { endPrompt, response } = await this.prompt(
                    this.actor.get(),
                    numberOfResponses >= 1
                        ? chainStartMessage
                        : chainResponseMessage || chainStartMessage
                )
                endPrompt()

                if (response === 'YES') {
                    passes = 0
                    this.actor.get().action.event.Wait()
                    await Promise.delay(0.15)
                } else if (response === 'NO') {
                    passes++
                }
            } else {
                passes++
            }

            //clearAction(this.opponent(actor.player))
            if (passes < 2) {
                this.actor.set(this.opponent(this.actor.get()))
            } else if (passes === 2) {
                this.actor.set(this.turnPlayer.get())
            }
        }
        this.handlingResponses.set(false)
        this.resolveChain()
    }

    async handlePhases(p: Phase) {
        print(1)
        this.gameState.set('OPEN')
        print(2)
        if (p === 'DP') {
            print(3)
            this.turn.set(this.turn.get() + 1)
            print(4)
            const cardsInSZone = getFilteredCards(this, {
                location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5']
            })
            print(5)
            cardsInSZone.forEach((card) => {
                card.canActivate.set(true)
            })
            print(6)
            const cardsInHand = getFilteredCards(this, {
                location: ['Hand']
            })
            print(7)
            cardsInHand.forEach((card) => {
                card.canActivate.set(true)
            }) 
            print(8)
            const cardsInMZone = getFilteredCards(this, {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5']
            })
            print(9)
            for (const card of cardsInMZone) {
                removeCardFloodgate(card, `disableAttackAfterAttack-${card.uid}`)
                removeCardFloodgate(card, `disableChangePositionAfterPlacement-${card.uid}`)
                removeCardFloodgate(card, `disableChangePositionAfterAttack-${card.uid}`)
            }
            print(10)
            if (this.turn.get() >= 2) {
                this.turnPlayer.set(this.opponent(this.turnPlayer.get()))
                this.actor.set(this.turnPlayer.get())
            }
            print(11)
            this.phase.set(p)
            print(12)
            await Promise.delay(0.15)
            print(13)
            this.turnPlayer.get().canNormalSummon.set(true)
            if (this.turn.get() === 1) {
                const thread = [this.player1, this.player2].map((player) =>
                    coroutine.wrap(() => {
                        player.shuffle()
                        wait(player.cards.get().size() * 0.03)
                        player.draw(5)
                    })
                )
                thread[0]()
                thread[1]()
                await Promise.delay(0.25 * 5)
            }
            print(14)
            this.turnPlayer.get().draw(1)
            print(15)
            await this.handleResponses(this.turnPlayer.get()) //1
            print(16)
            await this.handlePhases('SP')
            print(17)
        } else if (p === 'SP') {
            this.phase.set(p)
            await Promise.delay(0.15)
            await this.handleResponses(this.turnPlayer.get())
            await this.handlePhases('MP1')
        } else if (p === 'MP1') {
            this.phase.set(p)
            await Promise.delay(0.15)
        } else if (p === 'BP') {
            this.phase.set(p)
            await Promise.delay(0.15)
            this.battleStep.set('START')
            await this.handleResponses(this.turnPlayer.get())
            this.battleStep.set('BATTLE')
        } else if (p === 'MP2') {
            this.phase.set(p)
            await Promise.delay(0.15)
        } else if (p === 'EP') {
            if (this.phase.get() === 'MP1' || this.phase.get() === 'MP2') {
                this.phase.set(p)
                await Promise.delay(0.15)
                await this.handleResponses(this.turnPlayer.get())
                await this.handlePhases('DP')
            } else if (this.phase.get() === 'BP') {
                await this.handleResponses(this.turnPlayer.get())
                await this.handlePhases('MP2')
            }
        }
    }
}

export const getCards = (duel: Duel) => {
    const cards1 = duel.player1.cards.get()
    const cards2 = duel.player2.cards.get()
    return [...cards1, ...cards2]
}