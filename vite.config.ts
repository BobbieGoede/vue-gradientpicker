import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			entry: "src/entry.ts",
			formats: ["es", "cjs"],
			fileName: (format) => `vue-gradientpicker.${format}.js`,
			cssFileName: "style",
		},
		rolldownOptions: { external: ["vue"] },
	},
});
