import Remotes from "shared/net/remotes";
import { createDeck } from "./functions/createDeck";
import { equipDeck } from "./functions/equipDeck";
import { saveDeck } from "./functions/saveDeck";

//Remotes.Server.Get("buyPack")

//Remotes.Server.Get("changeDp")

Remotes.Server.Get("createDeck").Connect(createDeck)

Remotes.Server.Get("equipDeck").Connect(equipDeck)

//Remotes.Server.Get("getEquippedDeck")

//Remotes.Server.Get("getEquippedSleeve")

Remotes.Server.Get("saveDeck").SetCallback(saveDeck)