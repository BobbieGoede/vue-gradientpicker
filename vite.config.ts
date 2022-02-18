import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "path";
import { IndexHtmlTransformResult, IndexHtmlTransformContext } from "vite";
import { Plugin } from "vite";
import { OutputChunk, OutputAsset } from "rollup";

const bundle_filename = "";
const css_filename = "style.css";

export function vueCss(): Plugin {
	return {
		apply: "build",
		enforce: "post",
		name: "pack-css",
		generateBundle(opts, bundle) {
			const {
				[css_filename]: { source: rawCss },
				[bundle_filename]: component,
			} = bundle;

			const IIFEcss = `
		  (function() {
			try {
				var elementStyle = document.createElement('style');
				elementStyle.innerText = ${JSON.stringify(rawCss)}
				document.head.appendChild(elementStyle)
			} catch(error) {
			  console.error(error, 'unable to concat style inside the bundled file')
			}
		  })()`;
			component.code += IIFEcss;

			// remove from final bundle
			delete bundle[css_filename];
		},
	};
}

export function viteSingleFile(): Plugin {
	return {
		name: "vite:singlefile",
		// transformIndexHtml: {
		enforce: "post",
		transform(src: string, id) {
			// Only use this plugin during build
			// if (!ctx || !ctx.bundle) return html;
			// console.log(ctx.bundle);
			// Get the bundle
			if (/\.vue$/.test(id)) {
				console.log(id, src);
			}

			return src;
			// let extraCode = "";
			// for (const [, value] of Object.entries(ctx.bundle)) {
			// 	const o = value as OutputChunk;
			// 	const a = value as OutputAsset;
			// 	if (o.code) {
			// 		const reScript = new RegExp(
			// 			`<script type="module"[^>]*?src="[\./]*${value.fileName}"[^>]*?></script>`
			// 		);
			// 		const code = `<script type="module">\n//${o.fileName}\n${o.code}\n</script>`;
			// 		html = html.replace(reScript, (_) => code);
			// 	} else if (value.fileName.endsWith(".css")) {
			// 		const reCSS = new RegExp(`<link rel="stylesheet"[^>]*?href="[\./]*${value.fileName}"[^>]*?>`);
			// 		const code = `<!-- ${a.fileName} --><style type="text/css">\n${a.source}\n</style>`;
			// 		html = html.replace(reCSS, (_) => code);
			// 	} else {
			// 		extraCode += "\n<!-- ASSET NOT INLINED: " + a.fileName + " -->\n";
			// 	}
			// }
			// return html.replace(/<\/body>/, extraCode + "</body>");
		},
		// },
	};
}
// https://vitejs.dev/config/
export default defineConfig({
	server: {
		watch: {
			usePolling: true,
		},
		host: "0.0.0.0",
		port: 8080,
	},
	build: {
		lib: {
			formats: ["es", "umd", "iife"],
			entry: path.resolve(__dirname, "src/entry.js"),
			name: "MyLib",
			fileName: (format) => `vue-gradientpicker.${format}.js`,
		},
		cssCodeSplit: false,
		rollupOptions: {
			// make sure to externalize deps that shouldn't be bundled
			// into your library
			external: ["vue"],
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					vue: "Vue",
				},
				inlineDynamicImports: true,
			},
		},
	},
	plugins: [
		vue(),
		vueCss(),
		// viteSingleFile()
	],
});
