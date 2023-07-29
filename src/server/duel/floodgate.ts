import type { Card } from "./card";
import { CardFilter } from "./types";

export class Floodgate {
    name: string;
    expired: () => boolean;
    causedByCard?: Card;

    constructor(name: string, expired: () => boolean, causedByCard?: Card) {
        this.name = name;
        this.causedByCard = causedByCard;
        this.expired = expired;
    }
}