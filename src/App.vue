<template>
	<div style="display: grid; gap: 1rem">
		<!-- <h4>RGB</h4>
		<GradientPicker :color-space="'srgb'" v-model="gradient2Rgb" v-model:select="focus" />
		<h4>LAB</h4>
		<GradientPicker :color-space="'lab'" v-model="gradient2Lab" v-model:select="focus" />
		<h4>HSL</h4>
		<GradientPicker
			:color-space="'hsl'"
			v-model="gradient2Hsl"
			v-model:selection="currentSelection"
			v-model:select="focus"
		/>
		<h4>HCL</h4> -->
		<select v-model="colorSpace">
			<option v-for="opt of colorSpaceOptions" :value="opt">{{ opt }}</option>
		</select>
		<GradientPicker
			:color-space="colorSpace"
			:model-value="gradient2Hcl"
			v-model:selection="currentSelection"
			v-model:select="focus"
		/>
		<!-- <GradientPicker v-model="gradient3" v-model:gradient="gradientString" v-model:selection="currentSelection" /> -->
		<!-- {{ gradientString }}
		{{ currentSelection }} -->
		<!-- <p>Hello world</p> -->
	</div>
</template>

<script lang="ts" setup>
import { ref, unref } from "vue";

const gradient2 = [
	{ color: "rgb(200, 255, 100)", position: 0 },
	{ color: "rgb(0,0,255)", position: 1 },
];
const gradient2Hsl = ref([...gradient2]);
const gradient3 = ref([
	{ color: "rgb(0, 255, 255)", position: 0 },
	{ color: "rgb(255,255,0)", position: 1 },
]);

const colorSpaceOptions = ["srgb", "lab", "hsl", "lch"];
const colorSpace = ref("lch");

const gradient2Rgb = ref([...gradient2]);
const gradient2Lab = ref([...gradient2]);
const gradient2Hcl = ref([...gradient2]);
const gradient3Plain = ref(unref(gradient3));
const currentSelection = ref();
const focus = ref();

const gradientString = ref("");
</script>

<style lang="scss">
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #fff;
	margin-top: 60px;
}

html {
	background-color: #151515;
}

@media (dynamic-range: standard) {
	p {
		color: red;
	}
}

@media (dynamic-range: high) {
	p {
		color: green;
	}
}
</style>
