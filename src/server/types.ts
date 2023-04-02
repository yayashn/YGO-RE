export type Phase = 'DP' | 'SP' | 'MP1' | 'BP' | 'MP2' | 'EP'
export interface PhaseValue extends StringValue {
    Value: Phase
}

export type BattleStep = 'START' | 'BATTLE' | 'DAMAGE' | 'END'
export interface BattleStepValue extends StringValue {
    Value: BattleStep
}

export type DamageStep = 'START' | 'BEFORE' | 'DURING' | 'AFTER' | 'END'
export interface DamageStepValue extends StringValue {
    Value: DamageStep
}

export interface TypeValue extends StringValue {
    Value: 'Monster Card' | 'Spell Card' | 'Trap Card'
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

export interface GameStateValue extends StringValue {
    Value: "OPEN" | "CLOSED"
}

export interface ActorValue extends ObjectValue {
    Value: PlayerValue
}

export interface CardValue extends ObjectValue {
    Value: CardFolder | undefined
}

export interface DuelFolder extends Folder {
    turn: IntValue
    phase: PhaseValue
    battleStep: BattleStepValue
    damageStep: DamageStepValue
    player1: PlayerValue
    player2: PlayerValue
    handlePhases: BindableEvent
    turnPlayer: ControllerValue
    addToChain: BindableEvent<(card: CardFolder, effect: Callback) => void>
    gameState: GameStateValue
    chainResolving: BoolValue
    actor: ControllerValue
    handleResponses: BindableFunction<(p: PlayerValue) => Promise<void>>
    speedSpell: IntValue
    attackingCard: CardValue
    defendingCard: CardValue
}

export interface CardInventory {
    name: string
}

export interface ResponseValue extends StringValue {
    Value: "YES" | "NO" | ""
}

export interface PlayerValue extends ObjectValue {
    Name: 'player1' | 'player2'
    cards: Folder
    Value: Player
    draw: BindableFunction<(n: number) => void>
    shuffle: BindableEvent<() => void>
    canAttack: BoolValue
    responseWindow: BoolValue
    selectableZones: StringValue
    selectedZone: StringValue
    targettableCards: StringValue
    canNormalSummon: BoolValue
    targets: StringValue
    lifePoints: NumberValue
    updateLP: BindableEvent
    handleCardResponse: BindableEvent
    prompt: BindableFunction
    promptMessage: StringValue
    promptResponse: ResponseValue
    action: BindableEvent<(actionName: string, card: CardFolder) => void>
}

export interface ControllerValue extends ObjectValue {
    Value: PlayerValue
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
    tributeSet: BindableEvent
    destroy_: BindableEvent
    attack: BindableEvent<(card: CardFolder | PlayerValue) => void>
    targettable: BoolValue
    status: StringValue
    toGraveyard: BindableEvent
    flip: BindableEvent
    flipSummon: BindableEvent
    changePosition: BindableEvent
    canChangePosition: BoolValue
    canAttack: BoolValue
    activateEffect: BindableFunction
    checkEffectConditions: BindableFunction
    effectsNegated: BoolValue
    activated: BoolValue
    canActivate: BoolValue
    attackNegated: BoolValue
}


export type ChainedEffect = {
    effect: Callback,
    negated: boolean,
    card: CardFolder
}