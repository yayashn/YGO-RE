import { getFilteredCards } from "server/duel/utils";
import type { Card } from "server/duel/card"
import { getDuel } from "server/duel/duel"
import NormalSpell from "server-storage/conditions/NormalSpell";
import { CardEffect } from ".";
import { includes } from "shared/utils";
import { Position } from "server/duel/types";

/*
Increase the ATK and DEF of a Thunder-Type monster equipped with this card by 300 points.
*/
const ATK = 300
const DEF = 300
const RACE = ["Thunder"]

export default (card: Card) => {
    const controller = card.getController()
    const duel = getDuel(controller.player)!

    const condition = () => {
        const raceOnField = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            position: ['FaceUpDefense', 'FaceUpAttack'],
            race: RACE
        })
        return raceOnField.size() > 0
    }

    const target = () => {
        const targettableCards = getFilteredCards(duel, {
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            type: ['Monster'],
            position: ['FaceUpDefense', 'FaceUpAttack'],
            race: RACE
        })
        card.targets.set(controller.pickTargets(1, targettableCards))
    }

    const effect = () => {
        const target = card.targets.get()[0];
        duel.addCardFloodgate({
            floodgateName: `MODIFY_ATK`,
            floodgateFilter: {
                card: [target],
            },
            expiry: () => {
                return !includes(card.location.get(), "SZone") || card.position.get() !== "FaceUp" || 
                !includes(target.position.get(), "FaceUp") || !includes(target.location.get(), "MZone")
                || !RACE.includes(target.race.get())
            },
            floodgateValue: {
                value: ATK,
                modifierId: `+ATK_${card.uid}`
            }
        })
        duel.addCardFloodgate({
            floodgateName: `MODIFY_DEF`,
            floodgateFilter: {
                card: [target],
            },
            expiry: () => {
                return !includes(card.location.get(), "SZone") || card.position.get() !== "FaceUp" || 
                !includes(target.position.get(), "FaceUp") || !includes(target.location.get(), "MZone")
                || !RACE.includes(target.race.get())
            },
            floodgateValue: {
                value: DEF,
                modifierId: `+DEF_${card.uid}`
            }
        })
        duel.addCardFloodgate({
            floodgateName: `EQUIP`,
            floodgateFilter: {
                card: [card]
            },
            expiry: () => {
                const expired = !includes(target.location.get(), "MZone") || !includes(target.position.get(), "FaceUp");
                if(expired) {
                    card.destroy('Equip')
                    return true;
                } 
                return false;
            }
        })
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card) && condition(),
            effect: () => effect(),
            target: () => target(),
            location: ['SZone']
        }
    ]

    return effects
}