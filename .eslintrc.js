export default {
	root: true,

	env: {
		// node: true,
		"vue/setup-compiler-macros": true,
	},

	rules: {
		// override/add rules settings here, such as:
		// 'vue/no-unused-vars': 'error'
	},

	parserOptions: {
		parser: "@typescript-eslint/parser",
	},

	extends: [
		"eslint:recommended",
		"plugin:vue/base",
		"plugin:vue/vue3-essential",
		"@vue/eslint-config-typescript",
		"@vue/typescript",
		"prettier",
	],
};
