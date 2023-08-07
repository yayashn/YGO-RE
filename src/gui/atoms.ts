import { CardPublic } from "server/duel/types";
import { atom } from "shared/jotai";

export const hoveredCardAtom = atom<CardPublic | false>(false);
export const showMenuAtom = atom<CardPublic | false>(false);