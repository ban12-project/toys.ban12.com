export const i18n = {
  defaultLocale: 'en',
  locales: {
    en: {
      lang: 'en',
      label: 'English',
    },
    'zh-CN': {
      lang: 'zh-CN',
      label: '简体中文',
    },
  },
} as const

export type Locale = keyof (typeof i18n)['locales']
