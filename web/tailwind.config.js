export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { 
    extend: {
      colors: {
        'mtg': {
          'white': '#f8f9fa',
          'blue': '#0d6efd',
          'black': '#1a1a1a',
          'red': '#dc3545',
          'green': '#198754',
          'gold': '#ffc107',
          'mana': {
            'white': '#f8f9fa',
            'blue': '#0d6efd',
            'black': '#1a1a1a',
            'red': '#dc3545',
            'green': '#198754',
            'colorless': '#6c757d',
            'gold': '#ffc107'
          }
        }
      },
      fontFamily: {
        'mtg': ['Beleren', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'mtg-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm20 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      }
    }
  },
  plugins: [],
};