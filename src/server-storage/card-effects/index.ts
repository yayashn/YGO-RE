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
import HarpieLadySisters from "./MRD/Harpie Lady Sisters"
import ElegantEgotist from "./MRD/Elegant Egotist"
import SangaOfTheThunder from "./MRD/Sanga of the Thunder"
import Kazejin from "./MRD/Kazejin"
import Suijin from "./MRD/Suijin"
import Kuriboh from "./MRD/Kuriboh"
import CatapultTurtle from "./MRD/Catapult Turtle"
import TwinHeadedThunderDragon from "./MRD/Twin-Headed Thunder Dragon"
import HeavyStorm from "./MRD/Heavy Storm"
import CocoonOfEvolution from "./MRD/Cocoon of Evolution"
import MaskOfDarkness from "./MRD/Mask of Darkness"
import WhiteMagicalHat from "./MRD/White Magical Hat"
import TributeToTheDoomed from "./MRD/Tribute to the Doomed"
import MagicianOfFaith from "./MRD/Magician of Faith"
import MaskedSorcerer from "./MRD/Masked Sorcerer"
import FakeTrap from "./MRD/Fake Trap"
import Sangan from "./MRD/Sangan"
import GreatMoth from "./MRD/Great Moth"
import PrincessOfTsurugi from "./MRD/Princess of Tsurugi"
import ShadowGhoul from "./MRD/Shadow Ghoul"
import Hoshiningen from "./MRD/Hoshiningen"
import CannonSoldier from "./MRD/Cannon Soldier"
import MukaMuka from "./MRD/Muka Muka"
import StarBoy from "./MRD/Star Boy"
import MilusRadiant from "./MRD/Milus Radiant"
import DarkElf from "./MRD/Dark Elf"
import WitchOfTheBlackForest from "./MRD/Witch of the Black Forest"
import LittleChimera from "./MRD/Little Chimera"
import Bladefly from "./MRD/Bladefly"
import WitchSApprentice from "./MRD/Witch's Apprentice"
import ShieldSword from "./MRD/Shield & Sword"
import RobbinGoblin from "./MRD/Robbin' Goblin"
import MysticLamp from "./MRD/Mystic Lamp"
import Leghul from "./MRD/Leghul"
import Ooguchi from "./MRD/Ooguchi"
import Jinzo7 from "./MRD/Jinzo #7"
import RainbowFlower from "./MRD/Rainbow Flower"
import QueenSDouble from "./MRD/Queen's Double"
import CrassClown from "./MRD/Crass Clown"
import DreamClown from "./MRD/Dream Clown"
import ThunderDragon from "./MRD/Thunder Dragon"
import TheUnhappyMaiden from "./MRD/The Unhappy Maiden"
import StimPack from "./MRD/Stim-Pack"
import LarvaeMoth from "./MRD/Larvae Moth"
import BigEye from "./MRD/Big Eye"
import SteelScorpion from "./MRD/Steel Scorpion"
import BlastJuggler from "./MRD/Blast Juggler"
import ElectricLizard from "./MRD/Electric Lizard"
import LavaBattleguard from "./MRD/Lava Battleguard"
import SwampBattleguard from "./MRD/Swamp Battleguard"
import TheCheerfulCoffin from "./MRD/The Cheerful Coffin"
import SoulRelease from "./MRD/Soul Release"

export type TriggerEffect = "FLIP" | "INFLICTS_BATTLE_DAMAGE" | "SENT_FROM_FIELD_TO_GY" | "ATTACK"
| "DEFENSE_TO_ATTACK" | "ATTACK_TO_DEFENSE" | "SENT_FROM_FIELD_TO_GY_BATTLE"

export type CardEffect = {
    condition?: () => boolean | "Special Summon",
    continuous?: {
        effect: (card: Card) => void,
        condition?: () => boolean,
    },
    effect?: (card: Card) => void,
    location?: (Location | "SZone" | "MZone" | "Hand")[],
    cost?: () => boolean | void,
    attackCost?: () => boolean | void,
    target?: () => boolean | void,
    fusionMaterials?: Record<string, number>,
    action?: Action
    trigger?: TriggerEffect
    optional?: boolean
    description?: string[]
    restrictions?: () => string[]
    prediction?: (card: Card) => Record<string, unknown>
}

export default {
    //Not released
    "Harpie's Feather Duster": HarpieSFeatherDuster,
    //
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
    "Legendary Sword": LegendarySword,
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
    "Polymerization": Polymerization,
    "Exodia the Forbidden One": ExodiaTheForbiddenOne,
    //MRD
    "Change of Heart": ChangeOfHeart,
    "Time Wizard": TimeWizard,
    "Barrel Dragon": BarrelDragon,
    "Solemn Judgment": SolemnJudgment,
    "Magic Jammer": MagicJammer,
    "Horn of Heaven": HornOfHeaven,
    "Seven Tools of the Bandit": SevenToolsOfTheBandit,
    "Mirror Force": MirrorForce,
    "Harpie Lady Sisters": HarpieLadySisters,
    "Elegant Egotist": ElegantEgotist,
    "Sanga of the Thunder": SangaOfTheThunder,
    "Kazejin": Kazejin,
    "Suijin": Suijin,
    "Tribute to the Doomed": TributeToTheDoomed,
    Kuriboh,
    "Catapult Turtle": CatapultTurtle,
    "Twin-Headed Thunder Dragon": TwinHeadedThunderDragon,
    "Heavy Storm": HeavyStorm,
    "Cocoon of Evolution": CocoonOfEvolution,
    "Mask of Darkness": MaskOfDarkness,
    "White Magical Hat": WhiteMagicalHat,
    "Magician of Faith": MagicianOfFaith,
    "Masked Sorcerer": MaskedSorcerer,
    "Fake Trap": FakeTrap,
    "Sangan": Sangan,
    "Great Moth": GreatMoth,
    "Princess of Tsurugi": PrincessOfTsurugi,
    "Shadow Ghoul": ShadowGhoul,
    "Hoshiningen": Hoshiningen,
    "Cannon Soldier": CannonSoldier,
    "Muka Muka": MukaMuka,
    "Star Boy": StarBoy,
    "Milus Radiant": MilusRadiant,
    "Dark Elf": DarkElf,
    "Witch of the Black Forest": WitchOfTheBlackForest,
    "Little Chimera": LittleChimera,
    "Bladefly": Bladefly,
    "Witch's Apprentice": WitchSApprentice,
    "Shield & Sword": ShieldSword,
    "Robbin' Goblin": RobbinGoblin,
    "Mystic Lamp": MysticLamp,
    "Leghul": Leghul,
    "Ooguchi": Ooguchi,
    "Jinzo #7": Jinzo7,
    "Rainbow Flower": RainbowFlower,
    "Queen's Double": QueenSDouble,
    "Crass Clown": CrassClown,
    "Dream Clown": DreamClown,
    "Thunder Dragon": ThunderDragon,
    "The Unhappy Maiden": TheUnhappyMaiden,
    "Stim-Pack": StimPack,
    "Larvae Moth": LarvaeMoth,
    "Big Eye": BigEye,
    "Steel Scorpion": SteelScorpion,
    "Blast Juggler": BlastJuggler,
    "Electric Lizard": ElectricLizard,
    "Lava Battleguard": LavaBattleguard,
    "Swamp Battleguard": SwampBattleguard,
    "The Cheerful Coffin": TheCheerfulCoffin,
    "Soul Release": SoulRelease
} as {
    [key: string]: (card: Card) => CardEffect[]
}