import { createApp } from "vue";
import App from "./App.vue";
import GradientPicker from "./GradientPicker.vue";

const app = createApp(App);

app.component("GradientPicker", GradientPicker);
app.mount("#app");
