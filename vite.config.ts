import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: false,
    outDir: 'dist',
    lib: {
      entry: './src/index.ts',
      fileName: 'index',
      formats: [
        'es',
      ],
    },
    rollupOptions: {
      external: [
        'axios',
      ],
      output: {
        globals: {
          axios: 'axios',
        },
      },
    },
  },
})
