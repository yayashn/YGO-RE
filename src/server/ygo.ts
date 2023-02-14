import { instance } from 'shared/utils'
import { ServerScriptService } from '@rbxts/services'
import { getFilteredCards } from './utils'

const duels = ServerScriptService.FindFirstChild('instances')!.FindFirstChild('duels') as Folder
const replicatedStorage = game.GetService('ReplicatedStorage')
const cards = replicatedStorage.WaitForChild('cards') as Folder
const httpService = game.GetService('HttpService')
const moveCard3D = replicatedStorage
    .FindFirstChild('remotes')!
    .FindFirstChild('moveCard3D.re') as RemoteEvent

export type Phase = 'DP' | 'SP' | 'MP1' | 'BP' | 'MP2' | 'EP'
interface PhaseValue extends StringValue {
    Value: Phase
}

export type BattleStep = 'START' | 'BATTLE' | 'DAMAGE' | 'END'
interface BattleStepValue extends StringValue {
    Value: BattleStep
}

export type DamageStep = 'START' | 'BEFORE' | 'DURING' | 'AFTER' | 'END'
interface DamageStepValue extends StringValue {
    Value: DamageStep
}

interface TypeValue extends StringValue {
    Value: 'Monster' | 'Spell' | 'Trap'
}

export type MZone = 'MZone1' | 'MZone2' | 'MZone3' | 'MZone4' | 'MZone5'
export type SZone = 'SZone1' | 'SZone2' | 'SZone3' | 'SZone4' | 'SZone5'
export type Zone = 'Deck' | 'Hand' | 'GZone' | 'BZone' | 'EZone' | 'FZone' | MZone | SZone

export interface LocationValue extends StringValue {
    Value: Zone
}

export type Position = 'FaceUpAttack' | 'FaceUpDefense' | 'FaceDownDefense' | 'FaceUp' | 'FaceDown'
export interface PositionValue extends StringValue {
    Value: Position
}

export interface DuelFolder extends Folder {
    turn: IntValue
    phase: PhaseValue
    battleStep: BattleStepValue
    damageStep: DamageStepValue
    mover: ObjectValue
    player1: PlayerValue
    player2: PlayerValue
    handlePhases: BindableEvent
    turnPlayer: ControllerValue
}

export interface CardInventory {
    name: string
}

export interface PlayerValue extends ObjectValue {
    cards: Folder
    Value: Player
    draw: BindableEvent
    shuffle: BindableEvent
    canAttack: BoolValue
    responseWindow: BoolValue
    selectableZones: StringValue
    selectedZone: StringValue
    targettableCards: StringValue
    canNormalSummon: BoolValue
    targets: StringValue
}

export const Duel = (p1: Player, p2: Player) => {
    const folder = instance('Folder', `${p1.Name}|${p2.Name}`, duels) as DuelFolder
    const turn = instance('IntValue', 'turn', folder) as IntValue
    const phase = instance('StringValue', 'phase', folder) as PhaseValue
    const battleStep = instance('StringValue', 'battleStep', folder) as BattleStepValue
    const damageStep = instance('StringValue', 'damageStep', folder) as DamageStepValue
    const turnPlayer = instance('ObjectValue', 'turnPlayer', folder) as unknown as {
        Value: PlayerValue
    }
    const mover = instance('ObjectValue', 'mover', folder) as PlayerValue
    const player1 = instance('ObjectValue', 'player1', folder) as PlayerValue
    const player2 = instance('ObjectValue', 'player2', folder) as PlayerValue
    const opponent = (player: PlayerValue) => (player.Value === p1 ? player2 : player1)

    player1.Value = p1
    player2.Value = p2
    turn.Value = 0
    mover.Value = p1
    turnPlayer.Value = player1
    phase.Value = 'DP'

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

            selectableZones.Value = `[]`

            canNormalSummon.Value = true

            lifePoints.Value = 8000

            let o = 0
            for (const card of (
                player.Value.WaitForChild('getCards') as BindableFunction
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
        })
    )
    thread[0]()
    thread[1]()

    const promptPlayer = (p: PlayerValue) => {
        return false
    }

    const handleResponseWindow = (p: PlayerValue) => {
        if (p.responseWindow.Value) {
            const pause = promptPlayer(p)
            if (pause) {
                while (p.responseWindow.Value) wait()
            } else {
                p.responseWindow.Value = false
            }
        }
    }

    const handlePhases = (p: Phase) => {
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
            handleResponseWindow(turnPlayer.Value)
            handleResponseWindow(opponent(turnPlayer.Value))
            handlePhases('SP')
        } else if (p === 'SP') {
            phase.Value = p
            wait(1)
            handleResponseWindow(turnPlayer.Value)
            handleResponseWindow(opponent(turnPlayer.Value))
            handlePhases('MP1')
        } else if (p === 'MP1') {
            phase.Value = p
        } else if (p === 'BP') {
            phase.Value = p
            battleStep.Value = 'START'
            wait(1)
            handleResponseWindow(turnPlayer.Value)
            handleResponseWindow(opponent(turnPlayer.Value))
            battleStep.Value = 'BATTLE'
            wait(1)
            handleResponseWindow(turnPlayer.Value)
            handleResponseWindow(opponent(turnPlayer.Value))
        } else if (p === 'MP2') {
            phase.Value = p
        } else if (p === 'EP') {
            if (phase.Value === 'MP1' || phase.Value === 'MP2') {
                phase.Value = p
                wait(1)
                handleResponseWindow(turnPlayer.Value)
                handleResponseWindow(opponent(turnPlayer.Value))
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

export interface CardFolder extends Folder {
    uid: StringValue
    art: ImageButton
    controller: ControllerValue
    type: TypeValue
    location: LocationValue
    owner: PlayerValue
    atk: NumberValue
    def: NumberValue
    order: IntValue
    position: PositionValue
    cardButton: ObjectValue
    attribute: StringValue
    desc: StringValue
    level: IntValue
    race: StringValue
    normalSummon: BindableEvent
    set: BindableEvent
    tribute: BindableEvent
    tributeSummon: BindableEvent
    destroy_: BindableEvent
    attack: BindableEvent
    targettable: BoolValue
    status: StringValue
    toGraveyard: BindableEvent
    flip: BindableEvent
    flipSummon: BindableEvent
    changePosition: BindableEvent
    canChangePosition: BoolValue
    canAttack: BoolValue
}

export interface ControllerValue extends ObjectValue {
    Value: PlayerValue
}

export const Card = (_name: string, _owner: PlayerValue, _order: number) => {
    const duel = _owner.FindFirstAncestorWhichIsA('Folder') as DuelFolder
    const players = [
        _owner,
        duel.FindFirstChild(_owner.Name === 'Player1' ? 'Player2' : 'Player1') as PlayerValue
    ]

    const cardDataFolder = cards.FindFirstChild(_name, true)
    const card = cardDataFolder!.Clone() as CardFolder
    card.art.Image = 'rbxassetid://3955072236'
    card.Name = _name
    card.Parent = _owner.cards
    const uid = instance('StringValue', 'uid', card) as StringValue
    const controller = instance('ObjectValue', 'controller', card) as ControllerValue
    const location = instance('StringValue', 'location', card) as LocationValue
    const order = instance('IntValue', 'order', card) as IntValue
    const position = instance('StringValue', 'position', card) as PositionValue
    instance('ObjectValue', 'cardButton', card) as ObjectValue
    instance('BoolValue', 'targettable', card) as BoolValue
    const status = instance('StringValue', 'status', card) as StringValue
    const canChangePosition = instance('BoolValue', 'canChangePosition', card) as BoolValue
    const canAttack = instance('BoolValue', 'canAttack', card) as BoolValue

    order.Value = _order
    controller.Value = _owner
    location.Value = 'Deck'
    position.Value = 'FaceUpAttack'
    uid.Value = httpService.GenerateGUID(false)
    canChangePosition.Value = true
    canAttack.Value = true

    const Summon = (_location: MZone) => {
        location.Value = _location
    }

    const NormalSummon = (_location: MZone) => {
        position.Value = 'FaceUpAttack'
        controller.Value.canNormalSummon.Value = false
        card.canChangePosition.Value = false
        Summon(_location)
    }
    ;(instance('BindableEvent', 'normalSummon', card) as BindableEvent).Event.Connect(NormalSummon)

    const Set = (_location: SZone | MZone) => {
        if (card.type.Value.match('Monster').size() > 0) {
            position.Value = 'FaceDownDefense'
            controller.Value.canNormalSummon.Value = false
        } else {
            position.Value = 'FaceDown'
        }
        location.Value = _location
    }
    ;(instance('BindableEvent', 'set', card) as BindableEvent).Event.Connect(Set)

    const toGraveyard = () => {
        controller.Value = _owner
        position.Value = 'FaceUp'
        location.Value = 'GZone'
    }
    ;(instance('BindableEvent', 'toGraveyard', card) as BindableEvent).Event.Connect(toGraveyard)

    const tribute = () => {
        toGraveyard()
    }
    ;(instance('BindableEvent', 'tribute', card) as BindableEvent).Event.Connect(tribute)

    const destroy = (cause: string) => {
        status.Value = `destroyedBy${cause}`
        print(card, `destroyed by ${cause}`)
    }
    ;(instance('BindableEvent', 'destroy_', card) as BindableEvent).Event.Connect((cause) =>
        destroy(cause)
    )

    const tributeSummon = (_location: MZone) => {
        NormalSummon(_location)
    }
    ;(instance('BindableEvent', 'tributeSummon', card) as BindableEvent).Event.Connect(
        tributeSummon
    )

    const changePosition = (pos: Position) => {
        position.Value = pos
    }
    ;(instance('BindableEvent', 'changePosition', card) as BindableEvent).Event.Connect(
        changePosition
    )

    const flip = () => {
        position.Value = 'FaceUpDefense'
    }
    ;(instance('BindableEvent', 'flip', card) as BindableEvent).Event.Connect(flip)

    const flipSummon = (_location: MZone) => {
        canChangePosition.Value = false
        position.Value = 'FaceUpAttack'
    }
    ;(instance('BindableEvent', 'flipSummon', card) as BindableEvent).Event.Connect(flipSummon)

    const attack = (defender: CardFolder) => {
        const defenderPosition = defender.position.Value
        print(card, defender)

        const startOfDamageStep = () => {
            print('start of damage step')
            canChangePosition.Value = false
            duel.battleStep.Value = 'DAMAGE'
            duel.damageStep.Value = 'START'
            //during damage step only effects
            //start of damage step effects
            //ATK/DEF change effects
            //check if players finished effects
            beforeDamageCalculation()
        }

        const beforeDamageCalculation = () => {
            print('before damage calculation')
            duel.damageStep.Value = 'BEFORE'
            if (defenderPosition === 'FaceDownDefense') {
                print('flip', defender)
                defender.flip.Fire()
            }
            //ATK/DEF change effects
            //before damage calculation effects
            //check if players finished effects
            if (defender.location.Value.match('MZone').size() === 0) {
                endOfDamageStep()
            } else {
                damageCalculation()
            }
        }

        const damageCalculation = () => {
            print('damage calculation')
            duel.damageStep.Value = 'DURING'
            //during damage calculation only effects immediately
            //during damage calculation effects
            if (defenderPosition === 'FaceUpAttack') {
                if (card.atk.Value > defender.atk.Value) {
                    defender.destroy_.Fire('Battle')
                    //inflict battle damage to opponent
                } else if (card.atk.Value < defender.atk.Value) {
                    destroy('Battle')
                    //inflict battle damage to player
                } else {
                    defender.destroy_.Fire('Battle')
                    destroy('Battle')
                }
            } else {
                if (card.atk.Value > defender.def.Value) {
                    defender.destroy_.Fire('Battle')
                } else if (card.atk.Value < defender.def.Value) {
                    //inflict battle damage to player
                }
            }
            afterDamageCalculation()
        }

        const afterDamageCalculation = () => {
            print('after damage calculation')
            duel.damageStep.Value = 'AFTER'
            //self destruction continuous effects immediately
            //after damage calculation effects
            //battle damage effects
            //flip effects
            endOfDamageStep()
        }

        const endOfDamageStep = () => {
            print('end of damage step')
            duel.damageStep.Value = 'END'
            if (defender.status.Value === 'destroyedByBattle') {
                defender.toGraveyard.Fire()
                defender.status.Value = ''
            }
            if (status.Value === 'destroyedByBattle') {
                toGraveyard()
                status.Value = ''
            }
            duel.battleStep.Value = 'BATTLE'
        }
        startOfDamageStep()
    }
    ;(instance('BindableEvent', 'attack', card) as BindableEvent).Event.Connect(attack)
}
