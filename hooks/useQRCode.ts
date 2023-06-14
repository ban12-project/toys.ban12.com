import { useMemo } from 'react'
import qrcode, { type TypeNumber, ErrorCorrectionLevel } from '@/lib/qrcode'

export function useQRCode(
  data: string,
  qrcodeOptions: {
    typeNumber: TypeNumber
    errorCorrectionLevel: ErrorCorrectionLevel
  } = {
    typeNumber: 0,
    errorCorrectionLevel: 'L',
  },
): [boolean[][], number] {
  return useMemo(() => {
    const qr = qrcode(
      qrcodeOptions.typeNumber,
      qrcodeOptions.errorCorrectionLevel,
    )

    if (data) {
      qr.addData(data)
      qr.make()
      return [qr.getModule() || [], qr.getModuleCount()]
    }

    return [[], qr.getModuleCount()]
  }, [data, qrcodeOptions.errorCorrectionLevel, qrcodeOptions.typeNumber])
}
