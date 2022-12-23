import { Card } from "./ygo";

const field = game.Workspace.Field3D.Field;

export class Zone {
    locked = false;
    name;

    constructor(name: string) {
        this.name = name;
    }

    get3DZone(isOpponent?: boolean) {
        if(isOpponent) {
            return field.Opponent.FindFirstChild(this.name, true);
        } else {
            return field.Player.FindFirstChild(this.name, true);
        }
    }
}

export class Zones {
    MZone1 = new Zone("MZone1");
    MZone2 = new Zone("MZone2");
    MZone3 = new Zone("MZone3");
    MZone4 = new Zone("MZone4");
    MZone5 = new Zone("MZone5");
    SZone1 = new Zone("SZone1");
    SZone2 = new Zone("SZone2");
    SZone3 = new Zone("SZone3");
    SZone4 = new Zone("SZone4");
    SZone5 = new Zone("SZone5");
    GZone = new Zone("GZone");
    EZone = new Zone("EZone");
    FZone = new Zone("FZone");
    BZone = new Zone("BZone");
    Deck = new Zone("Deck");
    Hand = new Zone("Hand");
}

export class Field {
    player1 = new Zones();
    player2 = new Zones();
}