import type { CardFolder } from "server/types";
import Sparks from "./Sparks";
import { Location } from "shared/types";
import Hinotama from "./Hinotama";
import RemoveTrap from "./Remove Trap";
import RedMedicine from "./Red Medicine";
import DarkHole from "./Dark Hole";
import Raigeki from "./Raigeki";
import Fissure from "./Fissure";
import GravediggerGhoul from "./Gravedigger Ghoul";
import StopDefense from "./Stop Defense";
import GoblinSSecretRemedy from "./Goblin's Secret Remedy";
import PotOfGreed from "./Pot of Greed";
import FinalFlame from "./Final Flame";
import SwordsOfRevealingLight from "./Swords of Revealing Light";
import MonsterReborn from "./Monster Reborn";
import TwoProngedAttack from "./Two-Pronged Attack";
import TrapHole from "./Trap Hole";

export type CardEffect = {
    condition: () => boolean,
    effect: () => void,
    location: (Location | "SZone" | "MZone" | "Hand")[],
    cost?: () => void
    target?: () => void
}

export default {
    "Sparks": TrapHole,
    "Hinotama": Hinotama,
    "Remove Trap": RemoveTrap,
    "Red Medicine": RedMedicine,
    "Dark Hole": DarkHole,
    "Raigeki": Raigeki,
    "Fissure": Fissure,
    "Gravedigger Ghoul": GravediggerGhoul,
    "Stop Defense": StopDefense,
    "Goblin's Secret Remedy": GoblinSSecretRemedy,
    "Pot of Greed": PotOfGreed,
    "Final Flame": FinalFlame,
    "Swords of Revealing Light": SwordsOfRevealingLight,
    "Monster Reborn": MonsterReborn,
    "Two-Pronged Attack": TwoProngedAttack,
    "Trap Hole": TrapHole,
} as {
    [key: string]: (card: CardFolder) => CardEffect[]
}