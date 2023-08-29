import GradientPicker from "./GradientPicker.vue";

describe("GradientPicker", () => {
	it("should mount", () => {
		const selectionSpy = cy.spy().as("selectionSpy");
		const selection = [];
		const wrapper = cy
			.mount(GradientPicker, {
				props: {
					modelValue: [
						{ color: "hsl(230, 100%, 50%)", position: 0 },
						{ color: "hsl(30, 100%, 50%)", position: 0.8 },
						// { color: "lab(50, 50, 59, 0)", position: 0.8 },
						{ color: "rgb(255, 255, 0)", position: 1 },
					],
					"onUpdate:selection": (...args) => selection.push([...args]),
					colorSpace: "lab",
				},
			})
			.then(({ wrapper, component }) => {
				console.log(wrapper);

				const pickerEl = cy.get(".gradient-picker");
				pickerEl.click(200, 10);
				// cy.get("@selectionSpy").should("be.called");
				pickerEl.click(100, 10);
				// wrapper.setProps({ classPrefix: "hello" });
				pickerEl.trigger("mousedown", 200, 10).trigger("mousemove", 0, 100).trigger("mouseup");

				// cy.get("@selectionSpy").should("be.called");
			});
		// console.log(cy.get("@selectionSpy").);
		// console.log(selection)
		// console.log(selectionSpy());
		// pickerEl.click(100, 10);

		// console.log(wrapper("selection"));

		// });
		// const picker = wrapper.find(".gradient-picker");
		// console.log(cy.)
	});
});
