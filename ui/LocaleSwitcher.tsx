'use client'

import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Locale, i18n } from '@/i18n-config'
import Portal from './Portal'
import { Listbox } from '@headlessui/react'
import clsx from 'clsx'

export default function LocaleSwitcher({
  lang,
  panelClassName = 'mt-4',
}: {
  lang: Locale
  panelClassName?: string
}) {
  const pathName = usePathname()
  const redirectedPathName = (locale: string) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  return (
    <Listbox value={lang}>
      <Listbox.Label className="sr-only">Language</Listbox.Label>
      <Listbox.Button type="button">
        <Icon className="h-6 w-6" />
      </Listbox.Button>

      <Portal container={() => document.body}>
        <Listbox.Options
          className={clsx(
            'dark:highlight-white/5 absolute right-0 top-14 z-50 w-36 overflow-hidden rounded-lg bg-white py-1 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-slate-900/10 dark:bg-slate-800 dark:text-slate-300 dark:ring-0',
            panelClassName,
          )}
          as="div"
        >
          {i18n.locales.map((locale) => (
            <Listbox.Option key={locale} value={locale} as={Fragment}>
              {({ active, selected }) => (
                <Link
                  className={clsx(
                    'flex cursor-pointer items-center px-2 py-1',
                    selected && 'text-sky-500',
                    active && 'bg-slate-50 dark:bg-slate-600/30',
                  )}
                  href={redirectedPathName(locale)}
                >
                  {locale}
                </Link>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </Portal>
    </Listbox>
  )
}

function Icon(props: React.SVGAttributes<SVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none"></path>
      <path
        d=" M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z "
        className="fill-current"
      ></path>
    </svg>
  )
}
