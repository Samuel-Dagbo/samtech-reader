export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await Promise.all([
      import("@/models/Book"),
      import("@/models/User"),
      import("@/models/ReadingProgress"),
      import("@/models/Bookmark"),
      import("@/models/Chapter"),
    ]);
  }
}

export async function onRequestError(
  error: { digest: string } & Error,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string };
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routePath: string;
    routeType: "render" | "route" | "action" | "middleware";
    revalidateReason?: "on-demand" | "stale" | undefined;
    renderSource?:
      | "react-server-components"
      | "react-server-components-action"
      | undefined;
  }
) {
  console.error("\n[SERVER_ERROR_CAPTURED]", {
    digest: error.digest,
    message: error.message,
    stack: error.stack,
    name: error.name,
    path: request.path,
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    renderSource: context.renderSource,
    cause: (error as { cause?: unknown }).cause,
  });
  console.error("[SERVER_ERROR_RAW]", error);
}
