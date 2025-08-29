import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:5000', // Use environment variable for production
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist', // Specify the build output directory (where Railway expects it)
  },
  base: '/', // If you are deploying it on a subpath, change this (e.g., '/my-app/')
})



// ! Old Config
// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // import { reactRouter } from "@react-router/dev/vite";
// // import tsconfigPaths from "vite-tsconfig-paths";
// import tailwindcss from "@tailwindcss/vite";

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//     // reactRouter(),
//     // tsconfigPaths(),
//   ],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000', // or whatever your backend runs on
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// })