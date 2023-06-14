'use client'

import { QRCodeContext } from '@/lib/qrcodeStore'
import { ChangeEventHandler, useContext } from 'react'
import { useStore } from 'zustand'
import { useThrottleFn } from 'ahooks'

export default function Input() {
  const store = useContext(QRCodeContext)
  if (!store) throw new Error('Missing QRCodeContext.Provider in the tree')
  const { data, setData } = useStore(store)

  const { run: onChange } = useThrottleFn<ChangeEventHandler<HTMLInputElement>>(
    (e) => {
      const value = e.target.value
      setData(value)
    },
    { wait: 300 },
  )

  return (
    <input
      className="mx-auto block h-10 max-w-xs rounded bg-slate-300 bg-opacity-80 px-2 py-1 backdrop-blur-lg backdrop-saturate-150 dark:bg-slate-800 dark:bg-opacity-80"
      defaultValue={data}
      onChange={onChange}
    />
  )
}
