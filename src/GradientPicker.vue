<template>
	<div
		class="gradient-picker"
		:class="`${classPrefix}-gradient-picker`"
		ref="slider"
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
				:style="{backgroundColor: data[i].color}"
			></div>
		</div>
	</div>
</template>

<script>
const d3 = {
	...require("d3-interpolate"),
	...require("d3-color")
};

export default {
	props: {
		selectionColor: {
			type: Object,
			default: () => ({
				h: 0,
				s: 0,
				l: 0,
				opacity: 0
			})
		},
		gradient: {
			type: Array,
			default: () => ["dodgerblue", "blueviolet"]
		},
		// Used to determine whether this instance of the picker is selected.
		// Leave undefined if only one picker is used.
		currentFocus: {
			type: HTMLDivElement,
			default: undefined
		},
		// Set a custom class to override default styling.
		// Does not remove required classes for the gradient picker to function.
		classPrefix: {
			type: String,
			default: "goede"
		},
		// Determines the vertical drag distance required to remove a selected node.
		// distance to remove = pickerHeight * removeOffset
		removeOffset: {
			type: Number,
			default: 5
		}
	},
	data() {
		return {
			data: null,
			selectedIndex: -1,
			hoverIndex: -1,
			dragging: false,
			checkerImage: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAL0lEQVQ4T2N89uzZfwY8QFJSEp80A+OoAcMiDP4DAb6Ifv78Of50MGoAA+PQDwMAuX5VedFT3cEAAAAASUVORK5CYII=")`
		};
	},
	created() {
		this.setData(this.gradient);
	},
	mounted() {
		window.addEventListener("mouseup", this.stopDrag);
		window.addEventListener("mousemove", this.setValue);
		window.addEventListener("touchend", this.stopDrag);
		window.addEventListener("touchmove", this.setValue, { passive: false });

		this.$emit("gradientChange", {
			gradient: this.colorGradient,
			colors: this.data
		});
	},
	beforeDestroy() {
		window.removeEventListener("mouseup", this.stopDrag);
		window.removeEventListener("mousemove", this.setValue);
		window.removeEventListener("touchend", this.stopDrag);
		window.removeEventListener("touchmove", this.setValue, {
			passive: false
		});
	},
	watch: {
		selectionColor: {
			handler(newVal) {
				if (
					this.selectedIndex < 0 ||
					this.data[this.selectedIndex].color == d3.hsl(newVal)
				) {
					return;
				}

				this.$set(this.data, this.selectedIndex, {
					color: d3.hsl(newVal),
					position: this.data[this.selectedIndex].position
				});
			}
		},
		currentFocus: {
			handler(newVal) {
				if (newVal != this.$el) {
					this.selectedIndex = -1;
				} else if (this.selectedIndex == -1) {
					this.$emit("selectionChange", {
						color: this.data[0].color,
						index: 0,
						element: this.$el
					});
					this.selectedIndex = 0;
				}
			}
		},
		gradient: {
			handler(newVal) {
				this.setData(newVal);
			},
			deep: true
		}
	},
	methods: {
		setData(gradient) {
			let count = gradient.length - 1;
			if (typeof gradient[0] === "object") {
				if (gradient[0].position === undefined) {
					this.data = gradient.map((val, i) => ({
						color: d3.hsl(val.color),
						position: i / count
					}));
				} else {
					this.data = gradient.map(val => ({
						color: d3.hsl(val.color),
						position: val.position
					}));
				}
			} else if (typeof gradient[0] === "string") {
				this.data = gradient.map((val, i) => ({
					color: d3.hsl(val),
					position: i / count
				}));
			}
		},
		percentage(val) {
			return val * 100;
		},
		dataChanged() {
			this.$emit("gradientChange", {
				gradient: this.colorGradient,
				colors: this.data
			});
		},
		stopDrag() {
			this.dragging = false;

			let index = this.data.findIndex(val => val.position < 0);
			if (index >= 0) {
				this.remove(index);
			}
		},
		getEventPosition(event) {
			if (event.touches === undefined) return event;
			if (event.cancelable) {
				event.preventDefault();
			}
			return event.touches[0];
		},
		remove(index) {
			this.data.splice(index, 1);
			this.dataChanged();

			this.selectedIndex =
				this.selectedIndex < this.data.length ? Math.max(this.selectedIndex, 0) : 0;
			this.$emit("selectionChange", {
				color: this.data[this.selectedIndex].color,
				index: this.selectedIndex,
				element: this.$el
			});
		},
		hover(index) {
			if (this.dragging) return;
			this.hoverIndex = index;
		},
		unhover() {
			if (this.dragging) return;
			this.hoverIndex = -1;
		},
		select(index) {
			this.dragging = true;
			this.hoverIndex = -1;

			if (this.currentFocus == this.$el && this.selectedIndex == index) return;

			this.selectedIndex = index;
			this.$emit("selectionChange", {
				color: this.data[index].color,
				index: index,
				element: this.$el
			});
		},
		knobClass(index) {
			const selectedClass = `handle--selected ${this.classPrefix}-handle--selected`;
			const hoverClass = `handle--hover ${this.classPrefix}-handle--hover`;
			return [
				this.selectedIndex == index ? selectedClass : "",
				this.hoverIndex == index ? hoverClass : ""
			];
		},
		containerClass(index) {
			const selectedClass = `handle-container--selected ${
				this.classPrefix
			}-handle-container--selected`;
			const hoverClass = `handle-container--hover ${
				this.classPrefix
			}-handle-container--hover`;

			return [
				this.selectedIndex == index ? selectedClass : "",
				this.hoverIndex == index ? hoverClass : ""
			];
		},
		addAtClick(event) {
			var rect = this.$refs.slider.getBoundingClientRect();
			var pos = this.getEventPosition(event);

			var relativeX = (pos.clientX - rect.left) / rect.width;
			let neighborIndices = this.pointsSurroundingPercentage(this.data, relativeX);

			let relval =
				(relativeX - this.data[neighborIndices[0]].position) /
				(this.data[neighborIndices[1]].position - this.data[neighborIndices[0]].position);

			this.data.push({
				color: d3.hsl(
					d3.interpolateRgb(
						this.data[neighborIndices[0]].color,
						this.data[neighborIndices[1]].color
					)(relval)
				),
				position: relativeX
			});
			this.dataChanged();

			this.selectedIndex = this.data.length - 1;
			this.dragging = true;
			this.$emit("selectionChange", {
				color: this.data[this.selectedIndex].color,
				index: this.selectedIndex,
				element: this.$el
			});
		},
		pointsSurroundingPercentage(data, percentage) {
			let lowest = {
				position: 99,
				distance: 99,
				index: -1
			};

			let highest = {
				position: -99,
				distance: 99,
				index: -1
			};

			data.forEach((val, index) => {
				let dist = Math.abs(val.position - percentage);
				if (val.position <= percentage && lowest.distance > dist) {
					lowest = {
						position: val.position,
						distance: dist,
						index: index
					};
				} else if (val.position >= percentage && highest.distance > dist) {
					highest = {
						position: val.position,
						distance: dist,
						index: index
					};
				}
			});

			highest.index = highest.index == -1 ? lowest.index : highest.index;
			lowest.index = lowest.index == -1 ? highest.index : lowest.index;

			return [lowest.index, highest.index];
		},
		setValue(event) {
			if (!this.dragging || this.selectedIndex == -1) return;
			var rect = this.$refs.slider.getBoundingClientRect();

			var pos = this.getEventPosition(event);
			let relative = {
				x: (pos.clientX - rect.left) / rect.width,
				y: (pos.clientY - rect.top) / rect.height
			};
			relative.x = Math.min(Math.max(relative.x, 0), 1);

			let newPosition = 0;
			if (this.data.length > 1 && Math.abs(relative.y) > this.removeOffset) {
				newPosition = -1;
			} else if (this.data[this.selectedIndex].position != relative.x) {
				newPosition = relative.x;
			} else {
				return;
			}

			this.$set(this.data, this.selectedIndex, {
				color: this.data[this.selectedIndex].color,
				position: newPosition
			});
			this.dataChanged();
		}
	},
	computed: {
		pickerBackground: function() {
			return `linear-gradient(to right, ${this.colorGradient}), 
			${this.checkerImage}`;
		},
		colorGradient() {
			let s = "";

			let copy = this.data
				.concat()
				.sort((a, b) => (a.position > b.position ? 1 : -1))
				.filter(val => val.position >= 0);

			if (copy.length == 1) {
				s += `${copy[0].color} ${(copy[0].position * 100).toFixed(2)}%, 
				${copy[0].color} ${(copy[0].position * 100).toFixed(2)}%`;
				return s;
			}

			copy.forEach((val, i) => {
				s += `${val.color} ${(val.position * 100).toFixed(2)}%${
					i == copy.length - 1 ? "" : ", "
				}`;
			});

			return s;
		}
	}
};
</script>

<style lang="scss" scoped>
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


