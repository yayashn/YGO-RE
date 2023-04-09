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
import DragonCaptureJar from "./Dragon Capture Jar";
import VioletCrystal from "./Violet Crystal";
import BeastFangs from "./Beast Fangs";
import BookOfSecretArts from "./Book of Secret Arts";
import PowerOfKaishin from "./Power of Kaishin";
import DarkEnergy from "./Dark Energy";
import LaserCannonArmor from "./Laser Cannon Armor";
import VileGerms from "./Vile Germs";
import SilverBowAndArrow from "./Silver Bow and Arrow";
import DragonTreasure from "./Dragon Treasure";
import ElectroWhip from "./Electro-Whip";
import MysticalMoon from "./Mystical Moon";
import MachineConversionFactory from "./Machine Conversion Factory";
import RaiseBodyHeat from "./Raise Body Heat";
import FollowWind from "./Follow Wind";
import Wasteland from "./Wasteland";
import Yami from "./Yami";
import Forest from "./Forest";
import Mountain from "./Mountain";
import Sogen from "./Sogen";
import Umi from "./Umi";
import ManEaterBug from "./Man-Eater Bug";
import FlameSwordsman from "./Flame Swordsman";
import HaneHane from "./Hane-Hane";
import ReaperOfTheCards from "./Reaper of the Cards";
import ArmedNinja from "./Armed Ninja";
import CharubinTheFireKnight from "./Charubin the Fire Knight";
import DarkfireDragon from "./Darkfire Dragon";
import Fusionist from "./Fusionist";
import FlameGhost from "./Flame Ghost";
import KarbonalaWarrior from "./Karbonala Warrior";
import DragonessTheWickedKnight from "./Dragoness the Wicked Knight";
import MetalDragon from "./Metal Dragon";
import FlowerWolf from "./Flower Wolf";
import GaiaTheDragonChampion from "./Gaia the Dragon Champion";

export type CardEffect = {
    condition?: () => boolean,
    effect?: () => void,
    location?: (Location | "SZone" | "MZone" | "Hand")[],
    cost?: () => void
    target?: () => void
    fusionMaterials?: Record<string, number>
}

export default {
    "Sparks": Sparks,
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
    "Dragon Capture Jar": DragonCaptureJar,
    "Violet Crystal": VioletCrystal,
    "Beast Fangs": BeastFangs,
    "Book of Secret Arts": BookOfSecretArts,
    "Power of Kaishin": PowerOfKaishin,
    "Dark Energy": DarkEnergy,
    "Laser Cannon Armor": LaserCannonArmor,
    "Vile Germs": VileGerms,
    "Silver Bow and Arrow": SilverBowAndArrow,
    "Dragon Treasure": DragonTreasure,
    "Electro-Whip": ElectroWhip,
    "Mystical Moon": MysticalMoon,
    "Machine Conversion Factory": MachineConversionFactory,
    "Raise Body Heat": RaiseBodyHeat,
    "Follow Wind": FollowWind,
    "Wasteland": Wasteland,
    "Forest": Forest,
    "Mountain": Mountain,
    "Sogen": Sogen,
    "Umi": Umi,
    "Yami": Yami,
    "Man-Eater Bug": ManEaterBug,
    "Hane-Hane": HaneHane,
    "Reaper of the Cards": ReaperOfTheCards,
    "Armed Ninja": ArmedNinja,

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
    [key: string]: (card: CardFolder) => CardEffect[]
}