import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import options from "server/popups/options";
import waiting from "server/popups/waiting";
import { includes } from "shared/utils";

/*
    Cannot be Normal Summoned/Set. Must first be Special Summoned with "Elegant Egotist".
*/
export default (card: Card) => {

    const effects: CardEffect[] = [
        {
            restrictions: () => {
                const restrictionsList: string[] = ["CANNOT_NORMAL_SUMMON", "CANNOT_SET"];

                if(!card.hasFloodgate("WAS_SPECIAL_SUMMONED")) {
                    restrictionsList.push("CANNOT_SPECIAL_SUMMON")
                }

                return restrictionsList
            }
        }
    ]

    return effects
}