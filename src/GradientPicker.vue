<template>
	<div
		ref="el"
		class="gradient-picker"
		:class="`${classPrefix}-gradient-picker`"
		:style="{ background: pickerBackground }"
		@mousedown.prevent="addAtClick"
		@touchstart.prevent="addAtClick"
	>
		<div
			v-for="(val, i) in data"
			:key="i"
			class="handle-container"
			:class="[`${classPrefix}-handle-container`, containerClass(i)]"
			:style="{ left: `${percentage(val.position)}%` }"
			@mousedown.prevent.stop="select(i)"
			@touchstart.prevent.stop="select(i)"
			@mouseover="hover(i)"
			@mouseleave="unhover()"
		>
			<div
				v-show="data[i].position >= 0"
				class="handle"
				:class="[`${classPrefix}-handle`, knobClass(i)]"
				:style="{ backgroundColor: data[i].color.toString() }"
			></div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import * as d3Interpolate from "d3-interpolate";
import * as d3Color from "d3-color";

const d3 = { ...d3Interpolate, ...d3Color };

type HSLColor = d3Color.HSLColor;
type ColorData = { position: number; color: HSLColor };
type SimplifiedColor = {
	h: 0;
	s: 0;
	l: 0;
	opacity: 0;
};

type Props = {
	selectionColor?: SimplifiedColor;
	gradient?: string[];
	// Used to determine whether this instance of the picker is selected.
	// Leave undefined if only one picker is used.
	currentFocus?: HTMLDivElement;
	// Set a custom class to override default styling.
	// Does not remove required classes for the gradient picker to function.
	classPrefix?: string;
	// Determines the vertical drag distance required to remove a selected node.
	// distance to remove = pickerHeight * removeOffset
	removeOffset?: number;
};
const props = withDefaults(defineProps<Props>(), {
	selectionColor: () => ({ h: 0, s: 0, l: 0, opacity: 0 }),
	gradient: () => ["dodgerblue", "blueviolet"],
	currentFocus: undefined,
	classPrefix: "goede",
	removeOffset: 5,
});

const emit = defineEmits(["selection-change", "gradient-change"]);

const el = ref<HTMLElement>();
const data = ref<ColorData[]>([]);
const selectedIndex = ref(-1);
const hoverIndex = ref(-1);
const dragging = ref(false);
const checkerImage = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP4DAb6Ifv78Of50MGoAA+PQDwMAuX5VedFT3cEAAAAASUVORK5CYII=")`;

const pickerBackground = computed(() => `linear-gradient(to right, ${colorGradient.value}), ${checkerImage}`);
const colorGradient = computed(() => {
	const copy = [...data.value].sort((a, b) => (a.position > b.position ? 1 : -1)).filter((val) => val.position >= 0);

	if (copy.length === 1) {
		copy.push(copy[0]);
	}

	return copy.map((x) => `${x.color} ${percentage(x.position).toFixed(2)}%`).join(", ");
});

const isArrayOfColorData = (val: (string | ColorData)[]): val is ColorData[] =>
	val.filter((x): x is ColorData => x === typeof "string").length > 0;

const setData = (gradient: (string | ColorData)[]) => {
	let count = gradient.length - 1;

	if (typeof gradient[0] === "object" && isArrayOfColorData(gradient)) {
		if (gradient[0].position === undefined) {
			data.value = gradient.map((val, i) => ({ color: d3.hsl(val.color), position: i / count }));
		} else {
			data.value = gradient.map((val) => ({ color: d3.hsl(val.color), position: val.position }));
		}
	} else if (typeof gradient[0] === "string") {
		data.value = gradient
			.filter((x): x is string => x !== typeof "string")
			.map((val: string, i) => ({ color: d3.hsl(val), position: i / count }));
	}
};

const percentage = (val: number) => val * 100;

const dataChanged = () => {
	emit("gradient-change", { gradient: colorGradient.value, colors: data.value });
};

const stopDrag = () => {
	dragging.value = false;

	let index = data.value.findIndex((val) => val.position < 0);
	if (index >= 0) {
		remove(index);
	}
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
	emit("selection-change", {
		color: data.value[selectedIndex.value].color,
		index: selectedIndex.value,
		element: el.value,
	});
};

const hover = (index: number) => {
	if (dragging.value) return;
	hoverIndex.value = index;
};

const unhover = () => {
	if (dragging.value) return;
	hoverIndex.value = -1;
};

const select = (index: number) => {
	dragging.value = true;
	hoverIndex.value = -1;

	if (props.currentFocus === el.value && selectedIndex.value === index) return;

	selectedIndex.value = index;
	emit("selection-change", {
		color: data.value[index].color,
		index: index,
		element: el.value,
	});
};

const knobClass = (index: number) => {
	const selectedClass = `handle--selected ${props.classPrefix}-handle--selected`;
	const hoverClass = `handle--hover ${props.classPrefix}-handle--hover`;

	return [selectedIndex.value === index ? selectedClass : "", hoverIndex.value === index ? hoverClass : ""];
};

const containerClass = (index: number) => {
	const selectedClass = `handle-container--selected ${props.classPrefix}-handle-container--selected`;
	const hoverClass = `handle-container--hover ${props.classPrefix}-handle-container--hover`;

	return [selectedIndex.value === index ? selectedClass : "", hoverIndex.value === index ? hoverClass : ""];
};

const addAtClick = (event: MouseEvent | TouchEvent) => {
	if (el.value == null) return;
	var rect = el.value.getBoundingClientRect();
	var pos = getEventPosition(event);

	var relativeX = (pos.clientX - rect.left) / rect.width;
	let neighborIndices = pointsSurroundingPercentage(data.value, relativeX);

	let relval =
		(relativeX - data.value[neighborIndices[0]].position) /
		(data.value[neighborIndices[1]].position - data.value[neighborIndices[0]].position);

	data.value.push({
		color: d3.hsl(
			d3.interpolateRgb(data.value[neighborIndices[0]].color, data.value[neighborIndices[1]].color)(relval)
		),
		position: relativeX,
	});
	dataChanged();

	selectedIndex.value = data.value.length - 1;
	dragging.value = true;
	emit("selection-change", {
		color: data.value[selectedIndex.value].color,
		index: selectedIndex.value,
		element: el.value,
	});
};

const pointsSurroundingPercentage = (data: ColorData[], percentage: number) => {
	let lowest = { position: 99, distance: 99, index: -1 };
	let highest = { position: -99, distance: 99, index: -1 };

	data.forEach((val, index) => {
		let dist = Math.abs(val.position - percentage);
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
	var rect = el.value.getBoundingClientRect();

	var pos = getEventPosition(event);
	let relative = {
		x: (pos.clientX - rect.left) / rect.width,
		y: (pos.clientY - rect.top) / rect.height,
	};
	relative.x = Math.min(Math.max(relative.x, 0), 1);

	let newPosition = 0;
	if (data.value.length > 1 && Math.abs(relative.y) > props.removeOffset) {
		newPosition = -1;
	} else if (data.value[selectedIndex.value]?.position !== relative.x) {
		newPosition = relative.x;
	} else {
		return;
	}

	data.value[selectedIndex.value] = {
		color: data.value[selectedIndex.value].color,
		position: newPosition,
	};
	// this.$set(this.data, this.selectedIndex, {
	// 	color: this.data[this.selectedIndex].color,
	// 	position: newPosition,
	// });
	dataChanged();
};

watch(
	() => props.selectionColor,
	(newVal) => {
		if (selectedIndex.value < 0) return;
		if (data.value[selectedIndex.value].color === d3.hsl(newVal.h, newVal.s, newVal.l, newVal.opacity)) return;

		data.value[selectedIndex.value] = {
			color: d3.hsl(newVal.h, newVal.s, newVal.l, newVal.opacity),
			position: data.value[selectedIndex.value].position,
		};
		// this.$set(this.data, this.selectedIndex, {
		// 	color: d3.hsl(newVal),
		// 	position: this.data[this.selectedIndex].position,
		// });
		dataChanged();
	}
);
watch(
	() => props.currentFocus,
	(newVal) => {
		if (newVal !== el.value) {
			selectedIndex.value = -1;
		} else if (selectedIndex.value === -1) {
			emit("selection-change", {
				color: data.value[0].color,
				index: 0,
				element: el.value,
			});
			selectedIndex.value = 0;
		}
	}
);
watch(
	() => props.gradient,
	(newVal) => {
		setData(newVal);
	}
);

// console.log(props.gradient);
setData(props.gradient);
onMounted(() => {
	window.addEventListener("mouseup", stopDrag);
	window.addEventListener("mousemove", setValue);
	window.addEventListener("touchend", stopDrag);
	window.addEventListener("touchmove", setValue, { passive: false });

	emit("gradient-change", {
		gradient: colorGradient.value,
		colors: data.value,
	});
});

onBeforeUnmount(() => {
	window.removeEventListener("mouseup", stopDrag);
	window.removeEventListener("mousemove", setValue);
	window.removeEventListener("touchend", stopDrag);
	window.removeEventListener("touchmove", setValue);
});
</script>

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
