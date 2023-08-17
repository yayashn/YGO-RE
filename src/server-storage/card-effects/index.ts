import type { Card } from "server/duel/card"
import { Location, Action } from "server/duel/types"
import HarpieSFeatherDuster from "./Harpie's Feather Duster"
import ArmedNinja from "./LOB/Armed Ninja"
import BeastFangs from "./LOB/Beast Fangs"
import BookOfSecretArts from "./LOB/Book of Secret Arts"
import DarkEnergy from "./LOB/Dark Energy"
import DarkHole from "./LOB/Dark Hole"
import DragonCaptureJar from "./LOB/Dragon Capture Jar"
import DragonTreasure from "./LOB/Dragon Treasure"
import ElectroWhip from "./LOB/Electro-Whip"
import FinalFlame from "./LOB/Final Flame"
import Fissure from "./LOB/Fissure"
import FollowWind from "./LOB/Follow Wind"
import Forest from "./LOB/Forest"
import GoblinSSecretRemedy from "./LOB/Goblin's Secret Remedy"
import GravediggerGhoul from "./LOB/Gravedigger Ghoul"
import HaneHane from "./LOB/Hane-Hane"
import Hinotama from "./LOB/Hinotama"
import LaserCannonArmor from "./LOB/Laser Cannon Armor"
import LegendarySword from "./LOB/Legendary Sword"
import MachineConversionFactory from "./LOB/Machine Conversion Factory"
import ManEaterBug from "./LOB/Man-Eater Bug"
import MonsterReborn from "./LOB/Monster Reborn"
import Mountain from "./LOB/Mountain"
import MysticalMoon from "./LOB/Mystical Moon"
import Polymerization from "./LOB/Polymerization"
import PotOfGreed from "./LOB/Pot of Greed"
import PowerOfKaishin from "./LOB/Power of Kaishin"
import Raigeki from "./LOB/Raigeki"
import RaiseBodyHeat from "./LOB/Raise Body Heat"
import ReaperOfTheCards from "./LOB/Reaper of the Cards"
import RedMedicine from "./LOB/Red Medicine"
import RemoveTrap from "./LOB/Remove Trap"
import SilverBowAndArrow from "./LOB/Silver Bow and Arrow"
import Sogen from "./LOB/Sogen"
import Sparks from "./LOB/Sparks"
import StopDefense from "./LOB/Stop Defense"
import SwordsOfRevealingLight from "./LOB/Swords of Revealing Light"
import TrapHole from "./LOB/Trap Hole"
import TwoProngedAttack from "./LOB/Two-Pronged Attack"
import Umi from "./LOB/Umi"
import VileGerms from "./LOB/Vile Germs"
import VioletCrystal from "./LOB/Violet Crystal"
import Wasteland from "./LOB/Wasteland"
import Yami from "./LOB/Yami"
import ChangeOfHeart from "./MRD/Change of Heart"
import ExodiaTheForbiddenOne from "./LOB/Exodia the Forbidden One"
import TimeWizard from "./MRD/Time Wizard"
import BarrelDragon from "./MRD/Barrel Dragon"
import SolemnJudgment from "./MRD/Solemn Judgment"
import MagicJammer from "./MRD/Magic Jammer"
import HornOfHeaven from "./MRD/Horn of Heaven"
import SevenToolsOfTheBandit from "./MRD/Seven Tools of the Bandit"
import MirrorForce from "./MRD/Mirror Force"

export type CardEffect = {
    condition?: () => boolean,
    effect?: (card: Card) => void,
    location?: (Location | "SZone" | "MZone" | "Hand")[],
    cost?: () => boolean | void,
    target?: () => boolean | void,
    fusionMaterials?: Record<string, number>,
    action?: Action
    trigger?: "FLIP"
    optional?: boolean
    description?: string
}

export default {
    //Not released
    "Harpie's Feather Duster": HarpieSFeatherDuster,
    //
    "Sparks": Sparks, //
    "Hinotama": Hinotama, //
    "Remove Trap": RemoveTrap,//
    "Red Medicine": RedMedicine,//
    "Dark Hole": DarkHole,//
    "Raigeki": Raigeki,//
    "Fissure": Fissure,//
    "Gravedigger Ghoul": GravediggerGhoul,//
    "Stop Defense": StopDefense,//
    "Goblin's Secret Remedy": GoblinSSecretRemedy,//
    "Pot of Greed": PotOfGreed,//
    "Final Flame": FinalFlame,//
    "Legendary Sword": LegendarySword,//
    "Swords of Revealing Light": SwordsOfRevealingLight,//
    "Monster Reborn": MonsterReborn,//
    "Two-Pronged Attack": TwoProngedAttack,//
    "Trap Hole": TrapHole,//
    "Dragon Capture Jar": DragonCaptureJar,//
    "Violet Crystal": VioletCrystal,//
    "Beast Fangs": BeastFangs,//
    "Book of Secret Arts": BookOfSecretArts,//
    "Power of Kaishin": PowerOfKaishin,//
    "Dark Energy": DarkEnergy,//
    "Laser Cannon Armor": LaserCannonArmor,//
    "Vile Germs": VileGerms,//
    "Silver Bow and Arrow": SilverBowAndArrow,//
    "Dragon Treasure": DragonTreasure,//
    "Electro-Whip": ElectroWhip,//
    "Mystical Moon": MysticalMoon,//
    "Machine Conversion Factory": MachineConversionFactory,//
    "Raise Body Heat": RaiseBodyHeat,//
    "Follow Wind": FollowWind,//
    "Wasteland": Wasteland,//
    "Forest": Forest,//
    "Mountain": Mountain,//
    "Sogen": Sogen,//
    "Umi": Umi,//
    "Yami": Yami,//
    "Man-Eater Bug": ManEaterBug,
    "Hane-Hane": HaneHane,
    "Reaper of the Cards": ReaperOfTheCards,
    "Armed Ninja": ArmedNinja,
    "Polymerization": Polymerization,//
    "Exodia the Forbidden One": ExodiaTheForbiddenOne,
    //MRD
    "Change of Heart": ChangeOfHeart,
    "Time Wizard": TimeWizard,
    "Barrel Dragon": BarrelDragon,
    "Solemn Judgment": SolemnJudgment,
    "Magic Jammer": MagicJammer,
    "Horn of Heaven": HornOfHeaven,
    "Seven Tools of the Bandit": SevenToolsOfTheBandit,
    "Mirror Force": MirrorForce
} as {
    [key: string]: (card: Card) => CardEffect[]
}