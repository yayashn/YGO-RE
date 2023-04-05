import type { CardFolder, DuelFolder } from 'server/types'
import NormalSpell from 'server-storage/conditions/NormalSpell'
import { CardEffect } from '.'
import { createInstance } from 'shared/utils'
import { getCards, getFilteredCards } from 'server/utils'

/*
    All Warrior and Beast-Warrior monsters on the field gain 200 ATK/DEF.
*/
const BUFF_ATK = 200
const BUFF_DEF = 200
const BUFF_RACES = ['Warrior', 'Beast-Warrior']

export default (card: CardFolder) => {
    const controller = card.controller.Value
    const duel = controller.Parent as DuelFolder
    
    const meetsBuffCondition = (c: CardFolder) => {
        const buffedCards = getFilteredCards(duel, {
            race: BUFF_RACES,
            location: ['MZone1', 'MZone2', 'MZone3', 'MZone4', 'MZone5'],
            position: ['FaceUpAttack', 'FaceUpDefense'],
        })

        return buffedCards.includes(c)
    }

    const effect = () => {
        const connections: RBXScriptConnection[] = []

        const allCards = getCards(duel)

        const handleBuff = (buffedCard: CardFolder, forceRemove?: boolean) => {
            const buffed = buffedCard.FindFirstChild(`buffed-${card.uid.Value}`) as BoolValue
            if (
                !forceRemove &&
                buffed.Value === false &&
                meetsBuffCondition(buffedCard)
            ) {
                buffed.Value = true
                if (buffedCard.atk.Value + BUFF_ATK < 0) {
                    buffedCard.atk.Value = 0
                } else {
                    buffedCard.atk.Value += BUFF_ATK
                }
                if (buffedCard.def.Value + BUFF_DEF < 0) {
                    buffedCard.def.Value = 0
                } else {
                    buffedCard.def.Value += BUFF_DEF
                }
            } else if (buffed.Value === true) {
                buffed.Value = false
                if (buffedCard.atk.Value - BUFF_ATK < 0) {
                    buffedCard.atk.Value = 0
                } else {
                    buffedCard.atk.Value -= BUFF_ATK
                }
                if (buffedCard.def.Value - BUFF_DEF < 0) {
                    buffedCard.def.Value = 0
                } else {
                    buffedCard.def.Value -= BUFF_DEF
                }
            }
        }

        allCards.forEach((buffedCard) => {
            createInstance(`BoolValue`, `buffed-${card.uid.Value}`, buffedCard)
            handleBuff(buffedCard)
            connections.push(buffedCard.position.Changed.Connect(() => handleBuff(buffedCard)))
            connections.push(buffedCard.location.Changed.Connect(() => handleBuff(buffedCard)))
            connections.push(buffedCard.race.Changed.Connect(() => handleBuff(buffedCard)))
        })

        const onCardRemoved = () => {
            connections.forEach((connection) => {
                connection.Disconnect()
            })
            allCards.forEach((buffedCard) => {
                handleBuff(buffedCard, true)
                const buffed = buffedCard.FindFirstChild(`buffed-${card.uid.Value}`) as BoolValue
                buffed.Destroy()
            })
        }

        connections.push(card.position.Changed.Connect(position => {
            if (position !== "FaceUp") {
                onCardRemoved()
            }
        }))
        connections.push(
            card.location.Changed.Connect((location) => {
                if (location !== 'FZone') {
                    onCardRemoved()
                }
            })
        )
    }

    const effects: CardEffect[] = [
        {
            condition: () => NormalSpell(card),
            effect: () => effect(),
            location: ['FZone']
        }
    ]

    return effects
}