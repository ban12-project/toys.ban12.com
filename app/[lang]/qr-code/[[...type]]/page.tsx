import { getDictionary } from '@/get-dictionary'
import { Locale } from '@/i18n-config'
import { getSupportedDataTypes } from '@/lib/getSupportedDataTypes'

import Intro from '@/ui/Intro'
import Menu from '@/ui/Menu'

export default async function QRCodePage({
  params,
}: {
  params: { lang: Locale }
}) {
  const [types, messages] = await Promise.all([
    getSupportedDataTypes(),
    getDictionary(params.lang),
  ])

  return (
    <>
      <Intro messages={messages} />
      <Menu types={types} />
    </>
  )
}
