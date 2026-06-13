import { auth } from "@/lib/auth";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "admin";

  if (pathname.startsWith("/admin") && !isAdmin) {
    return Response.redirect(new URL("/", req.url));
  }

  if (
    (pathname.startsWith("/dashboard") || pathname.startsWith("/reader")) &&
    !isLoggedIn
  ) {
    return Response.redirect(new URL("/login", req.url));
  }

  return;
});

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/reader/:path*"],
};
