import { NextResponse, type NextRequest } from "next/server";
import { getContentfulRouteType } from "~/contentful-routing";

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

function getPrefixedFallbackRoute(pathname: string) {
  const productListingPath = stripRoutePrefix(pathname, "/products");

  if (productListingPath !== null) {
    return `${INTERNAL_ROUTE_PREFIX}/product-listing${productListingPath}`;
  }

  const productPath = stripRoutePrefix(pathname, "/product");

  if (productPath !== null) {
    return `${INTERNAL_ROUTE_PREFIX}/product${productPath}`;
  }

  const pagePath = stripRoutePrefix(pathname, "/page");

  if (pagePath) {
    return `${INTERNAL_ROUTE_PREFIX}/page${pagePath}`;
  }

  return null;
}

function getContentfulPathname(pathname: string) {
  return (
    stripRoutePrefix(pathname, "/page") ??
    stripRoutePrefix(pathname, "/products") ??
    pathname
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/" ||
    pathname.startsWith(`${INTERNAL_ROUTE_PREFIX}/`) ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  let contentfulRouteType: Awaited<ReturnType<typeof getContentfulRouteType>> =
    null;
  const contentfulPathname = getContentfulPathname(pathname);

  try {
    contentfulRouteType = await getContentfulRouteType(contentfulPathname);
  } catch (error) {
    console.error("Failed to resolve Contentful route type", error);
  }

  if (contentfulRouteType === "ProductListingPage") {
    return rewriteTo(
      request,
      `${INTERNAL_ROUTE_PREFIX}/product-listing${contentfulPathname}`,
    );
  }

  if (contentfulRouteType === "Page") {
    return rewriteTo(
      request,
      `${INTERNAL_ROUTE_PREFIX}/page${contentfulPathname}`,
    );
  }

  const prefixedFallbackRoute = getPrefixedFallbackRoute(pathname);

  if (prefixedFallbackRoute) {
    return rewriteTo(request, prefixedFallbackRoute);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
