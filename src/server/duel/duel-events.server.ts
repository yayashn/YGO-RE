import { DuelRemotes } from "shared/duel/remotes";
import viewZone from "./events/viewZone";
import surrender from "./events/surrender";
import { getPublicCards } from "./events/getPublicCards";


DuelRemotes.Server.Get("getCards").SetCallback(getPublicCards)

DuelRemotes.Server.Get("viewZone").SetCallback(viewZone)

DuelRemotes.Server.Get("surrender").Connect(surrender)