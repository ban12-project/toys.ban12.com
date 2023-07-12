import Link from 'next/link'

export default function Home() {
  return (
    <ul className="mx-auto max-w-md pt-20 text-center sm:pt-24 lg:pt-3">
      <li>
        <Link
          className="hover:ring-slate-900/15 rounded-lg bg-slate-300 bg-white/0 bg-opacity-80 px-4 py-3 text-sm font-semibold text-slate-900 ring-1 ring-slate-900/10 backdrop-blur-lg backdrop-saturate-150 dark:bg-slate-800 dark:bg-opacity-80 dark:text-white"
          href="/qr-code"
        >
          QR Code
        </Link>
      </li>
    </ul>
  )
}
