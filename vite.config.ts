import { defineConfig } from 'vite'
import { server } from './configs/server'
import { build } from './configs/build'
import { alias } from './configs/resolve'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  server,
  build,
  resolve: {
    alias,
  },
})
