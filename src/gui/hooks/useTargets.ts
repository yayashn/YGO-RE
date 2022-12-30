import { useEffect, useState } from "@rbxts/roact-hooked"
import { getCard, getDuel } from "server/utils"
import useCards from "./useCards"
import { CardFolder } from "server/ygo"

const httpService = game.GetService("HttpService")
const player = script.FindFirstAncestorWhichIsA("Player")!

export default () => {
    const [duel, YGOPlayer, YGOOpponent] = getDuel(player)!
    const [targets, setTargets] = useState<CardFolder[]>() 
    const cards = useCards(YGOPlayer.Value);
    const cardsOpponent = useCards(YGOOpponent.Value);

    const addTarget = (target: CardFolder) => {
        YGOPlayer.targets.Value = httpService.JSONEncode([...(httpService.JSONDecode(YGOPlayer.targets.Value) as string[]), target.uid])
    }

    const resetTargets = () => {
        YGOPlayer.targets.Value = `[]`
    }

    useEffect(() => {
        setTargets((httpService.JSONDecode(YGOPlayer.targets.Value) as string[]).map((target: string) => {
            return getCard(duel, target)!
        }))
    }, [cards, cardsOpponent, YGOPlayer.targets.Value, YGOOpponent.targets.Value])

    return [targets, addTarget, resetTargets] as [CardFolder[], (target: CardFolder) => void, () => void]
}