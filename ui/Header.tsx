import Link from 'next/link'

export function Header({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex px-4 pt-6 text-gray-50 mix-blend-difference">
      <h1>
        <Link href="/">Toys</Link>
      </h1>

      <div className="ml-auto space-x-2">{children}</div>
    </header>
  )
}
