import type { Card } from "server/duel/card";
import { createGlobalState } from "shared/useGlobalState";

export const showMenuStore = createGlobalState<Card | undefined>(undefined);