export type ColorSpace = "srgb" | "hsl" | "lab" | "lch" | "oklab" | "oklch";
export type GradientStop = { color: string; position: number };

export function toLinearGradient(stops: GradientStop[], colorSpace: ColorSpace = "oklch", direction = "to right") {
	const sorted = stops.toSorted((a, b) => a.position - b.position);
	if (sorted.length === 1) sorted.push(sorted[0]);

	const colorStops = sorted.map((stop) => `${stop.color} ${+(stop.position * 100).toFixed(2)}%`);
	return `linear-gradient(in ${colorSpace} ${direction}, ${colorStops.join(", ")})`;
}

/**
 * Resolves the color at `position` the same way the browser interpolates the gradient
 * @internal
 */
export function getColorAt(el: HTMLElement, stops: GradientStop[], position: number, colorSpace: ColorSpace) {
	const sorted = stops.toSorted((a, b) => a.position - b.position);
	const before = sorted.findLast((stop) => stop.position <= position) ?? sorted[0];
	const after = sorted.find((stop) => stop.position >= position) ?? sorted[sorted.length - 1];
	const range = after.position - before.position;
	const weight = range ? (position - before.position) / range : 0;

	const previous = el.style.color;
	el.style.color = `color-mix(in ${colorSpace}, ${before.color}, ${after.color} ${weight * 100}%)`;
	const color = getComputedStyle(el).color;
	el.style.color = previous;

	return color;
}
