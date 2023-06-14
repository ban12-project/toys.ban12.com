import { createContext } from 'react'
import { createStore } from 'zustand'

interface BearProps {
  data: string
}

interface QRCodeState extends BearProps {
  setData: (data: string) => void
}

type QRCodeStore = ReturnType<typeof createQRCodeStore>

export const createQRCodeStore = (initProps?: Partial<BearProps>) => {
  const defaultProps: BearProps = {
    data: '',
  }

  return createStore<QRCodeState>()((set) => ({
    ...defaultProps,
    ...initProps,
    setData: (data) => set({ data }),
  }))
}

export const QRCodeContext = createContext<QRCodeStore | null>(null)
