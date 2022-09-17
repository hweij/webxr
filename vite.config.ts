import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // lib: {
    //   entry: 'src/app-demo.ts',
    //   formats: ['es']
    // },
    rollupOptions: {
      // external: /^lit/
      // input: {
      //   demo: resolve(__dirname, 'index.html'),
      //   cms: resolve(__dirname, 'cms.html'),
      // }
    }
  },
  server: {
    https: true
  },
  define: {
    '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
  },
  plugins: [
    basicSsl()
  ]
})
