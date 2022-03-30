import { lazy } from "react";

const Login = lazy(() => import("."));

export const loginUrls = [{ link: "/login", label: "Login", component: Login }];
