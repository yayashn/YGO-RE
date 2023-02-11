import { createContext } from "@rbxts/roact";
import { SetStateAction, Dispatch } from "@rbxts/roact-hooked";
import { Card } from "server/profile/profileTemplate";

export default createContext({
    useDeck: [[], () => {}] as [Card[], Dispatch<SetStateAction<Card[]>>],
    useCards: [[], () => {}] as [Card[], Dispatch<SetStateAction<Card[]>>],
    refreshCards: () => {}
})