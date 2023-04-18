import { useStore } from '@/lib/store'
import type Lenis from '@studio-freight/lenis'
import { useEffect, type DependencyList } from 'react'

export function useScroll(
  callback: (lenis: Lenis) => void,
  deps: DependencyList = [],
) {
  const lenis = useStore((state) => state.lenis)

  useEffect(() => {
    if (!lenis) return
    lenis.on('scroll', callback)
    lenis.emit()

    return () => {
      lenis.off('scroll', callback)
    }
  }, [lenis, callback, deps])
}
