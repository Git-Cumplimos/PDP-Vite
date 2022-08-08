import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ServiceWorkerWrapper from "./components/Compound/ServiceWorkerWrapper/ServiceWorkerWrapper";

// import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import "./index.css";
import "./utils/fonts.css";

ReactDOM.render(
  <React.StrictMode>
    <ToastContainer
      position={"top-center"}
      autoClose={5000}
      hideProgressBar={false}
      closeOnClick={true}
      pauseOnHover={true}
      draggable={true}
      progress={undefined}
    />
    <App />
    <ServiceWorkerWrapper />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorkerRegistration.register();
