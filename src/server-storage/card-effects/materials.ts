import type { Card } from "server/duel/card"
import FlameSwordsman from "./Flame Swordsman";
import CharubinTheFireKnight from "./Charubin the Fire Knight";
import DarkfireDragon from "./Darkfire Dragon";
import Fusionist from "./Fusionist";
import FlameGhost from "./Flame Ghost";
import KarbonalaWarrior from "./Karbonala Warrior";
import DragonessTheWickedKnight from "./Dragoness the Wicked Knight";
import MetalDragon from "./Metal Dragon";
import FlowerWolf from "./Flower Wolf";
import GaiaTheDragonChampion from "./Gaia the Dragon Champion";
import { Location } from "server/duel/types";

export type CardEffect = {
    condition?: () => boolean,
    effect?: () => void,
    location?: (Location | "SZone" | "MZone" | "Hand")[],
    cost?: () => void
    target?: () => void
    fusionMaterials?: Record<string, number>
}

export default {
    //Normal Fusion Monsters
    "Flame Swordsman": FlameSwordsman,
    "Charubin the Fire Knight": CharubinTheFireKnight,
    "Darkfire Dragon": DarkfireDragon,
    "Fusionist": Fusionist,
    "Flame Ghost": FlameGhost,
    "Karbonala Warrior": KarbonalaWarrior,
    "Dragoness the Wicked Knight": DragonessTheWickedKnight,
    "Metal Dragon": MetalDragon,
    "Flower Wolf": FlowerWolf,
    "Gaia the Dragon Champion": GaiaTheDragonChampion

} as {
    [key: string]: (card: Card) => CardEffect[]
}