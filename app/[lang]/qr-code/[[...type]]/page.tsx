import { getDictionary } from '@/get-dictionary'
import { Locale } from '@/i18n-config'
import { getSupportedDataTypes } from '@/lib/getSupportedDataTypes'

import Intro from '@/ui/Intro'
import Menu from '@/ui/Menu'
import IntlMessageFormat from 'intl-messageformat'

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
      <p>
        {new IntlMessageFormat(messages.message, params.lang).format({
          numPhotos: 1000,
        })}
      </p>
      <Menu types={types} />
    </>
  )
}
