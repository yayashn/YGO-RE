import { Dictionary as Object } from "@rbxts/sift"
import { Duel, getDuel } from "./duel"
import { CardFilter } from "./types"
import { Card } from "./card"
import { includes } from "shared/utils"

export const getFilteredCards = (duel: Duel, cardFilter: CardFilter) => {
    const cards = getCards(duel);
    return cards.filter((card) =>
        Object.entries(cardFilter).every(([key, values]) => {
            if(key === "type") {
                return values!.some((value) => card["type"].get().match(value as string).size() > 0)
            }
            if(key === "uid") {
                return values!.some((value) => card[key] === value)
            }
            if(key === "card") {
                return (values as Card[]).includes(card)
            }
            if(key === "exclude") {
                return !card.hasSomeRestrictions(values as string[]);
            }
            if(key === "atk") {
                return values!.some((value) => {
                    value = `${value}` as string;
                    if(value.match("<=").size() > 0) {
                        return card.getAtk() <= tonumber(value.sub(3))!
                    }
                    if(value.match(">="). size() > 0) {
                        return card.getAtk() >= tonumber(value.sub(3))!
                    }
                    return card.getAtk() === tonumber(value)
                })
            }
            if(key === "def") {
                return values!.some((value) => {
                    value = `${value}` as string;
                    if(value.match("<=").size() > 0) {
                        return card.getDef() <= tonumber(value.sub(3))!
                    }
                    if(value.match(">="). size() > 0) {
                        return card.getDef() >= tonumber(value.sub(3))!
                    }
                    return card.getDef() === tonumber(value)
                })
            }
            return values!.some((value) => card[key].get() === value)
        })
    )
}

//const cardCache = new Map<string, Card[]>();

export const getCards = (duel: Duel): Card[] => {
   // const key = `${duel.player1.player.UserId},${duel.player1.cards.get().size()},${duel.player2.cards.get().size()}`;
    
    // If we've already computed the result for this duel, return it
  //  if (cardCache.has(key)) {
  //      return cardCache.get(key)!;
  //  }
    
    // Otherwise, compute the result and store it in the cache
    const cards1 = duel.player1.cards.get();
    const cards2 = duel.player2.cards.get();
    const result = [...cards1, ...cards2];
 //   cardCache.set(key, result);

    return result;
}

export const getPublicCard = (player: Player, card: Card, showArt: boolean = false)=> {
    showArt = includes(card.position.get(), "FaceUp") 
    || (["Hand", "BZone", "EZone", "GZone", "FZone", "MZone", "SZone"]
        .some(z => includes(card.location.get(), z)) && card.controller.get() === player)
    || card.isTargettable(player);
    const showAtkDef = includes(card.position.get(), "FaceUp") && includes(card.location.get(), "MZone");

    return {
        uid: card.uid,
        position: card.position.get(),
        location: card.location.get(),
        controller: card.controller.get(),
        order: card.order.get(),
        atk: showArt && showAtkDef ? card.getAtk() : undefined,
        def: showArt && showAtkDef ? card.getDef() : undefined,
        art: showArt ? card.art : undefined,
        name: showArt ? card.name.get() : undefined,
        race: showArt ? card.race.get() : undefined,
        attribute: showArt ? card.attribute.get() : undefined,
        level: showArt ? card.level.get() : undefined,
        type: showArt ? card["type"].get() : undefined,
        desc: showArt ? card.desc.get() : undefined,
    }
}