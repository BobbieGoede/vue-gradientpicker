import { expect, onTestFinished, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { rgb, type ColorSpaceObject } from "d3-color";
import GradientPicker from "./GradientPicker.vue";

type ColorData = { position: number; color: ColorSpaceObject };
type Props = InstanceType<typeof GradientPicker>["$props"];

async function renderPicker(props: Props = {}, attrs = {}) {
	const screen = await render(GradientPicker, {
		props: { modelValue: ["rgb(255, 0, 0)", "rgb(0, 0, 255)"], ...props },
		attrs,
	});
	const picker = screen.container.querySelector<HTMLElement>(".gradient-picker")!;
	const handles = () => [...picker.querySelectorAll<HTMLElement>(".handle-container")];
	const lastModel = () => screen.emitted<[ColorData[]]>("update:model-value")?.at(-1)?.[0];

	return { screen, picker, handles, lastModel };
}

test("distributes string colors evenly", async () => {
	const { handles } = await renderPicker({ modelValue: ["red", "lime", "blue"] });

	expect(handles().map((handle) => handle.style.left)).toEqual(["0%", "50%", "100%"]);
});

test("adds a stop with the interpolated color on click", async () => {
	const { picker, handles, lastModel } = await renderPicker();
	const { width, height } = picker.getBoundingClientRect();

	await userEvent.click(picker, { position: { x: width / 2, y: height / 2 } });

	expect(handles()).toHaveLength(3);
	const added = lastModel()!.at(-1)!;
	expect(added.position).toBeCloseTo(0.5, 1);
	const { r, g, b } = rgb(added.color);
	expect([r, g, b]).toEqual([expect.closeTo(128, -1), 0, expect.closeTo(128, -1)]);
});

test("moves a stop when dragged along the picker", async () => {
	const { picker, handles, lastModel } = await renderPicker();
	const { width, height } = picker.getBoundingClientRect();

	await userEvent.dragAndDrop(handles()[1], picker, { targetPosition: { x: width / 4, y: height / 2 } });

	expect(lastModel()!.map((stop) => stop.position)).toEqual([0, expect.closeTo(0.25, 1)]);
});

test("removes a stop when dragged away from the picker", async () => {
	const { handles, lastModel } = await renderPicker();
	const dropZone = document.createElement("div");
	dropZone.style.height = "400px";
	document.body.append(dropZone);
	onTestFinished(() => dropZone.remove());

	await userEvent.dragAndDrop(handles()[1], dropZone, { targetPosition: { x: 10, y: 300 } });

	expect(handles()).toHaveLength(1);
	expect(lastModel()).toHaveLength(1);
});

test("applies the color prop to the selected stop", async () => {
	const { screen, handles, lastModel } = await renderPicker();

	await userEvent.click(handles()[0]);
	await screen.rerender({ color: "rgb(0, 255, 0)" });

	expect(screen.emitted("update:selection")?.at(-1)).toEqual([expect.objectContaining({ index: 0 })]);
	expect(lastModel()![0].color.toString()).toBe("rgb(0, 255, 0)");
});

test("updates the gradient when switching color space", async () => {
	// fallthrough attrs switch Vue to per-property style patching (vuejs/core#9084)
	const { screen, picker } = await renderPicker({ colorSpace: "srgb" }, { "data-picker": "" });

	for (const colorSpace of ["lch", "hsl", "lab"] as const) {
		await screen.rerender({ colorSpace });
		expect(picker.style.backgroundImage).toContain(`in ${colorSpace}`);
	}
});
