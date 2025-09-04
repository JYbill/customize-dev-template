/**
 * @time 2022/11/6 12:02
 * @author xiaoqinvar
 * @desc router入口
 * @dependence
 */
import React, { lazy } from "react";
import type { NonIndexRouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

const Login = lazy(() => import("@/views/login/login"));


const routers: NonIndexRouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/home" />,
  },
  {
    path: "/home",
  },
  {
    path: "/login",
    element: <Login />
  }
];
export default routers;
