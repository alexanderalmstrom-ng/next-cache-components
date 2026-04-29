import { NextResponse, type NextRequest } from "next/server";

const INTERNAL_ROUTE_PREFIX = "/routes";
const PUBLIC_FILE = /\.[^/]+$/;

function stripRoutePrefix(pathname: string, prefix: string) {
  if (pathname === prefix) {
    return "";
  }

  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length);
  }

  return null;
}

function rewriteTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;

  return NextResponse.rewrite(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const productPath = stripRoutePrefix(pathname, "/product");

  if (productPath !== null) {
    return rewriteTo(request, `${INTERNAL_ROUTE_PREFIX}/product${productPath}`);
  }

  const productListingPath = stripRoutePrefix(pathname, "/products");

  if (productListingPath !== null) {
    return rewriteTo(
      request,
      `${INTERNAL_ROUTE_PREFIX}/product-listing${productListingPath}`,
    );
  }

  if (
    pathname === "/" ||
    pathname.startsWith(`${INTERNAL_ROUTE_PREFIX}/`) ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  return rewriteTo(request, `${INTERNAL_ROUTE_PREFIX}/page${pathname}`);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
