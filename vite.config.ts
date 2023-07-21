import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8080,
    // port: 443,
    // https: true,
    // Uncomment to allow access from network
    // (or use `npm run dev -- -- host=0.0.0.0`)
    host: '0.0.0.0',
  },
  // plugins: [ basicSsl() ]
})
