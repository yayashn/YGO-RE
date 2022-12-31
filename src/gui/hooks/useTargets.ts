import Object from "@rbxts/object-utils"
import { useEffect, useState } from "@rbxts/roact-hooked"
import { getCard, getDuel } from "server/utils"
import { CardFolder } from "server/ygo"
import { Location } from "shared/types"
import { JSON } from "shared/utils"

const player = script.FindFirstAncestorWhichIsA("Player")!
type CardValues = "location" | "controller" | "uid"

interface TargettableCards {
    location: Location,
    controller: string,
    uid: string
}

export default (card: CardFolder) => {
    const [duel, YGOPlayer, YGOOpponent] = getDuel(player)!
    const [targettableCards, setTargettableCards] = useState<TargettableCards>({} as TargettableCards);
    const [isValidTarget, setIsValidTarget] = useState<boolean>(false);
    const [targets, setTargets] = useState<CardFolder[]>([])

    useEffect(() => {
        const targettableCardsConnection = YGOPlayer.targettableCards.Changed.Connect((newTargettableCards) => {
            setTargettableCards(JSON.parse(newTargettableCards as string) as unknown as TargettableCards)
        });
        const connections: RBXScriptConnection[] = (["location", "controller", "uid"] as CardValues[]).map((key) => {
            return card[key].Changed.Connect(() => {
                setIsValidTarget(checkValidTarget())
            })
        })
        const targetsConnection = YGOPlayer.targets.Changed.Connect((newTargets) => {
            setTargets((JSON.parse(newTargets) as string[]).map((uid) => {
                return getCard(duel, uid)!
            }))
        })

        return () => {
            targettableCardsConnection.Disconnect()
            connections.forEach((c) => c.Disconnect())
            targetsConnection.Disconnect()
        }
    }, [])

    const handleTarget = () => {
        if(targets.find((t) => t.uid.Value === card.uid.Value)) {
            YGOPlayer.targets.Value = JSON.stringify(targets.map(target => target.uid.Value).filter((uid) => uid !== card.uid.Value))
        } else {
            YGOPlayer.targets.Value = JSON.stringify([...targets.map(target => target.uid.Value), card.uid.Value])
        }
    }

    const checkValidTarget = () => {
        if(YGOPlayer.targettableCards.Value === "{}") return false;
        return Object.entries(JSON.parse(YGOPlayer.targettableCards.Value)).every(([key, value]) => {
            switch(key as keyof CardFolder) {
                case "controller":
                    return card.controller.Value.Value.Name === value
                case "location":
                    return card.location.Value.match(value as string).size() > 0
                case "uid":
                    return card.uid.Value === value
            }
        })
    }

    const getTargets = () => {
        return (JSON.parse(YGOPlayer.targets.Value) as string[]).map((uid: string) => {
            return getCard(duel, uid)!
        })
    }

    const isTargetted = () => {
        if(YGOPlayer.targets.Value === "[]") return false;
        return (JSON.parse(YGOPlayer.targets.Value) as string[]).find(uid => uid === card.uid.Value) !== undefined
    }

    return {
        targettableCards: targettableCards,
        isValidTarget,
        targets,
        checkValidTarget,
        handleTarget,
        getTargets,
        isTargetted
    }
}