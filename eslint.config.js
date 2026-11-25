import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import pluginVue from "eslint-plugin-vue";

export default defineConfigWithVueTs(
	{ ignores: ["dist"] },
	pluginVue.configs["flat/recommended"],
	vueTsConfigs.recommended,
	skipFormatting
);
