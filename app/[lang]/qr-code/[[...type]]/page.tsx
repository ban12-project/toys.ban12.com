import { getDictionary } from '@/get-dictionary'
import { Locale } from '@/i18n-config'

import Intro from '@/ui/Intro'
import Menu from '@/ui/Menu'
import IntlMessageFormat from 'intl-messageformat'
import QRCodeCanvas from './QRCodeCanvas'
import Input from './_components/Input'

type Props = {
  params: { lang: Locale }
}

export default async function QRCodePage({ params }: Props) {
  const messages = await getDictionary(params.lang)

  return (
    <>
      <QRCodeCanvas>
        <Input />
      </QRCodeCanvas>
      {/* <Intro messages={messages} />
      <p>
        {new IntlMessageFormat(messages.message, params.lang).format({
          numPhotos: 1000,
        })}
      </p>
      <Menu types={types} /> */}
    </>
  )
}

export async function generateMetadata({ params }: Props) {
  const message = await getDictionary(params.lang)
  
  return {
    title: 'Meet QR Code',
    description: message.hello
  }
}
