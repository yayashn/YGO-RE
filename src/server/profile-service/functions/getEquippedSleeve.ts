import items from "../items";
import { getProfile } from "./getProfile";

export const getEquippedSleeve = (player: Player) => {
    const profile = getProfile(player);
    return items.sleeves[profile!.Data.equipped.sleeve as keyof typeof items.sleeves];
}