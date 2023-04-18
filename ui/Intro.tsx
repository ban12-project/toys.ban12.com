'use client'

import { Messages } from '@/get-dictionary'
import { useGsapContext } from '@/hooks/useGsapContext'
import { gsap } from 'gsap'

export default function Intro({ messages }: { messages: Messages }) {
  const wrapperRef = useGsapContext<HTMLDivElement>(() => {
    gsap.from(wrapperRef.current!.childNodes, {
      stagger: 0.06,
      opacity: 0,
      x: 20,
      y: 80,
    })
  })

  return (
    <div
      className="my-8 overflow-hidden px-4 md:mx-auto md:max-w-lg"
      ref={wrapperRef}
    >
      <h1 className="md:text-6xlg text-5xl">
        Meet
        <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text px-1 text-6xl font-bold leading-tight tracking-tighter text-transparent md:ml-2">
          QR Code
        </span>
      </h1>

      <p>{messages.hello}</p>
    </div>
  )
}
