import { gsap } from 'gsap'
import { useRef, type DependencyList } from 'react'
import { useIsomorphicLayoutEffect } from 'ahooks'

/**
 * @param `callback` ANIMATION CODE HERE
 * ```javascript
 * return () => {
 *   // cleanup code (optional)
 * }
 * ```
 * @param `deps` `default []` empty dependency Array so it doesn't re-run on every render!
 * - `[someProp]` runs after first render and every time `someProp` changes
 * - `undefined` runs after every render
 * @see https://greensock.com/react-basics
 */
export function useGsapContext<T = HTMLElement>(
  callback: (
    ctx: Parameters<NonNullable<Parameters<typeof gsap.context>[0]>>[0],
  ) => void | (() => void),
  deps: DependencyList = [],
) {
  // create a ref for the root level element (for scoping)
  const wrapperRef = useRef<T | null>(null)
  const cleanup = useRef<void | (() => void)>()

  useIsomorphicLayoutEffect(() => {
    // create our context. This function is invoked immediately and all GSAP animations and ScrollTriggers created during the execution of this function get recorded so we can revert() them later (cleanup)
    const ctx = gsap.context((ctx) => {
      cleanup.current = callback(ctx)
    }, wrapperRef) // <- IMPORTANT! Scopes selector text

    return () => {
      ctx.revert()
      if (typeof cleanup.current === 'function') {
        cleanup.current()
        cleanup.current = undefined
      }
    }
  }, deps) // <- empty dependency Array so it doesn't re-run on every render

  return wrapperRef
}
