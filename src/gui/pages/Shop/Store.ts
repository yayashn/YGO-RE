import { CardFolder } from "server/types";
import { createGlobalState } from "shared/useGlobalState";

export const showPackOpenStore = createGlobalState<CardFolder[]>([]);