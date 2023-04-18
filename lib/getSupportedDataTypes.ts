import { readdir } from 'fs/promises'
import { resolve } from 'path'

/**
 * app/[lang]/qr-code/[[...type]]
 * 文件名是 type.[slug].tsx 的统计为支持的类型
 */
export const getSupportedDataTypes = (function () {
  let types: string[] = []
  return async function () {
    if (types.length) return types
    types = (
      await readdir(resolve('app/[lang]/qr-code/[[...type]]'), {
        withFileTypes: true,
      })
    )
      .filter(
        (dirent) => !dirent.isDirectory() && dirent.name.startsWith('type.'),
      )
      .map((dirent) => dirent.name.split('.').at(-2)!)
    return types
  }
})()
