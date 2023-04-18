import { IN_BROWSER } from '@/lib/globals'
import { createPortal } from 'react-dom'

type Container = Parameters<typeof createPortal>[1]

export default function Portal({
  children,
  container,
}: {
  children: React.ReactNode
  container: Container | (() => Container)
}) {
  if (!IN_BROWSER) return null
  return createPortal(
    children,
    typeof container === 'function' ? container() : container,
  )
}
