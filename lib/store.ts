import { create, type StateCreator } from 'zustand'
import type Lenis from '@studio-freight/lenis'

type Setting = 'light' | 'dark' | 'system' | null

export interface SettingState {
  setting: Setting
  setSetting: (setting: Setting) => void
}

export const createSetting: StateCreator<SettingState> = (set) => ({
  setting: null,
  setSetting: (setting) => set({ setting }),
})

interface LenisState {
  lenis: Lenis | null
  setLenis: (lenis: Lenis | null) => void
}

export const createLenisStore: StateCreator<LenisState> = (set) => ({
  lenis: null,
  setLenis: (lenis) => set({ lenis }),
})

export const useStore = create<SettingState & LenisState>((...args) => ({
  ...createSetting(...args),
  ...createLenisStore(...args),
}))
