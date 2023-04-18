import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.redirect(request.url.replace('qrcode', 'qr-code'))
}
