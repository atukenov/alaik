/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#fcf4f1',
        card: '#ffffff',
        card2: '#f6e6df',
        text: '#3a2a28',
        muted: '#a8938b',
        accent: '#e0664f',
        accent2: '#cf9a3f',
        line: 'rgba(58,42,40,0.08)',
      },
      fontFamily: {
        sans: ['Onest', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        field: '16px',
        gift: '20px',
        pill: '100px',
      },
      boxShadow: {
        event: '0 8px 20px -14px rgba(120,60,40,0.5)',
        guest: '0 6px 18px -12px rgba(224,102,79,0.5)',
        fab: '0 8px 18px -6px rgba(224,102,79,0.7)',
      },
      backgroundImage: {
        primary: 'linear-gradient(90deg, #e0664f, #cf9a3f)',
        'primary-135': 'linear-gradient(135deg, #e0664f, #cf9a3f)',
      },
      keyframes: {
        fadein: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        fadein: 'fadein 0.28s ease',
      },
    },
  },
  plugins: [],
};
