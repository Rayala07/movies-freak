import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./features/landing/pages/LandingPage";
import "./shared/styles/global.css";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  // Auth routes added in Phase F2
  // Protected routes added in Phase F2
]);