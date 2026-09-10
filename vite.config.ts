import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  /* host يخلي السيرفر يستقبل من الشبكة المحلية، فينفتح على الهاتف */
  server: { port: 5173, host: true },
  preview: { port: 4700 },
});
