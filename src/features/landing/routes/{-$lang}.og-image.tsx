import { createFileRoute } from "@tanstack/react-router";
import { createOgImageResponse } from "../lib/og-image-response";

export const Route = createFileRoute("/{-$lang}/og-image")({
  server: {
    handlers: {
      GET: ({ request }) => createOgImageResponse(request),
    },
  },
});
