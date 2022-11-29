import moveCard from "shared/moveCard";
import type { CardGui, YGOLocation, YGOZone } from "shared/types";
import YGOCard from "shared/ygo/card";

const serverStorage = game.GetService("ServerStorage");
const duels = serverStorage.FindFirstChild("Duels")!;
const players = game.GetService("Players")!;


export class YGOPlayer {
	lifePoints = 8000;
	duel;
	player;
	
	constructor(player: Player, duel: Duel) {
		this.duel = duel;
		this.player = player;
	}

	draw(amount: number) {

	}

	specialSummon(card: CardGui, zone: YGOZone) {
		
	}
}

export class Duel {
	player1;
	player2;
	duelStore;
	phase = "DP";
	
	constructor(player1: Player, player2: Player, duelStore: BindableFunction) {
		this.player1 = new YGOPlayer(player1, this);
		this.player2 = new YGOPlayer(player2, this);
		this.duelStore = duelStore;
	}

	start() {
		this.player1.draw(5);
		this.player2.draw(5);
	}

	end() {
		this.duelStore.Destroy();
	}
}