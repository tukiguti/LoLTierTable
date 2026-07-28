import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// loltiertable.tukiguti.com のルート配信のみを想定しているため base は '/' 固定。
// GitHub Pages 版は廃止したので、パス基準を環境で切り替える必要はない。
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
})
