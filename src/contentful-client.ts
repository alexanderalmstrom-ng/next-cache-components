import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { print } from "graphql";
import { env } from "~/env";

type GraphQLVariables = Record<string, unknown>;

type ContentfulGraphQLResponse<TResult> = {
  data?: TResult;
  errors?: Array<{
    message: string;
    extensions?: Record<string, unknown>;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: Array<string | number>;
  }>;
};

type ContentfulRequestOptions = {
  accessToken?: string;
  environment?: string;
  fetchOptions?: RequestInit;
  preview?: boolean;
  spaceId?: string;
};

type ContentfulRequestArgs<TVariables extends GraphQLVariables> =
  TVariables extends Record<string, never>
    ? [variables?: TVariables, options?: ContentfulRequestOptions]
    : [variables: TVariables, options?: ContentfulRequestOptions];

class ContentfulGraphQLError extends Error {
  errors: NonNullable<ContentfulGraphQLResponse<unknown>["errors"]>;

  constructor(
    errors: NonNullable<ContentfulGraphQLResponse<unknown>["errors"]>,
  ) {
    super(errors.map((error) => error.message).join("\n"));
    this.name = "ContentfulGraphQLError";
    this.errors = errors;
  }
}

function getContentfulAccessToken(preview: boolean): string {
  if (preview) {
    return env.CONTENTFUL_PREVIEW_ACCESS_TOKEN ?? env.CONTENTFUL_ACCESS_TOKEN;
  }

  return env.CONTENTFUL_ACCESS_TOKEN;
}

function getContentfulGraphQLEndpoint(options: ContentfulRequestOptions = {}) {
  const spaceId = options.spaceId ?? env.CONTENTFUL_SPACE_ID;
  const environment = options.environment ?? env.CONTENTFUL_ENVIRONMENT;

  return `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environment}`;
}

export async function contentfulRequest<
  TResult,
  TVariables extends GraphQLVariables = Record<string, never>,
>(
  document: TypedDocumentNode<TResult, TVariables>,
  ...[variables, options = {}]: ContentfulRequestArgs<TVariables>
): Promise<TResult> {
  const preview = options.preview ?? false;
  const headers = new Headers(options.fetchOptions?.headers);

  headers.set(
    "Authorization",
    `Bearer ${options.accessToken ?? getContentfulAccessToken(preview)}`,
  );
  headers.set("Content-Type", "application/json");

  const response = await fetch(getContentfulGraphQLEndpoint(options), {
    ...options.fetchOptions,
    method: "POST",
    headers,
    body: JSON.stringify({
      query: print(document),
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Contentful GraphQL request failed: ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as ContentfulGraphQLResponse<TResult>;

  if (payload.errors?.length) {
    throw new ContentfulGraphQLError(payload.errors);
  }

  if (!payload.data) {
    throw new Error("Contentful GraphQL response did not include data.");
  }

  return payload.data;
}

export const contentfulClient = {
  request: contentfulRequest,
};

export { ContentfulGraphQLError };
export type { ContentfulRequestOptions };
