<script lang="ts" setup>
import { ref } from "vue";
import GradientPicker from "./GradientPicker.vue";
import type { ColorSpace } from "./assets/color-helpers";

const colorSpaces: ColorSpace[] = ["srgb", "hsl", "lab", "lch"];
const colorSpace = ref<ColorSpace>("lch");
const colors = ["#c8ff64", "blue"];
const gradient = ref("");
</script>

<template>
	<main>
		<select v-model="colorSpace">
			<option v-for="space of colorSpaces" :key="space" :value="space">{{ space }}</option>
		</select>
		<GradientPicker v-model:gradient="gradient" :color-space="colorSpace" :model-value="colors" />
		<code>{{ gradient }}</code>
	</main>
</template>

<style>
html {
	background-color: #151515;
	color: #fff;
	font-family: system-ui, sans-serif;
}

main {
	display: grid;
	gap: 1rem;
	margin-top: 60px;
}
</style>
