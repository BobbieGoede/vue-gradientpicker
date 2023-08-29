<script lang="ts" setup>
import { computed, onMounted, ref, watch, nextTick } from "vue";
import { useEventListener } from "@vueuse/core";
import { hsl, HSLColor, color, ColorCommonInstance, ColorSpaceObject, lch, hcl, Color, rgb, lab } from "d3-color";
import HandleContainer from "./components/HandleContainer.vue";
import { convertColor, interpolateColor, type ColorSpace } from "./assets/color-helpers";

type ColorData = { position: number; color: ColorSpaceObject };
type SimplifiedColor = string | ColorSpaceObject | ColorCommonInstance;

type Props = {
	modelValue: string[] | ColorData[];
	selectionColor?: SimplifiedColor;
	color?: SimplifiedColor;
	selection?: { index: number; color: SimplifiedColor; element: HTMLDivElement };
	colorSpace: ColorSpace;
	gradient?: string;
	/** Used to determine whether this instance of the picker is selected.
	 * Leave undefined if only one picker is used.
	 **/
	focus?: HTMLDivElement;
	/** Set a custom class to override default styling.
	 * Does not remove required classes for the gradient picker to function.
	 **/
	classPrefix?: string;
	/** Determines the vertical drag distance required to remove a selected node.
	 * distance to remove = pickerHeight * removeOffset
	 **/
	removeOffset?: number;
};

const props = withDefaults(defineProps<Props>(), {
	modelValue: () => ["dodgerblue", "blueviolet"],
	selectionColor: undefined,
	selection: undefined,
	color: undefined,
	gradient: "",
	colorSpace: "srgb",
	focus: undefined,
	classPrefix: "goede",
	removeOffset: 1,
});

// const convertColor = (color: Parameters<typeof convertColorHelper>[0]) => convertColorHelper(color, props.colorSpace);

const emit = defineEmits<{
	(e: "gradient", data: { gradient: string; colors: ColorData[] }): void;
	(e: "update:model-value", colors: ColorData[]): void;
	(e: "update:select", element: HTMLElement | undefined): void;
	(e: "update:gradient", gradient: string): void;
	(e: "update:selection", data: { element: HTMLElement | undefined; color: SimplifiedColor; index: number }): void;
}>();

const el = ref<HTMLElement>();
const data = ref<ColorData[]>([]);
const selectedIndex = ref(-1);
const hoverIndex = ref(-1);
const dragging = ref(false);

const checkerImage = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP4DAb6Ifv78Of50MGoAA+PQDwMAuX5VedFT3cEAAAAASUVORK5CYII=")`;

const pickerBackground = computed(() => `${cssGradient.value}, ${checkerImage}`);
const cssGradient = computed(() => `linear-gradient(in ${props.colorSpace} to right, ${colorGradient.value})`);
const colorGradient = computed(() => {
	const copy = [...data.value].sort((a, b) => (a.position > b.position ? 1 : -1)).filter((val) => val.position >= 0);

	if (copy.length === 1) copy.push(copy[0]);

	return copy.map((x) => `${x.color.formatHsl()} ${(x.position * 100).toFixed(2)}%`).join(", ");
});

const isArrayOfColorData = (val: (string | ColorData)[]): val is ColorData[] =>
	val.filter((x) => typeof x !== "string").length > 0;

const gradientHasPositions = (val: ColorData[]) => val.every((x) => x.position != null);
const setData = (gradient: (string | ColorData)[], colorSpace: ColorSpace) => {
	let count = gradient.length - 1;
	console.log("setting data with", colorSpace);

	if (isArrayOfColorData(gradient)) {
		if (gradientHasPositions(gradient)) {
			data.value = gradient.map((val) => ({
				color: convertColor(val.color, colorSpace),
				position: val.position,
			}));
		} else {
			data.value = gradient.map((val, i) => ({
				color: convertColor(val.color, colorSpace),
				position: i / count,
			}));
		}
	} else {
		// @ts-ignore
		data.value = gradient
			.filter((x): x is string => typeof x === "string")
			.map((val: string, i) => ({ color: convertColor(val, colorSpace), position: i / count }));
	}
};

const dataChanged = () => {
	emit("gradient", { gradient: colorGradient.value, colors: data.value });
	emit("update:gradient", cssGradient.value);
	emit("update:model-value", data.value);
};

const stopDrag = () => {
	dragging.value = false;

	const index = data.value.findIndex((val) => val.position < 0);
	if (index >= 0) remove(index);
};

const getEventPosition = (event: MouseEvent | TouchEvent) => {
	if (!("touches" in event)) return event;
	if (event.cancelable) event.preventDefault();

	return event.touches[0];
};

const remove = (index: number) => {
	data.value.splice(index, 1);
	dataChanged();

	selectedIndex.value = selectedIndex.value < data.value.length ? Math.max(selectedIndex.value, 0) : 0;
	emit("update:selection", {
		color: data.value[selectedIndex.value].color.toString(),
		index: selectedIndex.value,
		element: el.value,
	});
	emit("update:select", el.value);
};

const onHandleHover = (index: number) => {
	if (dragging.value) return;
	hoverIndex.value = index;
};

const onHandleSelect = (index: number) => {
	dragging.value = true;
	hoverIndex.value = -1;

	if (props.focus === el.value && selectedIndex.value === index) return;

	selectedIndex.value = index;
	emit("update:selection", {
		color: data.value[index].color,
		index: index,
		element: el.value,
	});
	emit("update:select", el.value);
};

const addAtClick = (event: MouseEvent | TouchEvent) => {
	if (el.value == null) return;
	const rect = el.value.getBoundingClientRect();
	const pos = getEventPosition(event);

	const relativeX = (pos.clientX - rect.left) / rect.width;
	const neighborIndices = pointsSurroundingPercentage(data.value, relativeX);

	const relVal =
		(relativeX - data.value[neighborIndices[0]].position) /
		(data.value[neighborIndices[1]].position - data.value[neighborIndices[0]].position);

	data.value.push({
		color: convertColor(
			interpolateColor(
				data.value[neighborIndices[0]].color.toString(),
				data.value[neighborIndices[1]].color.toString(),
				relVal,
				props.colorSpace
			),
			props.colorSpace
		),
		position: relativeX,
	});
	dataChanged();

	selectedIndex.value = data.value.length - 1;
	dragging.value = true;
	emit("update:selection", {
		color: data.value[selectedIndex.value].color,
		index: selectedIndex.value,
		element: el.value,
	});
	emit("update:select", el.value);
};

const pointsSurroundingPercentage = (data: ColorData[], percentage: number) => {
	let lowest = { position: 99, distance: 99, index: -1 };
	let highest = { position: -99, distance: 99, index: -1 };

	data.forEach((val, index) => {
		const dist = Math.abs(val.position - percentage);
		if (val.position <= percentage && lowest.distance > dist) {
			lowest = { position: val.position, distance: dist, index: index };
		} else if (val.position >= percentage && highest.distance > dist) {
			highest = { position: val.position, distance: dist, index: index };
		}
	});

	highest.index = highest.index == -1 ? lowest.index : highest.index;
	lowest.index = lowest.index == -1 ? highest.index : lowest.index;

	return [lowest.index, highest.index];
};

const setValue = (event: MouseEvent | TouchEvent) => {
	if (el.value == null) return;
	if (!dragging.value || selectedIndex.value == -1) return;
	const rect = el.value.getBoundingClientRect();

	const pos = getEventPosition(event);
	const relative = {
		x: (pos.clientX - rect.left) / rect.width,
		y: (pos.clientY - rect.top) / rect.height,
	};

	const pixelsFromEdge = Math.abs(
		pos.clientY > rect.bottom ? pos.clientY - rect.bottom : pos.clientY < rect.top ? pos.clientY - rect.top : 0
	);
	const relativeHeightDistance = pixelsFromEdge > 0 ? pixelsFromEdge / rect.height : 0;

	relative.x = Math.min(Math.max(relative.x, 0), 1);

	let newPosition = 0;
	if (data.value.length > 1 && relativeHeightDistance > props.removeOffset) {
		newPosition = -1;
	} else if (data.value[selectedIndex.value]?.position !== relative.x) {
		newPosition = relative.x;
	} else {
		return;
	}

	data.value[selectedIndex.value] = { color: data.value[selectedIndex.value].color, position: newPosition };

	dataChanged();
};

watch(
	() => props.colorSpace,
	async (val) => {
		// await nextTick();
		// console.log([...props.modelValue]);
		// setData(props.modelValue);
		// console.log([...props.modelValue]);
		dataChanged();
	}
);

watch(
	() => props.color,
	(val) => {
		if (val == null) return;
		if (selectedIndex.value < 0) return;
		if (data.value[selectedIndex.value].color === convertColor(val, props.colorSpace)) return;

		data.value[selectedIndex.value] = {
			color: convertColor(val, props.colorSpace),
			position: data.value[selectedIndex.value].position,
		};

		dataChanged();
	}
);
watch(
	() => props.focus,
	(val) => {
		if (val !== el.value) {
			selectedIndex.value = -1;
		} else if (selectedIndex.value === -1) {
			emit("update:selection", { color: data.value[0].color, index: 0, element: el.value });
			emit("update:select", el.value);
			selectedIndex.value = 0;
		}
	}
);

watch(
	() => props.modelValue,
	(val, oldVal) => {
		setData(val, props.colorSpace);
		console.log([...oldVal], [...val]);
	}
);

setData(props.modelValue, props.colorSpace);

useEventListener("mouseup", stopDrag);
useEventListener("mousemove", setValue);
useEventListener("touchend", stopDrag);
useEventListener("touchmove", setValue, { passive: false });

onMounted(() => {
	emit("update:gradient", cssGradient.value);
});
</script>

<template>
	<div
		ref="el"
		:class="['gradient-picker', `${classPrefix}-gradient-picker`]"
		:style="{ background: pickerBackground }"
		@mousedown.prevent="addAtClick"
		@touchstart.prevent="addAtClick"
	>
		<HandleContainer
			v-for="(val, i) in data"
			:key="i"
			:value="val"
			:tabindex="i"
			:selected="selectedIndex === i"
			:hovered="hoverIndex === i"
			:class-prefix="classPrefix"
			@select="onHandleSelect(i)"
			@hover="onHandleHover(i)"
			@blur="onHandleHover(-1)"
		/>
	</div>
</template>

<style lang="scss">
.gradient-picker {
	position: relative;
	height: 2em;
	width: 100%;
	max-width: 100%;
	box-sizing: border-box;
}

.handle-container {
	position: absolute;
	top: 50%;
	width: 2em;
	height: 2em;
	transform: translateY(-50%) translateX(-50%);
	text-align: center;
	cursor: pointer;

	&--hover {
		z-index: 20;
	}

	&--selected {
		z-index: 10;
	}
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
	box-shadow: 0em 0em 0em 0.15em white, 0em 0em 0em 0.25em rgba(0, 0, 0, 0.5),
		0em 0em 0em 0.1em rgba(0, 0, 0, 0.5) inset;
	transition: transform 0.088s ease, box-shadow 0.088s ease;

	&--hover {
		transform: translateY(-50%) translateX(-50%) scale(1.2, 1.2);
	}

	&--selected {
		box-shadow: 0em 0em 0em 0.15em white, 0em 0em 0em 0.23em rgba(0, 0, 0, 0.5),
			0em 0em 0em 0.1em rgba(0, 0, 0, 0.5) inset;

		transform: translateY(-50%) translateX(-50%) scale(1.35, 1.35);
	}
}
</style>
