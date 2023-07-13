import {
  useEffect,
  useRef,
  createContext,
  useContext,
  useState,
  PropsWithChildren,
  use,
  Suspense,
  RefObject,
  cache,
} from 'react'
import type {
  Engine,
  EngineOptions,
  Scene,
  SceneOptions,
  WebGPUEngineOptions,
  Nullable,
  WebGPUEngine,
} from '@babylonjs/core'
import Script from 'next/script'

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

const SCRIPT_READY_EVENT_NAME = 'babylonLoaderReady'
const evt = new Event(SCRIPT_READY_EVENT_NAME)
const et = new EventTarget()
const CANVAS_READY_EVENT_NAME = 'canvasReady'

export default function BabylonLoader({
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

  return (
    <>
      <Script
        src="https://cdn.babylonjs.com/babylon.js"
        onReady={() => {
          et.dispatchEvent(evt)
        }}
      />
      <canvas ref={reactCanvas} {...rest} />
      <Suspense fallback={<p>loading</p>}>
        <SceneComponent
          {...{
            antialias,
            engineOptions,
            adaptToDeviceRatio,
            sceneOptions,
            onRender,
            onSceneReady,
            renderChildrenWhenReady,
            children,
            reactCanvas,
          }}
        />
      </Suspense>
    </>
  )
}

const loadBabylon = cache(async () => {
  return new Promise<void>((resolve) => {
    if (!!window.BABYLON) resolve()

    et.addEventListener(SCRIPT_READY_EVENT_NAME, () => {
      resolve()
    })
  })
})

const getEngine = cache(
  async (
    canvas: HTMLCanvasElement,
    antialias: BabylonjsProps['antialias'],
    engineOptions: BabylonjsProps['engineOptions'],
    adaptToDeviceRatio: BabylonjsProps['adaptToDeviceRatio'],
  ) => {
    return await createEngine(canvas!, {
      antialias,
      engineOptions,
      adaptToDeviceRatio,
    })
  },
)

function SceneComponent({
  antialias,
  engineOptions,
  adaptToDeviceRatio,
  sceneOptions,
  onRender,
  onSceneReady,
  renderChildrenWhenReady,
  children,
  reactCanvas,
}: PropsWithChildren<
  BabylonjsProps & { reactCanvas: RefObject<HTMLCanvasElement | null> }
>) {
  const { current: canvas } = reactCanvas

  use(loadBabylon())

  const engine = use(
    getEngine(canvas!, antialias, engineOptions, adaptToDeviceRatio),
  )

  const [engineContext, setEngineContext] = useState<EngineCanvasContextType>({
    engine: null,
    canvas: null,
  })

  const [sceneContext, setSceneContext] = useState<SceneContextType>({
    scene: null,
    sceneReady: false,
  })

  const active = useRef(false)

  // set up basic engine and scene
  useEffect(() => {
    if (active.current) return
    active.current = true

    setEngineContext(() => ({
      engine,
      canvas,
    }))

    const scene = new window.BABYLON.Scene(engine, sceneOptions)
    const sceneIsReady = scene.isReady()
    if (sceneIsReady) {
      onSceneReady(scene)
    } else {
      scene.onReadyObservable.addOnce((scene) => {
        onSceneReady(scene)
        setSceneContext(() => ({
          canvas,
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
      canvas,
      scene,
      engine,
      sceneReady: sceneIsReady,
    }))

    return () => {
      scene.getEngine().dispose()

      if (window) {
        window.removeEventListener('resize', resize)
      }
    }
  }, [canvas, engine, onRender, onSceneReady, sceneOptions])

  return (
    <EngineCanvasContext.Provider value={engineContext}>
      <SceneContext.Provider value={sceneContext}>
        {(renderChildrenWhenReady !== true ||
          (renderChildrenWhenReady === true && sceneContext.sceneReady)) &&
          children}
      </SceneContext.Provider>
    </EngineCanvasContext.Provider>
  )
}
