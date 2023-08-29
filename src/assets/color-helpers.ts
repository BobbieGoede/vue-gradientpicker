import { ColorCommonInstance, ColorSpaceObject, color, hsl, lab, lch, rgb } from "d3-color";
import { interpolateHcl, interpolateHsl, interpolateLab, interpolateRgb } from "d3-interpolate";

export type ColorSpace = "lab" | "lch" | "hsl" | "srgb";

export const interpolateColor = (
	col1: string | ColorSpaceObject,
	col2: string | ColorSpaceObject,
	position: number,
	space: ColorSpace
) => {
	switch (space) {
		case "hsl":
			return interpolateHsl(col1, col2)(position);
		case "lab":
			return interpolateLab(col1, col2)(position);
		case "lch":
			return interpolateHcl(col1, col2)(position);
		case "srgb":
		default:
			return interpolateRgb(col1, col2)(position);
	}
};

export const convertColor = (col: string | ColorCommonInstance | ColorSpaceObject, space: ColorSpace) => {
	const val = typeof col === "string" ? color(col) ?? rgb(0, 0, 0) : col;

	switch (space) {
		case "hsl":
			return hsl(val);
		case "lab":
			return lab(val);
		case "lch":
			return lch(val);
		case "srgb":
		default:
			return rgb(val);
	}
};

export const formatColor = (col: ColorSpaceObject, space: ColorSpace) => {
	switch (space) {
		case "hsl":
			return col.formatHsl();
		case "lab":
			return col.toString();
		case "lch":
			return col.formatHsl();
		case "srgb":
		default:
			return col.formatRgb();
	}
};
