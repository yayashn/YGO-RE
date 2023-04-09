import { Profile } from "@rbxts/profileservice/globals";
import { ProfileTemplate } from "../profileTemplate";

export const getAvatar = (profile: Profile<ProfileTemplate>) => {
    return profile.Data.avatars.find(a => profile.Data.equipped.avatar === a)
}

export const getAvatars = (profile: Profile<ProfileTemplate>) => {
    return profile.Data.avatars
}

export const getDP = (profile: Profile<ProfileTemplate>) => {
    if(!profile.Data.dp) {
        while(!profile.Data.dp) {
            wait()
        }
    }
    return profile.Data.dp
}

export const addDeck = (profile: Profile<ProfileTemplate>, deckName: string) => {
    return profile.Data.decks[deckName] = {
        deck: [],
        extra: [],
    }
}