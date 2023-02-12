import { instance } from "shared/utils";
import { ServerScriptService } from "@rbxts/services";
import { getCards } from "./utils";

const duels = ServerScriptService.FindFirstChild("instances")!.FindFirstChild("duels") as Folder
const replicatedStorage = game.GetService("ReplicatedStorage")
const cards = replicatedStorage.WaitForChild("cards") as Folder
const httpService = game.GetService("HttpService")

export type Phase = "DP" | "SP" | "MP1" | "BP" | "MP2" | "EP";
interface PhaseValue extends StringValue {
    Value: Phase;
}

interface TypeValue extends StringValue {
    Value: "Monster" | "Spell" | "Trap";   
}

export type MZone = "MZone1" | "MZone2" | "MZone3" | "MZone4" | "MZone5"
export type SZone = "SZone1" | "SZone2" | "SZone3" | "SZone4" | "SZone5"
export type Zone = "Deck" | "Hand" | "GZone" | "BZone" | "EZone" | "FZone" 
| MZone 
| SZone

export interface LocationValue extends StringValue {
    Value: Zone
}

export type Position = "FaceUpAttack" | "FaceUpDefense" | "FaceDownDefense" | "FaceUp" | "FaceDown";
export interface PositionValue extends StringValue {
    Value: Position
}

export interface DuelFolder extends Folder {
    turn: IntValue;
    phase: PhaseValue;
    mover: ObjectValue;
    player1: PlayerValue;
    player2: PlayerValue;
    handlePhases: BindableEvent;
    turnPlayer: ControllerValue;
}

export interface CardInventory {
    name: string;
}

export interface PlayerValue extends ObjectValue {
    cards: Folder;
    Value: Player;
    draw: BindableEvent;
    shuffle: BindableEvent;
    canAttack: BoolValue;
    responseWindow: BoolValue;
    selectableZones: StringValue;
    selectedZone: StringValue;
    targettableCards: StringValue;
    canNormalSummon: BoolValue;
    targets: StringValue;
}

export const Duel = (p1: Player, p2: Player) => {
    const folder = instance("Folder", `${p1.Name}|${p2.Name}`, duels) as DuelFolder;
    const turn = instance("IntValue", "turn", folder) as IntValue;
    const phase = instance("StringValue", "phase", folder) as PhaseValue;
    const turnPlayer = instance("ObjectValue", "turnPlayer", folder) as unknown as {Value: PlayerValue};
    const mover = instance("ObjectValue", "mover", folder) as PlayerValue;
    const player1 = instance("ObjectValue", "player1", folder) as PlayerValue;
    const player2 = instance("ObjectValue", "player2", folder) as PlayerValue;
    const opponent = (player: PlayerValue) => player.Value === p1 ? player2 : player1;

    player1.Value = p1;
    player2.Value = p2;
    turn.Value = 0;
    mover.Value = p1;
    turnPlayer.Value = player1;
    phase.Value = "DP";

    const thread = [player1, player2].map((player) => coroutine.wrap(() => {
        const lifePoints = instance("NumberValue", "lifePoints", player) as NumberValue;
        const cards = instance("Folder", "cards", player) as Folder;
        const responseWindow = instance("BoolValue", "responseWindow", player) as BoolValue;
        const canAttack = instance("BoolValue", "canAttack", player) as BoolValue;
        const selectableZones = instance("StringValue", "selectableZones", player) as StringValue;
        const selectedZone = instance("StringValue", "selectedZone", player) as StringValue;
        const targettableCards = instance("StringValue", "targettableCards", player) as StringValue;
        const targets = instance("StringValue", "targets", player) as StringValue;
        const canNormalSummon = instance("BoolValue", "canNormalSummon", player) as BoolValue;

        targettableCards.Value = `{}`
        targets.Value = `[]`
        selectableZones.Value = `[]`

        canNormalSummon.Value = true;

        lifePoints.Value = 8000;

        let o = 0;
        for(const card of getCards(player.Value)!) {
            Card((card as CardInventory).name, player, o)
            o++;
        }

        const shuffle = () => {
            const deck = (cards.GetChildren() as CardFolder[]).filter((card) => card.location.Value === "Deck");
            for (let i = deck.size() - 1; i > 0; i--) {
                const ran = new Random().NextNumber();
                const j = math.floor(ran * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            for (let i = 0; i < deck.size(); i++) {
                deck[i].order.Value = i;
            }
        }
        (instance("BindableEvent", "shuffle", player) as BindableEvent).Event.Connect(shuffle)

        const draw = (n: number) => {
            for(let i = 0; i < n; i++) {
                let deck = (cards.GetChildren() as CardFolder[]).filter((card) => card.location.Value === "Deck");
                const topCard = deck.find((card) => card.order.Value === 0)!;
                topCard.location.Value = "Hand";
                if(!topCard.cardButton.Value) {
                    while (!topCard.cardButton.Value) wait();
                }
                deck = (cards.GetChildren() as CardFolder[]).filter((card) => card.location.Value === "Deck");
                deck.forEach((_, x) => {
                    deck[x].order.Value -= 1;
                });
                wait(0.3)
            }
        }
        (instance("BindableEvent", "draw", player) as BindableEvent).Event.Connect(draw)
    }))
    thread[0]()
    thread[1]()

    const promptPlayer = (p: PlayerValue) => {
        return false
    }

    const handleResponseWindow = (p: PlayerValue) => {
        if(p.responseWindow.Value) {
            const pause = promptPlayer(p);
            if(pause) {
                while(p.responseWindow.Value) wait();
            } else {
                p.responseWindow.Value = false;
            }
        }
    }

    const handlePhases = (p: Phase) => {
        if(p === "DP") {
            turn.Value++;
            if (turn.Value >= 2) {
                turnPlayer.Value = opponent(turnPlayer.Value);
                turnPlayer.Value.canAttack.Value = true;
            }
            phase.Value = p;
            turnPlayer.Value.canNormalSummon.Value = true;
            if(turn.Value === 1) {
                const thread = [player1, player2].map((player) => coroutine.wrap(() => {
                    player.shuffle.Fire(5);
                    wait(player.cards.GetChildren().size() * 0.03);
                    player.draw.Fire(5);
                }))
                thread[0]();
                thread[1]();
            } 
            wait(1)
            turnPlayer.Value.draw.Fire(1)
            handleResponseWindow(turnPlayer.Value);
            handleResponseWindow(opponent(turnPlayer.Value));
            handlePhases("SP");
        } else if(p === "SP") {
            phase.Value = p;
            wait(1)
            handleResponseWindow(turnPlayer.Value);
            handleResponseWindow(opponent(turnPlayer.Value));
            handlePhases("MP1");
        }
        else if(p === "MP1") {
            phase.Value = p;
        } else if(p === "BP") {
            phase.Value = p;
        }
        else if(p === "MP2") {
            phase.Value = p;
        } else if(p === "EP") {
            if(phase.Value === "MP1" || phase.Value === "MP2") {
                phase.Value = p;
                wait(1)
                handleResponseWindow(turnPlayer.Value);
                handleResponseWindow(opponent(turnPlayer.Value));
                handlePhases("DP");   
            } else if(phase.Value === "BP") {
                handlePhases("MP2");
            }
        }
    }
    handlePhases("DP");
    (instance("BindableEvent", "handlePhases", folder) as BindableEvent).Event.Connect(handlePhases);
}

export interface CardFolder extends Folder {
    uid: StringValue;
    art: ImageButton;
    controller: ControllerValue;
    type: TypeValue;
    location: LocationValue;
    owner: PlayerValue;
    atk: NumberValue;
    def: NumberValue;
    order: IntValue;
    position: PositionValue;
    cardButton: ObjectValue;
    attribute: StringValue;
    desc: StringValue;
    level: IntValue;
    race: StringValue;
    normalSummon: BindableEvent;
    set: BindableEvent;
    tribute: BindableEvent;
    tributeSummon: BindableEvent;
}

export interface ControllerValue extends ObjectValue {
    Value: PlayerValue;
}

export const Card = (_name: string, _owner: PlayerValue, _order: number) => {
    const cardDataFolder = cards.FindFirstChild(_name, true);
    const folder = cardDataFolder!.Clone() as CardFolder;
    folder.art.Image = "rbxassetid://3955072236"
    folder.Name = _name;
    folder.Parent = _owner.cards;
    const uid = instance("StringValue", "uid", folder) as StringValue;
    const controller = instance("ObjectValue", "controller", folder) as ControllerValue;
    const location = instance("StringValue", "location", folder) as LocationValue;
    const order = instance("IntValue", "order", folder) as IntValue;
    const position = instance("StringValue", "position", folder) as PositionValue;
    instance("ObjectValue", "cardButton", folder) as ObjectValue;

    order.Value = _order;
    controller.Value = _owner;
    location.Value = "Deck";
    position.Value = "FaceUpAttack";
    uid.Value = httpService.GenerateGUID(false);

    const Summon = (_location: MZone) => {
        location.Value = _location;
    }

    const NormalSummon = (_location: MZone) => {
        position.Value = "FaceUpAttack";
        controller.Value.canNormalSummon.Value = false;
        Summon(_location);
    }
    (instance("BindableEvent", "normalSummon", folder) as BindableEvent).Event.Connect(NormalSummon);

    const Set = (_location: SZone | MZone) => {
        if(folder.type.Value.match("Monster").size() > 0) {
            position.Value = "FaceDownDefense";
            controller.Value.canNormalSummon.Value = false;
        } else {
            position.Value = "FaceDown";
        }
        location.Value = _location;
    }
    (instance("BindableEvent", "set", folder) as BindableEvent).Event.Connect(Set);

    const toGraveyard = () => {
        controller.Value = _owner;
        position.Value = "FaceUp";
        location.Value = "GZone";
    }

    const tribute = () => {
        toGraveyard();
    }
    (instance("BindableEvent", "tribute", folder) as BindableEvent).Event.Connect(tribute);

    const tributeSummon = (_location: MZone) => {
        NormalSummon(_location);
    }
    (instance("BindableEvent", "tributeSummon", folder) as BindableEvent).Event.Connect(tributeSummon);
}