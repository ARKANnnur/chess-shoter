import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

document.title = "Chess Shoter";

createApp(App).mount("#app");
