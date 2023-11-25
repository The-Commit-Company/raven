import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'
import proxyOptions from './proxyOptions';
import svgr from "vite-plugin-svgr";

/// <reference types="vite-plugin-svgr/client" />
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), svgr()],
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
	},
});
