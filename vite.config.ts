import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
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
