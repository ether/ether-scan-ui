import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import svgr from "vite-plugin-svgr";
import sitemap from 'vite-plugin-sitemap';

const fetchInstanceRoutes = async (apiUrl: string) => {
    try {
        const response = await fetch(`${apiUrl}/instances`);
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        const data = await response.json();
        return data.instances.map((instance: { name: string }) => {
            const normalized = instance.name.replace(/^https?:\/\//i, "");
            const encoded = encodeURIComponent(normalized).replace(/\./g, "%2E");
            return `/instances/${encoded}`;
        });
    } catch (error) {
        console.warn(`⚠️  Failed to fetch instances for sitemap: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
    }
};

// https://vitejs.dev/config/
export default defineConfig(async ({mode}) => {
    const env = loadEnv(mode, process.cwd(), "");
    const instanceRoutes = await fetchInstanceRoutes(env.VITE_APP_API_URL);

    return {
        plugins: [
            svgr(),
            react(),
            sitemap({
                hostname: 'https://scanner.etherpad.org',
                dynamicRoutes: [
                    '/',
                    '/statistics',
                    '/instances',
                    ...instanceRoutes,
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
                    rewrite: (path) => path.replace(/^\/api/, "")
                },
            },
        }
    }
})
