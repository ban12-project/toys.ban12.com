'use client'

import { MutableRefObject, createContext, useContext, useRef } from 'react'

const CanvasContext =
  createContext<MutableRefObject<HTMLCanvasElement | null> | null>(null)

export function useCanvasRef() {
  return useContext(CanvasContext)
}

export default function CanvasContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  return (
    <>
      <CanvasContext.Provider value={canvasRef}>
        {children}
      </CanvasContext.Provider>
      <canvas ref={canvasRef}></canvas>
    </>
  )
}
