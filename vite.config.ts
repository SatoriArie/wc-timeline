import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — относительные пути, чтобы сайт работал и локально,
// и на GitHub Pages в любом подкаталоге.
export default defineConfig({
  base: './',
  plugins: [react()],
  // хост-раннер (preview-инструмент) назначает порт через PORT — уважаем его,
  // иначе дефолт 5173 для обычного `npm run dev`
  server: {
    port: Number(process.env.PORT) || 5173,
  },
});
