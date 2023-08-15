import { profiles } from "../profiles"

export const getProfile = (player: Player) => {
    return profiles[player.UserId]
}