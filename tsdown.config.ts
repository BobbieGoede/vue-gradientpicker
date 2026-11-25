import { defineConfig } from "tsdown";
import vue from "unplugin-vue/rolldown";

export default defineConfig({
	entry: "src/index.ts",
	platform: "neutral",
	plugins: [vue({ isProduction: true })],
	dts: { tsc: { vue: true } },
});
