/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        fintech: {
          bg: '#F7F9FC',
          darkBg: '#0B0F17',
          sidebar: '#101828',
          sidebarHover: '#1D2939',
          sidebarActive: '#1F2A37',
          accent: '#16A34A',
          secondary: '#2563EB',
          text: '#111827',
          secondaryText: '#667085',
          card: '#FFFFFF',
          cardDark: '#161F2E',
          cardHoverDark: '#1E293B',
          positive: '#16A34A',
          negative: '#DC2626',
          border: '#E5E7EB',
          borderDark: '#283344',
          subtle: '#F2F4F7',
          subtleDark: '#1E293B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(16, 24, 40, 0.06), 0 1px 2px -1px rgba(16, 24, 40, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
