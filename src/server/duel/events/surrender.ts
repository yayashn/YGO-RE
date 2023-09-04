import { getDuel } from "server/duel/duel";

export default function surrender(player: Player) {
    const duel = getDuel(player)!; 
    const yPlayer = duel.getOpponent(player);
    duel.endDuel(yPlayer, 'Surrendered.');
}