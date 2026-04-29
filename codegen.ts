import "@dotenvx/dotenvx/config";
import type { CodegenConfig } from "@graphql-codegen/cli";

const spaceId = process.env.CONTENTFUL_SPACE_ID;
const environment = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
const accessToken =
  process.env.CONTENTFUL_ACCESS_TOKEN ??
  process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN;

if (!spaceId) {
  throw new Error("Missing required environment variable: CONTENTFUL_SPACE_ID");
}

if (!accessToken) {
  throw new Error(
    "Missing required environment variable: CONTENTFUL_ACCESS_TOKEN",
  );
}

const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/${environment}`;

const config: CodegenConfig = {
  schema: [
    {
      [endpoint]: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    },
  ],
  documents: ["src/**/*.{ts,tsx,graphql,gql}"],
  generates: {
    "./src/gql/": {
      preset: "client",
      presetConfig: {
        gqlTagName: "graphql",
      },
      config: {
        scalars: {
          DateTime: "string",
          JSON: "unknown",
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
