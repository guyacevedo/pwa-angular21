import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/app/core/**/*.ts',
        'src/app/shared/**/*.ts',
        'src/app/features/**/*.ts',
      ],
      exclude: [
        'src/app/**/*.spec.ts',
        'src/app/**/index.ts',
        'src/app/**/*.routes.ts',
        'src/app/**/*.model.ts',
        'src/app/**/*.interface.ts',
        'src/app/**/*.type.ts',
      ],
    },
  },
  resolve: {
    alias: {
      'src': resolve(__dirname, 'src'),
    },
  },
});
