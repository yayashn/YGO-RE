import { Card } from "server/duel/card";
import { createGlobalState } from "shared/useGlobalState";

export const shownCardsStore = createGlobalState<Card[] | undefined>(undefined);