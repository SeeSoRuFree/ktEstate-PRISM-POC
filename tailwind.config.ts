import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // KT Estate 브랜드 컬러
        'kt-red': '#E4002B',
        'kt-black': '#1A1A1A',
        'smart-blue': '#3B82F6',
        'smart-blue-light': '#EFF6FF',
        'bg-gray': '#F8FAFC',
        'border-gray': '#E2E8F0',
        'muted-foreground': '#64748B',
        'status-success': '#22C55E',
        'status-warning': '#F59E0B',
        'status-error': '#EF4444',
      },
    },
  },
  plugins: [],
}

export default config
