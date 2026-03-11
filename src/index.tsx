import { serve } from "bun";
import index from "./index.html";

const AUTH_WORKER_URL =
  process.env.AUTH_WORKER_URL ?? process.env.BUN_PUBLIC_AUTH_WORKER_URL;

const authConfigError = () =>
  Response.json(
    {
      error:
        "Auth worker is not configured. Set AUTH_WORKER_URL or BUN_PUBLIC_AUTH_WORKER_URL.",
    },
    { status: 500 }
  );

async function proxyAuthRequest(req: Request) {
  if (!AUTH_WORKER_URL) {
    return authConfigError();
  }

  const incomingUrl = new URL(req.url);
  const upstreamUrl = new URL(
    `${incomingUrl.pathname}${incomingUrl.search}`,
    AUTH_WORKER_URL
  );
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("accept-encoding");

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = req.body;
    init.duplex = "half";
  }

  const upstreamResponse = await fetch(upstreamUrl, init);
  const responseHeaders = new Headers(upstreamResponse.headers);

  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

const server = serve({
  routes: {
    "/auth/send-magic-link": proxyAuthRequest,

    "/auth/verify": proxyAuthRequest,

    "/auth/validate": proxyAuthRequest,

    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});
