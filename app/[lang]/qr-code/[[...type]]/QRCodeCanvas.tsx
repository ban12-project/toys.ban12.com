'use client'

import {
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Color4,
  Mesh,
  InstancedMesh,
  StandardMaterial,
  Color3,
  VertexBuffer,
} from '@babylonjs/core'
import SceneComponent, { useScene } from './_components/SceneComponent'
import { useQRCode } from '@/hooks/useQRCode'
import { useContext, useRef, useState } from 'react'
import { QRCodeContext, createQRCodeStore } from '@/lib/qrcodeStore'
import { useStore } from 'zustand'
import { IN_BROWSER } from '@/lib/globals'

let box: Mesh

const onSceneReady = async (scene: Scene) => {
  scene.clearColor = new Color4(0, 0, 0, 0)

  const camera = new ArcRotateCamera(
    'Camera',
    -Math.PI / 2,
    Math.PI / 2,
    12,
    Vector3.Zero(),
    scene,
  )
  camera.attachControl()

  // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
  const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene)

  // Create a built-in "ground" shape;
  const ground = MeshBuilder.CreateGround(
    'ground1',
    { width: 100, height: 100, subdivisions: 2, updatable: false },
    scene,
  )
  ground.isVisible = false

  box = MeshBuilder.CreateBox('box', { size: 1 }, scene)
  box.alwaysSelectAsActiveMesh = true
}

const onRender = (scene: Scene) => {
  // const camera = scene.getCameraByName('arcRotateCamera')!
  // const deltaTimeInMillis = scene.getEngine().getDeltaTime()
  // const rpm = 10
  // camera.position.z += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000)
}

export default function QRCodeCanvas({
  children,
}: {
  children: React.ReactNode
}) {
  const store = useRef(
    createQRCodeStore({
      data: IN_BROWSER ? window.location.origin : '',
    }),
  ).current

  return (
    <QRCodeContext.Provider value={store}>
      <SceneComponent
        antialias
        engineOptions={{
          preserveDrawingBuffer: true,
          antialias: true,
          stencil: true,
        }}
        onSceneReady={onSceneReady}
        onRender={onRender}
        className="fixed inset-0 -z-10 h-screen w-full outline-none"
      >
        <Boxes />
      </SceneComponent>
      {children}
    </QRCodeContext.Provider>
  )
}

function Boxes() {
  const store = useContext(QRCodeContext)
  if (!store) throw new Error('Missing QRCodeContext.Provider in the tree')
  const { data } = useStore(store)

  const [module, count] = useQRCode(data)

  const boxes = useRef<(Mesh | InstancedMesh)[]>([])
  const length = Math.pow(count, 2)

  const getPosition = (index: number) => {
    const x = -count / 2 + (index % count)
    const y = 1
    const z = -count / 2 + Math.floor(index / count)
    return new Vector3(x, y, z)
  }

  useScene((scene) => {
    if (!box) return
    if (count === 0) {
      return
    }

    const white = Color3.White()
    const black = Color3.Black()

    const colorData = new Float32Array(length * 4)

    // box color
    colorData.set(
      module[0][0]
        ? [black.r, black.g, black.b, 1]
        : [white.r, white.g, white.b, 1],
    )

    for (let i = 1; i < length; i++) {
      boxes.current[i] = box.createInstance(`box${i}`)
      boxes.current[i].position = getPosition(i)
      boxes.current[i].alwaysSelectAsActiveMesh = true
      colorData.set(
        module[Math.floor(i / count)][i % count]
          ? [black.r, black.g, black.b, 1]
          : [white.r, white.g, white.b, 1],
        i * 4,
      )
    }

    // cleanup boxes
    if (boxes.current.length > length) {
      boxes.current
        .splice(length, boxes.current.length - length)
        .forEach((box) => {
          box.dispose()
        })
    }

    const buffer = new VertexBuffer(
      scene.getEngine(),
      colorData,
      VertexBuffer.ColorKind,
      false,
      false,
      4,
      true,
    )
    box.setVerticesBuffer(buffer)
    box.position = getPosition(0)

    const material = new StandardMaterial('material')
    material.disableLighting = true
    material.emissiveColor = Color3.White()
    box.material = material

    return () => {
      boxes.current.forEach((box) => {
        box.dispose()
      })
      boxes.current = []
    }
  })

  return null
}
