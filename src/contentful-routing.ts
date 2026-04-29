import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { parse } from "graphql";
import { contentfulClient } from "~/contentful-client";
import { env } from "./env";

type ContentfulEntryType = "Page" | "ProductListingPage";

type RoutableEntry = {
  __typename?: ContentfulEntryType;
  parent?: RoutableEntry | null;
  slug?: string | null;
};

type GetRouteTypeData = {
  pageCollection?: {
    items?: Array<RoutableEntry | null>;
  } | null;
  productListingPageCollection?: {
    items?: Array<RoutableEntry | null>;
  } | null;
};

type GetRouteTypeVariables = {
  locale?: string;
  slug: string;
};

const GET_ROUTE_TYPE = parse(/* GraphQL */ `
  query GetRouteType($slug: String!, $locale: String) {
    pageCollection(limit: 10, where: { slug: $slug }, locale: $locale) {
      items {
        __typename
        slug
        parent {
          ...PageParent
        }
      }
    }
    productListingPageCollection(
      limit: 10
      where: { slug: $slug }
      locale: $locale
    ) {
      items {
        __typename
        slug
        parent {
          ...RouteParent
        }
      }
    }
  }

  fragment RouteParent on ProductListingPageParent {
    __typename
    ... on Page {
      slug
      parent {
        ...PageParent
      }
    }
    ... on ProductListingPage {
      slug
      parent {
        __typename
        ... on Page {
          slug
          parent {
            ...PageParent
          }
        }
        ... on ProductListingPage {
          slug
          parent {
            __typename
            ... on Page {
              slug
            }
            ... on ProductListingPage {
              slug
            }
          }
        }
      }
    }
  }

  fragment PageParent on Page {
    __typename
    slug
    parent {
      __typename
      slug
      parent {
        __typename
        slug
        parent {
          __typename
          slug
        }
      }
    }
  }
`) as TypedDocumentNode<GetRouteTypeData, GetRouteTypeVariables>;

function getPathSegments(pathname: string) {
  return pathname.split("/").filter(Boolean);
}

function getEntryPathSegments(entry: RoutableEntry) {
  const segments: string[] = [];
  let current: RoutableEntry | null | undefined = entry;

  while (current) {
    if (current.slug) {
      segments.unshift(current.slug);
    }

    current = current.parent;
  }

  return segments;
}

function matchesPath(entry: RoutableEntry | null, contentPathname: string) {
  if (!entry) {
    return false;
  }

  return (
    getEntryPathSegments(entry).join("/") ===
    getPathSegments(contentPathname).join("/")
  );
}

async function getRouteCandidates(slug: string) {
  const data = await contentfulClient.request(GET_ROUTE_TYPE, {
    slug,
    locale: env.CONTENTFUL_LOCALE,
  });

  return {
    pages: data.pageCollection?.items ?? [],
    productListingPages: data.productListingPageCollection?.items ?? [],
  };
}

export async function getContentfulRouteType(
  contentPathname: string,
): Promise<ContentfulEntryType | null> {
  const segments = getPathSegments(contentPathname);
  const slug = segments.at(-1);

  if (!slug) {
    return null;
  }

  const candidates = await getRouteCandidates(slug);

  if (
    candidates.productListingPages.some((entry) =>
      matchesPath(entry, contentPathname),
    )
  ) {
    return "ProductListingPage";
  }

  if (candidates.pages.some((entry) => matchesPath(entry, contentPathname))) {
    return "Page";
  }

  return null;
}
