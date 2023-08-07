import { getDuel } from "server/duel/duel";
import { DuelRemotes } from "shared/duel/remotes";

DuelRemotes.Server.Get("handlePhaseClick").Connect((player, phaseName) => {
    const duel = getDuel(player)!;
    const phase = duel.phase.get();
    const turnPlayer = duel.turnPlayer.get();

    if(turnPlayer.selectableZones.get().size() !== 0) return;
    if(turnPlayer.targettableCards.get().size() !== 0) return;
    if (turnPlayer.player !== player) return;
    if (duel.gameState.get() !== "OPEN") return;
    if (duel.battleStep.get() === "DAMAGE") return;
    if (phase === "MP1") {
        if (phaseName === "BP") {
            if (duel!.turn.get() <= 1) {
                return
            }
            duel!.handlePhase("BP")
        } else if (phaseName === "EP") {
            duel!.handlePhase("EP")
        }
    } else if (phase === "MP2") {
        if (phaseName === "EP") {
            duel!.handlePhase("EP")
        }
    } else if (phase === "BP") {
        if (phaseName === "EP" || phaseName === "MP2") {
            duel!.handlePhase("MP2")
        }
    }
})