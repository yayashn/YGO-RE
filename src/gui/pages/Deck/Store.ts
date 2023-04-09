import { createGlobalState } from "shared/useGlobalState";

export const deckStore = createGlobalState<undefined | string>(undefined)
export const equippedDeckStore = createGlobalState<boolean>(false)