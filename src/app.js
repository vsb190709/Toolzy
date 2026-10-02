import { startRouter } from "./core/router.js";
import { renderApp } from "./core/app.js";
import { registerServiceWorker } from "./core/pwa.js";
renderApp();
startRouter();
registerServiceWorker();
