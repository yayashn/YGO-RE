import alert from "server/popups/alert";
import { getProfile } from "server/profile-service/functions/getProfile";
import { CardTemplate } from "server/types";

export const cards = () => [
    { name: "Catapult Turtle", rarity: "pre-release" },
    { name: "Heavy Storm", rarity: "pre-release" },
    { name: "White Magical Hat", rarity: "pre-release" },
    { name: "Tribute to the Doomed", rarity: "pre-release" },
    { name: "Kazejin", rarity: "pre-release" },
    { name: "Mirror Force", rarity: "pre-release" },
    { name: "Time Wizard", rarity: "pre-release" },
    { name: "Magic Jammer", rarity: "pre-release" }
]

export function getRandomBossCard() {
    const random = new Random();
    const c = cards();
    return c[random.NextInteger(0, c.size() - 1)];
}

const noobCards: CardTemplate[] = [
    { name: "Kuriboh", rarity: "pre-release" },
]

export function giftPack(player: Player) {
    const profile = getProfile(player);

    const bossCard = getRandomBossCard();

    const other = [...noobCards];

    const allCards = [...other, bossCard];
    alert(`You have been gifted: ${bossCard.name}!, ${other.map(card => card.name).join(", ")}`, player);
    profile!.Data.cards = [...profile!.Data.cards, ...allCards]
}