import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import proxyOptions from './proxyOptions';
import svgr from "vite-plugin-svgr";
import { VitePWA } from 'vite-plugin-pwa'

/// <reference types="vite-plugin-svgr/client" />
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), svgr(), VitePWA({
		registerType: 'autoUpdate',
		devOptions: {
			enabled: true,
		},
		manifest: {
			display: 'standalone',
			name: 'Raven',
			short_name: 'Raven',
			start_url: '/raven',
			description: 'Simple work messaging tool',
			icons: [
				{
					src: "/assets/raven/raven/android-chrome-192x192.png",
					sizes: "192x192",
					type: "image/png"
				},
				{
					src: "/assets/raven/raven/android-chrome-384x384.png",
					sizes: "384x384",
					type: "image/png"
				}
			]
		}
	})],
	server: {
		port: 8080,
		proxy: proxyOptions
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	build: {
		outDir: '../raven/public/raven',
		emptyOutDir: true,
		target: 'es2015',
		rollupOptions: {
			onwarn(warning, warn) {
				if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
					return
				}
				warn(warning)
			}
		}
	}
},
);
