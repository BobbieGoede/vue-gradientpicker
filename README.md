# @goede/gradientpicker [Live demo](https://gradientpicker.goede.site/ "Live demo")

## Description

A simple & intuitive gradient picker made for Vue. Tap on the gradient to add a new node, drag a node to change its position or to remove it from the gradient.

## Install & import

Start by installing @goede/vue-gradientpicker using npm:

```bash
$ npm install @goede/vue-gradientpicker
```

Import the gradient picker from @goede/vue-gradientpicker at the top of the vue script. Then register the component in the components object.

```html
<template>
  <GradientPicker
    @selectionChange='setPickerFocus'
    @gradientChange='onGradientChange'
    :selectionColor='nodeColor'
    :currentFocus='currentFocus'
  />
</template>

<script>
// Import component
import GradientPicker from "@goede/vue-gradientpicker";

export default {
  // Register component
  components: {
  GradientPicker: GradientPicker
  },
  data: function(){
    return{
      currentFocus: null,
      nodeColor: ""
    }
  },
  methods: {
    setPickerFocus: function(e) {
      this.currentFocus = e.element;
      this.nodeColor = e.color;
    },
    onGradientChange: function(e){
      document.documentElement.style.background =
	    `linear-gradient(to right, ${colors.gradient})`;
    }
  }
}
</script>
```
## Properties

<table>
<tr>
	<th>Name</th>
	<th>Type</th>
	<th>Default</th>
	<th>Description</th>
</tr>
<tr>
	<td>selectionColor</td>
	<td><pre class="javascript">Object</pre></td>
	<td><pre class="javascript">{
  h: 0, 
  s: 0, 
  l: 0, 
  opacity: 0
}</pre></td>
	<td>Use this prop to set the color of the current selected node.</td>
</tr>
<tr>
	<td>gradient</td>
	<td><pre class="javascript">[Object] or [String]</pre></td>
		<td><pre class="javascript">[
  "dodgerblue", 
  "blueviolet"
]</pre></td>
	<td>Used to initialize the gradient. An array of color strings or an array of objects with a color string and a position value (0...1) properties.

For example;

<pre>[{ 
  color: "dodgerblue", 
  position: 0.3 
},
{ 
  color: "blueviolet", 
  position: 0.8 
}]</pre></td>
</tr>
<tr>
	<td>currentFocus</td>
	<td><pre class="javascript">HTMLDivElement</pre></td>
	<td><pre class="javascript">undefined</pre></td>
	<td>Used to determine whether this instance of the picker is selected. Leave undefined if a single picker is used.</td>
</tr>
<tr>
	<td>classPrefix</td>
	<td><pre class="javascript">String</pre></td>
	<td><pre class="javascript">"Goede"</pre></td>
	<td>Set a custom class to override default styling. Does not remove required classes for the gradient picker to function.</td>
</tr>
<tr>
<td>removeOffset</td>
	<td><pre class="javascript">Number</pre></td>
	<td><pre class="javascript">5</pre></td>
	<td>Determines the vertical drag distance required to remove a selected node.
(distance to remove = pickerHeight * removeOffset)</td>
</tr>
</table>

## Events

<table>
<tr>
	<th>Name</th>
	<th>Object</th>
	<th>Description</th>
</tr>
<tr>
	<td>selectionChange</td>
	<td><pre class="javascript">{
  color: ColorObject,
  element: HTMLDivElement,
  index: 0
}</pre></td>
	<td>Emitted when a new node is selected.</td>
</tr>
<tr>
	<td>gradientChange</td>
	<td><pre class="javascript">{
  gradient: String,
  colors: [NodeObject]
}</pre></td>
	<td>Emitted on every gradient change.

Gradient property is a string containing each color with their position percentage, intended for css gradients.

Colors property is an array with NodeObjects, containing each color as an hsl object and their position (0...1)</td>
</tr>
</table>
