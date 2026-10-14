import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Keep tests independent of the dev server's PORT/BASE_PATH and browser plugins.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
