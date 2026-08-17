import { PrivateRoute } from "./features/authentication/layouts/PrivateRoute";
import type { RouteObject } from "react-router";
import { ROUTES } from "./features/authentication/authenticationConfig";
import AuthAppLayout from "./features/authentication/layouts/AuthAppLayout";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <AuthAppLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { default: Component } = await import("./pages/home/Home");
          return { Component };
        },
        handle: { showInNavigation: true, label: "Home" },
      },
      {
        path: ROUTES.LOGIN.PATH,
        lazy: async () => {
          const { default: Component } = await import("./features/authentication/pages/Login");
          return { Component };
        },
        handle: { showInNavigation: false, label: "Login", title: ROUTES.LOGIN.TITLE },
      },
      {
        path: ROUTES.REGISTER.PATH,
        lazy: async () => {
          const { default: Component } = await import("./features/authentication/pages/Register");
          return { Component };
        },
        handle: { showInNavigation: false, title: ROUTES.REGISTER.TITLE },
      },
      {
        path: ROUTES.FORGOT_PASSWORD.PATH,
        lazy: async () => {
          const { default: Component } = await import("./features/authentication/pages/ForgotPassword");
          return { Component };
        },
        handle: { showInNavigation: false, title: ROUTES.FORGOT_PASSWORD.TITLE },
      },
      {
        path: ROUTES.RESET_PASSWORD.PATH,
        lazy: async () => {
          const { default: Component } = await import("./features/authentication/pages/ResetPassword");
          return { Component };
        },
        handle: { showInNavigation: false, title: ROUTES.RESET_PASSWORD.TITLE },
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: ROUTES.PROFILE.PATH,
            lazy: async () => {
              const { default: Component } = await import("@/features/profile/Profile");
              return { Component };
            },
            handle: { showInNavigation: true, label: "Profile", title: ROUTES.PROFILE.TITLE },
          },
          {
            path: ROUTES.CHANGE_PASSWORD.PATH,
            lazy: async () => {
              const { default: Component } = await import("./features/authentication/pages/ChangePassword");
              return { Component };
            },
            handle: { showInNavigation: false, title: ROUTES.CHANGE_PASSWORD.TITLE },
          },
          {
            path: "appointments",
            lazy: async () => {
              const { default: Component } = await import("./pages/Appointments");
              return { Component };
            },
            handle: { showInNavigation: false, title: "Appointments" },
          },
        ],
      },
      {
        path: "accounts/:recordId",
        lazy: async () => {
          const { default: Component } = await import("./pages/AccountObjectDetailPage");
          return { Component };
        },
      },
      {
        path: "accounts",
        lazy: async () => {
          const { default: Component } = await import("./pages/AccountSearch");
          return { Component };
        },
      },
      {
        path: "*",
        lazy: async () => {
          const { default: Component } = await import("./pages/NotFound");
          return { Component };
        },
      },
    ],
  },
];
