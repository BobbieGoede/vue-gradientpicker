module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		// add more generic rulesets here, such as:
		// 'eslint:recommended',
		"plugin:vue/essential",
		"eslint:recommended",
	],
	rules: {
		// override/add rules settings here, such as:
		// 'vue/no-unused-vars': 'error'
	},
	parserOptions: {
		parser: "babel-eslint",
	},
};
