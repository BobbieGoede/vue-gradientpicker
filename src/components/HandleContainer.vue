<script lang="ts" setup>
import { convertColor } from "@/assets/color-helpers";
import { ColorSpaceObject, hsl } from "d3-color";
import { computed } from "vue";

type Props = {
	value: { position: number; color: ColorSpaceObject };
	classPrefix: string;
	selected: boolean;
	hovered: boolean;
};

const emit = defineEmits<{
	(e: "hover"): void;
	(e: "blur"): void;
	(e: "select"): void;
}>();

const props = withDefaults(defineProps<Props>(), {
	value: () => ({ position: 0, color: hsl(0, 0, 0, 1) }),
	classPrefix: "goede",
	selected: false,
	hovered: false,
});

const prefixClass = (className: string) => [className, `${props.classPrefix}-${className}`];

const containerClass = computed(() => {
	const selectedClass = prefixClass("handle-container--selected");
	const hoverClass = prefixClass("handle-container--hover");

	return [prefixClass("handle-container"), props.selected ? selectedClass : "", props.hovered ? hoverClass : ""];
});

const knobClass = computed(() => {
	const selectedClass = prefixClass("handle--selected");
	const hoverClass = prefixClass("handle--hover");

	return [prefixClass("handle"), props.selected ? selectedClass : "", props.hovered ? hoverClass : ""];
});

const onHandleBlur = () => emit("blur");
const onHandleSelect = () => emit("select");
const onHandleHover = () => {
	if (props.hovered) return;
	emit("hover");
};
</script>

<template>
	<div
		:class="containerClass"
		:style="{ left: `${value.position * 100}%` }"
		@mousedown.prevent.stop="onHandleSelect"
		@touchstart.prevent.stop="onHandleSelect"
		@mouseover="onHandleHover"
		@mouseleave="onHandleBlur"
	>
		<div v-show="value.position >= 0" :class="knobClass" :style="{ backgroundColor: value.color.toString() }"></div>
	</div>
</template>
