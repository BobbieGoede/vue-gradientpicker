import { describe, expect, onTestFinished, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { h, nextTick, reactive } from "vue";
import GradientPicker from "./GradientPicker.vue";
import { toLinearGradient, type ColorSpace, type GradientStop } from "./colors";

type State = { modelValue?: GradientStop[]; selected?: number; colorSpace?: ColorSpace };

const RED_TO_BLUE: GradientStop[] = [
	{ color: "rgb(255, 0, 0)", position: 0 },
	{ color: "rgb(0, 0, 255)", position: 1 },
];

async function renderPicker(props: State = {}, attrs = {}) {
	const state = reactive<State>({ modelValue: RED_TO_BLUE, ...props });
	const screen = await render(() =>
		h(GradientPicker, {
			...attrs,
			...state,
			"onUpdate:modelValue": (stops: GradientStop[]) => (state.modelValue = stops),
			"onUpdate:selected": (index?: number) => (state.selected = index),
		})
	);
	const picker = screen.container.querySelector<HTMLElement>(".gradient-picker")!;
	const handles = () => [...picker.querySelectorAll<HTMLElement>(".handle-container")];

	return { state, picker, handles };
}

async function clickCenter(picker: HTMLElement) {
	const { width, height } = picker.getBoundingClientRect();
	await userEvent.click(picker, { position: { x: width / 2, y: height / 2 } });
}

const getChannels = (color: string) => color.match(/-?[\d.]+/g)!.map(Number);

test("renders a handle per stop", async () => {
	const { handles } = await renderPicker();

	expect(handles().map((handle) => handle.style.left)).toEqual(["0%", "100%"]);
});

test("selects a stop on click", async () => {
	const { state, handles } = await renderPicker();

	await userEvent.click(handles()[1]);

	expect(state.selected).toBe(1);
	expect(handles()[1].classList).toContain("handle-container--selected");
});

test("adds a stop with the color at the clicked position", async () => {
	const { state, picker, handles } = await renderPicker({ colorSpace: "srgb" });

	await clickCenter(picker);

	expect(handles()).toHaveLength(3);
	expect(state.selected).toBe(2);
	const added = state.modelValue![2];
	expect(added.position).toBeCloseTo(0.5, 1);
	expect(getChannels(added.color)).toEqual([expect.closeTo(0.5, 1), 0, expect.closeTo(0.5, 1)]);
});

test("adds a stop matching the gradient's powerless hue handling", async () => {
	const { state, picker } = await renderPicker({
		colorSpace: "oklch",
		modelValue: [
			{ color: "white", position: 0 },
			{ color: "blue", position: 1 },
		],
	});

	await clickCenter(picker);

	const [, , hue] = getChannels(state.modelValue![2].color);
	expect(hue).toBeCloseTo(264, 0);
});

test("moves a stop when dragged along the picker", async () => {
	const { state, picker, handles } = await renderPicker();
	const { width, height } = picker.getBoundingClientRect();

	await userEvent.dragAndDrop(handles()[1], picker, { targetPosition: { x: width / 4, y: height / 2 } });

	expect(state.modelValue!.map((stop) => stop.position)).toEqual([0, expect.closeTo(0.25, 1)]);
});

test("removes a stop when dragged away from the picker", async () => {
	const { state, handles } = await renderPicker();
	const dropZone = document.createElement("div");
	dropZone.style.height = "400px";
	document.body.append(dropZone);
	onTestFinished(() => dropZone.remove());

	await userEvent.dragAndDrop(handles()[1], dropZone, { targetPosition: { x: 10, y: 300 } });

	expect(handles()).toHaveLength(1);
	expect(state.modelValue).toEqual([RED_TO_BLUE[0]]);
	expect(state.selected).toBe(0);
});

test("updates the gradient when switching color space", async () => {
	// fallthrough attrs switch Vue to per-property style patching (vuejs/core#9084)
	const { state, picker } = await renderPicker({ colorSpace: "srgb" }, { "data-picker": "" });

	for (const colorSpace of ["lch", "hsl", "oklab"] as const) {
		state.colorSpace = colorSpace;
		await nextTick();
		expect(picker.style.backgroundImage).toContain(`in ${colorSpace}`);
	}
});

describe("toLinearGradient", () => {
	test("sorts stops by position", () => {
		const stops = [
			{ color: "blue", position: 1 },
			{ color: "red", position: 0.25 },
		];

		expect(toLinearGradient(stops, "oklab")).toBe("linear-gradient(in oklab to right, red 25%, blue 100%)");
	});

	test("repeats a single stop", () => {
		expect(toLinearGradient([{ color: "red", position: 0.5 }])).toBe(
			"linear-gradient(in oklch to right, red 50%, red 50%)"
		);
	});
});
