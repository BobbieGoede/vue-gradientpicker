# @goede/vue-gradientpicker

![@goede/vue-gradientpicker cover image](https://goede.site/gradientpicker/gradient-picker-cover.png)
[![npm version](https://img.shields.io/npm/v/@goede/vue-gradientpicker.svg?style=flat)](https://www.npmjs.com/package/@goede/vue-gradientpicker "View this project on npm")
[![npm downloads](https://img.shields.io/npm/dt/@goede/vue-gradientpicker.svg?style=flat)](https://www.npmjs.com/package/@goede/vue-gradientpicker "View this project on npm")

### [Live demo](https://goede.site/gradientpicker/index.html "Live demo")

A simple & intuitive gradient picker made with Vue. Click on the gradient to add a stop, drag a stop to change its position, or drag it away from the gradient to remove it.

The gradient is rendered by the browser in the color space of your choice (`srgb`, `hsl`, `lab`, `lch`, `oklab` or `oklch`), and new stops get the exact color the browser renders at that position.

## Install

```bash
npm install @goede/vue-gradientpicker
```

## Usage

```vue
<script setup lang="ts">
import { computed, ref } from "vue";
import GradientPicker, { toLinearGradient, type GradientStop } from "@goede/vue-gradientpicker";
import "@goede/vue-gradientpicker/style.css";

const stops = ref<GradientStop[]>([
	{ color: "dodgerblue", position: 0 },
	{ color: "blueviolet", position: 1 },
]);
const selected = ref<number>();
const gradient = computed(() => toLinearGradient(stops.value, "oklch"));
</script>

<template>
	<GradientPicker v-model="stops" v-model:selected="selected" color-space="oklch" />

	<!-- edit the selected stop with any color input -->
	<input v-if="selected !== undefined" v-model="stops[selected].color" />

	<div :style="{ backgroundImage: gradient }" />
</template>
```

Stop colors can be any CSS color string. Stops added by the picker use the notation of the color space, for example `oklch(0.64 0.22 321.22)` or `color(srgb 0.5 0 0.5)`.

### Multiple pickers

Each picker has its own selection, clear the other selections to keep a single stop selected across pickers:

```vue
<GradientPicker v-model="background" v-model:selected="backgroundStop" @update:selected="borderStop = undefined" />
<GradientPicker v-model="border" v-model:selected="borderStop" @update:selected="backgroundStop = undefined" />
```

### Keyboard

Each stop is a focusable slider labelled with its color, focusing a stop selects it.

| Key                     | Action                                         |
| ----------------------- | ---------------------------------------------- |
| `←` `↓` / `→` `↑`       | Move the stop by 1% (10% when holding `Shift`) |
| `Page Down` / `Page Up` | Move the stop by 10%                           |
| `Home` / `End`          | Move the stop to the start or end              |
| `Delete` / `Backspace`  | Remove the stop                                |

Stops can't be added with the keyboard, add them by updating `v-model` instead (for example from an "Add stop" button).

## API

### Models

| Model              | Type                                    | Default                                                                        |
| ------------------ | --------------------------------------- | ------------------------------------------------------------------------------ |
| `v-model`          | `{ color: string; position: number }[]` | `[{ color: "dodgerblue", position: 0 }, { color: "blueviolet", position: 1 }]` |
| `v-model:selected` | `number \| undefined`                   | `undefined`                                                                    |

Positions range from `0` to `1`. Stops keep their order in the array when dragged past each other.

### Props

| Prop           | Type                                                      | Default   | Description                                                                                                     |
| -------------- | --------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `colorSpace`   | `"srgb" \| "hsl" \| "lab" \| "lch" \| "oklab" \| "oklch"` | `"oklch"` | Color space used to interpolate the gradient.                                                                   |
| `classPrefix`  | `string`                                                  | `"goede"` | Adds `<classPrefix>-*` classes for theming, see [Styling](#styling).                                            |
| `removeOffset` | `number`                                                  | `1`       | Vertical distance (relative to the picker height) a stop has to be dragged away from the gradient to remove it. |

### `toLinearGradient(stops, colorSpace = "oklch", direction = "to right")`

Returns a CSS `linear-gradient()` for the given stops, which you can use anywhere a CSS image is accepted.

```ts
toLinearGradient(stops.value, "oklab", "45deg");
// linear-gradient(in oklab 45deg, dodgerblue 0%, blueviolet 100%)
```

## Styling

The picker renders the following classes, each also added with the `classPrefix` (`goede-gradient-picker`, `goede-handle`, etc.):

- `gradient-picker`
- `handle-container`, `handle-container--selected`
- `handle`

The unprefixed classes contain the styles required for the picker to work, the default theme uses the `goede-` prefixed classes. Set `classPrefix` to your own prefix to replace the default theme.

## Browser support

The picker uses CSS color interpolation in gradients and `color-mix()`, which are supported in Chrome/Edge 111+, Safari 16.2+ and Firefox 127+.

## Migrating from 1.x

Version 2 requires Vue 3, use `@goede/vue-gradientpicker@1` for Vue 2.

- `gradient` is replaced by `v-model`, stops are always objects with a `color` and `position`
- `currentFocus`, `selectionColor` and `@selection-change` are replaced by `v-model:selected`, change the color of a stop by updating it in `v-model`
- `@gradient-change` is replaced by `v-model` together with `toLinearGradient()`
- The stylesheet is no longer injected, import `@goede/vue-gradientpicker/style.css`
