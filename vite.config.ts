import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(),
    tsconfigPaths()],
  server: { port: 3000 },
  preview: { port: 4173 },
  build: {
    outDir: 'build', // force Vite to output into build/
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
});
