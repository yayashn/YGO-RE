import { createInstance, instance } from 'shared/utils'
import { ServerScriptService } from '@rbxts/services'
import { getEmptyFieldZones, getFilteredCards, getOpponent } from '../utils'
import cardEffects, { CardEffect } from 'server-storage/card-effects/index'
import Object from '@rbxts/object-utils'
import { DuelFolder, PlayerValue, GameStateValue, ActorValue, CardFolder, ChainedEffect, ResponseValue, CardInventory, Phase, ControllerValue, LocationValue, PositionValue, MZone, SZone, Zone, BattleStepValue, PhaseValue, DamageStepValue } from '../types'
import { Card } from './Card'

const duels = ServerScriptService.FindFirstChild('instances')!.FindFirstChild('duels') as Folder
const replicatedStorage = game.GetService('ReplicatedStorage')

export const Duel = (p1: Player, p2: Player) => {
    const folder = createInstance<DuelFolder>('Folder', `${p1.Name}|${p2.Name}`, duels);
    const turn = createInstance<IntValue>('IntValue', 'turn', folder);
    const phase = createInstance<PhaseValue>('StringValue', 'phase', folder);
    const battleStep = createInstance<BattleStepValue>('StringValue', 'battleStep', folder);
    const damageStep = createInstance<DamageStepValue>('StringValue', 'damageStep', folder);
    const turnPlayer = createInstance<ControllerValue>('ObjectValue', 'turnPlayer', folder);
    const player1 = createInstance<PlayerValue>('ObjectValue', 'player1', folder);
    const player2 = createInstance<PlayerValue>('ObjectValue', 'player2', folder);
    const opponent = (player: PlayerValue) => (player.Value === p1 ? player2 : player1);
    const gameState = createInstance<GameStateValue>('StringValue', 'gameState', folder);
    const chainResolving = createInstance<BoolValue>('BoolValue', 'chainResolving', folder);
    const actor = createInstance<ControllerValue>('ObjectValue', 'actor', folder);

    player1.Value = p1
    player2.Value = p2
    turn.Value = 0
    turnPlayer.Value = player1
    actor.Value = player1
    phase.Value = 'DP'
    gameState.Value = "OPEN"

    let chain: Record<number, ChainedEffect> = {}

    const responses: Record<"player1" | "player2", CardFolder[]> = {
        "player1": [],
        "player2": []
    }

    const addToChain = (card: CardFolder, effect: Callback) => {
        gameState.Value = "CLOSED"
        card.activated.Value = true
        chain[Object.keys(chain).size()] = {
            card,
            effect,
            negated: false
        }
        handleResponses(opponent(card.controller.Value))
    }
    (instance('BindableEvent', 'addToChain', folder) as BindableEvent).Event.Connect((card, effect) => addToChain(card as CardFolder, effect as Callback))

    const resolveChain = async () => {
        if(chainResolving.Value === true) return
        chainResolving.Value = true
        //from highest key to lowest key
        for(let chainNumber = Object.keys(chain).size() - 1; chainNumber >= 0; chainNumber--) {
            const { card, effect, negated } = chain[chainNumber]
            if(!negated && card.effectsNegated.Value === false) {
                effect()
                await Promise.delay(3)
            }
        }

        // Remove non-continuous spell/trap cards from SZone, and reset activated
        Object.values(chain).forEach(({card}) => {
            if(card.location.Value.match("SZone").size() > 0) {
                card.toGraveyard.Fire()
            }
            card.activated.Value = false
        })
        chain = {}
        gameState.Value = "OPEN"
        chainResolving.Value = false
        actor.Value = turnPlayer.Value
    }

    const prompt = async (p: PlayerValue, msg: string) => {
        p.promptMessage.Value = msg
        const res = new Promise<{
            endPrompt: () => void
            response: "YES" | "NO"
        }>((resolve) => {
            p.promptResponse.Changed.Wait()
            resolve({
                endPrompt: () => p.promptMessage.Value = "",
                response: p.promptResponse.Value as "YES" | "NO"
            })
        })
        return res
    }

    const handleResponses = async (p: PlayerValue) => {
        let passes = 0
        actor.Value = p
        while(passes !== 2) {
            const numberOfResponses = responses[actor.Value.Name].size();
            const lastCardInChain = chain[Object.keys(chain).size() - 1];
            const chainStartMessage = `You have ${numberOfResponses} card/effect${numberOfResponses > 1 ? "s" : ""} that can be activated. Activate?`;
            const chainResponseMessage = `"${lastCardInChain.card.Name}" is activated. Chain another card or effect?`;

            if (numberOfResponses > 0) {
                const { endPrompt, response } = await prompt(actor.Value, numberOfResponses > 1 ? chainStartMessage : chainResponseMessage)
                endPrompt()
                if (response === "YES") {
                    passes = 0;
                    actor.Value.action.Event.Wait()
                } else if (response === "NO") {
                    passes++;
                }
            } else {
                passes++;
            }
            actor.Value = opponent(actor.Value)
        }

        resolveChain()
    };
    


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
            const handleCardResponse = instance('BindableEvent', 'handleCardResponse', player) as BindableEvent
            const promptMessage = instance('StringValue', 'promptMessage', player) as StringValue
            const promptResponse = instance('StringValue', 'promptResponse', player) as ResponseValue
            const action = instance('BindableEvent', 'action', player) as BindableEvent

            selectableZones.Value = `[]`

            canNormalSummon.Value = true

            lifePoints.Value = 8000

            const handleCardResponseF = (card: CardFolder) => {
                const isInResponses = responses[player.Name].find((c) => c === card as CardFolder)
                const conditionMet = (card as CardFolder).checkEffectConditions.Invoke()
                if(conditionMet) {
                    if(!isInResponses) {
                        responses[player.Name].push(card as CardFolder)  
                    }
                } else {
                    if(isInResponses) {
                        responses[player.Name] = responses[player.Name].filter((c) => c.uid !== card.uid)
                    }
                }
            }
            handleCardResponse.Event.Connect(handleCardResponseF)

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
            ;(instance('BindableEvent', 'draw', player) as BindableEvent).Event.Connect(draw)

            ;(instance('BindableEvent', 'updateLP', player) as BindableEvent).Event.Connect(
                (lp: number) => {
                    lifePoints.Value += lp
                }
            )
        })
    )
    thread[0]()
    thread[1]()

    const handlePhases = async (p: Phase) => {
        gameState.Value = "OPEN"
        if (p === 'DP') {
            const cardsWithLockedPosition = getFilteredCards(folder, {
                location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
                canChangePosition: [false]
            })

            for (const card of cardsWithLockedPosition) {
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
                        player.shuffle.Fire(5)
                        wait(player.cards.GetChildren().size() * 0.03)
                        player.draw.Fire(5)
                    })
                )
                thread[0]()
                thread[1]()
            }
            wait(1)
            turnPlayer.Value.draw.Fire(1)
            //await handleResponses(turnPlayer.Value)
            handlePhases('SP')
        } else if (p === 'SP') {
            phase.Value = p
            wait(1)
            //await handleResponses(turnPlayer.Value)
            handlePhases('MP1')
        } else if (p === 'MP1') {
            phase.Value = p
        } else if (p === 'BP') {
            phase.Value = p
            battleStep.Value = 'START'
            wait(1)
            //await handleResponses(turnPlayer.Value)
            battleStep.Value = 'BATTLE'
            wait(1)
            //handleResponses(turnPlayer.Value)
        } else if (p === 'MP2') {
            phase.Value = p
        } else if (p === 'EP') {
            if (phase.Value === 'MP1' || phase.Value === 'MP2') {
                phase.Value = p
                wait(1)
                //await handleResponses(turnPlayer.Value)

                handlePhases('DP')
            } else if (phase.Value === 'BP') {
                handlePhases('MP2')
            }
        }
    }
    handlePhases('DP')
    ;(instance('BindableEvent', 'handlePhases', folder) as BindableEvent).Event.Connect(
        handlePhases
    )
}