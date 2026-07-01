import { physical, rootRoute } from "@tanstack/virtual-file-routes";

const featureRoutes = [
  physical("../features/landing/routes"),
  physical("../features/signatures/routes"),
  physical("../features/presentations/routes"),
];

export const routes = rootRoute("__root.tsx", [...featureRoutes]);
