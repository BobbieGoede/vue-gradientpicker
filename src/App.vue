<script lang="ts" setup>
import { computed, ref } from "vue";
import GradientPicker from "./GradientPicker.vue";
import { toLinearGradient, type ColorSpace, type GradientStop } from "./colors";

const colorSpaces: ColorSpace[] = ["oklch", "oklab", "lch", "lab", "hsl", "srgb"];
const colorSpace = ref<ColorSpace>("oklch");
const stops = ref<GradientStop[]>([
	{ color: "#c8ff64", position: 0 },
	{ color: "blue", position: 1 },
]);
const selected = ref<number>();
const gradient = computed(() => toLinearGradient(stops.value, colorSpace.value));
</script>

<template>
	<main>
		<select v-model="colorSpace">
			<option v-for="space of colorSpaces" :key="space" :value="space">{{ space }}</option>
		</select>
		<GradientPicker v-model="stops" v-model:selected="selected" :color-space="colorSpace" />
		<input v-if="selected !== undefined && stops[selected]" v-model="stops[selected].color" />
		<div class="preview" :style="{ backgroundImage: gradient }" />
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

.preview {
	height: 6rem;
	border-radius: 0.5rem;
}
</style>
