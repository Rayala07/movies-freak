import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/store";
import "./shared/styles/global.css";
import App from "./App";

ReactDOM.createRoot(document.querySelector("#root")).render(
  <Provider store={store}>
    <App />
  </Provider>
);