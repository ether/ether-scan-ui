import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import svgr from "vite-plugin-svgr";
import sitemap from 'vite-plugin-sitemap';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        svgr(),
        react(),
        sitemap({
            hostname: 'https://scanner.etherpad.org',
            dynamicRoutes: [
                '/',
                '/statistics',
                '/instances',
            ],
            exclude: ['/404', '/'],
        }),
    ],
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
