import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		fs: {
			allow: ['..']
		},
		proxy: {
			'/backend-api': {
				target: 'http://localhost:5031',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/backend-api/, '')
			}
		}
	}
});
