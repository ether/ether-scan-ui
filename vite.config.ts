import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from "path"
import svgr from "vite-plugin-svgr";
import sitemap from 'vite-plugin-sitemap';
import fs from "node:fs/promises";

const DIST_DIR = path.resolve("dist");
const STATIC_ROUTES = ['/', '/statistics', '/instances'];

function routeToDir(route: string) {
    if (route === "/") return DIST_DIR;
    return path.join(DIST_DIR, route.replace(/^\//, ""));
}

async function writeStaticRouteFile(route: string) {
    if (route === "/") return;

    const baseHtmlPath = path.join(DIST_DIR, "index.html");
    const dir = routeToDir(route);
    const linkPath = path.join(dir, "index.html");
    const relativeTarget = path.relative(dir, baseHtmlPath);

    await fs.mkdir(dir, { recursive: true });

    await fs.symlink(relativeTarget, linkPath, "file");
}

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
    const dynamicRoutes = [...STATIC_ROUTES, ...instanceRoutes];

    return {
        plugins: [
            svgr(),
            react(),
            sitemap({
                hostname: 'https://scanner.etherpad.org',
                dynamicRoutes,
                exclude: ['/404', '/'],
            }),
            {
                name: "create-route-symlinks",
                closeBundle: async () => {
                    await Promise.all(dynamicRoutes.map((route) => writeStaticRouteFile(route.replaceAll("%2E", "."))));
                },
            },
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
