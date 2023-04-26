import './globals.css'
import { Header } from '@/ui/Header'
import LenisMount from '@/lib/lenis'
import LocaleSwitcher from '@/ui/LocaleSwitcher'
import { ThemeToggle } from '@/ui/ThemeToggle'
import { Locale } from '@/i18n-config'

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
  themeColor: '#f8fafc',
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: Locale }
}) {
  return (
    <html suppressHydrationWarning lang={params.lang} className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0B1120')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-slate-900 dark:text-slate-400">
        <LenisMount />

        <Header>
          <LocaleSwitcher lang={params.lang} />
          <ThemeToggle />
        </Header>

        {children}
      </body>
    </html>
  )
}