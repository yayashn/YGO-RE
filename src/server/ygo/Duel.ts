import { createInstance, includes, instance } from 'shared/utils'
import { ServerScriptService } from '@rbxts/services'
import { getEmptyFieldZones, getFilteredCards, getOpponent } from '../utils'
import cardEffects, { CardEffect } from 'server-storage/card-effects/index'
import Object from '@rbxts/object-utils'
import {
    DuelFolder,
    PlayerValue,
    GameStateValue,
    ActorValue,
    CardFolder,
    ChainedEffect,
    ResponseValue,
    CardInventory,
    Phase,
    ControllerValue,
    LocationValue,
    PositionValue,
    MZone,
    SZone,
    Zone,
    BattleStepValue,
    PhaseValue,
    DamageStepValue,
    CardValue
} from '../types'
import { Card } from './Card'
import changedOnce from 'shared/lib/changedOnce'

const duels = ServerScriptService.FindFirstChild('instances')!.FindFirstChild('duels') as Folder
const replicatedStorage = game.GetService('ReplicatedStorage')

export const Duel = (p1: Player, p2: Player) => {
    const folder = createInstance('Folder', `${p1.Name}|${p2.Name}`, duels) as DuelFolder
    const turn = createInstance('IntValue', 'turn', folder)
    const phase = createInstance('StringValue', 'phase', folder) as PhaseValue
    const battleStep = createInstance('StringValue', 'battleStep', folder) as BattleStepValue
    const damageStep = createInstance('StringValue', 'damageStep', folder) as DamageStepValue
    const turnPlayer = createInstance('ObjectValue', 'turnPlayer', folder) as ControllerValue
    const player1 = createInstance('ObjectValue', 'player1', folder) as PlayerValue
    const player2 = createInstance('ObjectValue', 'player2', folder) as PlayerValue
    const opponent = (player: PlayerValue) => (player.Value === p1 ? player2 : player1)
    const gameState = createInstance('StringValue', 'gameState', folder) as GameStateValue
    const chainResolving = createInstance('BoolValue', 'chainResolving', folder)
    const actor = createInstance('ObjectValue', 'actor', folder) as ControllerValue
    const attackingCard = createInstance('ObjectValue', 'attackingCard', folder) as CardValue
    const defendingCard = createInstance('ObjectValue', 'defendingCard', folder) as CardValue
    const speedSpell = createInstance('IntValue', 'speedSpell', folder)
    speedSpell.Value = 1

    player1.Value = p1
    player2.Value = p2
    turn.Value = 0
    turnPlayer.Value = player1
    actor.Value = player1
    phase.Value = 'DP'
    gameState.Value = 'OPEN'

    let chain: Record<number, ChainedEffect> = {}

    const responses: Record<'player1' | 'player2', CardFolder[]> = {
        player1: [],
        player2: []
    }

    const addToChain = (card: CardFolder, effect: Callback) => {
        gameState.Value = 'CLOSED'
        card.activated.Value = true
        chain[Object.keys(chain).size()] = {
            card,
            effect,
            negated: false
        }
        handleResponses(opponent(card.controller.Value))
    }
    ;(instance('BindableEvent', 'addToChain', folder) as BindableEvent).Event.Connect(
        (card, effect) => {
            addToChain(card as CardFolder, effect as Callback)
        }
    )

    const resolveChain = async () => {
        if (chainResolving.Value === true) return
        chainResolving.Value = true
        //from highest key to lowest key
        for (let chainNumber = Object.keys(chain).size() - 1; chainNumber >= 0; chainNumber--) {
            const { card, effect, negated } = chain[chainNumber]
            if (!negated && card.effectsNegated.Value === false) {
                effect()
                await Promise.delay(3)
            }
        }

        // Remove non-continuous spell/trap cards from SZone, and reset activated
        Object.values(chain).forEach(({ card }) => {
            if (card.location.Value.match('SZone').size() > 0) {
                card.toGraveyard.Fire()
            }
            card.activated.Value = false
        })
        chain = {}
        gameState.Value = 'OPEN'
        chainResolving.Value = false
        actor.Value = turnPlayer.Value
        speedSpell.Value = 1
        
        if(battleStep.Value === "BATTLE" && attackingCard.Value) {
            if(attackingCard.Value.attackNegated.Value === false) {
                attackingCard.Value.attack.Fire(defendingCard.Value || opponent(turnPlayer.Value))
            }
        }
        try {
            attackingCard.Value!.canAttack.Value = false
        } catch {
            print("No attacking card")
        }
        attackingCard.Value = undefined
        defendingCard.Value = undefined
    }

    const prompt = async (p: PlayerValue, msg: string) => {
        p.promptMessage.Value = msg
        const res = new Promise<{
            endPrompt: () => void
            response: 'YES' | 'NO'
        }>((resolve) => {
            p.promptResponse.Changed.Wait()
            resolve({
                endPrompt: () => (p.promptResponse.Value = ''),
                response: p.promptResponse.Value as 'YES' | 'NO'
            })
        })
        return res
    }

    let handlingResponses = false
    const handleResponses = async (p: PlayerValue) => {
        if(handlingResponses) return
        speedSpell.Value = 2
        handlingResponses = true
        gameState.Value = 'CLOSED'
        let passes = 0
        actor.Value = p

        while (passes < 2) {
            const numberOfResponses = responses[actor.Value.Name].size()
            const lastCardInChain = chain[Object.keys(chain).size() - 1]
            const chainStartMessage = `You have ${numberOfResponses} card/effect${
                numberOfResponses > 1 ? 's' : ''
            } that can be activated. Activate?`
            const chainResponseMessage = `"${
                lastCardInChain ? lastCardInChain.card.Name : '?'
            }" is activated. Chain another card or effect?`

            if (numberOfResponses > 0) {
                const { endPrompt, response } = await prompt(
                    actor.Value,
                    numberOfResponses >= 1
                        ? chainStartMessage
                        : chainResponseMessage || chainStartMessage
                )
                endPrompt()

                if (response === 'YES') {
                    passes = 0
                    await changedOnce(actor.Value.action.Event)
                    await Promise.delay(.25)
                } else if (response === 'NO') {
                    passes++
                }
            } else {
                passes++
            }

            if(passes < 2) {
                actor.Value = opponent(actor.Value)
            }
        }
        handlingResponses = false
        await resolveChain()
    }
    createInstance('BindableFunction', 'handleResponses', folder).OnInvoke = handleResponses

    const thread = [player1, player2].map((player) =>
        coroutine.wrap(() => {
            const lifePoints = instance('NumberValue', 'lifePoints', player) as NumberValue
            const cards = instance('Folder', 'cards', player) as Folder
            const responseWindow = instance('BoolValue', 'responseWindow', player) as BoolValue
            const canAttack = instance('BoolValue', 'canAttack', player) as BoolValue
            const selectableZones = instance(
                'StringValue',
                'selectableZones',
                player
            ) as StringValue
            const selectedZone = instance('StringValue', 'selectedZone', player) as StringValue
            const targettableCards = instance(
                'StringValue',
                'targettableCards',
                player
            ) as StringValue
            const targets = instance('StringValue', 'targets', player) as StringValue
            const canNormalSummon = instance('BoolValue', 'canNormalSummon', player) as BoolValue
            const handleCardResponse = instance(
                'BindableEvent',
                'handleCardResponse',
                player
            ) as BindableEvent
            const promptMessage = instance('StringValue', 'promptMessage', player) as StringValue
            const promptResponse = instance(
                'StringValue',
                'promptResponse',
                player
            ) as ResponseValue
            const action = instance('BindableEvent', 'action', player) as BindableEvent<(actionName: string, card: CardFolder) => void>

            selectableZones.Value = `[]`

            canNormalSummon.Value = true

            lifePoints.Value = 8000

            canAttack.Value = false

            const handleCardResponseF = (card: CardFolder) => {
                const isInResponses = responses[player.Name].find((c) => c === (card as CardFolder))
                const conditionMet = (card as CardFolder).checkEffectConditions.Invoke()
                if (conditionMet) {
                    if (!isInResponses) {
                        responses[player.Name].push(card as CardFolder)
                    }
                } else {
                    if (isInResponses) {
                        responses[player.Name] = responses[player.Name].filter(
                            (c) => c.uid !== card.uid
                        )
                    }
                }
            }
            handleCardResponse.Event.Connect(handleCardResponseF)
            action.Event.Connect((actionName, card) => {
                if(includes(actionName, "Activate")) return;
                handleResponses(turnPlayer.Value)
            });
            
            let o = 0
            for (const card of (
                player.Value.WaitForChild('getDeck') as BindableFunction
            ).Invoke()) {
                Card((card as CardInventory).name, player, o)
                o++
            }

            const shuffle = () => {
                const deck = (cards.GetChildren() as CardFolder[]).filter(
                    (card) => card.location.Value === 'Deck'
                )
                for (let i = deck.size() - 1; i > 0; i--) {
                    const ran = new Random().NextNumber()
                    const j = math.floor(ran * (i + 1))
                    ;[deck[i], deck[j]] = [deck[j], deck[i]]
                }
                for (let i = 0; i < deck.size(); i++) {
                    deck[i].order.Value = i
                }
            }
            ;(instance('BindableEvent', 'shuffle', player) as BindableEvent).Event.Connect(shuffle)

            const draw = (n: number) => {
                for (let i = 0; i < n; i++) {
                    let deck = (cards.GetChildren() as CardFolder[]).filter(
                        (card) => card.location.Value === 'Deck'
                    )
                    const topCard = deck.find((card) => card.order.Value === 0)!
                    topCard.location.Value = 'Hand'
                    if (!topCard.cardButton.Value) {
                        while (!topCard.cardButton.Value) wait()
                    }
                    deck = (cards.GetChildren() as CardFolder[]).filter(
                        (card) => card.location.Value === 'Deck'
                    )
                    deck.forEach((_, x) => {
                        deck[x].order.Value -= 1
                    })
                    wait(0.3)
                }
            }
            createInstance('BindableFunction', 'draw', player).OnInvoke = draw
            createInstance('BindableEvent', 'updateLP', player).Event.Connect((lp: number) => {
                lifePoints.Value += lp
            })
        })
    )
    thread[0]()
    thread[1]()

    const handlePhases = async (p: Phase) => {
        await Promise.delay(0.15)
        gameState.Value = 'OPEN'
        if (turn.Value > 1) {
            turnPlayer.Value.canAttack.Value = true
        }
        if (p === 'DP') {
            const cardsInSZone = getFilteredCards(folder, {
                location: ['SZone1', 'SZone2', 'SZone3', 'SZone4', 'SZone5'],
            })
            cardsInSZone.forEach((card) => {
                card.canActivate.Value = true
            })
            
            const cardsInHand = getFilteredCards(folder, {
                location: ['Hand'],
            })
            cardsInHand.forEach((card) => {
                card.canActivate.Value = true
            })

            const cardsInMZone = getFilteredCards(folder, {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                canChangePosition: [false]
            })
            for (const card of cardsInMZone) {
                card.canChangePosition.Value = true
                card.canAttack.Value = true
            }

            turn.Value++
            if (turn.Value >= 2) {
                turnPlayer.Value = opponent(turnPlayer.Value)
                actor.Value = turnPlayer.Value
                turnPlayer.Value.canAttack.Value = true
            }
            phase.Value = p
            turnPlayer.Value.canNormalSummon.Value = true
            if (turn.Value === 1) {
                const thread = [player1, player2].map((player) =>
                    coroutine.wrap(() => {
                        player.shuffle.Fire()
                        wait(player.cards.GetChildren().size() * 0.03)
                        player.draw.Invoke(5)
                    })
                )
                thread[0]()
                thread[1]()
                await Promise.delay(.25*5)
                print('drew 5')
            } 
            turnPlayer.Value.draw.Invoke(1)
            await handleResponses(turnPlayer.Value)
            await handlePhases('SP')
        } else if (p === 'SP') {
            phase.Value = p
            await handleResponses(turnPlayer.Value)
            await handlePhases('MP1')
        } else if (p === 'MP1') {
            phase.Value = p
        } else if (p === 'BP') {
            phase.Value = p
            await handleResponses(turnPlayer.Value)
            battleStep.Value = 'START'
            await handleResponses(turnPlayer.Value)
            battleStep.Value = 'BATTLE'
        } else if (p === 'MP2') {
            phase.Value = p
        } else if (p === 'EP') {
            if (phase.Value === 'MP1' || phase.Value === 'MP2') {
                phase.Value = p
                await handleResponses(turnPlayer.Value)
                await handlePhases('DP')
            } else if (phase.Value === 'BP') {
                await handleResponses(turnPlayer.Value)
                await handlePhases('MP2')
            }
        }
    }
    ;(async () => {
        await handlePhases('DP')
    })()
    ;(instance('BindableEvent', 'handlePhases', folder) as BindableEvent).Event.Connect(
        handlePhases
    )
}
