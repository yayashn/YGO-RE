import Object from "@rbxts/object-utils"
import promptSync from "server/gui/promptSync"
import { CardFolder, ChainedEffect, DuelFolder, PlayerValue } from "server/types"
import { clearAction } from "server/utils"
import changedOnceSync from "shared/lib/changedOnceSync"


export default (p: PlayerValue, duel: DuelFolder, responses: Record<'player1' | 'player2', CardFolder[]>, chain: Record<number, ChainedEffect>, resolveChain: Callback) => {
    const opponent = (p: PlayerValue) => (p === duel.player1 ? duel.player2 : duel.player1)
    // if(handlingResponses) return
    duel.speedSpell.Value = 2
    //handlingResponses = true
    duel.gameState.Value = 'CLOSED'
    let passes = 0
    duel.actor.Value = p

    while (passes < 2) {
        const numberOfResponses = responses[duel.actor.Value.Name].size()

        if (numberOfResponses > 0) {
            const lastCardInChain = chain[Object.keys(chain).size() - 1]
            const chainStartMessage = `You have ${numberOfResponses} card/effect${
                numberOfResponses > 1 ? 's' : ''
            } that can be activated. Activate?`
            const chainResponseMessage = `"${
                lastCardInChain ? lastCardInChain.card.Name : '?'
            }" is activated. Chain another card or effect?`
            const response = promptSync(
                duel.actor.Value,
                numberOfResponses >= 1
                    ? chainStartMessage
                    : chainResponseMessage || chainStartMessage
            )
            if (response === 'YES') {
                passes = 0
                changedOnceSync(duel.actor.Value.action.Changed)
            } else if (response === 'NO') {
                passes++
            }
        } else {
            passes++
        }

        clearAction(opponent(duel.actor.Value))
        if(passes < 2) {
            duel.actor.Value = opponent(duel.actor.Value)
        } else if(passes === 2) {
            duel.actor.Value = duel.turnPlayer.Value
        }
    }
//    handlingResponses = false
    print(4)
    resolveChain()
}