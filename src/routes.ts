import { physical, rootRoute } from "@tanstack/virtual-file-routes";

const featureRoutes = [physical("../features/landing/routes")];

export const routes = rootRoute("__root.tsx", [...featureRoutes]);
