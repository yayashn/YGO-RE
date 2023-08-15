import { CardTemplate } from "server/types";
import { Pack } from "./packs";
import alert from "server/popups/alert";

export const rarities = {
    rare: 0.70 - 0.0001 - 0.01,
    super: 0.2,
    ultra: 0.1,
    secret: 0.01,
    gold: 0.0001,
}

export const getAmountOfRarity = (rarity: keyof typeof rarities | "common") => {
    let amount = 0
    for (const card of cards) {
        if (card.rarity === rarity) {
            amount += 1
        }
    }
    return amount
}

export const cards: CardTemplate[] = [
    { name: "Tri-Horned Dragon", rarity: "ultra" },
    { name: "Blue-Eyes White Dragon", rarity: "secret" },
    { name: "Gaia the Dragon Champion", rarity: "super" },
    { name: "Dark Magician", rarity: "super" },
    { name: "Gaia The Fierce Knight", rarity: "super" },
    { name: "Red-Eyes Black Dragon", rarity: "super" },
    { name: "Monster Reborn", rarity: "secret" },
    { name: "Right Leg of the Forbidden One", rarity: "ultra" },
    { name: "Left Leg of the Forbidden One", rarity: "ultra" },
    { name: "Right Arm of the Forbidden One", rarity: "ultra" },
    { name: "Left Arm of the Forbidden One", rarity: "ultra" },
    { name: "Exodia the Forbidden One", rarity: "secret" },
    { name: "Flame Swordsman", rarity: "rare" },
    { name: "Celtic Guardian", rarity: "rare" },
    { name: "Dark Hole", rarity: "ultra" },
    { name: "Raigeki", rarity: "secret" },
    { name: "Trap Hole", rarity: "ultra" },
    { name: "Polymerization", rarity: "ultra" },
    { name: "Mystical Elf", rarity: "super" },
    { name: "Curse of Dragon", rarity: "secret" },
    { name: "Swords of Revealing Light", rarity: "ultra" },
    { name: "Man-Eater Bug", rarity: "ultra" },
    { name: "Charubin the Fire Knight", rarity: "common" },
    { name: "Darkfire Dragon", rarity: "common" },
    { name: "Fusionist", rarity: "common" },
    { name: "Flame Ghost", rarity: "common" },
    { name: "Aqua Madoor", rarity: "ultra" },
    { name: "Dragon Capture Jar", rarity: "rare" },
    { name: "Fissure", rarity: "ultra" },
    { name: "Two-Pronged Attack", rarity: "super" },
    { name: "Gravedigger Ghoul", rarity: "common" },
    { name: "Karbonala Warrior", rarity: "common" },
    { name: "Giant Soldier of Stone", rarity: "ultra" },
    { name: "Reaper of the Cards", rarity: "super" },
    { name: "Spirit of the Harp", rarity: "super" },
    { name: "Dragoness the Wicked Knight", rarity: "common" },
    { name: "Stop Defense", rarity: "rare" },
    { name: "Goblin's Secret Remedy", rarity: "super" },
    { name: "Final Flame", rarity: "super" },
    { name: "Metal Dragon", rarity: "rare" },
    { name: "Armed Ninja", rarity: "rare" },
    { name: "Hane-Hane", rarity: "super" },
    { name: "Flower Wolf", rarity: "common" },
    { name: "Pot of Greed", rarity: "gold" },
    { name: "Legendary Sword", rarity: "rare" },
    { name: "Beast Fangs", rarity: "rare" },
    { name: "Violet Crystal", rarity: "rare" },
    { name: "Book of Secret Arts", rarity: "rare" },
    { name: "Power of Kaishin", rarity: "rare" },
    { name: "Dark Energy", rarity: "rare" },
    { name: "Laser Cannon Armor", rarity: "rare" },
    { name: "Vile Germs", rarity: "rare" },
    { name: "Silver Bow and Arrow", rarity: "rare" },
    { name: "Dragon Treasure", rarity: "rare" },
    { name: "Mystical Moon", rarity: "rare" },
    { name: "Machine Conversion Factory", rarity: "rare" },
    { name: "Raise Body Heat", rarity: "rare" },
    { name: "Follow Wind", rarity: "rare" },
    { name: "Hitotsu-Me Giant", rarity: "rare" },
    { name: "Skull Servant", rarity: "common" },
    { name: "Basic Insect", rarity: "common" },
    { name: "Mammoth Graveyard", rarity: "rare" },
    { name: "Silver Fang", rarity: "rare" },
    { name: "Dark Gray", rarity: "common" },
    { name: "Trial of Nightmare", rarity: "rare" },
    { name: "Nemuriko", rarity: "common" },
    { name: "The 13th Grave", rarity: "rare" },
    { name: "Flame Manipulator", rarity: "common" },
    { name: "Monster Egg", rarity: "common" },
    { name: "Firegrass", rarity: "common" },
    { name: "Dark King of the Abyss", rarity: "rare" },
    { name: "Petit Dragon", rarity: "common" },
    { name: "Petit Angel", rarity: "common" },
    { name: "Hinotama Soul", rarity: "common" },
    { name: "Kagemusha of the Blue Flame", rarity: "common" },
    { name: "Two-Mouth Darkruler", rarity: "common" },
    { name: "Dissolverock", rarity: "common" },
    { name: "Root Water", rarity: "common" },
    { name: "The Furious Sea King", rarity: "common" },
    { name: "Green Phantom King", rarity: "rare" },
    { name: "Ray & Temperature", rarity: "common" },
    { name: "King Fog", rarity: "common" },
    { name: "Mystical Sheep #2", rarity: "common" },
    { name: "Masaki the Legendary Swordsman", rarity: "common" },
    { name: "Kurama", rarity: "common" },
    { name: "Forest", rarity: "rare" },
    { name: "Wasteland", rarity: "rare" },
    { name: "Mountain", rarity: "rare" },
    { name: "Sogen", rarity: "rare" },
    { name: "Umi", rarity: "rare" },
    { name: "Yami", rarity: "rare" },
    { name: "Red Medicine", rarity: "common" },
    { name: "Sparks", rarity: "common" },
    { name: "Hinotama", rarity: "common" },
    { name: "Remove Trap", rarity: "common" },
    { name: "Tyhone", rarity: "rare" },
    { name: "Beaver Warrior", rarity: "rare" },
    { name: "Uraby", rarity: "ultra" },
    { name: "Larvas", rarity: "common" },
    { name: "Hard Armor", rarity: "common" },
    { name: "Man Eater", rarity: "common" },
    { name: "M-Warrior #1", rarity: "common" },
    { name: "M-Warrior #2", rarity: "common" },
    { name: "Armaill", rarity: "common" },
    { name: "Terra the Terrible", rarity: "rare" },
    { name: "Frenzied Panda", rarity: "rare" },
    { name: "Kumootoko", rarity: "common" },
    { name: "Meda Bat", rarity: "common" },
    { name: "One-Eyed Shield Dragon", rarity: "common" },
    { name: "Electro-Whip", rarity: "rare" },
    { name: "Spike Seadra", rarity: "super" },
    { name: "Tripwire Beast", rarity: "common" },
    { name: "Skull Red Bird", rarity: "ultra" },
    { name: "Sand Stone", rarity: "common" },
    { name: "Misairuzame", rarity: "common" },
    { name: "Steel Ogre Grotto #1", rarity: "common" },
    { name: "Lesser Dragon", rarity: "rare" },
    { name: "Darkworld Thorns", rarity: "common" },
    { name: "Drooling Lizard", rarity: "common" },
]

function getRandomCardByRarity(rarity: string) {
    const cardsByRarity = cards.filter(card => card.rarity === rarity);
    const random = new Random()
    const randomIndex = random.NextInteger(0, cardsByRarity.size() - 1)
    return cardsByRarity[randomIndex];
}

const pack: Pack = {
    cards,
    getFullRandomPack: () => {
        const random = new Random();
        const pack = [];

        for (let i = 0; i < 8; i++) {
            const randomCommon = random.NextInteger(0, cards.size() - 1);
            if (cards[randomCommon].rarity === 'common') {
                pack.push(cards[randomCommon]);
            } else {
                i--;
            }
        }

        const randomNonCommon = random.NextInteger(0, 10000)/10000;
        let nonCommonRarity;
        if (randomNonCommon <= rarities.gold) {
            nonCommonRarity = 'gold';
        } else if (randomNonCommon <= rarities.secret) {
            nonCommonRarity = 'secret';
        } else if (randomNonCommon <= rarities.ultra) {
            nonCommonRarity = 'ultra';
        } else if (randomNonCommon <= rarities.super) {
            nonCommonRarity = 'super';
        } else {
            nonCommonRarity = 'rare';
        }

        const nonCommonCard = getRandomCardByRarity(nonCommonRarity);
        pack.push(nonCommonCard);

        return pack.map(card => card);
    },
    price: 1000,
    alert: (player: Player) => {
        const amountOfGold = getAmountOfRarity("gold")
        const amountOfSecret = getAmountOfRarity("secret")
        const amountOfUltra = getAmountOfRarity("ultra")
        const amountOfSuper = getAmountOfRarity("super")
        const amountOfRare = getAmountOfRarity("rare")
        alert(`This pack guarantees you: 8 commons + 1 rare or higher. Chances of obtaining: rare (${amountOfRare}) - ${rarities.rare*100}%, super (${amountOfSuper}) - ${rarities.super*100}%, ultra (${amountOfUltra}) - ${rarities.ultra*100}%, secret (${amountOfSecret}) - ${rarities.secret*100}%, gold (${amountOfGold}) - ${rarities.gold*100}%.`, player)
    }

}

export default pack;