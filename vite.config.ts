import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "localhost",
    port: 3000,
    strictPort: true, // Fail if port is already in use instead of trying another port
    allowedHosts: [".replit.dev", ".repl.co"],
    // Headers for iframe embedding
    headers: {
      'X-Frame-Options': 'SAMEORIGIN', // Allow iframe embedding from same origin
      // In production, use: 'X-Frame-Options': 'ALLOW-FROM https://yourdomain.com'
      // Or remove X-Frame-Options entirely and use Content-Security-Policy
      'Content-Security-Policy': "frame-ancestors 'self' *;", // Allow embedding from any origin (for testing)
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
