import type { Card } from "server/duel/card"
import NormalEffect from "server-storage/conditions/NormalEffect";
import { getDuel } from "server/duel/duel";
import { CardEffect } from "..";
import { getFilteredCards } from "server/duel/utils";
import waiting from "server/popups/waiting";
import { includes } from "shared/utils";

/*
You can target 1 "Petit Moth" you control; equip this card from your hand 
to that target. While equipped by this effect, the original ATK/DEF of that 
"Petit Moth" becomes the ATK/DEF of "Cocoon of Evolution".
*/
export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!
    const opponent = duel.getOpponent(controller.player)
    
    const condition = () => {
        const petitMoth = getFilteredCards(duel, {
            name: ["Petit Moth"],
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            controller: [controller.player],
        })
        return NormalEffect(card) && includes(card.location.get(), "Hand") && petitMoth.size() > 0
    }
    
    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            controller: [controller.player],
            name: ["Petit Moth"],
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
        })
        card.targets.set(controller.pickTargets(1, targettableCards))
    }

    const effect = async () => {
        const target = card.targets.get()[0]

        target.atk.set(card.atk.get())
        target.def.set(card.def.get())
        
        const zone = controller.pickZone(duel.getEmptyFieldZones("SZone", controller.player, "Player"));
        card.position.set("FaceUp")
        card.location.set(zone)

        duel.addCardFloodgate("EQUIPPED", {
            floodgateFilter: {
                card: [card],
            },
            floodgateValue: {
                equipper: card,
                equipped: target,
                turnEquipped: duel.turn.get(),
            },
            expiry: () => {
                const expired = !includes(target.location.get(), "MZone") || !includes(card.location.get(), "SZone") || card.position.get() !== "FaceUp";
                if(expired) {
                    card.toGraveyard()
                    target.atk.set((target.originalData as unknown as { atk: number }).atk)
                    target.def.set((target.originalData as unknown as { def: number }).def)
                }
                return expired;
            }
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => condition(),
            effect: () => effect(),
            target: () => target(),
            location: ['MZone']
        }
    ]

    return effects
}