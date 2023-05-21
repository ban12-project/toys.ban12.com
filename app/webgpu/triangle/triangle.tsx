'use client'

import { useEffect, useRef } from 'react'

import triangleVertWGSL from './triangle.vert.wgsl'
import colorFragWGSL from './color.frag.wgsl'
import { FormEventHandler } from 'react'
import { useCanvasRef } from '../CanvasContext'

async function init(canvas: HTMLCanvasElement) {
  if (!navigator.gpu) throw Error('WebGPU not supported.')
  const adapter = await navigator.gpu.requestAdapter()
  if (!adapter) throw Error("Couldn't request WebGPU adapter.")
  const device = await adapter.requestDevice()
  if (!device) throw Error("Couldn't request WebGPU device")
  const context = canvas.getContext('webgpu')
  if (!context) throw Error("Couldn't got webgpu context from canvas")

  const devicePixelRatio = window.devicePixelRatio || 1
  canvas.width = canvas.clientWidth * devicePixelRatio
  canvas.height = canvas.clientHeight * devicePixelRatio
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat()

  context.configure({
    device,
    format: presentationFormat,
    alphaMode: 'premultiplied',
  })

  const vertex = new Float32Array([
    // x y z
    0, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0,
  ])
  const vertexBuffer = device.createBuffer({
    size: vertex.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(vertexBuffer, 0, vertex)
  const onLocationInput: FormEventHandler<HTMLInputElement> = (e) => {
    const value = Number.parseFloat((e.target as HTMLInputElement).value)
    vertex[0] = 0 + value
    vertex[3] = -0.5 + value
    vertex[6] = 0.5 + value
    device.queue.writeBuffer(vertexBuffer, 0, vertex)
  }

  const color = new Float32Array([1, 0, 0, 1])
  const colorBuffer = device.createBuffer({
    size: color.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(colorBuffer, 0, color)
  const onColorInput: FormEventHandler<HTMLInputElement> = (e) => {
    const value = (e.target as HTMLInputElement).value
    const [r, g, b] = [
      Number.parseInt(`0x${value.slice(1, 3)}`) / 255,
      Number.parseInt(`0x${value.slice(3, 5)}`) / 255,
      Number.parseInt(`0x${value.slice(5, 7)}`) / 255,
    ]
    color[0] = r
    color[1] = g
    color[2] = b
    device.queue.writeBuffer(colorBuffer, 0, color)
  }

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: triangleVertWGSL,
      }),
      entryPoint: 'main',
      buffers: [
        {
          arrayStride: 3 * 4,
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x3',
            } as GPUVertexAttribute,
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: colorFragWGSL,
      }),
      entryPoint: 'main',
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
  })

  const group = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: colorBuffer,
        },
      } as GPUBindGroupEntry,
    ],
  })

  function frame() {
    const commandEncoder = device.createCommandEncoder()
    const textureView = context!.getCurrentTexture().createView()

    const passEncoder = commandEncoder.beginRenderPass({
      colorAttachments: [
        {
          view: textureView,
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: 'clear',
          storeOp: 'store',
        } as GPURenderPassColorAttachment,
      ],
    })
    passEncoder.setPipeline(pipeline)
    passEncoder.setVertexBuffer(0, vertexBuffer)
    passEncoder.setBindGroup(0, group)
    passEncoder.draw(3, 1, 0, 0)
    passEncoder.end()

    device.queue.submit([commandEncoder.finish()])
    requestAnimationFrame(frame)
  }

  requestAnimationFrame(frame)

  return { onColorInput, onLocationInput }
}

export default function Triangle() {
  const canvasRef = useCanvasRef()
  const active = useRef(true)
  const handlers = useRef<Record<string, FormEventHandler<HTMLInputElement>[]>>(
    {
      onColorInput: [],
      onLocationInput: [],
    },
  )

  const onColorInput: FormEventHandler<HTMLInputElement> = (...args) => {
    handlers.current.onColorInput.forEach((handler) => handler(...args))
  }
  const onLocationInput: FormEventHandler<HTMLInputElement> = (...args) => {
    handlers.current.onLocationInput.forEach((handler) => handler(...args))
  }

  useEffect(() => {
    if (!canvasRef?.current) return
    if (!active.current) return
    ;(async () => {
      const { onColorInput, onLocationInput } = await init(canvasRef.current!)
      handlers.current.onColorInput.push(onColorInput)
      handlers.current.onLocationInput.push(onLocationInput)
    })()

    return () => {
      active.current = false
      handlers.current = {
        onColorInput: [],
        onLocationInput: [],
      }
    }
  }, [canvasRef])

  return (
    <>
      <label htmlFor="color">color:</label>
      <input type="color" name="color" id="color" onInput={onColorInput} />
      <label htmlFor="location">location:</label>
      <input
        type="range"
        name="location"
        id="location"
        min="-0.5"
        max="0.5"
        step="0.1"
        onInput={onLocationInput}
      />
    </>
  )
}
