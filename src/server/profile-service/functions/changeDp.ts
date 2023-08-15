import { getProfile } from "./getProfile";
import { profileChanged } from "./profileChanged";

export const changeDp = (player: Player, amount: number) => {
    const profile = getProfile(player)
    if (profile !== undefined) {
        profile.Data.dp += amount;
    }
    profileChanged(player, profile!.Data)
}