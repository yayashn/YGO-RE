import Object from "@rbxts/object-utils"
import { CardFolder, DuelFolder, PlayerValue, Position } from "server/types"
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

export const getFloodgates = (player: PlayerValue, floodgates: string = player.floodgates.Value) => {
    const floodgatesPlayer = JSON.parse(floodgates) as FloodgatePlayer[]
    return floodgatesPlayer
}

export const addFloodgate = (player: PlayerValue, floodgate: FloodgatePlayer) => {
    const floodgatesPlayer = getFloodgates(player)
    floodgatesPlayer.push(floodgate)
    player.floodgates.Value = JSON.stringify(floodgatesPlayer)
    return () => removeFloodgate(player, floodgate.floodgateUid)
}

export const removeFloodgate = (player: PlayerValue, floodgateUid: string) => {
    const floodgatesPlayer = getFloodgates(player)
    const newFloodgatesPlayer = floodgatesPlayer.filter(floodgate => floodgate.floodgateUid !== floodgateUid)
    player.floodgates.Value = JSON.stringify(newFloodgatesPlayer)
}

export const hasFloodgate = (player: PlayerValue, floodgateName: FloodgateName) => {
    const floodgatesPlayer = getFloodgates(player)
    return floodgatesPlayer.some(floodgate => floodgate.floodgateName === floodgateName)
}

export type FloodgateFilter = {
    location?: Location[] // string[]
    position?: Position[] // string[]
    uid?: string[]
    controller?: PlayerValue[] // this needs to be encoded.
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
    card: CardFolder,
    floodgates: string = (card.controller.Value.Parent as DuelFolder).floodgates.Value,
  ) => {
    const floodgatesCard = JSON.parse(floodgates) as FloodgateCard[];
  
    floodgatesCard.forEach((floodgateCard) => {
      if (floodgateCard.floodgateFilter.controller) {
        floodgateCard.floodgateFilter.controller = floodgateCard.floodgateFilter.controller.map(
          (playerName) => {
            const duel = card.controller.Value.Parent as DuelFolder;
            const player = duel.FindFirstChild(playerName as unknown as string);
            return player as PlayerValue;
          },
        );
      }
    });
  
    return floodgatesCard;
};
  
export const addCardFloodgate = (card: CardFolder, floodgate: FloodgateCard) => {
    const duel = card.controller.Value.Parent as DuelFolder
    const floodgatesCard = getCardFloodgates(card)
    floodgatesCard.push(floodgate)
    duel.floodgates.Value = JSON.stringify(floodgatesCard)
    return () => removeCardFloodgate(card, floodgate.floodgateUid)
}

export const addCardFloodgateAsync = (card: CardFolder, floodgate: FloodgateCard) => {
    new Promise((resolve) => {
        const duel = card.controller.Value.Parent as DuelFolder
        const floodgatesCard = getCardFloodgates(card)
        floodgatesCard.push(floodgate)
        duel.floodgates.Value = JSON.stringify(floodgatesCard)
        resolve(() => removeCardFloodgate(card, floodgate.floodgateUid))
    })
}

export const addCardFloodgates = (card: CardFolder, floodgateConfigs: FloodgateCard[]) => {
    const removeFunctions: (() => void)[] = [];
    for (const config of floodgateConfigs) {
        const removeFn = addCardFloodgate(card, config);
        removeFunctions.push(removeFn);
    }
    return removeFunctions;
}

export const removeCardFloodgate = (card: CardFolder, floodgateUid: string) => {
    const duel = card.controller.Value.Parent as DuelFolder
    const floodgatesCard = getCardFloodgates(card)
    const newFloodgatesCard = floodgatesCard.filter(floodgate => floodgate.floodgateUid !== floodgateUid)
    duel.floodgates.Value = JSON.stringify(newFloodgatesCard)
}

export const hasCardFloodgate = (card: CardFolder, floodgateName: FloodgateName) => {
    const floodgatesCard = getCardFloodgates(card);

    return floodgatesCard.some(floodgate => {
        if(floodgate.floodgateName !== floodgateName) return false;
        return Object.entries(floodgate.floodgateFilter).every(([key, filter]) => {
            return filter.some((value) => value === card[key].Value)
        })
    })
};

export const hasCardStatChangeFloodgate = (card: CardFolder) => {
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
            return filter.some((value) => value === card[key].Value)
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
