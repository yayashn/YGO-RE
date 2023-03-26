import type { CardFolder } from 'server/types'
import Spell from './Spell'

export default (card: CardFolder) => {
    return Spell(card)
}