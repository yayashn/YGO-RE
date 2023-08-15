import { Location } from "server/duel/types";
import { includes } from "shared/utils";
import { getPublicCards } from "./getPublicCards";

export default function viewZone(player: Player, zone: Location, isOpponent: boolean) {
    return getPublicCards(player).filter(card => {
        if(isOpponent) {
            return includes(card.location, zone) && card.controller !== player;
        } else {
            return includes(card.location, zone) && card.controller === player;
        }
    })
}