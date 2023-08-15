import { atom, useAtom } from "shared/jotai"

type Page = {
    name: string
    deckName?: string
}

const pageAtom = atom<Page>({ name: "" })

export default function usePage() {
    const [page, setPage] = useAtom(pageAtom)

    return [page, setPage] as const
}