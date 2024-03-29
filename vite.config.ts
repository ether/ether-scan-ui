import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import svgr from "vite-plugin-svgr";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svgr(), react()],
    base: '/',
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: '0.0.0.0',
        proxy: {
            "/api": {
                target: "https://ether-scan.stefans-entwicklerecke.de/api",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        }
    }
})
