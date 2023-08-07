import { Element, createContext, createElement, useContext, useRef } from '@rbxts/roact'
import { createStore, getDefaultStore } from '../vanilla/store'

type Store = ReturnType<typeof createStore>

const StoreContext = createContext<Store | undefined>(undefined)

type Options = {
  store?: Store
}

export const useStore = (options?: Options): Store => {
  const store = useContext(StoreContext)
  return options?.store || store || getDefaultStore()
}

export const Provider = ({
  children,
  store,
}: {
  children?: Element
  store?: Store
}) => {
  const storeRef = useRef<Store>()
  if (!store && !storeRef.current) {
    storeRef.current = createStore()
  }
  return createElement(
    StoreContext.Provider,
    {
      value: store || storeRef.current,
    },
    children ? [children] : undefined
  )
}
