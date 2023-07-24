import { HttpService } from "@rbxts/services";
import getCardData from "shared/utils";
import { Location, Position } from "./types";
import { Subscribable } from "shared/Subscribable";

export class Card {
    uid: string;
    name: Subscribable<string>;
    atk = new Subscribable<number | undefined>(undefined);
    def = new Subscribable<number | undefined>(undefined);
    originalData: Subscribable<Record<string, unknown>>;
    race: Subscribable<string>;
    desc: Subscribable<string>;
    level = new Subscribable<number | undefined>(undefined);
    art: string;
    owner: Player;
    controller: Subscribable<Player>;
    position: Subscribable<Position>;
    location: Subscribable<Location>;
    order: Subscribable<number>;

    constructor(name: string, owner: Player, order: number) {
        const cardData = getCardData(name)!;
        this.originalData = new Subscribable(cardData);
        this.uid = HttpService.GenerateGUID(false);
        this.name = new Subscribable(name);
        this.race = new Subscribable(cardData.race);
        this.desc = new Subscribable(cardData.desc);
        this.position = new Subscribable<Position>("FaceDown");
        this.art = cardData.art;
        this.owner = owner;
        this.controller = new Subscribable<Player>(owner);
        this.order = new Subscribable<number>(order);

        if(cardData["type"].match("Fusion").size() > 0) {
            this.location = new Subscribable<Location>("EZone");
        } else {
            this.location = new Subscribable<Location>("Deck");
        }
        if(cardData["type"].match("Monster").size() > 0) {
            this.atk.set(cardData.atk!);
            this.def.set(cardData.def!);
            this.level.set(cardData.level!);
        }
    }

    normalSummon() {
        this.position.set("FaceUpAttack");
        this.location.set("MZone1");
    }
}