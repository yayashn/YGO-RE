import Object from "@rbxts/object-utils"
import { DuelFolder, PlayerValue } from "server/types"
import { clearAction, getOpponent } from "server/utils"
import changedOnce from "shared/lib/changedOnce"

export default async function handleResponses (
    p: PlayerValue, 
    duel: DuelFolder
) {
    if(duel.handlingResponses.Value === true) return
    const prompt = async (p: PlayerValue, msg: string) => {
        p.promptMessage.Value = msg
        const res = new Promise<{
            endPrompt: () => void
            response: 'YES' | 'NO'
        }>((resolve) => {
            p.promptResponse.Changed.Wait()
            resolve({
                endPrompt: () => (p.promptResponse.Value = ''),
                response: p.promptResponse.Value as 'YES' | 'NO'
            })
        })
        return res
    }
    duel.speedSpell.Value = 2
    duel.handlingResponses.Value = true
    duel.gameState.Value = 'CLOSED'
    let passes = 0
    duel.actor.Value = p
    const chain = duel.getChain.Invoke()
    const responses = duel.getResponses.Invoke()

    while (passes < 2) {
        const numberOfResponses = responses[duel.actor.Value.Name].size()
        const lastCardInChain = chain[Object.keys(chain).size() - 1]
        const chainStartMessage = `You have ${numberOfResponses} card/effect${
            numberOfResponses > 1 ? 's' : ''
        } that can be activated. Activate?`
        const chainResponseMessage = `"${
            lastCardInChain ? lastCardInChain.card.Name : '?'
        }" is activated. Chain another card or effect?`

        if (numberOfResponses > 0) {
            const { endPrompt, response } = await prompt(
                duel.actor.Value,
                numberOfResponses >= 1
                    ? chainStartMessage
                    : chainResponseMessage || chainStartMessage
            )
            endPrompt()

            if (response === 'YES') {
                passes = 0
                await changedOnce(duel.actor.Value.action.Changed)
                await Promise.delay(.15)
            } else if (response === 'NO') {
                passes++
            }
        } else {
            passes++
        }

        clearAction(getOpponent(duel.actor.Value))
        if(passes < 2) {
            duel.actor.Value = getOpponent(duel.actor.Value)
        } else if(passes === 2) {
            duel.actor.Value = duel.turnPlayer.Value
        }
    }
    duel.handlingResponses.Value = false
    duel.resolveChain.Fire()
}