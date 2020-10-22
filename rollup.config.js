// rollup.config.js
import vuePlugin from "rollup-plugin-vue";
import buble from "@rollup/plugin-buble";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));

const baseConfig = {
	input: "src/entry.js",

	plugins: [
		nodeResolve(),
		replace({
			__buildEnv__: JSON.stringify("production"),
		}),
		commonjs(),
		vuePlugin({
			css: true,
			template: {
				isProduction: true,
			},
		}),
		babel({
			exclude: "node_modules/**",
			babelHelpers: "runtime",
		}),
		buble(),
	],
};

// UMD/IIFE shared settings: externals and output.globals
// Refer to https://rollupjs.org/guide/en#output-globals for details
const external = [
	// list external dependencies, exactly the way it is written in the import statement.
	// eg. 'jquery'
];
const globals = {
	// Provide global variable names to replace your external imports
	// eg. jquery: '$'
};

// Customize configs for individual targets
const buildFormats = [];
if (!argv.format || argv.format === "es") {
	const esConfig = {
		...baseConfig,
		output: {
			file: "dist/vue-gradientpicker.esm.js",
			format: "esm",
			exports: "named",
		},
		plugins: [
			...baseConfig.plugins,
			terser({
				output: {
					ecma: 6,
				},
			}),
		],
	};
	buildFormats.push(esConfig);
}

if (!argv.format || argv.format === "umd") {
	const umdConfig = {
		...baseConfig,
		external,
		output: {
			compact: true,
			file: "dist/vue-gradientpicker.umd.js",
			format: "umd",
			name: "VueGradientpicker",
			exports: "named",
			globals,
		},
		plugins: [
			...baseConfig.plugins,
			terser({
				output: {
					ecma: 6,
				},
			}),
		],
	};
	buildFormats.push(umdConfig);
}

if (!argv.format || argv.format === "iife") {
	const unpkgConfig = {
		...baseConfig,
		external,
		output: {
			compact: true,
			file: "dist/vue-gradientpicker.min.js",
			format: "iife",
			name: "VueGradientpicker",
			exports: "named",
			globals,
		},
		plugins: [
			...baseConfig.plugins,
			terser({
				output: {
					ecma: 5,
				},
			}),
		],
	};
	buildFormats.push(unpkgConfig);
}

// Export config
export default buildFormats;
