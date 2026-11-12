import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "gcse_session";
// The public website pages, the login and the register page. Everything else needs a session (tutor pages: see below).
const PUBLIC_PATHS = ["/", "/courses", "/how-it-works", "/about", "/blog", "/shop", "/login", "/register"];

// Where the tutor sign-in page really lives inside the app.
const INTERNAL_TUTOR_LOGIN = "/login/tutor";

/**
 * The address tutors and admins use to sign in. Nothing on the site links to it, so only people who
 * are given the address know it. Set TUTOR_LOGIN_PATH (for example /portal-k3x9q) to use a hard-to-guess
 * address; the normal /login/tutor then stops working. Unsafe or clashing values are ignored.
 */
function chooseTutorLoginPath(): string {
  const wanted = process.env.TUTOR_LOGIN_PATH ?? "";
  const looksSafe = /^\/[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/.test(wanted);
  const first = wanted.split("/")[1];
  const clashes = ["login", "register", "dashboard", "items", "api", "tutor", "student", "courses", "how-it-works", "about", "blog", "shop"].includes(first);
  return looksSafe && !clashes ? wanted : INTERNAL_TUTOR_LOGIN;
}
const TUTOR_LOGIN_PATH = chooseTutorLoginPath();
const isDev = process.env.NODE_ENV !== "production";

// A fresh random nonce per request: only scripts carrying it may run (blocks XSS).
function buildCsp(nonce: string, isHttps: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'", // framer-motion sets inline styles
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isHttps ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

// (Called "middleware" before Next.js 16.)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Secret tutor sign-in address: serve the real page at the chosen address, and make the normal
  // /login/tutor look like any other page that does not exist.
  let rewriteTo: string | null = null;
  if (TUTOR_LOGIN_PATH !== INTERNAL_TUTOR_LOGIN) {
    if (pathname === TUTOR_LOGIN_PATH) rewriteTo = INTERNAL_TUTOR_LOGIN;
    else if (pathname === INTERNAL_TUTOR_LOGIN) rewriteTo = "/page-not-found";
  }

  // Route protection: no session cookie -> go to the student login.
  // Tutor pages are the exception: they are not redirected here (that would reveal where the tutor sign-in
  // is). The tutor layout sends a signed-out visitor to the home page instead.
  // (This is a fast first check; the real check happens on the server, which
  // asks the backend to verify the cookie before showing any data.)
  const isTutorArea = pathname === "/tutor" || pathname.startsWith("/tutor/");
  const isTutorLogin = pathname === TUTOR_LOGIN_PATH || pathname === "/login/admin";
  const hasSession = request.cookies.has(SESSION_COOKIE);
  if (!hasSession && !PUBLIC_PATHS.includes(pathname) && !isTutorArea && !isTutorLogin) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const nonce = btoa(crypto.randomUUID());
  const isHttps =
    request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https";
  const csp = buildCsp(nonce, isHttps);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const init = { request: { headers: requestHeaders } };
  const response = rewriteTo ? NextResponse.rewrite(new URL(rewriteTo, request.url), init) : NextResponse.next(init);
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "no-store"); // never cache private pages
  return response;
}

export const config = {
  matcher: [
    // Everything except Next.js internals, the API proxy and public image/static files
    // (those must stay reachable by logged-out visitors, e.g. the login page background).
    { source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:webp|png|jpg|jpeg|gif|svg|avif|ico|mp4|webm)$).*)" },
  ],
};
