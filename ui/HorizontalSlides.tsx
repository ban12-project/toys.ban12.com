'use client'

import { useRect } from '@studio-freight/hamo'
import { useScroll } from '@/hooks/useScroll'
import React, { useEffect, useState, useRef } from 'react'
import { useWindowSize } from '@/hooks/useWindowSize'
import { gsap } from 'gsap'
import clsx from 'clsx'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRafState } from 'ahooks'

interface Props {
  children: React.ReactNode
  className?: string
}

export default function HorizontalSlides({ children, className }: Props) {
  const elementRef = useRef<HTMLDivElement | null>(null)
  const [wrapperRectRef, wrapperRect] = useRect()
  const [elementRectRef, elementRect] = useRect()
  const childRect = useRef<Record<'left' | 'width', number>[]>([])

  const updateChildRect = () => {
    if (!elementRef.current) return
    // 收集 children 的 offsetLeft
    childRect.current = Array.from(
      elementRef.current.childNodes as NodeListOf<HTMLElement>,
    ).map((node) => ({ left: node.offsetLeft, width: node.offsetWidth }))
  }

  useEffect(() => {
    if (!elementRef.current) return
    updateChildRect()

    gsap.set(elementRef.current.childNodes, {
      transformOrigin: 'right center',
      force3D: true,
    })
  }, [elementRef])

  // elementRect 变化会影响后面元素的 ScrollTrigger 触发位置
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [elementRect])

  const { height: windowHeight } = useWindowSize()

  const [windowWidth, setWindowWidth] = useRafState(Infinity)

  useScroll(({ scroll, direction }) => {
    if (!elementRect || !elementRef.current) return

    const start = Math.max(wrapperRect.top - windowHeight, 0)
    const end = wrapperRect.top + wrapperRect.height - windowHeight

    let progress = gsap.utils.mapRange(start, end, 0, 1, scroll)
    progress = gsap.utils.clamp(0, 1, progress)

    const x = progress * (elementRect.width - windowWidth)

    /* gsap.to(elementRef.current.childNodes, {
      x: -x,
      // lenis direction -1|1
      stagger: direction * 0.033,
      ease: 'none',
      duration: 0,
    }) */

    elementRef.current.childNodes.forEach((node, index) => {
      const offsetLeft = childRect.current[index].left - x
      const inView =
        offsetLeft < wrapperRect.width &&
        offsetLeft > wrapperRect.left - childRect.current[index].width

      gsap.set(node, { css: { visibility: inView ? 'revert' : 'hidden' } })

      if (!inView) return
      gsap.to(node, {
        x: -x,
        ease: 'none',
        duration: 0,
      })
    })
  })

  useEffect(() => {
    const onResize = () => {
      setWindowWidth(
        // document.documentElement.offsetWidth do not include the scrollbars.
        Math.min(window.innerWidth, document.documentElement.offsetWidth),
      )
      updateChildRect()
    }

    window.addEventListener('resize', onResize, false)
    onResize()

    return () => {
      window.removeEventListener('resize', onResize, false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={wrapperRectRef}
      style={elementRect ? { height: elementRect.width + 'px' } : {}}
    >
      <div className={clsx('overflow-hidden', [className])}>
        <div
          className="flex"
          ref={(node) => {
            elementRef.current = node
            elementRectRef(node)
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
