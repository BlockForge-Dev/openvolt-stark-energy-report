import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    fs: {
      // Allow serving files from one level up (to import output/stark-january-2023-report.json)
      allow: ['..']
    }
  }
});
