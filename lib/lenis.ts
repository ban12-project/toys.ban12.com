'use client'

import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import { useStore } from '@/lib/store'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScroll } from '@/hooks/useScroll'
import { useIsomorphicLayoutEffect } from 'ahooks'
import { useResponsive } from '@/hooks/useResponsive'

export default function LenisMount() {
  const [lenis, setLenis] = useStore((state) => [state.lenis, state.setLenis])
  const isDesktop = useResponsive((breakpoint) => breakpoint.md)

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    ScrollTrigger.defaults({
      markers: process.env.NODE_ENV === 'development',
    })
  }, [])
  useScroll(ScrollTrigger.update)

  useEffect(() => {
    if (!lenis) return
    ScrollTrigger.refresh()
    lenis.start()
  }, [lenis])

  useEffect(() => {
    if (!isDesktop) return

    const lenis = new Lenis()
    setLenis(lenis)

    const raf = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(raf)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
      setLenis(null)
    }
  }, [isDesktop, setLenis])

  return null
}
