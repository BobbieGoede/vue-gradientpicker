import { createApp } from "vue";
// @ts-ignore
import App from "./App.vue";
import GradientPicker from "../dist/vue-gradientpicker.es.js";
import "../dist/style.css";
console.log(GradientPicker);

const app = createApp(App);

app.component("GradientPicker", GradientPicker);
app.mount("#app");
