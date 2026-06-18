import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // 👈 this is essential for Tailwind v4
  ],
  server: {
    port: 5173,
  },
});