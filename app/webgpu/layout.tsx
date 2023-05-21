import CanvasContextProvider from './CanvasContext'

export default function WebGPULayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <CanvasContextProvider>{children}</CanvasContextProvider>
      </body>
    </html>
  )
}
