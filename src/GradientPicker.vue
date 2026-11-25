<script lang="ts" setup>
import { computed, ref } from "vue";
import { getColorAt, toLinearGradient, type ColorSpace, type GradientStop } from "./colors";

const {
	colorSpace = "oklch",
	classPrefix = "goede",
	removeOffset = 1,
} = defineProps<{
	colorSpace?: ColorSpace;
	/** Adds `<classPrefix>-*` classes for theming, the unprefixed classes required for layout are always added */
	classPrefix?: string;
	/** Vertical drag distance (relative to the picker height) at which a stop is removed */
	removeOffset?: number;
}>();

const stops = defineModel<GradientStop[]>({
	default: () => [
		{ color: "dodgerblue", position: 0 },
		{ color: "blueviolet", position: 1 },
	],
});
const selected = defineModel<number>("selected");

const el = ref<HTMLElement>();
const removing = ref<number>();
let dragging: number | undefined;

const CHECKER_IMAGE = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP4DAb6Ifv78Of50MGoAA+PQDwMAuX5VedFT3cEAAAAASUVORK5CYII=")`;
const background = computed(() => {
	const visible = stops.value.filter((_, i) => i !== removing.value);
	return `${toLinearGradient(visible, colorSpace)}, ${CHECKER_IMAGE}`;
});

const prefixed = (name: string) => [name, `${classPrefix}-${name}`];

function getPointer(event: PointerEvent) {
	const rect = el.value!.getBoundingClientRect();
	const position = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
	const offset = Math.max(rect.top - event.clientY, event.clientY - rect.bottom, 0) / rect.height;
	return { position, removed: offset > removeOffset };
}

function startDrag(index: number, event: PointerEvent) {
	selected.value = index;
	dragging = index;
	el.value!.setPointerCapture(event.pointerId);
}

function onHandleDown(index: number, event: PointerEvent) {
	if (event.button !== 0) return;
	startDrag(index, event);
}

function onPickerDown(event: PointerEvent) {
	if (event.button !== 0 || !stops.value.length) return;
	const { position } = getPointer(event);
	const color = getColorAt(el.value!, stops.value, position, colorSpace);
	const index = stops.value.length;
	stops.value = [...stops.value, { color, position }];
	startDrag(index, event);
}

function onPointerMove(event: PointerEvent) {
	if (dragging === undefined) return;
	const index = dragging;
	const { position, removed } = getPointer(event);

	removing.value = removed && stops.value.length > 1 ? index : undefined;
	if (removing.value !== undefined || stops.value[index].position === position) return;

	stops.value = stops.value.map((stop, i) => (i === index ? { ...stop, position } : stop));
}

function onPointerUp() {
	const index = removing.value;
	dragging = undefined;
	removing.value = undefined;
	if (index === undefined) return;

	const remaining = stops.value.filter((_, i) => i !== index);
	stops.value = remaining;
	selected.value = Math.min(index, remaining.length - 1);
}
</script>

<template>
	<div
		ref="el"
		:class="prefixed('gradient-picker')"
		:style="{ backgroundImage: background }"
		@pointerdown.prevent="onPickerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerUp"
		@pointercancel="onPointerUp"
	>
		<div
			v-for="(stop, i) in stops"
			v-show="i !== removing"
			:key="i"
			:class="[prefixed('handle-container'), i === selected && prefixed('handle-container--selected')]"
			:style="{ left: `${stop.position * 100}%` }"
			@pointerdown.prevent.stop="onHandleDown(i, $event)"
		>
			<div :class="prefixed('handle')" :style="{ backgroundColor: stop.color }" />
		</div>
	</div>
</template>

<style>
.gradient-picker {
	position: relative;
	height: 2em;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
	touch-action: none;
	user-select: none;
}

.handle-container {
	position: absolute;
	top: 50%;
	width: 2em;
	height: 2em;
	transform: translateY(-50%) translateX(-50%);
	text-align: center;
	cursor: pointer;
}

.handle-container--selected {
	z-index: 10;
}

.handle-container:hover {
	z-index: 20;
}

.handle {
	position: relative;
	top: 50%;
	left: 50%;
	transform: translateY(-50%) translateX(-50%);
	width: 1em;
	height: 3em;
}

.goede-gradient-picker {
	height: 2.5em;
	width: calc(100% - 1rem);
	margin-left: 0.5em;
	margin-right: 0.5em;
	border-radius: 0.5em;
	font-size: 1.25em;
}

.goede-handle {
	width: 0.8em;
	height: 0.8em;
	border-radius: 1em;
	box-shadow:
		0em 0em 0em 0.15em white,
		0em 0em 0em 0.25em rgba(0, 0, 0, 0.5),
		0em 0em 0em 0.1em rgba(0, 0, 0, 0.5) inset;
	transition:
		transform 0.088s ease,
		box-shadow 0.088s ease;
}

/* :where keeps hover below the selected state */
.goede-handle-container:where(:hover) > .goede-handle {
	transform: translateY(-50%) translateX(-50%) scale(1.2, 1.2);
}

.goede-handle-container--selected > .goede-handle {
	box-shadow:
		0em 0em 0em 0.15em white,
		0em 0em 0em 0.23em rgba(0, 0, 0, 0.5),
		0em 0em 0em 0.1em rgba(0, 0, 0, 0.5) inset;
	transform: translateY(-50%) translateX(-50%) scale(1.35, 1.35);
}
</style>
