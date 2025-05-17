import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Remove 'lucide-react' from exclude, or if it's the only one,
    // you can remove the exclude array or the entire optimizeDeps section
    // if this was its only purpose.
    // For example:
    // exclude: [], // if you have other exclusions you want to keep
    // OR, if lucide-react was the only one:
  },
  // If optimizeDeps was only for excluding lucide-react, you can remove
  // the optimizeDeps key entirely:
  // optimizeDeps: {}, // or just remove the key
});