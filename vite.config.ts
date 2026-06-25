import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — относительные пути, чтобы сайт работал и локально,
// и на GitHub Pages в любом подкаталоге.
export default defineConfig({
  base: './',
  plugins: [react()],
});
