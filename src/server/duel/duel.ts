import { Subscribable } from "shared/Subscribable";
import { YPlayer } from "./player";
import { Phase } from "./types";
import { Dictionary as Object } from "@rbxts/sift";
import Remotes from "shared/net";

export let duels: Record<string, Duel> = {}

export class Duel {
    player1: YPlayer;
    player2: YPlayer;
    phase: Subscribable<Phase>;

    constructor(player1: Player, player2: Player) {
        this.player1 = new YPlayer(player1);
        this.player2 = new YPlayer(player2);
        duels[`${player1.UserId}:${player2.UserId}`] = this;

        this.phase = new Subscribable<Phase>("DP");

        Remotes.Server.Get("showField").SendToPlayers([player1, player2], true);

        [player1, player2].forEach(player => {
            const route = player.GetDescendants().find(descendant => descendant.IsA("StringValue") && descendant.Name === "route") as StringValue;
            route.Value = "/duel/"
        })
    }
    
    endDuel() {
        duels = Object.fromEntries(Object.entries(duels).filter(([key, value]) => value !== this));
        Remotes.Server.Get("showField").SendToPlayers([this.player1.player, this.player2.player], false);
    }

    getOpponent(player: Player) {
        return player === this.player1.player ? this.player2 : this.player1;
    }
}

export function getDuel(player: Player) {
    return Object.values(duels).find(duel => duel.player1.player === player || duel.player2.player === player)
}