import { instance } from "shared/utils";
import { getCards, getDuel } from "./utils";
import { CardButton } from "gui/duel/Cards";

const serverStorage = game.GetService("ServerStorage")
const playersFolder = serverStorage.WaitForChild("players")!
const httpService = game.GetService("HttpService");
const duels = serverStorage.WaitForChild("duels")!
const replicatedStorage = game.GetService("ReplicatedStorage");
const drawCardFromClient = replicatedStorage.FindFirstChild("remotes")!.FindFirstChild("drawCard") as RemoteFunction;

interface PhaseValue extends StringValue {
    Value: "DP" | "SP" | "MP1" | "BP" | "MP2" | "EP";
}

export interface PlayerValue extends ObjectValue {
    cards: Folder;
    Value: Player;
}

interface TypeValue extends StringValue {
    Value: "Monster" | "Spell" | "Trap";   
}

interface LocationValue extends StringValue {
    Value: "Deck" | "Hand" | "GZone" | "BZone" | "EZone" | "FZone" 
    | "MZone1" | "MZone2" | "MZone3" | "MZone4" | "MZone5" 
    | "SZone1" | "SZone2" | "SZone3" | "SZone4" | "SZone5";
}

export type Position = "FaceUpAttack" | "FaceUpDefense" | "FaceDownDefense" | "FaceUp" | "FaceDown";
interface PositionValue extends StringValue {
    Value: Position
}

export interface CardFolder extends Folder {
    controller: PlayerValue;
    name: StringValue;
    type: TypeValue;
    location: LocationValue;
    owner: PlayerValue;
    atk: NumberValue;
    def: NumberValue;
    order: IntValue;
    position: PositionValue;
    cardButton: ObjectValue;
}

export interface DuelFolder extends Folder {
    turn: IntValue;
    phase: PhaseValue;
    mover: ObjectValue;
    player1: PlayerValue;
    player2: PlayerValue;
}



export const Duel = (p1: Player, p2: Player) => {
    const folder = instance("Folder", `${p1.Name}|${p2.Name}`, duels) as DuelFolder;
    const turn = instance("IntValue", "turn", folder) as IntValue;
    const phase = instance("StringValue", "phase", folder) as PhaseValue;
    const mover = instance("ObjectValue", "mover", folder) as ObjectValue;
    const player1 = instance("ObjectValue", "player1", folder) as PlayerValue;
    const player2 = instance("ObjectValue", "player2", folder) as PlayerValue;

    phase.Value = "DP";
    turn.Value = 1;
    mover.Value = p1;
    player1.Value = p1;
    player2.Value = p2;

    const thread = [player1, player2].map((player) => coroutine.wrap(() => {
        const lifePoints = instance("NumberValue", "lifePoints", player) as NumberValue;
        const cards = instance("Folder", "cards", player) as Folder;
        const opponent = player === player1 ? player2 : player1;

        lifePoints.Value = 8000;

        let o = 0;
        for(const card of getCards(player.Value)!) {
            Card(card, player, o)
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
            }
        }
        (instance("BindableEvent", "draw", player) as BindableEvent).Event.Connect(draw)

        shuffle();
        draw(5);
    }));

    thread[0]();
    thread[1]();
}

export const Card = (n: string, owner: PlayerValue, o: number) => {
    const folder = instance("Folder", "card", owner.cards) as CardFolder;
    const name = instance("StringValue", "name", folder) as StringValue;
    const atk = instance("IntValue", "atk", folder) as IntValue;
    const def = instance("IntValue", "def", folder) as IntValue;
    const typ = instance("StringValue", "type", folder) as TypeValue;
    const controller = instance("ObjectValue", "controller", folder) as PlayerValue;
    const location = instance("StringValue", "location", folder) as LocationValue;
    const order = instance("IntValue", "order", folder) as IntValue;
    const position = instance("StringValue", "position", folder) as PositionValue;
    const card = instance("ObjectValue", "cardButton", folder) as ObjectValue;

    order.Value = o;
    controller.Value = owner.Value;
    name.Value = n;
    location.Value = "Deck";
    typ.Value = "Monster";
    position.Value = "FaceUpAttack";
}