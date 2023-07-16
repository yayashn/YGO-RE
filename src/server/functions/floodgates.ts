import Object from "@rbxts/object-utils"
import { Position } from "server/types"
import { Card } from "server/ygo/Card"
import type { YPlayer } from "server/ygo/Player"
import { Location } from "shared/types"
import { JSON, includes } from "shared/utils"

export type FloodgateName =
      "disableAttack"
    | "forceFaceUpDefensePosition"
    | "disableChangePosition"
    | string

export type FloodgatePlayer = {
    floodgateUid: string
    floodgateName: FloodgateName
    floodgateCause: "Effect" | "Mechanic"
}

export const addFloodgate = (player: YPlayer, floodgate: FloodgatePlayer) => {
    const floodgatesPlayer = player.floodgates.get()
    floodgatesPlayer.push(floodgate)
    return () => removeFloodgate(player, floodgate.floodgateUid)
}

export const removeFloodgate = (player: YPlayer, floodgateUid: string) => {
    player.floodgates.set(player.floodgates.get().filter(floodgate => floodgate.floodgateUid !== floodgateUid))
}

export const hasFloodgate = (player: YPlayer, floodgateName: FloodgateName) => {
    return player.floodgates.get().some(floodgate => floodgate.floodgateName === floodgateName)
}

export type FloodgateFilter = {
    location?: Location[] // string[]
    position?: Position[] // string[]
    uid?: string[]
    controller?: YPlayer[] // this needs to be encoded.
    race?: string[]
    type?: string[]
}

export type FloodgateCard = {
    floodgateUid: string
    floodgateName: FloodgateName
    floodgateCause: "Effect" | "Mechanic"
    floodgateFilter: FloodgateFilter
}

export const getCardFloodgates = (
    card: Card,
    floodgates = card.duel().floodgates.get(),
  ) => {  
    floodgates.forEach((floodgateCard) => {
      if (floodgateCard.floodgateFilter.controller) {
        floodgateCard.floodgateFilter.controller = floodgateCard.floodgateFilter.controller.map(
          (playerName) => {
            const duel = card.controller.get().getDuel();
            const player = duel.player1.player.Name === playerName.name ? duel.player1 : duel.player2;
            return player
          },
        );
      }
    });
  
    return floodgates;
};
  
export const addCardFloodgate = (card: Card, floodgate: FloodgateCard) => {
    const floodgatesCard = getCardFloodgates(card)
    floodgatesCard.push(floodgate)
    return () => removeCardFloodgate(card, floodgate.floodgateUid)
}

export const addCardFloodgateAsync = (card: Card, floodgate: FloodgateCard) => {
    new Promise((resolve) => {
        const floodgatesCard = getCardFloodgates(card)
        floodgatesCard.push(floodgate)
        resolve(() => removeCardFloodgate(card, floodgate.floodgateUid))
    })
}

export const addCardFloodgates = (card: Card, floodgateConfigs: FloodgateCard[]) => {
    const removeFunctions: (() => void)[] = [];
    for (const config of floodgateConfigs) {
        const removeFn = addCardFloodgate(card, config);
        removeFunctions.push(removeFn);
    }
    return removeFunctions;
}

export const removeCardFloodgate = (card: Card, floodgateUid: string) => {
    const duel = card.duel()
    const floodgatesCard = getCardFloodgates(card)
    const newFloodgatesCard = floodgatesCard.filter(floodgate => floodgate.floodgateUid !== floodgateUid)
    duel.floodgates.set(newFloodgatesCard)
}

export const hasCardFloodgate = (card: Card, floodgateName: FloodgateName) => {
    const floodgatesCard = getCardFloodgates(card);

    return floodgatesCard.some(floodgate => {
        if(floodgate.floodgateName !== floodgateName) return false;
        return Object.entries(floodgate.floodgateFilter).every(([key, filter]) => {
            if(key === "uid") {
                return filter.some((value) => value === card.uid)
            }
            return filter.some((value) => value === card[key].get())
        })
    })
};

export const hasCardStatChangeFloodgate = (card: Card) => {
    const floodgatesCard = getCardFloodgates(card);
    
    const statChange = {
        ATK: 0,
        DEF: 0,
    }

    let hasFloodgate = false;
    floodgatesCard.forEach(floodgate => {
        if(!includes(floodgate.floodgateName, '+') && !includes(floodgate.floodgateName, '-')) return false;
        let [ATK, DEF]: (string | number)[] = floodgate.floodgateName.split('/');
        if(ATK.sub(1,1) === '+') {
            ATK = tonumber(ATK.sub(2,ATK.size()))!;
        } else {
            ATK = -tonumber(ATK.sub(2,ATK.size()))!;
        }
        if(DEF.sub(1,1) === '+') {
            DEF = tonumber(DEF.sub(2,DEF.size()))!;
        } else {
            DEF = -tonumber(DEF.sub(2,DEF.size()))!;
        }
        if(Object.entries(floodgate.floodgateFilter).every(([key, filter]) => {
            if(key === "uid") {
                return filter.some((value) => value === card.uid)
            }
            return filter.some((value) => value === card[key].get())
        })) {
            hasFloodgate = true;
            statChange.ATK += ATK;
            statChange.DEF += DEF;
        }
    })

    if(hasFloodgate) {
        return statChange;
    } 
    return undefined
};
