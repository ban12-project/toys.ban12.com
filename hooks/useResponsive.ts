import { useEffect, useMemo, useState } from 'react'

interface Breakpoints {
  /** (min-width: 640px) This will only center text on screens 640px and wider, not on small screens */
  sm: boolean
  /** (min-width: 768px) */
  md: boolean
  /** (min-width: 1024px) */
  lg: boolean
  /** (min-width: 1280px) */
  xl: boolean
  /** (min-width: 1536px) */
  '2xl': boolean
}

export function useResponsive(): Breakpoints
export function useResponsive<U>(selector: (breakpoints: Breakpoints) => U): U
export function useResponsive<U>(selector?: (breakpoints: Breakpoints) => U) {
  const [breakpoints, setBreakpoints] = useState({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  })

  useEffect(() => {
    const onResize = () => {
      // tailwindcss responsive breakpoints
      // https://tailwindcss.com/docs/responsive-design
      setBreakpoints({
        sm: window.matchMedia('(min-width: 640px)').matches,
        md: window.matchMedia('(min-width: 768px)').matches,
        lg: window.matchMedia('(min-width: 1024px)').matches,
        xl: window.matchMedia('(min-width: 1280px)').matches,
        '2xl': window.matchMedia('(min-width: 1536px)').matches,
      })
    }

    window.addEventListener('resize', onResize, false)
    onResize()

    return () => {
      window.removeEventListener('resize', onResize, false)
    }
  }, [])

  return useMemo(
    () => (selector ? selector(breakpoints) : breakpoints),
    [breakpoints, selector],
  )
}
