import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
	server: {
		watch: { usePolling: true },
		host: "0.0.0.0",
		port: 8080,
	},
	test: {
		// reporters: ["html"],
		browser: {
			enabled: true,
			name: "chrome",
		},
		// enable jest-like global test APIs
		globals: true,
		// simulate DOM with happy-dom
		// (requires installing happy-dom as a peer dependency)
		environment: "happy-dom",
	},
	build: {
		lib: {
			formats: ["es", "cjs"],
			entry: resolve(__dirname, "src/entry.ts"),
			name: "VueGradientpicker",
			fileName: (format) => `vue-gradientpicker.${format}.js`,
		},
		// terserOptions: {
		// 	compress: false,
		// 	mangle: true,
		// },
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: ["vue"],
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: { vue: "Vue" },
				// inlineDynamicImports: true,
			},
		},
	},
	plugins: [vue()],
});
