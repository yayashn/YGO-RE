import { FloodgatePlayer } from "server/functions/floodgates"
import { CardInventory } from "server/types"
import { Action } from "server/utils"
import { Card } from "./Card"
import type { Duel } from "./Duel"
import { YEvent } from "./Event"
import { includes } from "shared/utils"
import { Duels } from "./Duels"

export class YPlayer {
    player: Player
    targets = new YEvent<Card[]>([])
    name: "player1" | "player2"
    lifePoints = new YEvent(8000)
    cards = new YEvent<Card[]>([])
    responseWindow = new YEvent(false)
    selectableZones = new YEvent<(Vector3Value | {
        [x: string]: {
            opponent: boolean;
            player: boolean;
        };
    })[]>([])
    selectablePositions = new YEvent([])
    selectedZone = new YEvent('')
    selectedPosition = new YEvent('')
    selectedPositionCard = new YEvent('')
    targettableCards = new YEvent<Card[]>([])
    canNormalSummon = new YEvent(false)
    promptMessage = new YEvent('')
    promptResponse = new YEvent('')
    action = new YEvent<Action>({ action: "None" })
    summonedCards = new YEvent([])
    floodgates = new YEvent<FloodgatePlayer[]>([])
    selectPositionCard = new YEvent('')

    constructor(player: Player, name: "player1" | "player2") {
        this.player = player
        this.name = name

        this.lifePoints.event.Connect((newValue) => {
            if(newValue <= 0) {
                this.getDuel().endDuel(this.getDuel().opponent(this))
            }
        })

        this.action.event.Connect((encodedAction) => {
            if (includes(encodedAction.action, 'Activate')) return
            this.getDuel().handleResponses(this.getDuel().turnPlayer.get())
        })
    }
    
    initCards() {
        let o = 0
        for (const card of (this.player.WaitForChild('getDeck') as BindableFunction).Invoke()
            .deck) {
            this.cards.set([...this.cards.get(), new Card((card as CardInventory).name, this, o)])
            o++
        }

        for (const card of (this.player.WaitForChild('getDeck') as BindableFunction).Invoke()
            .extra) {
            this.cards.set([...this.cards.get(), new Card((card as CardInventory).name, this, o, true)])
        }        
    }

    getDuel(): Duel {
        for (const [d, duel] of Duels) {
            if (string.match(d, `|${this.player.Name}`) || string.match(d, `${this.player.Name}|`)) {
                return duel
            }
        }
        return {} as Duel
    }

    updateLP(value: number) {
        this.lifePoints.set(this.lifePoints.get() + value)
    }

    handleCardResponses(card: Card) {
        const isInResponses = this.getDuel().responses[this.name].find((c) => c === card)
        const conditionMet = card.checkEffectConditions()
        if (conditionMet) {
            if (!isInResponses) {
                this.getDuel().responses[this.name].push(card)
            }
        } else {
            if (isInResponses) {
                this.getDuel().responses[this.name] = this.getDuel().responses[this.name].filter(
                    (c) => c.uid !== card.uid
                )
            }
        }
    }

    shuffle() {
        const deck = this.cards.get().filter(
            (card) => card.location.get() === 'Deck'
        )
        for (let i = deck.size() - 1; i > 0; i--) {
            const ran = new Random().NextNumber()
            const j = math.floor(ran * (i + 1))
            ;[deck[i], deck[j]] = [deck[j], deck[i]]
        }
        for (let i = 0; i < deck.size(); i++) {
            deck[i].order.set(i)
        }
    }

    draw(n: number) {
        for (let i = 0; i < n; i++) {
            let deck = this.cards.get().filter(
                (card) => card.location.get() === 'Deck'
            )
            const topCard = deck.find((card) => card.order.get() === 0)
            if (!topCard) {
                this.getDuel().endDuel(this.getDuel().opponent(this))
                return
            }
            topCard.location.set('Hand')
            if (!topCard.cardButton.Value) {
                while (!topCard.cardButton.Value) wait()
            }
            deck = this.cards.get().filter(
                (card) => card.location.get() === 'Deck'
            )
            deck.forEach((_, x) => {
                deck[x].order.set(deck[x].order.get() - 1)
            })
            wait(0.3)
        }
    }
}