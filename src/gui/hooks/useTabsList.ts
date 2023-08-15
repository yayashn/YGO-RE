import { atom, useAtom } from "shared/jotai";

const tabsListAtom = atom(["Decks", "Shop"])

export default function useTabsList() {
    const [tabsList, setTabsList] = useAtom(tabsListAtom)

    return [tabsList, setTabsList] as const
}