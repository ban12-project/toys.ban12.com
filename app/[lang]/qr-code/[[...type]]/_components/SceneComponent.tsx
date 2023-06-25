import { useEffect, useRef, createContext, useContext, useState } from 'react'
import type {
  Engine,
  EngineOptions,
  Scene,
  SceneOptions,
  WebGPUEngineOptions,
  Nullable,
} from '@babylonjs/core'
import Script from 'next/script'
import { IN_BROWSER } from '@/lib/globals'

declare global {
  interface Window {
    BABYLON: typeof import('@babylonjs/core')
  }
}

// engine
export type EngineCanvasContextType = {
  engine: Nullable<Engine>
  canvas: Nullable<HTMLCanvasElement | WebGLRenderingContext>
}

export const EngineCanvasContext = createContext<EngineCanvasContextType>({
  engine: null,
  canvas: null,
})

/**
 * Get the engine from the context.
 */
export const useEngine = (): Nullable<Engine> =>
  useContext(EngineCanvasContext).engine

// scene
export type SceneContextType = {
  scene: Nullable<Scene>
  sceneReady: boolean
}

export const SceneContext = createContext<SceneContextType>({
  scene: null,
  sceneReady: false,
})

/**
 * Get the scene from the context.
 */
export const useScene = (callback: (scene: Scene) => void | (() => void)) => {
  const scene = useContext(SceneContext).scene

  useEffect(() => {
    if (!scene) return
    const cleanup = callback(scene)

    return cleanup
  }, [callback, scene])
}

type BabylonjsProps = {
  antialias?: boolean
  engineOptions?: EngineOptions & WebGPUEngineOptions
  adaptToDeviceRatio?: boolean
  sceneOptions?: SceneOptions
  onSceneReady: (scene: Scene) => void
  onRender?: (scene: Scene) => void
  renderChildrenWhenReady?: boolean
}

async function createEngine(
  canvas: HTMLCanvasElement,
  {
    antialias,
    engineOptions,
    adaptToDeviceRatio,
  }: Pick<BabylonjsProps, 'antialias' | 'engineOptions' | 'adaptToDeviceRatio'>,
) {
  const webGPUSupported = await window.BABYLON.WebGPUEngine.IsSupportedAsync
  if (webGPUSupported) {
    const engine = new window.BABYLON.WebGPUEngine(canvas, {
      ...engineOptions,
      antialias,
    })
    await engine.initAsync()
    return engine
  }
  return new window.BABYLON.Engine(
    canvas,
    antialias,
    engineOptions,
    adaptToDeviceRatio,
  )
}

export default function SceneComponent({
  antialias,
  engineOptions,
  adaptToDeviceRatio,
  sceneOptions,
  onRender,
  onSceneReady,
  renderChildrenWhenReady,
  children,
  ...rest
}: BabylonjsProps & React.CanvasHTMLAttributes<HTMLCanvasElement>) {
  const reactCanvas = useRef<HTMLCanvasElement>(null)
  const active = useRef(false)

  const [engineContext, setEngineContext] = useState<EngineCanvasContextType>({
    engine: null,
    canvas: null,
  })

  const [sceneContext, setSceneContext] = useState<SceneContextType>({
    scene: null,
    sceneReady: false,
  })

  const [isReady, setIsReady] = useState(IN_BROWSER ? !!window.BABYLON : false)

  // set up basic engine and scene
  useEffect(() => {
    if (!isReady) return

    const { current: canvas } = reactCanvas

    if (!canvas) return
    if (active.current) return
    active.current = true

    const cleanupCallbacks: (() => void)[] = []

    ;(async () => {
      const engine = await createEngine(canvas, {
        antialias,
        engineOptions,
        adaptToDeviceRatio,
      })
      setEngineContext(() => ({
        engine,
        canvas: reactCanvas.current,
      }))

      const scene = new window.BABYLON.Scene(engine, sceneOptions)
      const sceneIsReady = scene.isReady()
      if (sceneIsReady) {
        onSceneReady(scene)
      } else {
        scene.onReadyObservable.addOnce((scene) => {
          onSceneReady(scene)
          setSceneContext(() => ({
            canvas: reactCanvas.current,
            scene,
            engine,
            sceneReady: true,
          }))
        })
      }

      engine.runRenderLoop(() => {
        if (typeof onRender === 'function') onRender(scene)
        scene.render()
      })

      const resize = () => {
        scene.getEngine().resize()
      }

      if (window) {
        window.addEventListener('resize', resize)
      }

      setSceneContext(() => ({
        canvas: reactCanvas.current,
        scene,
        engine,
        sceneReady: sceneIsReady,
      }))

      cleanupCallbacks.push(() => {
        scene.getEngine().dispose()

        if (window) {
          window.removeEventListener('resize', resize)
        }
      })
    })()

    return () => {
      let cb
      while ((cb = cleanupCallbacks.shift())) {
        cb()
      }
    }
  }, [
    antialias,
    engineOptions,
    adaptToDeviceRatio,
    sceneOptions,
    onRender,
    onSceneReady,
    isReady,
  ])

  return (
    <>
      <Script
        src="https://cdn.babylonjs.com/babylon.js"
        onReady={() => {
          setIsReady(true)
        }}
      />
      {!isReady && <p>loading</p>}
      <canvas ref={reactCanvas} {...rest} />
      <EngineCanvasContext.Provider value={engineContext}>
        <SceneContext.Provider value={sceneContext}>
          {(renderChildrenWhenReady !== true ||
            (renderChildrenWhenReady === true && sceneContext.sceneReady)) &&
            children}
        </SceneContext.Provider>
      </EngineCanvasContext.Provider>
    </>
  )
}
